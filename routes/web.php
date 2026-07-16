<?php
use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// LISTINGS
Route::get('/listings', function () {
    return Inertia::render('public/listings/index');
})->name('listings.index');
Route::get('/listings/{listing}', function (Listing $listing) {
    return Inertia::render('public/listings/show', [
        'listingId' => $listing->id,
    ]);
})->name('listings.show');

// AUTHENTICATED ROUTES
Route::middleware(['auth', 'verified'])->group(function () {
    // LISTINGS
    Route::get('/listings/create', function () {
        return Inertia::render('student/listings/create');
    })->name('listings.create');
    Route::get('/my-listings', function () {
        return Inertia::render('student/listings/index');
    })->name('listings.mine');
    Route::get('/my-listings/{listing}/edit', function (Listing $listing) {
        abort_unless(
            Auth::id() === $listing->user_id,
            403
        );
        return Inertia::render('student/listings/edit', [
            'listingId' => $listing->id,
        ]);
    })->name('listings.edit');

    // MESSAGES
    Route::get('/messages', function () {
        return Inertia::render('student/messages/index');
    })->name('messages.index');
    Route::get('/messages/{user}', function (User $user) {
        abort_if(Auth::id() === $user->id, 422);

        return Inertia::render('student/messages/chat', [
            'contact' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
        ]);
    })->name('messages.chat');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
