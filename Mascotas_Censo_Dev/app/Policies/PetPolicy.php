<?php

namespace App\Policies;

use App\Models\Owner;
use App\Models\Pet;

class PetPolicy
{
    /**
     * Ver listado de mascotas.
     */
    public function viewAny(Owner $user): bool
    {
        // Cliente: sí puede ver listado, pero filtrado por owner_id en el controller
        if ($user->isCliente()) return true;

        // Superadmin: todo
        if ($user->isSuperadmin()) return true;

        // Veterinario: temporalmente permitido (paso 3 lo restringimos por atenciones)
        if ($user->isVeterinario()) return true;

        return false;
    }

    /**
     * Ver una mascota específica.
     */
    public function view(Owner $user, Pet $pet): bool
    {
        if ($user->isSuperadmin()) return true;
        if ($user->isVeterinario()) return true; // paso 3 lo afinamos
        return $pet->owner_id === $user->id; // cliente
    }

    /**
     * Crear mascota.
     */
    public function create(Owner $user): bool
    {
        if ($user->isSuperadmin()) return true;
        if ($user->isVeterinario()) return true; // opcional: puede registrar mascotas
        return $user->isCliente();
    }

    /**
     * Actualizar mascota.
     */
    public function update(Owner $user, Pet $pet): bool
    {
        if ($user->isSuperadmin()) return true;
        if ($user->isVeterinario()) return true; // paso 3 lo afinamos
        return $pet->owner_id === $user->id;
    }

    /**
     * Deshabilitar mascota (destroy).
     */
    public function delete(Owner $user, Pet $pet): bool
    {
        if ($user->isSuperadmin()) return true;
        if ($user->isVeterinario()) return true; // paso 3 lo afinamos
        return $pet->owner_id === $user->id;
    }
}
