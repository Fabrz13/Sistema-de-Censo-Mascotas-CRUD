<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'species',
        'breed',
        'size',
        'age',  
        'vaccinated',
        'food_type',
        'photo_path',
        'last_vaccination',
        'owner_id',
        'status'
    ];

    protected $casts = [
        'vaccinated' => 'boolean',
        'last_vaccination' => 'date'
    ];

    public function owner()
    {
        return $this->belongsTo(Owner::class);
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