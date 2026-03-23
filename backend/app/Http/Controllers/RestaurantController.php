<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreRestaurantRequest;
use App\Http\Requests\UpdateRestaurantRequest;
use App\Http\Resources\RestaurantResource;

class RestaurantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Restaurant::query()->withCount('reviews')->with('photos')->orderBy('created_at', 'desc');

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

        // 3. Faceted Search - Price Range
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
        if ($rating !== null && $rating !== '' && floatval($rating) > 0) {
            $query->where('rating', '>=', floatval($rating));
        }

        // 5. Geolocation Search (Distance)
        if ($request->filled('lat') && $request->filled('lng')) {
            $lat = $request->get('lat');
            $lng = $request->get('lng');
            $radius = $request->get('radius', 50);

            $driver = \DB::getDriverName();

            if ($driver === 'sqlite') {
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

        return response()->json(RestaurantResource::collection($query->paginate(10)));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRestaurantRequest $request)
    {
        $validated = $request->validated();

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

        return response()->json(new RestaurantResource($restaurant->fresh(['photos', 'user'])), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $restaurant = Restaurant::withCount('reviews')
            ->with(['photos', 'reviews.user', 'workingHours'])
            ->findOrFail($id);
        return response()->json(new RestaurantResource($restaurant));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRestaurantRequest $request, string $id)
    {
        $restaurant = Restaurant::findOrFail($id);

        // Ownership check
        if ($restaurant->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

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

        return response()->json(new RestaurantResource($restaurant->fresh(['photos', 'user'])));
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
        $restaurants = $request->user()->restaurants()->withCount('reviews')->with('photos', 'workingHours')->get();
        return response()->json(RestaurantResource::collection($restaurants));
    }

    /**
     * Get statistics for the owner's restaurants.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $restaurantIds = $user->restaurants()->pluck('id');

        $totalReviews = \App\Models\Review::whereIn('restaurant_id', $restaurantIds)->count();
        $avgRating = $user->restaurants()->avg('rating') ?: 0;
        $totalReservations = \App\Models\Reservation::whereIn('restaurant_id', $restaurantIds)->count();

        return response()->json([
            'restaurants_count' => $restaurantIds->count(),
            'total_reviews' => $totalReviews,
            'average_rating' => round($avgRating, 1),
            'total_reservations' => $totalReservations,
        ]);
    }
}
