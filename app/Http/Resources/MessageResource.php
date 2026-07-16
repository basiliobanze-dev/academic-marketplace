<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'is_read' => (bool) $this->is_read,

            'is_mine' => $request->user()
                ? (int) $this->sender_id === (int) $request->user()->id
                : false,

            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
            ],

            'receiver' => [
                'id' => $this->receiver->id,
                'name' => $this->receiver->name,
            ],

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}