<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Illuminate\Http\Request;

class VeterinarianController extends Controller
{
    public function index(Request $request)
    {
        // Cualquier usuario autenticado puede ver veterinarios disponibles para agendar
        // (si luego quieres restringirlo solo a clientes/superadmin, lo ajustamos)
        return Owner::query()
            ->where('role', Owner::ROLE_VETERINARIO)
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', 'HABILITADO');
            })
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
    }
}
