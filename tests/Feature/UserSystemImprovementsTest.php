<?php

namespace Tests\Feature;

use App\Jobs\DeleteOldSoftDeletedUsers;
use App\Models\Media;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSystemImprovementsTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'status' => 'enable',
        ]);
    }

    public function test_user_observer_deletes_avatar_on_force_delete(): void
    {
        // Create a user with an avatar
        $media = Media::factory()->create([
            'uploaded_by' => $this->adminUser->id,
        ]);

        $this->adminUser->update(['avatar' => $media->id]);

        // Soft delete first
        $this->adminUser->delete();

        // Force delete
        $this->adminUser->forceDelete();

        // Verify user is deleted
        $this->assertDatabaseMissing('users', ['id' => $this->adminUser->id]);

        // Verify media is deleted
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }

    public function test_user_observer_handles_missing_avatar_gracefully(): void
    {
        // Create a user without an avatar
        $user = User::factory()->create([
            'avatar' => null,
        ]);

        // Soft delete first
        $user->delete();

        // Force delete should not throw errors
        $user->forceDelete();

        // Verify user is deleted
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_delete_old_soft_deleted_users_job(): void
    {
        // Create a user that was soft-deleted more than 30 days ago
        $oldDeletedUser = User::factory()->create([
            'status' => 'enable',
        ]);
        $oldDeletedUser->deleted_at = Carbon::now()->subDays(31);
        $oldDeletedUser->save();

        // Create a user that was soft-deleted less than 30 days ago
        $recentDeletedUser = User::factory()->create([
            'status' => 'enable',
        ]);
        $recentDeletedUser->deleted_at = Carbon::now()->subDays(15);
        $recentDeletedUser->save();

        // Run the job
        $job = new DeleteOldSoftDeletedUsers;
        $job->handle($this->app->make(\App\Services\User\UserAvatarService::class));

        // Verify old user is permanently deleted
        $this->assertDatabaseMissing('users', ['id' => $oldDeletedUser->id]);

        // Verify recent user still exists (soft-deleted)
        $this->assertSoftDeleted('users', ['id' => $recentDeletedUser->id]);
    }

    public function test_soft_delete_sets_deleted_at(): void
    {
        $user = User::factory()->create([
            'status' => 'enable',
        ]);

        $user->delete();

        $this->assertNotNull($user->fresh()->deleted_at);
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_restore_clears_deleted_at(): void
    {
        $user = User::factory()->create([
            'status' => 'enable',
        ]);

        $user->delete();
        $user->restore();

        $this->assertNull($user->fresh()->deleted_at);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'deleted_at' => null,
        ]);
    }

    public function test_user_with_avatar_media_relationship(): void
    {
        $media = Media::factory()->create([
            'uploaded_by' => $this->adminUser->id,
        ]);

        $this->adminUser->update(['avatar' => $media->id]);

        $user = User::with('avatarMedia')->find($this->adminUser->id);

        $this->assertNotNull($user->avatarMedia);
        $this->assertEquals($media->id, $user->avatarMedia->id);
    }

    public function test_media_user_relationship_uses_uploaded_by(): void
    {
        $media = Media::factory()->create([
            'uploaded_by' => $this->adminUser->id,
        ]);

        $this->assertEquals($this->adminUser->id, $media->user->id);
    }

    public function test_force_delete_removes_user_completely(): void
    {
        $user = User::factory()->create();
        $userId = $user->id;

        $user->delete();
        $user->forceDelete();

        $this->assertDatabaseMissing('users', ['id' => $userId]);
        $this->assertNull(User::withTrashed()->find($userId));
    }

    public function test_user_scope_enabled(): void
    {
        $enabledUser = User::factory()->create(['status' => 'enable']);
        $disabledUser = User::factory()->create(['status' => 'disable']);

        $enabledUsers = User::enabled()->get();

        $this->assertTrue($enabledUsers->contains($enabledUser));
        $this->assertFalse($enabledUsers->contains($disabledUser));
    }

    public function test_user_scope_disabled(): void
    {
        $enabledUser = User::factory()->create(['status' => 'enable']);
        $disabledUser = User::factory()->create(['status' => 'disable']);

        $disabledUsers = User::disabled()->get();

        $this->assertTrue($disabledUsers->contains($disabledUser));
        $this->assertFalse($disabledUsers->contains($enabledUser));
    }

    public function test_user_scope_admin(): void
    {
        $adminUser = User::factory()->create(['role' => 'admin']);
        $regularUser = User::factory()->create(['role' => 'user']);

        $adminUsers = User::admin()->get();

        $this->assertTrue($adminUsers->contains($adminUser));
        $this->assertFalse($adminUsers->contains($regularUser));
    }

    public function test_user_scope_regular(): void
    {
        $adminUser = User::factory()->create(['role' => 'admin']);
        $regularUser = User::factory()->create(['role' => 'user']);

        $regularUsers = User::regular()->get();

        $this->assertTrue($regularUsers->contains($regularUser));
        $this->assertFalse($regularUsers->contains($adminUser));
    }
}
