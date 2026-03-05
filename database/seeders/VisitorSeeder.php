<?php

namespace Database\Seeders;

use App\Models\Visitor;
use Illuminate\Database\Seeder;

class VisitorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create visitors for the past 7 days
        Visitor::factory()->count(50)->create([
            'check_in_at' => fn () => fake()->dateTimeBetween('-7 days', 'now'),
        ]);

        // Create today's visitors (checked in)
        Visitor::factory()->count(20)->today()->checkedIn()->create();

        // Create some checked out visitors
        Visitor::factory()->count(15)->today()->checkedOut()->create();

        // Create returning visitors
        Visitor::factory()->count(10)->returning()->today()->create();

        // Ensure variety in purposes
        $purposes = ['Meeting', 'Interview', 'Delivery', 'Maintenance', 'Other'];
        foreach ($purposes as $purpose) {
            Visitor::factory()->count(5)->create(['purpose' => $purpose]);
        }
    }
}
