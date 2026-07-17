<?php

namespace App\Services;

use App\Models\UserNotification;

class UserNotificationService
{
    /**
     * Cria uma notificação para um utilizador.
     */
    public function create(
        int $userId,
        string $title,
        string $message
    ): UserNotification {
        return UserNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
        ]);
    }
}