<?php

namespace App\Providers;

use App\Models\Pet;
use App\Models\MedicalConsultation;
use App\Policies\PetPolicy;
use App\Policies\MedicalConsultationPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Pet::class => PetPolicy::class,
        MedicalConsultation::class => MedicalConsultationPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
