<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GooglePlacesController extends Controller
{
    /**
     * Search restaurants via Google Places Text Search API.
     * Acts as a server-side proxy to avoid CORS issues.
     */
    public function search(Request $request)
    {
        $apiKey = env('GOOGLE_MAPS_API_KEY');

        if (!$apiKey) {
            return response()->json(['error' => 'Google Maps API key not configured'], 500);
        }

        $query = $request->get('query', 'restaurant');
        $location = $request->get('location'); // "lat,lng"
        $radius = $request->get('radius', 5000);
        $type = 'restaurant';
        $opennow = $request->get('opennow');
        $minprice = $request->get('minprice');
        $maxprice = $request->get('maxprice');

        // Build the Google Places Text Search URL
        $params = [
            'query' => $query,
            'type' => $type,
            'key' => $apiKey,
        ];

        if ($location) {
            $params['location'] = $location;
            $params['radius'] = $radius;
        }

        if ($opennow === 'true') {
            $params['opennow'] = true;
        }

        if ($minprice !== null) {
            $params['minprice'] = $minprice;
        }
        if ($maxprice !== null) {
            $params['maxprice'] = $maxprice;
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/place/textsearch/json', $params);
            $data = $response->json();

            if (!isset($data['results'])) {
                return response()->json(['restaurants' => [], 'status' => $data['status'] ?? 'ERROR']);
            }

            $restaurants = collect($data['results'])->map(function ($place) use ($apiKey) {
                $photoUrl = null;
                if (!empty($place['photos'])) {
                    $ref = $place['photos'][0]['photo_reference'];
                    $photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={$ref}&key={$apiKey}";
                }

                return [
                'id' => $place['place_id'],
                'name' => $place['name'],
                'address' => $place['formatted_address'] ?? ($place['vicinity'] ?? ''),
                'latitude' => $place['geometry']['location']['lat'],
                'longitude' => $place['geometry']['location']['lng'],
                'rating' => $place['rating'] ?? 0,
                'user_ratings' => $place['user_ratings_total'] ?? 0,
                'price_level' => $place['price_level'] ?? null,
                'open_now' => $place['opening_hours']['open_now'] ?? null,
                'types' => $place['types'] ?? [],
                'photo_url' => $photoUrl,
                ];
            });

            return response()->json([
                'restaurants' => $restaurants,
                'status' => $data['status'],
            ]);
        }
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
