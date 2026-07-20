<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserNotificationController;
use Illuminate\Support\Facades\Route;

// API TEST
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
    ]);
});

// AUTHENTICATION
Route::post('/register', [
    AuthController::class,
    'register',
]);

Route::post('/login', [
    AuthController::class,
    'login',
]);

// CATEGORIES
Route::get('/categories', [
    CategoryController::class,
    'index',
]);

Route::get('/categories/{category}', [
    CategoryController::class,
    'show',
])->whereNumber('category');

// LISTINGS
Route::get('/listings', [
    ListingController::class,
    'index',
]);

Route::get('/listings/{listing}', [
    ListingController::class,
    'show',
])->whereNumber('listing');

// AUTHENTICATED ROUTES
Route::middleware('auth:sanctum')->group(function () {

    // AUTHENTICATION
    Route::post('/logout', [
        AuthController::class,
        'logout',
    ]);

    Route::get('/me', [
        AuthController::class,
        'me',
    ]);

    // PROFILE
    Route::get('/profile', [
        ProfileController::class,
        'show',
    ]);

    Route::put('/profile', [
        ProfileController::class,
        'update',
    ]);

    Route::put('/profile/password', [
        ProfileController::class,
        'updatePassword',
    ]);

    // LISTINGS
    Route::post('/listings', [
        ListingController::class,
        'store',
    ]);

    Route::get('/my-listings', [
        ListingController::class,
        'myListings',
    ]);

    Route::put('/listings/{listing}', [
        ListingController::class,
        'update',
    ])->whereNumber('listing');

    Route::delete('/listings/{listing}', [
        ListingController::class,
        'destroy',
    ])->whereNumber('listing');

    // MESSAGES
    Route::get('/messages', [
        MessageController::class,
        'index',
    ]);

    Route::post('/messages', [
        MessageController::class,
        'store',
    ]);

    Route::get('/messages/{user}', [
        MessageController::class,
        'conversation',
    ])->whereNumber('user');

    // REVIEWS
    Route::get('/reviews', [
        ReviewController::class,
        'index',
    ]);

    Route::post('/reviews', [
        ReviewController::class,
        'store',
    ]);

    Route::get('/reviews/{review}', [
        ReviewController::class,
        'show',
    ])->whereNumber('review');

    Route::put('/reviews/{review}', [
        ReviewController::class,
        'update',
    ])->whereNumber('review');

    Route::delete('/reviews/{review}', [
        ReviewController::class,
        'destroy',
    ])->whereNumber('review');

    // REPORTS
    Route::post('/reports', [
        ReportController::class,
        'store',
    ]);

    // NOTIFICATIONS
    Route::get('/notifications', [
        UserNotificationController::class,
        'index',
    ]);

    Route::patch('/notifications/read-all', [
        UserNotificationController::class,
        'markAllAsRead',
    ]);

    Route::get('/notifications/{notification}', [
        UserNotificationController::class,
        'show',
    ])->whereNumber('notification');

    Route::patch('/notifications/{notification}/read', [
        UserNotificationController::class,
        'markAsRead',
    ])->whereNumber('notification');

    Route::delete('/notifications/{notification}', [
        UserNotificationController::class,
        'destroy',
    ])->whereNumber('notification');
});

// ADMINISTRATIVE ROUTES
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // DASHBOARD
    Route::get('/dashboard', [
            AdminController::class,
            'dashboard',
        ]);

    // USERS
    Route::get('/users', [
        AdminController::class,
        'users',
    ]);

    Route::delete('/users/{user}', [
        AdminController::class,
        'destroyUser',
    ])->whereNumber('user');

    // CATEGORIES
    Route::get('/categories', [
        CategoryController::class,
        'index',
    ]);

    Route::post('/categories', [
        CategoryController::class,
        'store',
    ]);

    Route::put('/categories/{category}', [
        CategoryController::class,
        'update',
    ])->whereNumber('category');

    Route::delete('/categories/{category}', [
        CategoryController::class,
        'destroy',
    ])->whereNumber('category');

    // LISTINGS
    Route::get('/listings', [
        AdminController::class,
        'listings',
    ]);

    Route::delete('/listings/{listing}', [
        AdminController::class,
        'destroyListing',
    ])->whereNumber('listing');

    // REPORTS
    Route::get('/reports', [
        AdminController::class,
        'reports',
    ]);

    Route::patch('/reports/{report}/resolve', [
        AdminController::class,
        'resolveReport',
    ])->whereNumber('report');
});