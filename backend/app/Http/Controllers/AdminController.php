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
     * List all users.
     */
    public function users()
    {
        $this->checkAdmin();
        return response()->json(User::latest()->get());
    }

    /**
     * Toggle user status (active/blocked) - pseudo logic since we don't have is_active yet.
     */
    public function toggleUserStatus(User $user)
    {
        // $user->update(['is_blocked' => !$user->is_blocked]);
        return response()->json(['message' => 'User status updated']);
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
