<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Pet;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function index()
    {
        return Pet::with('owner')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species' => 'required|in:perro,gato,otro',
            // ... añade todas las validaciones necesarias
        ]);

        $pet = Pet::create($validated);
        return response()->json($pet, 201);
    }

}