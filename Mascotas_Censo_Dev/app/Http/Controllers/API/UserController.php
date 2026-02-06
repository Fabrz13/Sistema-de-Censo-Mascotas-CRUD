<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    private function ensureSuperadmin(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->isSuperadmin()) {
            abort(403, 'No autorizado');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperadmin($request);

        return Owner::query()
            ->select('id', 'name', 'email', 'phone', 'address', 'created_at', 'status', 'role')
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $this->ensureSuperadmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:owners,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'role' => ['required', Rule::in([Owner::ROLE_CLIENTE, Owner::ROLE_VETERINARIO, Owner::ROLE_SUPERADMIN])],
            'status' => ['nullable', Rule::in(['HABILITADO', 'DESHABILITADO'])],
        ]);

        $user = Owner::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'role' => $validated['role'],
            'status' => $validated['status'] ?? 'HABILITADO',
        ]);

        return response()->json($user, 201);
    }

    public function show(Request $request, Owner $user)
    {
        $this->ensureSuperadmin($request);

        return $user->only(['id', 'name', 'email', 'phone', 'address', 'created_at', 'status', 'role']);
    }

    public function update(Request $request, Owner $user)
    {
        $this->ensureSuperadmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('owners', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6|confirmed',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'role' => ['required', Rule::in([Owner::ROLE_CLIENTE, Owner::ROLE_VETERINARIO, Owner::ROLE_SUPERADMIN])],
            'status' => ['required', Rule::in(['HABILITADO', 'DESHABILITADO'])],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->address = $validated['address'];
        $user->role = $validated['role'];
        $user->status = $validated['status'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json($user->only(['id','name','email','phone','address','created_at','status','role']));
    }

    public function destroy(Request $request, Owner $user)
    {
        $this->ensureSuperadmin($request);

        // Evitar que el superadmin se deshabilite a sí mismo (opcional pero recomendado)
        if ((int)$request->user()->id === (int)$user->id) {
            return response()->json(['message' => 'No puedes deshabilitar tu propio usuario'], 422);
        }

        $user->status = 'DESHABILITADO';
        $user->save();

        return response()->json(['message' => 'Usuario deshabilitado correctamente']);
    }
}
