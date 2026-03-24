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
            'menu_id' => 'nullable|exists:menus,id',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $restaurant = Restaurant::findOrFail($restaurantId);

        if ($restaurant->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $menuItem = MenuItem::create([
            'restaurant_id' => $restaurantId,
            'menu_id' => $request->menu_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
        ]);

        return response()->json($menuItem, 201);
    }

    /**
     * Remove the specified menu item.
     */
    public function destroy(MenuItem $menuItem)
    {
        // Check ownership through restaurant
        $restaurant = Restaurant::findOrFail($menuItem->restaurant_id);
        if ($restaurant->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $menuItem->delete();
        return response()->json(['message' => 'Menu item deleted']);
    }
}
