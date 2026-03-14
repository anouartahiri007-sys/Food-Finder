<?php

namespace App\Http\Controllers;

use App\Models\Recommendation;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    /**
     * Display a listing of recommendations for the authenticated user.
     */
    public function index(Request $request)
    {
        return response()->json($request->user()->recommendations()->with('restaurant')->orderBy('score', 'desc')->get());
    }

    /**
     * Generate or update recommendations for the user (pseudo-logic).
     */
    public function generate(Request $request)
    {
        // Simple logic: recommend top rated restaurants the user hasn't visited/reviewed yet
        $user = $request->user();
        $topRestaurants = Restaurant::where('rating', '>=', 4.0)
            ->whereDoesntHave('reviews', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->limit(5)
            ->get();

        foreach ($topRestaurants as $restaurant) {
            $user->recommendations()->updateOrCreate(
                ['restaurant_id' => $restaurant->id],
                [
                    'score' => $restaurant->rating, // In a real app, this would be a ML score
                    'reason' => 'Basé sur vos préférences de cuisine ' . $restaurant->cuisine_type,
                ]
            );
        }

        return response()->json($user->recommendations()->with('restaurant')->get());
    }
}
