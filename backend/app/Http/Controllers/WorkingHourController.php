<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\WorkingHour;
use Illuminate\Http\Request;

class WorkingHourController extends Controller
{
    /**
     * Display a listing of the working hours for a restaurant.
     */
    public function index($restaurantId)
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        return response()->json($restaurant->workingHours);
    }

    /**
     * Store or update working hours for a restaurant.
     */
    public function store(Request $request, $restaurantId)
    {
        $restaurant = Restaurant::findOrFail($restaurantId);

        if ($restaurant->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'working_hours' => 'required|array',
            'working_hours.*.day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'working_hours.*.open_time' => 'nullable|string',
            'working_hours.*.close_time' => 'nullable|string',
            'working_hours.*.is_closed' => 'required|boolean',
        ]);

        foreach ($request->working_hours as $hourData) {
            $restaurant->workingHours()->updateOrCreate(
                ['day' => $hourData['day']],
                [
                    'open_time' => $hourData['open_time'],
                    'close_time' => $hourData['close_time'],
                    'is_closed' => $hourData['is_closed'],
                ]
            );
        }

        return response()->json([
            'message' => 'Working hours updated successfully',
            'working_hours' => $restaurant->workingHours,
        ]);
    }
}
