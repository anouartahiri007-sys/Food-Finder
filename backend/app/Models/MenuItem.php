<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'restaurant_id',
        'name',
        'description',
        'price',
        'image_path',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
