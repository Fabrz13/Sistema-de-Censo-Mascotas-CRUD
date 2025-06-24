<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\PetController;

Route::apiResource('pets', PetController::class);

// Ruta para el reporte de vacunación
Route::get('pets/vaccination-report', [PetController::class, 'vaccinationReport']);
