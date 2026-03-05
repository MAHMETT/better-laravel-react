<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Visitor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitorAnalyticsControllerTest extends TestCase
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

    public function test_index_page_renders_successfully(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->get('/admin/visitor-analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('filters')
        );
    }

    public function test_kpi_stats_endpoint_returns_correct_data(): void
    {
        // Create test visitors for today
        Visitor::factory()->count(5)->create([
            'check_in_at' => today(),
            'status' => 'checked_in',
        ]);

        Visitor::factory()->count(3)->create([
            'check_in_at' => today(),
            'status' => 'checked_out',
            'check_out_at' => today(),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/kpi-stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'kpi_stats' => [
                    'todays_visitors',
                    'checked_in',
                    'checked_out',
                    'yet_to_check_out',
                    'returning_visitors',
                    'percentage_change',
                ],
            ]);

        $data = $response->json('kpi_stats');
        $this->assertEquals(8, $data['todays_visitors']);
        $this->assertEquals(5, $data['checked_in']);
        $this->assertEquals(3, $data['checked_out']);
    }

    public function test_daily_visits_endpoint_returns_weekly_data(): void
    {
        Visitor::factory()->count(10)->create([
            'check_in_at' => today(),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/daily-visits');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'daily_visits' => [
                    '*' => [
                        'label',
                        'this_week',
                        'last_week',
                    ],
                ],
                'mode',
            ]);
    }

    public function test_daily_visits_endpoint_returns_yearly_data(): void
    {
        Visitor::factory()->count(10)->create([
            'check_in_at' => today(),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/daily-visits?mode=yearly');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'daily_visits' => [
                    '*' => [
                        'label',
                        'visits',
                    ],
                ],
                'mode',
            ])
            ->assertJson(['mode' => 'yearly']);
    }

    public function test_peak_hour_endpoint_returns_data(): void
    {
        Visitor::factory()->count(5)->create([
            'check_in_at' => today()->setHour(14),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/peak-hour');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'peak_hour_data',
                'peak_hour',
                'peak_visits',
            ]);
    }

    public function test_returning_visitors_endpoint_returns_data(): void
    {
        Visitor::factory()->count(3)->create([
            'is_returning' => true,
        ]);

        Visitor::factory()->count(2)->create([
            'is_returning' => false,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/returning-visitors');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'returning_visitors' => [
                    'recurring' => ['count', 'percentage'],
                    'one_time' => ['count', 'percentage'],
                ],
            ]);
    }

    public function test_purpose_of_visit_endpoint_returns_data(): void
    {
        Visitor::factory()->create(['purpose' => 'Meeting']);
        Visitor::factory()->create(['purpose' => 'Interview']);
        Visitor::factory()->create(['purpose' => 'Meeting']);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/purpose-of-visit');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'purpose_of_visit' => [
                    '*' => ['purpose', 'visits'],
                ],
            ]);
    }

    public function test_region_distribution_endpoint_returns_data(): void
    {
        Visitor::factory()->create([
            'region' => 'United States',
            'country_code' => 'US',
        ]);

        Visitor::factory()->create([
            'region' => 'Indonesia',
            'country_code' => 'ID',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/region-distribution');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'region_distribution' => [
                    '*' => ['region', 'country_code', 'visits'],
                ],
            ]);
    }

    public function test_live_feed_endpoint_returns_data(): void
    {
        // Create a host user first
        $hostUser = User::factory()->create([
            'status' => 'enable',
        ]);

        Visitor::factory()->count(3)->create([
            'host_user_id' => $hostUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/admin/visitor-analytics/live-feed');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'live_feed' => [
                    '*' => [
                        'id',
                        'visitor_id',
                        'full_name',
                        'status',
                        'time_ago',
                        'action',
                    ],
                ],
            ]);
    }

    public function test_export_endpoint_returns_success(): void
    {
        // For now, just test that the endpoint exists and returns a valid response structure
        // CSRF testing requires special test setup
        $this->withoutMiddleware();

        $response = $this->actingAs($this->adminUser)
            ->postJson('/admin/visitor-analytics/export');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Export completed successfully',
            ]);
    }

    public function test_unauthorized_user_cannot_access_endpoints(): void
    {
        $response = $this->getJson('/admin/visitor-analytics/kpi-stats');
        $response->assertStatus(401);

        $this->actingAs($this->adminUser)->getJson('/admin/visitor-analytics/kpi-stats')
            ->assertStatus(200);
    }

    public function test_non_admin_user_cannot_access_endpoints(): void
    {
        $nonAdminUser = User::factory()->create([
            'role' => 'user',
            'status' => 'enable',
        ]);

        $response = $this->actingAs($nonAdminUser)
            ->getJson('/admin/visitor-analytics/kpi-stats');

        $response->assertForbidden();
    }
}
