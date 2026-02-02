<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalConsultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'client_id',
        'veterinarian_id',
        'scheduled_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function client()
    {
        return $this->belongsTo(Owner::class, 'client_id');
    }

    public function veterinarian()
    {
        return $this->belongsTo(Owner::class, 'veterinarian_id');
    }
}
