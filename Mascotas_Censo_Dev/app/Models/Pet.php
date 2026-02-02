<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'owner_id',
        'status',
        'last_vaccination',
    ];

    protected $casts = [
        'vaccinated' => 'boolean',
        'last_vaccination' => 'date',
    ];

    public function owner()
    {
        return $this->belongsTo(Owner::class, 'owner_id');
    }

    public function consultations()
    {
        return $this->hasMany(MedicalConsultation::class, 'pet_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'HABILITADO');
    }
}
