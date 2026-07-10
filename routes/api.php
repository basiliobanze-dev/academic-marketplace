<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!'
    ]);
});


// --------------------
// -- ROTAS PÚBLICAS --
// --------------------
// ROTAS DE AUTENTICAÇÃO
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ROTAS DE CATEGORIAS
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// ROTAS DE ANÚNCIOS
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);



// -------------------------------------------
// -- ROTAS PROTEGIDAS (NÍVEL: AUTENTICADO) --
// -------------------------------------------
Route::middleware('auth:sanctum')->group(function(){
    // ROTAS DE AUTENTICAÇÃO (NÍVEL: AUTENTICADO)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ROTAS DE PERFIL (UTILIZADOR)
    Route::get('/profile', [ProfileController::class, 'show'] );
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // ROTAS DE CATEGORIAS
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // ROTAS DE ANÚNCIOS
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);

    // ROTAS DE MENSAGENS
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{user}', [MessageController::class, 'conversation']);

    // ROTAS DE AVALIAÇÕES
    // Route::apiResource('reviews', ReviewController::class);
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/reviews/{review}', [ReviewController::class, 'show']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    // ROTAS DE DENÚNCIAS
    // Route::apiResource('reports', ReportController::class);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{report}', [ReportController::class, 'show']);
    Route::put('/reports/{report}', [ReportController::class, 'update']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);

    // ROSTAS DE NOTIFICAÇÕES
    Route::apiResource('notifications', UserNotificationController::class)->only(['index', 'show', 'destroy']);
    Route::patch('notifications/{notification}/read',[UserNotificationController::class, 'markAsRead']);
    Route::patch('notifications/read-all',[UserNotificationController::class, 'markAllAsRead']);
});


