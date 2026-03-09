<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'status' => 'enable',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Admin user created/verified!');
        $this->command->info('Email: admin@example.com');
        $this->command->info('Password: password');
    }
}
