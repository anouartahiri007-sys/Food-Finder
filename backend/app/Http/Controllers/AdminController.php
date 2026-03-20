<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Report;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Check if user is admin.
     */
    private function checkAdmin()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
    }

    /**
     * Get system statistics.
     */
    public function stats()
    {
        $this->checkAdmin();
        return response()->json([
            'users_count' => User::count(),
            'restaurants_count' => Restaurant::count(),
            'reviews_count' => Review::count(),
            'pending_reports' => Report::where('status', 'pending')->count(),
        ]);
    }

    /**
     * List all users (excluding blocked).
     */
    public function users()
    {
        $this->checkAdmin();
        return response()->json(User::where('is_blocked', false)->latest()->get());
    }

    /**
     * List all restaurants (for admin).
     */
    public function restaurants()
    {
        $this->checkAdmin();
        return response()->json(Restaurant::with('user')->latest()->get());
    }

    /**
     * Delete a restaurant (for admin).
     */
    public function deleteRestaurant(Restaurant $restaurant)
    {
        $this->checkAdmin();
        $restaurant->delete();
        return response()->json(['message' => 'Restaurant deleted successfully']);
    }

    /**
     * Toggle user status (active/blocked).
     */
    public function toggleUserStatus(User $user)
    {
        $user->update(['is_blocked' => !$user->is_blocked]);
        return response()->json(['message' => 'User status updated', 'is_blocked' => $user->is_blocked]);
    }

    /**
     * Get blacklisted users.
     */
    public function blacklistedUsers()
    {
        $this->checkAdmin();
        return response()->json(User::where('is_blocked', true)->latest()->get());
    }

    /**
     * Add user to blacklist.
     */
    public function blacklistUser(User $user)
    {
        $this->checkAdmin();
        $user->update(['is_blocked' => true]);
        return response()->json(['message' => 'User added to blacklist']);
    }

    /**
     * Remove user from blacklist.
     */
    public function unblacklistUser(User $user)
    {
        $this->checkAdmin();
        $user->update(['is_blocked' => false]);
        return response()->json(['message' => 'User removed from blacklist']);
    }

    /**
     * Moderate a review.
     */
    public function moderateReview(Request $request, Review $review)
    {
        $this->checkAdmin();
        $request->validate(['action' => 'required|in:keep,delete']);

        if ($request->action === 'delete') {
            $review->delete();
            return response()->json(['message' => 'Review deleted']);
        }

        return response()->json(['message' => 'Review kept']);
    }
}
