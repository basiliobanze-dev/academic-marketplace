import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem } from '@/types';
import { type UserNotification } from '@/types/notification';
import { Head, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    Bell,
    BellRing,
    CheckCheck,
    LoaderCircle,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface PaginatedNotificationsResponse {
    data: UserNotification[];
}

type NotificationsResponse =
    | UserNotification[]
    | PaginatedNotificationsResponse;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel principal',
        href: '/dashboard',
    },
    {
        title: 'Notificações',
        href: '/notifications',
    },
];

function formatNotificationDate(date: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export default function NotificationsIndex() {
    const [notifications, setNotifications] = useState<
        UserNotification[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(
        null,
    );
    const [markingAll, setMarkingAll] = useState(false);
    const [error, setError] = useState('');

    const unreadCount = useMemo(
        () =>
            notifications.filter(
                (notification) => !notification.is_read,
            ).length,
        [notifications],
    );

    async function loadNotifications() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<NotificationsResponse>(
                '/api/notifications',
            );

            const responseData = response.data;

            const loadedNotifications = Array.isArray(responseData)
                ? responseData
                : responseData.data ?? [];

            setNotifications(loadedNotifications);
        } catch (requestError) {
            const axiosError = requestError as AxiosError<{
                message?: string;
            }>;

            if (axiosError.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError(
                axiosError.response?.data.message ??
                    'Não foi possível carregar as notificações.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(notificationId: number) {
        try {
            setProcessingId(notificationId);
            setError('');

            await api.get('/sanctum/csrf-cookie');

            const response = await api.patch<{
                message: string;
                data: UserNotification;
            }>(
                `/api/notifications/${notificationId}/read`,
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? response.data.data
                        : notification,
                ),
            );
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError(
                'Não foi possível marcar a notificação como lida.',
            );
        } finally {
            setProcessingId(null);
        }
    }

    async function markAllAsRead() {
        if (unreadCount === 0) {
            return;
        }

        try {
            setMarkingAll(true);
            setError('');

            await api.get('/sanctum/csrf-cookie');
            await api.patch('/api/notifications/read-all');

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({
                    ...notification,
                    is_read: true,
                })),
            );
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError(
                'Não foi possível marcar todas as notificações como lidas.',
            );
        } finally {
            setMarkingAll(false);
        }
    }

    async function deleteNotification(notificationId: number) {
        const confirmed = window.confirm(
            'Tem a certeza de que pretende eliminar esta notificação?',
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(notificationId);
            setError('');

            await api.get('/sanctum/csrf-cookie');
            await api.delete(
                `/api/notifications/${notificationId}`,
            );

            setNotifications((currentNotifications) =>
                currentNotifications.filter(
                    (notification) =>
                        notification.id !== notificationId,
                ),
            );
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError(
                'Não foi possível eliminar a notificação.',
            );
        } finally {
            setProcessingId(null);
        }
    }

    useEffect(() => {
        void loadNotifications();
    }, []);

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificações" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Notificações
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Acompanhe as actividades recentes da sua conta.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        disabled={
                            markingAll ||
                            unreadCount === 0
                        }
                        onClick={() => void markAllAsRead()}
                    >
                        {markingAll ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCheck className="mr-2 h-4 w-4" />
                        )}

                        Marcar todas como lidas
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Bell className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total
                                </p>

                                <p className="text-2xl font-bold">
                                    {notifications.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BellRing className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Não lidas
                                </p>

                                <p className="text-2xl font-bold">
                                    {unreadCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar notificações...
                        </p>
                    </div>
                )}

                {!loading &&
                    notifications.length === 0 && (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground" />

                            <h2 className="mt-4 text-lg font-semibold">
                                Nenhuma notificação
                            </h2>

                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                As notificações relacionadas com a sua
                                conta aparecerão aqui.
                            </p>
                        </div>
                    )}

                {!loading &&
                    notifications.length > 0 && (
                        <div className="overflow-hidden rounded-xl border bg-card">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex flex-col gap-4 border-b p-5 last:border-b-0 sm:flex-row sm:items-start ${
                                        notification.is_read
                                            ? 'bg-card'
                                            : 'bg-primary/5'
                                    }`}
                                >
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                            notification.is_read
                                                ? 'bg-muted text-muted-foreground'
                                                : 'bg-primary/10 text-primary'
                                        }`}
                                    >
                                        {notification.is_read ? (
                                            <Bell className="h-5 w-5" />
                                        ) : (
                                            <BellRing className="h-5 w-5" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold">
                                                {notification.title}
                                            </h2>

                                            {!notification.is_read && (
                                                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                                    Nova
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {notification.message}
                                        </p>

                                        <p className="mt-3 text-xs text-muted-foreground">
                                            {formatNotificationDate(
                                                notification.created_at,
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        {!notification.is_read && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={
                                                    processingId ===
                                                    notification.id
                                                }
                                                onClick={() =>
                                                    void markAsRead(
                                                        notification.id,
                                                    )
                                                }
                                            >
                                                <CheckCheck className="mr-2 h-4 w-4" />
                                                Marcar como lida
                                            </Button>
                                        )}

                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            disabled={
                                                processingId ===
                                                notification.id
                                            }
                                            onClick={() =>
                                                void deleteNotification(
                                                    notification.id,
                                                )
                                            }
                                            aria-label="Eliminar notificação"
                                        >
                                            {processingId ===
                                            notification.id ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </StudentLayout>
    );
}