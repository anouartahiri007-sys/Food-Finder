<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkingHour extends Model
{
    protected $fillable = [
        'restaurant_id',
        'day',
        'open_time',
        'close_time',
        'is_closed',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
