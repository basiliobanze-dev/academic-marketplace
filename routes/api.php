<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserNotificationController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// API TEST
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
    ]);
});

// AUTHENTICATION
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// CATEGORIES
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// LISTINGS
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);

// AUTHENTICATED ROUTES
Route::middleware('auth:sanctum')->group(function () {
    // LOGOUT
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // PROFILE
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // CATEGORIES
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // LISTINGS
    Route::post('/listings', [ListingController::class, 'store']);
    Route::get('/my-listings', [ListingController::class, 'myListings']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);

    // MESSAGES
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{user}', [MessageController::class, 'conversation']);

    // REVIEWS
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/reviews/{review}', [ReviewController::class, 'show']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    // REPORTS
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{report}', [ReportController::class, 'show']);
    Route::put('/reports/{report}', [ReportController::class, 'update']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);

    // NOTIFICATIONS
    Route::get('/notifications', [UserNotificationController::class, 'index']);
    Route::get('/notifications/{notification}', [UserNotificationController::class, 'show']);
    Route::delete('/notifications/{notification}', [UserNotificationController::class, 'destroy']);

    Route::patch('/notifications/{notification}/read', [UserNotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [UserNotificationController::class, 'markAllAsRead']);
});

// ADMIN ROUTES
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);
    Route::get('/listings', [AdminController::class, 'listings']);
    Route::delete('/listings/{listing}', [AdminController::class, 'destroyListing']);
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::patch('/reports/{report}/resolve', [AdminController::class, 'resolveReport']);
});