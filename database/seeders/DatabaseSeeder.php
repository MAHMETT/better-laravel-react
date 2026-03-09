<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user (always created for testing)
        User::factory()->admin()->enabled()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        // Create regular users
        User::factory(10)->create();

        // Create some disabled users for testing
        User::factory(3)->disabled()->create();

        $this->command->info('✅ Database seeded!');
        $this->command->info('Admin credentials:');
        $this->command->info('  Email: admin@example.com');
        $this->command->info('  Password: password');
    }
}
