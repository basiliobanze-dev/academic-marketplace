<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'role' => $this->role,

            'email_verified_at' =>
                $this->email_verified_at?->toISOString(),

            'created_at' =>
                $this->created_at?->toISOString(),

            'updated_at' =>
                $this->updated_at?->toISOString(),

            'listings' => ListingResource::collection(
                $this->whenLoaded('listings')
            ),

            'reviews_given' => ReviewResource::collection(
                $this->whenLoaded('reviewsGiven')
            ),

            'reviews_received' => ReviewResource::collection(
                $this->whenLoaded('reviewsReceived')
            ),

            'notifications' => UserNotificationResource::collection(
                $this->whenLoaded('notifications')
            ),
        ];
    }
}