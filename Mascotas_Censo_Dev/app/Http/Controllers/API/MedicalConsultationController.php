<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MedicalConsultation;
use App\Models\Owner;
use App\Models\Pet;
use Illuminate\Http\Request;

class MedicalConsultationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'pet_id' => 'required|integer|exists:pets,id',
            'veterinarian_id' => 'required|integer|exists:owners,id',
            'scheduled_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $pet = Pet::findOrFail($validated['pet_id']);

        // ✅ Cliente: solo puede agendar para su propia mascota
        if ($user->isCliente() && $pet->owner_id !== $user->id) {
            return response()->json(['message' => 'No puedes agendar para una mascota que no es tuya'], 403);
        }

        // Validar que el veterinario realmente tenga rol veterinario
        $vet = Owner::findOrFail($validated['veterinarian_id']);
        if ($vet->role !== Owner::ROLE_VETERINARIO) {
            return response()->json(['message' => 'El usuario seleccionado no es veterinario'], 422);
        }

        $consultation = MedicalConsultation::create([
            'pet_id' => $pet->id,
            'client_id' => $pet->owner_id, // dueño real de la mascota
            'veterinarian_id' => $vet->id,
            'scheduled_at' => $validated['scheduled_at'],
            'status' => 'PENDIENTE',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Consulta médica creada correctamente',
            'consultation' => $consultation->load('pet', 'client', 'veterinarian')
        ], 201);
    }
}
