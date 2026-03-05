<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Visit;
use Illuminate\Database\Seeder;

class VisitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing users or create some
        $users = User::count() > 0 ? User::all() : User::factory()->count(5)->create();

        // Create visits for the past 30 days
        $visits = [];

        // Generate realistic visit patterns
        for ($day = 30; $day >= 0; $day--) {
            $date = now()->subDays($day);

            // More visits on weekdays
            $isWeekend = $date->isWeekend();
            $baseVisits = $isWeekend ? 20 : 50;

            // Create guest visits
            for ($i = 0; $i < $baseVisits; $i++) {
                $visits[] = [
                    'session_id' => bin2hex(random_bytes(20)),
                    'ip_address' => fake()->ipv4(),
                    'user_id' => null,
                    'route_path' => $this->randomRoute(),
                    'route_name' => $this->randomRouteName(),
                    'user_agent' => $this->randomUserAgent(),
                    'device_type' => $this->randomDeviceType(),
                    'referrer' => fake()->optional(0.3)->url(),
                    'visited_at' => $date->copy()->addSeconds(random_int(0, 86399)),
                    'created_at' => now(),
                ];
            }

            // Create authenticated user visits
            foreach ($users as $user) {
                // Each user visits 1-5 times per day
                $userVisits = random_int(1, 5);

                for ($j = 0; $j < $userVisits; $j++) {
                    $visits[] = [
                        'session_id' => bin2hex(random_bytes(20)),
                        'ip_address' => fake()->ipv4(),
                        'user_id' => $user->id,
                        'route_path' => $this->randomRoute(),
                        'route_name' => $this->randomRouteName(),
                        'user_agent' => $this->randomUserAgent(),
                        'device_type' => $this->randomDeviceType(),
                        'referrer' => fake()->optional(0.2)->url(),
                        'visited_at' => $date->copy()->addSeconds(random_int(0, 86399)),
                        'created_at' => now(),
                    ];
                }
            }
        }

        // Insert in chunks to avoid memory issues
        $chunks = array_chunk($visits, 500);

        foreach ($chunks as $chunk) {
            Visit::insert($chunk);
        }
    }

    protected function randomRoute(): string
    {
        $routes = [
            '/',
            '/dashboard',
            '/settings/profile',
            '/settings/password',
            '/settings/appearance',
            '/admin/users',
            '/admin/analytics',
        ];

        return $routes[array_rand($routes)];
    }

    protected function randomRouteName(): ?string
    {
        $names = [
            'home',
            'dashboard',
            'profile.edit',
            'user-password.edit',
            'appearance.edit',
            'users.index',
            'analytics.index',
        ];

        return $names[array_rand($names)];
    }

    protected function randomUserAgent(): string
    {
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        ];

        return $userAgents[array_rand($userAgents)];
    }

    protected function randomDeviceType(): string
    {
        $weights = [
            'desktop' => 60,
            'mobile' => 35,
            'tablet' => 5,
        ];

        $rand = random_int(1, 100);
        $cumulative = 0;

        foreach ($weights as $device => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $device;
            }
        }

        return 'desktop';
    }
}
