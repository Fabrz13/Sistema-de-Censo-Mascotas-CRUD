<?php

namespace App\Policies;

use App\Models\Owner;
use App\Models\Pet;

class PetPolicy
{
    public function viewAny(Owner $user): bool
    {
        // Cliente: puede ver listado (pero filtrado por owner_id en controller)
        if ($user->isCliente()) return true;

        // Superadmin: todo
        if ($user->isSuperadmin()) return true;

        // Veterinario: sí, pero filtrado por consultas en controller
        if ($user->isVeterinario()) return true;

        return false;
    }

    public function view(Owner $user, Pet $pet): bool
    {
        if ($user->isSuperadmin()) return true;

        if ($user->isVeterinario()) {
            // ✅ Solo si hay una consulta asignada a este veterinario para esta mascota
            return $pet->consultations()->where('veterinarian_id', $user->id)->exists();
        }

        // Cliente
        return $pet->owner_id === $user->id;
    }

    public function create(Owner $user): bool
    {
        // Cliente puede crear sus mascotas
        if ($user->isCliente()) return true;

        // Superadmin puede todo
        if ($user->isSuperadmin()) return true;

        // Veterinario: si quieres permitir que registre mascotas, déjalo true.
        // Si NO, cámbialo a false.
        return $user->isVeterinario();
    }

    public function update(Owner $user, Pet $pet): bool
    {
        if ($user->isSuperadmin()) return true;

        if ($user->isVeterinario()) {
            return $pet->consultations()->where('veterinarian_id', $user->id)->exists();
        }

        return $pet->owner_id === $user->id;
    }

    public function delete(Owner $user, Pet $pet): bool
    {
        if ($user->isSuperadmin()) return true;

        if ($user->isVeterinario()) {
            return $pet->consultations()->where('veterinarian_id', $user->id)->exists();
        }

        return $pet->owner_id === $user->id;
    }
}
