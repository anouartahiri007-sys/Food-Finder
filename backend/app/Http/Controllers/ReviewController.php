<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($restaurantId)
    {
        return response()->json(Review::where('restaurant_id', $restaurantId)->with('user:id,name')->get());
    }

    public function store(Request $request, $restaurantId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'photos' => 'nullable|array',
        ]);

        Restaurant::findOrFail($restaurantId); // Ensure exists

        $review = Review::create([
            'user_id' => auth()->id(),
            'restaurant_id' => $restaurantId,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'photos' => $request->photos,
        ]);

        return response()->json($review, 201);
    }
}
