<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MedicalConsultation;
use App\Models\Owner;
use App\Models\Pet;
use Illuminate\Http\Request;

class MedicalConsultationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Listado de citas:
     * - cliente: solo sus citas (client_id)
     * - veterinario: solo sus citas (veterinarian_id)
     * - superadmin: todas
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', MedicalConsultation::class);

        $user = $request->user();

        $query = MedicalConsultation::query()
            ->with([
                'pet:id,name,species,breed,owner_id',
                'client:id,name,email',
                'veterinarian:id,name,email',
            ])
            ->orderByDesc('scheduled_at');

        if ($user->isCliente()) {
            $query->where('client_id', $user->id);
        } elseif ($user->isVeterinario()) {
            $query->where('veterinarian_id', $user->id);
        }
        // superadmin: sin filtro

        return $query->get();
    }

    /**
     * Crear consulta médica (ya lo tenías)
     */
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

        // Cliente: solo puede agendar para su propia mascota
        if ($user->isCliente() && $pet->owner_id !== $user->id) {
            return response()->json(['message' => 'No puedes agendar para una mascota que no es tuya'], 403);
        }

        $vet = Owner::findOrFail($validated['veterinarian_id']);
        if ($vet->role !== Owner::ROLE_VETERINARIO) {
            return response()->json(['message' => 'El usuario seleccionado no es veterinario'], 422);
        }

        $consultation = MedicalConsultation::create([
            'pet_id' => $pet->id,
            'client_id' => $pet->owner_id,
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

    /**
     * Cambiar estado: CONFIRMADA o CANCELADA
     * - cliente: NO permitido
     * - veterinario/superadmin: permitido (si corresponde)
     */
    public function updateStatus(Request $request, MedicalConsultation $medicalConsultation)
    {
        $this->authorize('update', $medicalConsultation);

        $validated = $request->validate([
            'status' => 'required|in:CONFIRMADA,CANCELADA',
        ]);

        $medicalConsultation->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'consultation' => $medicalConsultation->load('pet', 'client', 'veterinarian'),
        ]);
    }
}
