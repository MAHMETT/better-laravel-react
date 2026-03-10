<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $UserArray = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => 'admin',
                'password' => 'password',
            ],
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'password',
            ]
        ];

        // Create admin user (always created for testing)
        foreach ($UserArray as $userData) {
            User::factory()->create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'role' => $userData['role'] ?? 'user',
                'password' => bcrypt($userData['password']),
            ]);
        }

        // Create regular users
        User::factory(10)->create();

        // Create some disabled users for testing
        User::factory(3)->disabled()->create();

        foreach ($UserArray as $userInfo) {
            $this->command->info("Created user: {$userInfo['email']} with password: {$userInfo['password']}");
        }
    }
}
