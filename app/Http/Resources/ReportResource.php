<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
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
            'reason' => $this->reason,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'listing' => new ListingResource($this->whenLoaded('listing')),
            'reported_user' => new UserResource($this->whenLoaded('reportedUser')),
        ];
    }
}
