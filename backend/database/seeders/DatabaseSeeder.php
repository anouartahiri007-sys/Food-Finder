<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin SaaS',
            'email' => 'admin@example.com',
            'role' => 'admin'
        ]);

        User::factory()->create([
            'name' => 'John Owner',
            'email' => 'owner@example.com',
            'role' => 'restaurateur'
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'user'
        ]);

        $this->call(RestaurantSeeder::class);
    }
}
