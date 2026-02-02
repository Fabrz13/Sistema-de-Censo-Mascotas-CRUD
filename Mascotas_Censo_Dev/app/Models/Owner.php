<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Owner extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_CLIENTE = 'cliente';
    public const ROLE_VETERINARIO = 'veterinario';
    public const ROLE_SUPERADMIN = 'superadmin';

    protected $table = 'owners';

    protected $fillable = [
        'name',
        'email',
        'password',
        'address',
        'phone',
        'photo_path',
        'location',
        'status',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'location' => 'array',
    ];

    public function pets()
    {
        return $this->hasMany(Pet::class, 'owner_id');
    }

    public function consultationsAsClient()
    {
        return $this->hasMany(MedicalConsultation::class, 'client_id');
    }

    public function consultationsAsVeterinarian()
    {
        return $this->hasMany(MedicalConsultation::class, 'veterinarian_id');
    }

    public function isCliente(): bool
    {
        return $this->role === self::ROLE_CLIENTE;
    }

    public function isVeterinario(): bool
    {
        return $this->role === self::ROLE_VETERINARIO;
    }

    public function isSuperadmin(): bool
    {
        return $this->role === self::ROLE_SUPERADMIN;
    }
}
