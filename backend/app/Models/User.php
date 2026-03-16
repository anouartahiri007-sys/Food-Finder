<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'last_name',
        'email',
        'password',
        'date_of_birth',
        'profile_photo',
        'role',
        'accepted_privacy_policy',
        'is_over_18',
        'verification_code',
        'phone',
        'social_login_provider',
        'social_login_id',
        'email_verified_at',
        'gender',
        'website',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'accepted_privacy_policy' => 'boolean',
            'is_over_18' => 'boolean',
        ];
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function recommendations()
    {
        return $this->hasMany(Recommendation::class);
    }

    public function restaurants()
    {
        return $this->hasMany(Restaurant::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(Restaurant::class , 'favorites');
    }
}
