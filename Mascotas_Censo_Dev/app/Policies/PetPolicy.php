<?php

namespace App\Policies;

use App\Models\Owner;
use App\Models\Pet;

class PetPolicy
{
    public function viewAny(Owner $user): bool
    {
        if ($user->isCliente()) return true;
        if ($user->isSuperadmin()) return true;
        if ($user->isVeterinario()) return true;

        return false;
    }

    public function view(Owner $user, Pet $pet): bool
    {
        if ($user->isSuperadmin()) return true;

        if ($user->isVeterinario()) {
            return $pet->consultations()
                ->where('veterinarian_id', $user->id)
                ->exists();
        }

        // Cliente
        return $pet->owner_id === $user->id;
    }

    public function create(Owner $user): bool
    {
        if ($user->isVeterinario()) return false;

        if ($user->isSuperadmin()) return true;
        return $user->isCliente();
    }

    public function update(Owner $user, Pet $pet): bool
    {
        if ($user->isVeterinario()) return false;

        if ($user->isSuperadmin()) return true;
        return $pet->owner_id === $user->id;
    }

    public function delete(Owner $user, Pet $pet): bool
    {
        if ($user->isVeterinario()) return false;

        if ($user->isSuperadmin()) return true;
        return $pet->owner_id === $user->id;
    }
}
