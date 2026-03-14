<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::where('role', 'restaurateur')->first() ?: User::factory()->create(['role' => 'restaurateur', 'name' => 'John Owner', 'email' => 'owner@example.com']);

        $restaurants = [
            [
                'name' => 'La Mammia Pizza',
                'description' => 'Authentic Italian pizzas baked in a wood-fired oven.',
                'address' => '123 Rue de Rome, Casablanca',
                'latitude' => 33.5731,
                'longitude' => -7.5898,
                'cuisine_type' => 'Pizza',
                'price_range' => '$$',
                'rating' => 4.5,
                'phone' => '+212 522-123456',
                'opening_time' => '12:00:00',
                'closing_time' => '23:00:00',
            ],
            [
                'name' => 'Le Gourmet Marocain',
                'description' => 'Discover the best of Moroccan traditional cuisine.',
                'address' => '45 Boulevard d\'Anfa, Casablanca',
                'latitude' => 33.5883,
                'longitude' => -7.6326,
                'cuisine_type' => 'Marocain',
                'price_range' => '$$$',
                'rating' => 4.8,
                'phone' => '+212 522-654321',
                'opening_time' => '11:00:00',
                'closing_time' => '22:30:00',
            ],
            [
                'name' => 'Sushi Zen',
                'description' => 'Fresh sushi and sashimi in a minimalist atmosphere.',
                'address' => '78 Avenue des FAR, Casablanca',
                'latitude' => 33.5950,
                'longitude' => -7.6186,
                'cuisine_type' => 'Sushi',
                'price_range' => '$$$',
                'rating' => 4.2,
                'phone' => '+212 522-987654',
                'opening_time' => '12:30:00',
                'closing_time' => '22:00:00',
            ],
            [
                'name' => 'Burger House',
                'description' => 'The best burgers in town with homemade fries.',
                'address' => '12 Rue Taha Houcine, Casablanca',
                'latitude' => 33.5750,
                'longitude' => -7.5950,
                'cuisine_type' => 'Burger',
                'price_range' => '$',
                'rating' => 3.9,
                'opening_time' => '10:00:00',
                'closing_time' => '00:00:00',
            ]
        ];

        foreach ($restaurants as $data) {
            $data['user_id'] = $owner->id;
            Restaurant::create($data);
        }
    }
}
