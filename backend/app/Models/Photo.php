<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    protected $fillable = [
        'url',
        'description',
        'type',
        'restaurant_id',
        'user_id',
        'review_id',
        'menu_item_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
