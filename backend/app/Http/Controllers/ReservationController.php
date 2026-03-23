<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Store a new reservation (Customer).
     */
    public function store(Request $request, $restaurantId)
    {
        // Check if user is blocked
        $user = $request->user();
        if ($user->is_blocked) {
            return response()->json(['message' => 'Votre compte est bloqué. Vous ne pouvez pas faire de réservation.'], 403);
        }

        $request->validate([
            'reservation_date' => 'required|date|after_or_equal:today',
            'reservation_time' => 'required',
            'guests_count' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $restaurant = Restaurant::findOrFail($restaurantId);

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'restaurant_id' => $restaurant->id,
            'reservation_date' => $request->reservation_date,
            'reservation_time' => $request->reservation_time,
            'guests_count' => $request->guests_count,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Réservation effectuée avec succès. En attente de confirmation du restaurant.',
            'reservation' => $reservation
        ], 201);
    }

    /**
     * List reservations for the current user (Customer).
     */
    public function index(Request $request)
    {
        $reservations = Reservation::with('restaurant')
            ->where('user_id', $request->user()->id)
            ->orderBy('reservation_date', 'desc')
            ->get();

        return response()->json($reservations);
    }

    /**
     * List reservations for the restaurant owner.
     */
    public function ownerReservations(Request $request)
    {
        // Get all restaurants owned by the user
        $restaurantIds = $request->user()->restaurants()->pluck('id');

        $reservations = Reservation::with(['restaurant', 'user'])
            ->whereIn('restaurant_id', $restaurantIds)
            ->orderBy('reservation_date', 'desc')
            ->get();

        return response()->json($reservations);
    }

    /**
     * Update reservation status (Owner).
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:confirmed,cancelled',
        ]);

        $reservation = Reservation::findOrFail($id);

        // Security check: Ensure the user owns the restaurant
        if ($reservation->restaurant->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $reservation->status = $request->status;
        $reservation->save();

        return response()->json([
            'message' => 'Statut de la réservation mis à jour.',
            'reservation' => $reservation
        ]);
    }
}
