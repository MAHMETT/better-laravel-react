<?php

namespace Tests\Feature\UserLog;

use App\Enums\UserLogEventType;
use App\Models\User;
use App\Models\UserLog;
use App\Services\Auth\UserActivityLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Testing\Fluent\AssertableJson;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserLogFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_logs_login_event_on_successful_authentication(): void
    {
        $user = User::factory()->enabled()->create();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertTrue(
            UserLog::query()
                ->where('user_id', $user->id)
                ->where('event_type', UserLogEventType::Login->value)
                ->exists()
        );
    }

    public function test_logs_logout_event_on_explicit_logout(): void
    {
        $user = User::factory()->enabled()->create();

        $this->actingAs($user)->post(route('logout'));

        $this->assertTrue(
            UserLog::query()
                ->where('user_id', $user->id)
                ->where('event_type', UserLogEventType::Logout->value)
                ->exists()
        );
    }

    public function test_logs_forced_logout_when_disabled_user_is_kicked_by_role_middleware(): void
    {
        $user = User::factory()->enabled()->create();

        $this->actingAs($user);
        $user->update(['status' => 'disable']);

        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
        $this->assertTrue(
            UserLog::query()
                ->where('user_id', $user->id)
                ->where('event_type', UserLogEventType::ForcedLogout->value)
                ->exists()
        );
    }

    public function test_does_not_create_duplicate_event_for_same_user_event_type_session(): void
    {
        $user = User::factory()->enabled()->create();
        $service = app(UserActivityLogService::class);

        $request = Request::create('/activity-log-test', 'GET');
        $session = app('session')->driver();
        $session->setId('fixed-session-id');
        $session->start();
        $request->setLaravelSession($session);

        $service->log($user, UserLogEventType::Login, $request);
        $service->log($user, UserLogEventType::Login, $request);

        $this->assertSame(
            1,
            UserLog::query()
                ->where('user_id', $user->id)
                ->where('event_type', UserLogEventType::Login->value)
                ->where('session_id', 'fixed-session-id')
                ->count()
        );
    }

    public function test_admin_can_view_global_logs_page(): void
    {
        $admin = User::factory()->admin()->enabled()->create();
        UserLog::factory()->count(3)->create();

        $this->actingAs($admin)
            ->get(route('activity-logs.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/user-logs/index')
                ->has('logs.data', 3)
                ->where('filters.date_from', now()->subDays(30)->toDateString())
                ->where('filters.date_to', now()->toDateString()),
            );
    }

    public function test_admin_can_filter_logs_by_user_event_type_and_date_range(): void
    {
        $admin = User::factory()->admin()->enabled()->create();
        $firstSelectedUser = User::factory()->enabled()->create();
        $secondSelectedUser = User::factory()->enabled()->create();
        $nonSelectedUser = User::factory()->enabled()->create();

        UserLog::factory()->create([
            'user_id' => $firstSelectedUser->id,
            'event_type' => UserLogEventType::Login->value,
            'created_at' => now()->subDays(2),
        ]);
        UserLog::factory()->create([
            'user_id' => $firstSelectedUser->id,
            'event_type' => UserLogEventType::Logout->value,
            'created_at' => now()->subDays(1),
        ]);
        UserLog::factory()->create([
            'user_id' => $secondSelectedUser->id,
            'event_type' => UserLogEventType::Login->value,
            'created_at' => now()->subDays(2),
        ]);
        UserLog::factory()->create([
            'user_id' => $nonSelectedUser->id,
            'event_type' => UserLogEventType::Login->value,
            'created_at' => now()->subDays(2),
        ]);

        $this->actingAs($admin)
            ->get(route('activity-logs.index', [
                'user_ids' => [$firstSelectedUser->id, $secondSelectedUser->id],
                'event_type' => UserLogEventType::Login->value,
                'date_from' => now()->subDays(3)->toDateString(),
                'date_to' => now()->subDay()->toDateString(),
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/user-logs/index')
                ->has('logs.data', 2)
                ->where('filters.user_ids.0', $firstSelectedUser->id)
                ->where('filters.user_ids.1', $secondSelectedUser->id)
                ->where('filters.event_type', UserLogEventType::Login->value),
            );
    }

    public function test_admin_can_search_users_for_activity_log_filter_modal(): void
    {
        $admin = User::factory()->admin()->enabled()->create();
        $matchingUser = User::factory()->enabled()->create([
            'name' => 'Filter Match User',
            'email' => 'filter-match@example.com',
        ]);
        $nonMatchingUser = User::factory()->enabled()->create([
            'name' => 'Other User',
            'email' => 'other-user@example.com',
        ]);
        $selectedUser = User::factory()->enabled()->create();

        $response = $this->actingAs($admin)->getJson(route('activity-logs.users', [
            'search' => 'Filter Match',
            'per_page' => 20,
            'selected_ids' => [$selectedUser->id],
        ]));

        $response->assertOk()
            ->assertJson(fn (AssertableJson $json) => $json
                ->has('data')
                ->has('selected', 1)
                ->where('selected.0.id', $selectedUser->id)
                ->where('meta.per_page', 20)
                ->whereType('meta.has_more', 'boolean')
                ->whereType('meta.next_cursor', 'string|null')
                ->whereType('meta.previous_cursor', 'string|null'),
            );

        $returnedUserIds = collect($response->json('data'))
            ->pluck('id')
            ->all();

        $this->assertContains($matchingUser->id, $returnedUserIds);
        $this->assertNotContains($nonMatchingUser->id, $returnedUserIds);
    }

    public function test_admin_can_view_specific_user_log_page(): void
    {
        $admin = User::factory()->admin()->enabled()->create();
        $targetUser = User::factory()->enabled()->create();
        $otherUser = User::factory()->enabled()->create();

        UserLog::factory()->count(2)->create(['user_id' => $targetUser->id]);
        UserLog::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($admin)
            ->get(route('activity-logs.user', ['user' => $targetUser->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/activity-logs')
                ->has('logs.data', 2)
                ->where('user.id', $targetUser->id),
            );
    }

    public function test_regular_user_cannot_access_admin_log_routes(): void
    {
        $user = User::factory()->enabled()->create();
        $otherUser = User::factory()->enabled()->create();

        $this->actingAs($user)
            ->get(route('activity-logs.index'))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('activity-logs.user', ['user' => $otherUser->id]))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('activity-logs.users'))
            ->assertForbidden();
    }

    public function test_authenticated_user_can_view_only_own_logs(): void
    {
        $user = User::factory()->enabled()->create();
        $otherUser = User::factory()->enabled()->create();

        UserLog::factory()->count(2)->create(['user_id' => $user->id]);
        UserLog::factory()->count(3)->create(['user_id' => $otherUser->id]);

        $this->actingAs($user)
            ->get(route('login-activity.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/login-activity')
                ->has('logs.data', 2),
            );
    }

    public function test_self_logs_endpoint_ignores_user_ids_tampering(): void
    {
        $user = User::factory()->enabled()->create();
        $otherUser = User::factory()->enabled()->create();

        UserLog::factory()->count(2)->create(['user_id' => $user->id]);
        UserLog::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $this->actingAs($user)
            ->get(route('login-activity.index', ['user_ids' => [$otherUser->id]]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/login-activity')
                ->has('logs.data', 2),
            );
    }

    public function test_invalid_filter_query_returns_validation_errors(): void
    {
        $admin = User::factory()->admin()->enabled()->create();

        $this->actingAs($admin)
            ->from(route('activity-logs.index'))
            ->get(route('activity-logs.index', [
                'date_from' => '2026-03-10',
                'date_to' => '2026-03-01',
            ]))
            ->assertSessionHasErrors('date_to');

        $this->actingAs($admin)
            ->getJson(route('activity-logs.users', [
                'role' => 'manager',
                'per_page' => 15,
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['role', 'per_page']);
    }
}
