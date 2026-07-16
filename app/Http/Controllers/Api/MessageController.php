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
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::with([
                'sender:id,name',
                'receiver:id,name',
            ])
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->latest()
            ->get();

        return response()->json([
            'data' => MessageResource::collection($messages)
                ->resolve($request),
        ]);
    }

    public function store(StoreMessageRequest $request): JsonResponse
    {
        $authenticatedUserId = $request->user()->id;
        $receiverId = (int) $request->validated('receiver_id');

        if ($receiverId === $authenticatedUserId) {
            return response()->json([
                'message' => 'Não pode enviar uma mensagem para si próprio.',
            ], 422);
        }

        $message = Message::create([
            'sender_id' => $authenticatedUserId,
            'receiver_id' => $receiverId,
            'message' => $request->validated('message'),
            'is_read' => false,
        ]);

        $message->load([
            'sender:id,name',
            'receiver:id,name',
        ]);

        return response()->json([
            'message' => 'Mensagem enviada com sucesso.',
            'data' => (new MessageResource($message))
                ->resolve($request),
        ], 201);
    }

    public function conversation(
        User $user,
        Request $request
    ): JsonResponse {
        $authenticatedUserId = $request->user()->id;

        if ($user->id === $authenticatedUserId) {
            return response()->json([
                'message' => 'Não pode abrir uma conversa consigo próprio.',
            ], 422);
        }

        Message::where('sender_id', $user->id)
            ->where('receiver_id', $authenticatedUserId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
            ]);

        $messages = Message::with([
                'sender:id,name',
                'receiver:id,name',
            ])
            ->where(function ($query) use (
                $authenticatedUserId,
                $user
            ) {
                $query->where(
                    'sender_id',
                    $authenticatedUserId
                )->where(
                    'receiver_id',
                    $user->id
                );
            })
            ->orWhere(function ($query) use (
                $authenticatedUserId,
                $user
            ) {
                $query->where(
                    'sender_id',
                    $user->id
                )->where(
                    'receiver_id',
                    $authenticatedUserId
                );
            })
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'data' => MessageResource::collection($messages)
                ->resolve($request),
        ]);
    }
}