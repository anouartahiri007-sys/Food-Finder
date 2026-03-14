<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display a listing of menus for a restaurant.
     */
    public function index($restaurantId)
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        return response()->json($restaurant->menus()->with('items')->get());
    }

    /**
     * Store a newly created menu for a restaurant.
     */
    public function store(Request $request, $restaurantId)
    {
        $restaurant = Restaurant::findOrFail($restaurantId);

        if ($restaurant->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $menu = $restaurant->menus()->create($request->all());

        return response()->json($menu, 201);
    }

    /**
     * Update the specified menu.
     */
    public function update(Request $request, Menu $menu)
    {
        if ($menu->restaurant->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $menu->update($request->all());

        return response()->json($menu);
    }

    /**
     * Remove the specified menu.
     */
    public function destroy(Menu $menu)
    {
        if ($menu->restaurant->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $menu->delete();

        return response()->json(['message' => 'Menu deleted']);
    }
}
