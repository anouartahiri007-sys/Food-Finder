<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
            'email' => 'admin@foodfinder.ma',
            'email_verified_at' => now(),
            'password' => Hash::make('Admin123'),
            'role' => 'admin'
        ]);

        User::factory()->create([
            'name' => 'John Owner',
            'email' => 'owner@example.com',
            'role' => 'owner'
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'customer'
        ]);

        $this->call(RestaurantSeeder::class);
    }
}
