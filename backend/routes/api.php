<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\AuthController;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-email', [AuthController::class, 'verifyCode']);
Route::post('/login', [AuthController::class, 'login']);

// Public Routes
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{restaurantId}/menu-items', [\App\Http\Controllers\MenuItemController::class, 'index']);
Route::get('/restaurants/{restaurantId}/reviews', [\App\Http\Controllers\ReviewController::class, 'index']);
Route::get('/restaurants/{restaurantId}/working-hours', [\App\Http\Controllers\WorkingHourController::class, 'index']);
Route::get('/restaurants/{restaurantId}/menus', [\App\Http\Controllers\MenuController::class, 'index']);
Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
Route::get('/google-places/search', [\App\Http\Controllers\GooglePlacesController::class, 'search']);

// Authenticated Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'show']);
    Route::post('/profile/update', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword']);

    // Restaurateur Routes
    Route::get('/owner/restaurants', [RestaurantController::class, 'ownerRestaurants']);
    Route::post('/restaurants', [RestaurantController::class, 'store']);
    Route::put('/restaurants/{id}', [RestaurantController::class, 'update']);
    Route::delete('/restaurants/{id}', [RestaurantController::class, 'destroy']);
    Route::get('/owner/stats', [RestaurantController::class, 'stats']);

    // Working Hours
    Route::post('/restaurants/{restaurantId}/working-hours', [\App\Http\Controllers\WorkingHourController::class, 'store']);

    // Menus & Items
    Route::post('/restaurants/{restaurantId}/menus', [\App\Http\Controllers\MenuController::class, 'store']);
    Route::put('/menus/{menu}', [\App\Http\Controllers\MenuController::class, 'update']);
    Route::delete('/menus/{menu}', [\App\Http\Controllers\MenuController::class, 'destroy']);
    Route::post('/restaurants/{restaurantId}/menu-items', [\App\Http\Controllers\MenuItemController::class, 'store']);
    Route::delete('/menu-items/{menuItem}', [\App\Http\Controllers\MenuItemController::class, 'destroy']);

    // Photos
    Route::post('/photos', [\App\Http\Controllers\PhotoController::class, 'store']);
    Route::delete('/photos/{photo}', [\App\Http\Controllers\PhotoController::class, 'destroy']);

    // Reviews & Reports
    Route::post('/restaurants/{restaurantId}/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);
    Route::post('/restaurants/{restaurantId}/reviews/generate', [\App\Http\Controllers\ReviewController::class, 'generateDynamicReviews']);
    Route::delete('/reviews/{id}', [\App\Http\Controllers\ReviewController::class, 'destroy']);
    Route::post('/reviews/{reviewId}/report', [\App\Http\Controllers\ReportController::class, 'store']);

    // Favorites
    Route::get('/favorites', [\App\Http\Controllers\FavoriteController::class, 'index']);
    Route::post('/restaurants/{restaurantId}/favorite', [\App\Http\Controllers\FavoriteController::class, 'toggle']);

    // Reservations
    Route::post('/restaurants/{restaurantId}/reservations', [\App\Http\Controllers\ReservationController::class, 'store']);
    Route::get('/reservations', [\App\Http\Controllers\ReservationController::class, 'index']);
    Route::get('/owner/reservations', [\App\Http\Controllers\ReservationController::class, 'ownerReservations']);
    Route::put('/reservations/{id}/status', [\App\Http\Controllers\ReservationController::class, 'updateStatus']);

    // Recommendations
    Route::get('/recommendations', [\App\Http\Controllers\RecommendationController::class, 'index']);
    Route::post('/recommendations/generate', [\App\Http\Controllers\RecommendationController::class, 'generate']);

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users']);
        Route::post('/users/{user}/toggle-status', [\App\Http\Controllers\AdminController::class, 'toggleUserStatus']);
        Route::post('/users/{user}/blacklist', [\App\Http\Controllers\AdminController::class, 'blacklistUser']);
        Route::post('/users/{user}/unblacklist', [\App\Http\Controllers\AdminController::class, 'unblacklistUser']);
        Route::get('/blacklist', [\App\Http\Controllers\AdminController::class, 'blacklistedUsers']);
        Route::get('/restaurants', [\App\Http\Controllers\AdminController::class, 'restaurants']);
        Route::delete('/restaurants/{restaurant}', [\App\Http\Controllers\AdminController::class, 'deleteRestaurant']);
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index']);
        Route::get('/reports/deleted', [\App\Http\Controllers\ReportController::class, 'deletedReviews']);
        Route::put('/reports/{report}', [\App\Http\Controllers\ReportController::class, 'update']);
        Route::post('/reviews/{review}/moderate', [\App\Http\Controllers\AdminController::class, 'moderateReview']);
        Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store']);
        Route::delete('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy']);
    });
});
