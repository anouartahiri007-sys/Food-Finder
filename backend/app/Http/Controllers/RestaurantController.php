<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RestaurantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Restaurant::query();

        // 1. Keyword Search (Name or Cuisine)
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', '%' . $search . '%')
                    ->orWhere('cuisine_type', 'LIKE', '%' . $search . '%');
            });
        }

        // 2. Faceted Search - Cuisine Type
        if ($request->filled('cuisine')) {
            $query->where('cuisine_type', $request->get('cuisine'));
        }

        // 3. Faceted Search - Price Range (cheap, medium, expensive mapped to $, $$, $$$)
        if ($request->filled('price_range')) {
            $priceMap = [
                'cheap' => '$',
                'medium' => '$$',
                'expensive' => '$$$'
            ];
            $price = $request->get('price_range');
            if (isset($priceMap[$price])) {
                $query->where('price_range', $priceMap[$price]);
            } else {
                $query->where('price_range', $price);
            }
        }

        // 4. Faceted Search - Minimum Rating
        $rating = $request->get('rating');
        // Only apply filter if rating is explicitly set and greater than 0
        if ($rating !== null && $rating !== '' && floatval($rating) > 0) {
            $query->where('rating', '>=', floatval($rating));
        }

        // 5. Geolocation Search (Distance)
        if ($request->filled('lat') && $request->filled('lng')) {
            $lat = $request->get('lat');
            $lng = $request->get('lng');
            $radius = $request->get('radius', 50); // Default 50km

            $driver = \DB::getDriverName();

            if ($driver === 'sqlite') {
                // SQLite doesn't support acos/cos/radians natively.
                // For a demo/local env, we can just return all results or 
                // perform a simple bounding box filter.
                $query->whereBetween('latitude', [$lat - 0.5, $lat + 0.5])
                    ->whereBetween('longitude', [$lng - 0.5, $lng + 0.5]);
            } else {
                $query->selectRaw("*, ( 6371 * acos( cos( radians(?) ) *
                    cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) +
                    sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance", [$lat, $lng, $lat])
                    ->having('distance', '<', $radius)
                    ->orderBy('distance');
            }
        }

        return response()->json($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'cuisine_type' => 'required|string|max:100',
            'price_range' => 'required|string|in:$,$,$$,$$',
            'dietary_options' => 'nullable|array',
            'opening_time' => 'nullable',
            'closing_time' => 'nullable',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();
        $restaurant = new Restaurant($validated);
        $restaurant->user_id = $user->id;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('restaurants', 'public');
            $restaurant->image_url = Storage::url($path);
        }

        $restaurant->save();

        // Handle multiple images (photos)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $path = $imageFile->store('restaurants', 'public');
                $restaurant->photos()->create([
                    'url' => Storage::url($path),
                    'type' => 'restaurant',
                    'user_id' => $user->id,
                ]);
            }
        }

        return response()->json($restaurant->fresh('photos'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $restaurant = Restaurant::withCount('reviews')->with('photos')->with('reviews.user')->findOrFail($id);
        return response()->json($restaurant);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $restaurant = Restaurant::findOrFail($id);

        // Ownership check
        if ($restaurant->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'sometimes|required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'cuisine_type' => 'sometimes|required|string|max:100',
            'price_range' => 'sometimes|required|string|in:$,$$,$$$,$$$$',
            'dietary_options' => 'nullable|array',
            'opening_time' => 'nullable',
            'closing_time' => 'nullable',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $restaurant->fill($validated);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($restaurant->image_url) {
                $oldPath = str_replace('/storage/', '', $restaurant->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('restaurants', 'public');
            $restaurant->image_url = Storage::url($path);
        }

        $restaurant->save();

        // Handle multiple images (photos)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $path = $imageFile->store('restaurants', 'public');
                $restaurant->photos()->create([
                    'url' => Storage::url($path),
                    'type' => 'restaurant',
                    'user_id' => $request->user()->id,
                ]);
            }
        }

        return response()->json($restaurant->fresh('photos'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $restaurant = Restaurant::findOrFail($id);

        // Ownership check
        if ($restaurant->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete image if exists
        if ($restaurant->image_url) {
            $oldPath = str_replace('/storage/', '', $restaurant->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $restaurant->delete();
        return response()->json(['message' => 'Restaurant deleted']);
    }

    public function ownerRestaurants(Request $request)
    {
        $restaurants = $request->user()->restaurants;
        return response()->json($restaurants);
    }

    /**
     * Get statistics for the owner's restaurants.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $restaurantIds = $user->restaurants()->pluck('id');

        return response()->json([
            'restaurants_count' => $restaurantIds->count(),
            'total_reviews' => \App\Models\Review::whereIn('restaurant_id', $restaurantIds)->count(),
            'average_rating' => $user->restaurants()->avg('rating') ?: 0,
            'total_reservations' => \App\Models\Reservation::whereIn('restaurant_id', $restaurantIds)->count(),
        ]);
    }
}
