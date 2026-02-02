<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function show(Request $request)
    {
        return $request->user()->load('pets');
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:owners,email,'.$user->id,
            'address' => 'required|string',
            'phone' => 'required|string',
            'photo' => 'nullable|image|max:2048',
            'location' => 'nullable|json',
        ]);

        try {
            if ($request->hasFile('photo')) {
                if ($user->photo_path) {
                    Storage::disk('public')->delete($user->photo_path);
                }
                $validated['photo_path'] = $request->file('photo')->store('owners', 'public');
            }

            $user->update($validated);

            return response()->json([
                'message' => 'Perfil actualizado correctamente',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar perfil: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al actualizar el perfil',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function disableAccount(Request $request)
    {
        $user = $request->user();

        // Deshabilitar todas las mascotas del dueño
        Pet::where('owner_id', $user->id)->update(['status' => 'DESHABILITADO']);

        // Deshabilitar la cuenta del dueño
        $user->update(['status' => 'DESHABILITADO']);

        // Revocar todos los tokens
        $user->tokens()->delete();

        return response()->json(['message' => 'Cuenta deshabilitada correctamente']);
    }
}
