<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Visit>
 */
class VisitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $routes = [
            ['path' => '/', 'name' => 'home'],
            ['path' => '/dashboard', 'name' => 'dashboard'],
            ['path' => '/settings/profile', 'name' => 'profile.edit'],
            ['path' => '/settings/password', 'name' => 'user-password.edit'],
            ['path' => '/settings/appearance', 'name' => 'appearance.edit'],
            ['path' => '/admin/users', 'name' => 'users.index'],
            ['path' => '/admin/users/create', 'name' => 'users.create'],
            ['path' => '/admin/analytics', 'name' => 'analytics.index'],
            ['path' => '/admin/activity-logs', 'name' => 'activity-logs.index'],
        ];

        $route = fake()->randomElement($routes);
        $deviceTypes = ['desktop', 'mobile', 'tablet'];
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        ];

        return [
            'session_id' => Str::random(40),
            'ip_address' => fake()->ipv4(),
            'user_id' => User::factory()->optional(),
            'route_path' => $route['path'],
            'route_name' => $route['name'],
            'user_agent' => fake()->randomElement($userAgents),
            'device_type' => fake()->randomElement($deviceTypes),
            'referrer' => fake()->optional(0.3)->url(),
            'visited_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * Indicate that the visit is from a guest (no user).
     */
    public function guest(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => null,
        ]);
    }

    /**
     * Indicate that the visit is from an authenticated user.
     */
    public function withUser(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => User::factory(),
        ]);
    }

    /**
     * Indicate that the visit is from a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Indicate that the visit is from a desktop device.
     */
    public function desktop(): static
    {
        return $this->state(fn (array $attributes) => [
            'device_type' => 'desktop',
        ]);
    }

    /**
     * Indicate that the visit is from a mobile device.
     */
    public function mobile(): static
    {
        return $this->state(fn (array $attributes) => [
            'device_type' => 'mobile',
        ]);
    }

    /**
     * Indicate that the visit is from today.
     */
    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'visited_at' => now(),
        ]);
    }

    /**
     * Indicate that the visit is from a specific date.
     */
    public function onDate(string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'visited_at' => $date,
        ]);
    }
}
