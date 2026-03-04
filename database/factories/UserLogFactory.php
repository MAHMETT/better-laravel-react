<?php

namespace Database\Factories;

use App\Enums\UserLogEventType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserLog>
 */
class UserLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_type' => fake()->randomElement(UserLogEventType::values()),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'device_info' => fake()->randomElement([
                'Chrome on Windows (Desktop)',
                'Safari on iOS (Mobile)',
                'Firefox on Linux (Desktop)',
            ]),
            'session_id' => fake()->optional()->uuid(),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
