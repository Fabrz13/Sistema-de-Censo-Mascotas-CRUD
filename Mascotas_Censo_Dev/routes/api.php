<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\PetController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OwnerController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\VeterinarianController;
use App\Http\Controllers\API\MedicalConsultationController;
use App\Http\Controllers\API\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/owner', [OwnerController::class, 'current']);

    Route::apiResource('pets', PetController::class);
    Route::get('pets/vaccination-report', [PetController::class, 'vaccinationReport']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/disable', [ProfileController::class, 'disableAccount']);

    // Agendar cita
    Route::get('/veterinarians', [VeterinarianController::class, 'index']);
    Route::post('/medical-consultations', [MedicalConsultationController::class, 'store']);

    Route::get('/medical-consultations', [MedicalConsultationController::class, 'index']);

    Route::patch('/medical-consultations/{medicalConsultation}/status', [MedicalConsultationController::class, 'updateStatus']);

    Route::apiResource('users', UserController::class);
});
