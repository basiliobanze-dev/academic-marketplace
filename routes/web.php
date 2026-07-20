<?php

use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// PUBLIC ROUTES
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// ABOUT
Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

// DASHBOARD
Route::get('/dashboard', function () {
    if (auth()->user()->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])
  ->name('dashboard');

// LISTINGS
Route::get('/listings', function () {
    return Inertia::render('public/listings/index');
})->name('listings.index');

// AUTHENTICATED ROUTES
Route::middleware(['auth', 'verified'])->group(function () {

    // LISTINGS
    Route::get('/listings/create', function () {
        return Inertia::render('student/listings/create');
    })->name('listings.create');

    Route::get('/my-listings', function () {
        return Inertia::render('student/listings/index');
    })->name('listings.mine');

    Route::get('/my-listings/{listing}/edit', function (
        Listing $listing
    ) {
        abort_unless(
            Auth::id() === $listing->user_id,
            403
        );

        return Inertia::render('student/listings/edit', [
            'listingId' => $listing->id,
        ]);
    })->whereNumber('listing')
      ->name('listings.edit');

    // MESSAGES
    Route::get('/messages', function () {
        return Inertia::render('student/messages/index');
    })->name('messages.index');

    Route::get('/messages/{user}', function (User $user) {
        abort_if(
            Auth::id() === $user->id,
            422
        );

        return Inertia::render('student/messages/chat', [
            'contact' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
        ]);
    })->whereNumber('user')
      ->name('messages.chat');

    // NOTIFICATIONS
    Route::get('/notifications', function () {
        return Inertia::render(
            'student/notifications/index'
        );
    })->name('notifications.index');

    // REVIEWS
    Route::get('/reviews', function () {
        return Inertia::render('student/reviews/index');
    })->name('reviews.index');

    Route::get('/reviews/create/{user}', function (User $user) {
        abort_if(
            Auth::id() === $user->id,
            422
        );

        return Inertia::render('student/reviews/create', [
            'reviewedUser' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
        ]);
    })->whereNumber('user')
      ->name('reviews.create');
});

// PUBLIC LISTING DETAILS
Route::get('/listings/{listing}', function (
    Listing $listing
) {
    return Inertia::render('public/listings/show', [
        'listingId' => $listing->id,
    ]);
})->whereNumber('listing')
  ->name('listings.show');

// ADMINISTRATIVE ROUTES
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    // DASHBOARD
    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    // USERS
    Route::get('/users', function () {
        return Inertia::render('admin/users/index');
    })->name('admin.users.index');

    // LISTINGS
    Route::get('/listings', function () {
        return Inertia::render('admin/listings/index');
    })->name('admin.listings.index');

    // REPORTS
    Route::get('/reports', function () {
        return Inertia::render('admin/reports/index');
    })->name('admin.reports.index');

    // CATEGORIES
    Route::get('/categories', function () {
        return Inertia::render('admin/categories/index');
    })->name('admin.categories.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';