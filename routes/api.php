<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!'
    ]);
});


// ROTAS DE AUTENTICAÇÃO
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    // ROTAS DE AUTENTICAÇÃO (NÍVEL: AUTENTICADO)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ROTAS DE PERFIL (UTILIZADOR)
    Route::get('/profile', [ProfileController::class, 'show'] );
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
});


