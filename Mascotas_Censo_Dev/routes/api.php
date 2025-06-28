<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\PetController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OwnerController;
use App\Http\Controllers\API\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/owner', [OwnerController::class, 'current']);
    Route::get('/owners', [OwnerController::class, 'index']);
    
    Route::apiResource('pets', PetController::class);
    Route::get('pets/vaccination-report', [PetController::class, 'vaccinationReport']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/disable', [ProfileController::class, 'disableAccount']);
});