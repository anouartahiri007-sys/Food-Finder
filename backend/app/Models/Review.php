<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'restaurant_id',
        'rating',
        'comment',
        'photos',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }
}
