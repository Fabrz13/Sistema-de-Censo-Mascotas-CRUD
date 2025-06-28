<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }
    
    public function index()
    {
        return Pet::with('owner')->active()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species' => 'required|in:perro,gato,otro',
            'breed' => 'required|string',
            'size' => 'required|in:pequeño,mediano,grande',
            'age' => 'required|integer|min:0',
            'vaccinated' => 'required|boolean',
            'food_type' => 'required|string',
            'photo' => 'nullable|image|max:2048',
            'last_vaccination' => 'nullable|date',
            'owner_id' => 'sometimes|required|exists:owners,id'
        ]);

        if (!isset($validated['owner_id'])) {
            $validated['owner_id'] = $request->user()->id;
        }

        $validated['status'] = 'HABILITADO';

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('pets', 'public');
        }

        $pet = Pet::create($validated);

        return response()->json($pet->load('owner'), 201);
    }

    public function show(Pet $pet)
    {
        return $pet->load('owner');
    }

    public function update(Request $request, Pet $pet)
    {
        Log::debug('Headers recibidos:', $request->headers->all());
        Log::debug('Datos recibidos en update:', $request->except(['photo']));
        Log::debug('Archivo recibido:', ['has_file' => $request->hasFile('photo')]);

        // Validación manual para FormData
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species' => 'required|in:perro,gato,otro',
            'breed' => 'required|string',
            'size' => 'required|in:pequeño,mediano,grande',
            'age' => 'required|integer|min:0',
            'vaccinated' => 'required|boolean',
            'food_type' => 'required|string',
            'photo' => 'nullable|image|max:2048',
            'last_vaccination' => 'nullable|date',
            'owner_id' => 'required|exists:owners,id'
        ]);

        // Convertir vaccinated a booleano
        if (is_string($validated['vaccinated'])) {
            $validated['vaccinated'] = $validated['vaccinated'] === '1' || $validated['vaccinated'] === 'true';
        }

        // Manejo de la foto
        if ($request->hasFile('photo')) {
            if ($pet->photo_path) {
                Storage::disk('public')->delete($pet->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('pets', 'public');
        }

        $pet->update($validated);
        
        Log::debug('Mascota actualizada:', $pet->fresh()->toArray());
        return response()->json($pet->load('owner'));
    }

    public function destroy(Pet $pet)
    {
        // Cambiar estado en lugar de eliminar
        $pet->update(['status' => 'DESHABILITADO']);

        return response()->json(['message' => 'Mascota deshabilitada correctamente']);
    }

    public function vaccinationReport()
    {
        return response()->json(['message' => 'Reporte de vacunación']);
    }
}