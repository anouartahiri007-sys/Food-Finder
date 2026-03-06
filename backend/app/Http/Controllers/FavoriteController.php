<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index()
    {
        $favorites = auth()->user()->favorites()->with('restaurants')->get();
        return response()->json($favorites);
    }

    public function toggle(Request $request, $restaurantId)
    {
        Restaurant::findOrFail($restaurantId);

        $favorite = Favorite::where('user_id', auth()->id())
            ->where('restaurant_id', $restaurantId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['message' => 'Removed from favorites']);
        }
        else {
            Favorite::create([
                'user_id' => auth()->id(),
                'restaurant_id' => $restaurantId,
            ]);
            return response()->json(['message' => 'Added to favorites'], 201);
        }
    }
}
