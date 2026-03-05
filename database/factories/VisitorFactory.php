<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Visitor>
 */
class VisitorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $purposes = ['Meeting', 'Interview', 'Delivery', 'Maintenance', 'Other'];
        $regions = ['United States', 'Indonesia', 'Japan', 'Germany', 'United Kingdom', 'Singapore', 'Australia', 'Canada'];
        $countryCodes = ['US', 'ID', 'JP', 'DE', 'GB', 'SG', 'AU', 'CA'];
        $locations = ['Main Office', 'Branch A', 'Branch B', 'Warehouse'];
        $sites = ['Site 1', 'Site 2', 'Site 3'];

        $checkInTime = fake()->dateTimeBetween('-7 days', 'now');
        $isCheckedOut = fake()->boolean(30);
        $checkOutTime = $isCheckedOut ? fake()->dateTimeBetween($checkInTime, 'now') : null;

        $regionKey = array_rand($regions);

        return [
            'visitor_id' => 'V'.strtoupper(Str::random(8)),
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'company' => fake()->company(),
            'purpose' => fake()->randomElement($purposes),
            'region' => $regions[$regionKey],
            'country_code' => $countryCodes[$regionKey],
            'host_user_id' => User::factory(),
            'location' => fake()->randomElement($locations),
            'site' => fake()->randomElement($sites),
            'check_in_at' => $checkInTime,
            'check_out_at' => $checkOutTime,
            'status' => $isCheckedOut ? 'checked_out' : 'checked_in',
            'is_returning' => fake()->boolean(40),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Indicate that the visitor is checked in.
     */
    public function checkedIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'checked_in',
            'check_out_at' => null,
        ]);
    }

    /**
     * Indicate that the visitor is checked out.
     */
    public function checkedOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'checked_out',
            'check_out_at' => now(),
        ]);
    }

    /**
     * Indicate that the visitor is returning.
     */
    public function returning(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_returning' => true,
        ]);
    }

    /**
     * Indicate that the visitor checked in today.
     */
    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'check_in_at' => fake()->dateTimeBetween('-8 hours', 'now'),
        ]);
    }
}
