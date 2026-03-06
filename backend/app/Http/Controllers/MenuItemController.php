<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($restaurantId)
    {
        return response()->json(MenuItem::where('restaurant_id', $restaurantId)->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $restaurantId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
        ]);

        $restaurant = Restaurant::findOrFail($restaurantId);

        if ($restaurant->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $menuItem = $restaurant->menuItems()->create($request->all());

        return response()->json($menuItem, 201);
    }
}
