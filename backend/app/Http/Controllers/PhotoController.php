<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    /**
     * Store a new photo.
     */
    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|string',
            'description' => 'nullable|string',
            'type' => 'required|in:restaurant,review,menu_item',
            'restaurant_id' => 'nullable|exists:restaurants,id',
            'review_id' => 'nullable|exists:reviews,id',
            'menu_item_id' => 'nullable|exists:menu_items,id',
        ]);

        // Authorization checks based on type could be added here

        $photo = Photo::create([
            'url' => $request->url,
            'description' => $request->description,
            'type' => $request->type,
            'restaurant_id' => $request->restaurant_id,
            'user_id' => auth()->id(),
            'review_id' => $request->review_id,
            'menu_item_id' => $request->menu_item_id,
        ]);

        return response()->json($photo, 201);
    }

    /**
     * Remove the specified photo.
     */
    public function destroy(Photo $photo)
    {
        if ($photo->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $photo->delete();

        return response()->json(['message' => 'Photo deleted']);
    }
}
