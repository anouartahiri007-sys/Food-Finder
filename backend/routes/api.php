<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-email', [AuthController::class, 'verifyCode']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/google-places/search', [\App\Http\Controllers\GooglePlacesController::class, 'search']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get(
        '/user',
        function (Request $request) {
            return $request->user();
        }
    );
    Route::post('/user/update', [\App\Http\Controllers\UserController::class, 'update']);

    // Protected restaurateur routes
    Route::get('/owner/restaurants', [RestaurantController::class, 'ownerRestaurants']);
    Route::post('/restaurants', [RestaurantController::class, 'store']);
    Route::put('/restaurants/{id}', [RestaurantController::class, 'update']);
    Route::delete('/restaurants/{id}', [RestaurantController::class, 'destroy']);

    Route::post('/restaurants/{restaurantId}/menu-items', [\App\Http\Controllers\MenuItemController::class, 'store']);

    // Reviews
    Route::post('/restaurants/{restaurantId}/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);

    // Favorites
    Route::get('/favorites', [\App\Http\Controllers\FavoriteController::class, 'index']);
    Route::post('/restaurants/{restaurantId}/favorite', [\App\Http\Controllers\FavoriteController::class, 'toggle']);

    // Reservations
    Route::post('/restaurants/{restaurantId}/reservations', [\App\Http\Controllers\ReservationController::class, 'store']);
    Route::get('/reservations', [\App\Http\Controllers\ReservationController::class, 'index']);
    Route::get('/owner/reservations', [\App\Http\Controllers\ReservationController::class, 'ownerReservations']);
    Route::put('/reservations/{id}/status', [\App\Http\Controllers\ReservationController::class, 'updateStatus']);
});

Route::get('/restaurants/{restaurantId}/menu-items', [\App\Http\Controllers\MenuItemController::class, 'index']);
Route::get('/restaurants/{restaurantId}/reviews', [\App\Http\Controllers\ReviewController::class, 'index']);
