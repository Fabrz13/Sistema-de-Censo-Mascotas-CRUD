<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'species', 'breed', 'size', 'age',
        'vaccinated', 'food_type', 'photo_path', 
        'location', 'last_vaccination', 'owner_id'
    ];

    protected $casts = [
        'location' => 'array',
        'vaccinated' => 'boolean',
        'last_vaccination' => 'date'
    ];

    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }
}