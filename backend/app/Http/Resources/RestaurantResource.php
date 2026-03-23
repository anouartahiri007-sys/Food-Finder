<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'cuisine_type' => $this->cuisine_type,
            'price_range' => $this->price_range,
            'dietary_options' => $this->dietary_options,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'website' => $this->website,
            'phone' => $this->phone,
            'rating' => $this->rating ?? 0,
            'reviews_count' => $this->reviews_count ?? 0,
            'image_url' => $this->image_url,
            'average_price' => $this->average_price,
            'is_open_now' => $this->isOpenNow(),
            'photos' => PhotoResource::collection($this->whenLoaded('photos')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'working_hours' => $this->whenLoaded('workingHours'),
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Check if restaurant is currently open.
     */
    private function isOpenNow(): bool
    {
        if (!$this->opening_time || !$this->closing_time) {
            return false;
        }

        $now = now()->format('H:i');
        $opening = $this->opening_time;
        $closing = $this->closing_time;

        // Handle overnight hours (e.g., 22:00 to 02:00)
        if ($closing < $opening) {
            return $now >= $opening || $now <= $closing;
        }

        return $now >= $opening && $now <= $closing;
    }
}
