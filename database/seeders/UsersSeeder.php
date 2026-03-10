<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
                'role' => 'user',
                'status' => 'enable',
                'password' => 'password',
            ]
        ];

        // Create users with hashed passwords
        foreach ($UserArray as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'role' => $userData['role'] ?? 'user',
                    'status' => 'enable', // Always enable users by default
                    'password' => Hash::make($userData['password']), // Hash the password!
                ]
            );
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
