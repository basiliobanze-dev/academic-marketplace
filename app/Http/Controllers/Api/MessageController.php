<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
     public function index(Request $request): JsonResponse{
        $messages = Message::where('sender_id', $request->user()->id)
            ->orWhere('receiver_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(MessageResource::collection($messages));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMessageRequest $request): JsonResponse{
        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => new MessageResource($message)
        ], 201);
    }

    public function conversation(User $user, Request $request): JsonResponse{
        $messages = Message::where(function ($query) use ($request, $user) {
                $query->where('sender_id', $request->user()->id)
                      ->where('receiver_id', $user->id);
            })
            ->orWhere(function ($query) use ($request, $user) {
                $query->where('sender_id', $user->id)
                      ->where('receiver_id', $request->user()->id);
            })
            ->orderBy('created_at')
            ->get();
         return response()->json(MessageResource::collection($messages));
    }
}
