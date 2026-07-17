<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use App\Services\UserNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Lista as mensagens relacionadas com o utilizador autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

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

    /**
     * Envia uma mensagem.
     */
    public function store(
        StoreMessageRequest $request,
        UserNotificationService $notificationService
    ): JsonResponse {
        $authenticatedUser = $request->user();
        $authenticatedUserId = (int) $authenticatedUser->id;
        $receiverId = (int) $request->validated('receiver_id');

        if ($receiverId === $authenticatedUserId) {
            return response()->json([
                'message' => 'Não pode enviar uma mensagem para si próprio.',
            ], 422);
        }

        $message = DB::transaction(function () use (
            $request,
            $authenticatedUser,
            $authenticatedUserId,
            $receiverId,
            $notificationService
        ) {
            $message = Message::create([
                'sender_id' => $authenticatedUserId,
                'receiver_id' => $receiverId,
                'message' => $request->validated('message'),
                'is_read' => false,
            ]);

            $notificationService->create(
                userId: $receiverId,
                title: 'Nova mensagem',
                message: $authenticatedUser->name
                    . ' enviou-lhe uma nova mensagem.'
            );

            return $message;
        });

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

    /**
     * Mostra a conversa com outro utilizador.
     */
    public function conversation(
        User $user,
        Request $request
    ): JsonResponse {
        $authenticatedUserId = (int) $request->user()->id;

        if ((int) $user->id === $authenticatedUserId) {
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