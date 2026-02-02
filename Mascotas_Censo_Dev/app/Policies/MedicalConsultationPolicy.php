<?php

namespace App\Policies;

use App\Models\MedicalConsultation;
use App\Models\Owner;

class MedicalConsultationPolicy
{
    public function viewAny(Owner $user): bool
    {
        return $user->isCliente() || $user->isVeterinario() || $user->isSuperadmin();
    }

    public function view(Owner $user, MedicalConsultation $consultation): bool
    {
        if ($user->isSuperadmin()) return true;
        if ($user->isVeterinario()) return (int)$consultation->veterinarian_id === (int)$user->id;
        return (int)$consultation->client_id === (int)$user->id; // cliente
    }

    /**
     * Cambiar estado (CONFIRMADA/CANCELADA)
     */
    public function update(Owner $user, MedicalConsultation $consultation): bool
    {
        if ($user->isSuperadmin()) return true;
        if ($user->isVeterinario()) return (int)$consultation->veterinarian_id === (int)$user->id;

        // cliente no puede cambiar estado
        return false;
    }
}
