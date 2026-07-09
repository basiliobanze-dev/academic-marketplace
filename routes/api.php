<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ListingController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!'
    ]);
});


// ----------------------
// -- ROTAS PÚBLICAS --
// ----------------------
// ROTAS DE AUTENTICAÇÃO
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ROTAS DE CATEGORIAS
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// ROTAS DE ANÚNCIOS
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);



// ----------------------
// -- ROTAS PROTEGIDAS --
// ----------------------
Route::middleware('auth:sanctum')->group(function(){
    // ROTAS DE AUTENTICAÇÃO (NÍVEL: AUTENTICADO)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ROTAS DE PERFIL (UTILIZADOR)
    Route::get('/profile', [ProfileController::class, 'show'] );
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // ROTAS DE CATEGORIAS (NÍVEL: AUTENTICADO)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // ROTAS DE ANÚNCIOS (NÍVEL: AUTENTICADO)
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
});


