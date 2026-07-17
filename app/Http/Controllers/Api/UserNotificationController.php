<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserNotificationResource;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    /**
     * Lista as notificações do utilizador autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = UserNotification::where(
                'user_id',
                $request->user()->id
            )
            ->latest()
            ->get();

        return response()->json([
            'data' => UserNotificationResource::collection($notifications)
                ->resolve($request),
        ]);
    }

    /**
     * Mostra uma notificação específica.
     */
    public function show(
        Request $request,
        UserNotification $notification
    ): JsonResponse {
        $this->authorizeNotification($request, $notification);

        return response()->json([
            'data' => (new UserNotificationResource($notification))
                ->resolve($request),
        ]);
    }

    /**
     * Marca uma notificação como lida.
     */
    public function markAsRead(
        Request $request,
        UserNotification $notification
    ): JsonResponse {
        $this->authorizeNotification($request, $notification);

        if (! $notification->is_read) {
            $notification->update([
                'is_read' => true,
            ]);
        }

        return response()->json([
            'message' => 'Notificação marcada como lida.',
            'data' => (new UserNotificationResource(
                $notification->fresh()
            ))->resolve($request),
        ]);
    }

    /**
     * Marca todas as notificações como lidas.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $updatedNotifications = UserNotification::where(
                'user_id',
                $request->user()->id
            )
            ->where('is_read', false)
            ->update([
                'is_read' => true,
            ]);

        return response()->json([
            'message' => 'Todas as notificações foram marcadas como lidas.',
            'updated_count' => $updatedNotifications,
        ]);
    }

    /**
     * Elimina uma notificação.
     */
    public function destroy(
        Request $request,
        UserNotification $notification
    ): JsonResponse {
        $this->authorizeNotification($request, $notification);

        $notification->delete();

        return response()->json([
            'message' => 'Notificação eliminada com sucesso.',
        ]);
    }

    /**
     * Confirma que a notificação pertence ao utilizador.
     */
    private function authorizeNotification(
        Request $request,
        UserNotification $notification
    ): void {
        abort_unless(
            (int) $notification->user_id ===
                (int) $request->user()->id,
            403,
            'Não possui autorização para aceder a esta notificação.'
        );
    }
}