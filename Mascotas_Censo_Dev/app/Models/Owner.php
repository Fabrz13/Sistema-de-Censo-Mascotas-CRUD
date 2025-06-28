<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

class Owner extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 
        'address', 
        'phone',
        'email',
        'password',
        'photo_path',
        'location',
        'status'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'location' => 'array',
    ];

    public function pets()
    {
        return $this->hasMany(Pet::class);
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo_path ? Storage::url($this->photo_path) : null;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'HABILITADO');
    }
}