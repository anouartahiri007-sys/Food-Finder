<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'cuisine_type',
        'price_range',
        'dietary_options',
        'opening_time',
        'closing_time',
        'website',
        'rating',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'dietary_options' => 'array',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'rating' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }
}
