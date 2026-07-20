import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    Bell,
    BookOpen,
    LoaderCircle,
    MessageSquare,
    PackageOpen,
    PlusCircle,
    Search,
    Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Listing {
    id: number;
    title: string;
    created_at: string;
}

interface Message {
    id: number;
    message: string;
    is_read: boolean;
    is_mine: boolean;
    created_at: string;
    sender: {
        id: number;
        name: string;
    };
    receiver: {
        id: number;
        name: string;
    };
}

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer: {
        id: number;
        name: string;
    };
    reviewed_user: {
        id: number;
        name: string;
    };
}

interface UserNotification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface ListingsResponse {
    data: Listing[];
    meta?: {
        total?: number;
    };
}

interface MessagesResponse {
    data: Message[];
}

interface ReviewsResponse {
    data: Review[];
}

interface NotificationsResponse {
    data: UserNotification[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel principal',
        href: '/dashboard',
    },
];

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}

export default function Dashboard() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [notifications, setNotifications] = useState<
        UserNotification[]
    >([]);

    const [totalListings, setTotalListings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const unreadMessages = useMemo(
        () =>
            messages.filter(
                (message) => !message.is_mine && !message.is_read,
            ).length,
        [messages],
    );

    const unreadNotifications = useMemo(
        () =>
            notifications.filter(
                (notification) => !notification.is_read,
            ).length,
        [notifications],
    );

    const totalReviews = reviews.length;

    const recentListings = listings.slice(0, 3);
    const recentMessages = messages.slice(0, 3);
    const recentReviews = reviews.slice(0, 3);

    async function loadDashboard() {
        try {
            setLoading(true);
            setError('');

            const [
                listingsResponse,
                messagesResponse,
                reviewsResponse,
                notificationsResponse,
            ] = await Promise.all([
                api.get<ListingsResponse>('/api/my-listings'),
                api.get<MessagesResponse>('/api/messages'),
                api.get<ReviewsResponse>(
                    '/api/reviews?type=received',
                ),
                api.get<NotificationsResponse>(
                    '/api/notifications',
                ),
            ]);

            const loadedListings =
                listingsResponse.data.data ?? [];

            setListings(loadedListings);

            setTotalListings(
                listingsResponse.data.meta?.total ??
                    loadedListings.length,
            );

            setMessages(
                messagesResponse.data.data ?? [],
            );

            setReviews(
                reviewsResponse.data.data ?? [],
            );

            setNotifications(
                notificationsResponse.data.data ?? [],
            );
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
                    'Não foi possível carregar os dados do painel.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadDashboard();
    }, []);

    const dashboardCards = [
        {
            title: 'Meus anúncios',
            description:
                'Consulte e faça a gestão dos materiais que publicou.',
            value: totalListings,
            icon: PackageOpen,
            href: '/my-listings',
        },
        {
            title: 'Mensagens não lidas',
            description:
                'Consulte as conversas com outros estudantes.',
            value: unreadMessages,
            icon: MessageSquare,
            href: '/messages',
        },
        {
            title: 'Avaliações recebidas',
            description:
                'Veja as avaliações feitas por outros estudantes.',
            value: totalReviews,
            icon: Star,
            href: '/reviews',
        },
        {
            title: 'Notificações não lidas',
            description:
                'Veja os avisos e eventos recentes da sua conta.',
            value: unreadNotifications,
            icon: Bell,
            href: '/notifications',
        },
    ];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Painel principal" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-white to-secondary/20 p-6 md:p-8">
                    <div className="max-w-3xl">
                        <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            Marketplace Académico
                        </span>

                        <h1 className="mt-5 text-3xl font-bold tracking-tight">
                            Bem-vindo ao seu painel
                        </h1>

                        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                            Publique materiais académicos, acompanhe os seus
                            anúncios e comunique com outros estudantes através
                            da plataforma.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/listings/create"
                                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Publicar anúncio
                            </Link>

                            <Link
                                href="/listings"
                                className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Pesquisar materiais
                            </Link>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar painel...
                        </p>
                    </div>
                ) : (
                    <>
                        <section>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold">
                                    Resumo da conta
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Consulte rapidamente as principais
                                    informações da sua actividade na
                                    plataforma.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {dashboardCards.map((card) => {
                                    const Icon = card.icon;

                                    return (
                                        <Link
                                            key={card.title}
                                            href={card.href}
                                            className="group rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Icon className="h-5 w-5" />
                                                </div>

                                                <span className="text-3xl font-bold text-primary">
                                                    {card.value}
                                                </span>
                                            </div>

                                            <h3 className="mt-5 font-semibold">
                                                {card.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                {card.description}
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border bg-card p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <BookOpen className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold">
                                                Anúncios recentes
                                            </h2>

                                            <p className="text-sm text-muted-foreground">
                                                Os seus materiais publicados
                                                recentemente.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                    >
                                        <Link href="/my-listings">
                                            Ver todos
                                        </Link>
                                    </Button>
                                </div>

                                {recentListings.length === 0 ? (
                                    <div className="mt-8 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                                        <PackageOpen className="h-9 w-9 text-muted-foreground" />

                                        <p className="mt-4 font-medium">
                                            Ainda não publicou anúncios
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Publique o primeiro material
                                            académico na plataforma.
                                        </p>

                                        <Link
                                            href="/listings/create"
                                            className="mt-4 text-sm font-medium text-primary hover:underline"
                                        >
                                            Publicar anúncio
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-3">
                                        {recentListings.map(
                                            (listing) => (
                                                <Link
                                                    key={listing.id}
                                                    href={`/listings/${listing.id}`}
                                                    className="flex items-center justify-between gap-4 rounded-lg border p-4 transition hover:bg-muted/40"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {listing.title}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {formatDate(
                                                                listing.created_at,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <BookOpen className="h-5 w-5 shrink-0 text-primary" />
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border bg-card p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold">
                                                Mensagens recentes
                                            </h2>

                                            <p className="text-sm text-muted-foreground">
                                                As conversas mais recentes da
                                                sua conta.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                    >
                                        <Link href="/messages">
                                            Ver todas
                                        </Link>
                                    </Button>
                                </div>

                                {recentMessages.length === 0 ? (
                                    <div className="mt-8 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                                        <MessageSquare className="h-9 w-9 text-muted-foreground" />

                                        <p className="mt-4 font-medium">
                                            Nenhuma mensagem disponível
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            As mensagens trocadas com outros
                                            estudantes aparecerão aqui.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-3">
                                        {recentMessages.map(
                                            (message) => {
                                                const contact =
                                                    message.is_mine
                                                        ? message.receiver
                                                        : message.sender;

                                                return (
                                                    <Link
                                                        key={message.id}
                                                        href={`/messages/${contact.id}`}
                                                        className="block rounded-lg border p-4 transition hover:bg-muted/40"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="truncate font-medium">
                                                                {
                                                                    contact.name
                                                                }
                                                            </p>

                                                            {!message.is_mine &&
                                                                !message.is_read && (
                                                                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                                                        Nova
                                                                    </span>
                                                                )}
                                                        </div>

                                                        <p className="mt-2 truncate text-sm text-muted-foreground">
                                                            {message.is_mine
                                                                ? 'Você: '
                                                                : ''}
                                                            {
                                                                message.message
                                                            }
                                                        </p>
                                                    </Link>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border bg-card p-6 lg:col-span-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Star className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold">
                                                Avaliações recentes
                                            </h2>

                                            <p className="text-sm text-muted-foreground">
                                                As avaliações que recebeu
                                                recentemente.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                    >
                                        <Link href="/reviews">
                                            Ver todas
                                        </Link>
                                    </Button>
                                </div>

                                {recentReviews.length === 0 ? (
                                    <div className="mt-8 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                                        <Star className="h-9 w-9 text-muted-foreground" />

                                        <p className="mt-4 font-medium">
                                            Ainda não recebeu avaliações
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            As avaliações feitas por outros
                                            estudantes aparecerão aqui.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        {recentReviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="rounded-lg border p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-medium">
                                                        {
                                                            review.reviewer
                                                                .name
                                                        }
                                                    </p>

                                                    <div className="flex items-center gap-1 text-sm font-medium">
                                                        <Star className="h-4 w-4" />
                                                        {review.rating}/5
                                                    </div>
                                                </div>

                                                {review.comment && (
                                                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                                                        {review.comment}
                                                    </p>
                                                )}

                                                <p className="mt-3 text-xs text-muted-foreground">
                                                    {formatDate(
                                                        review.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </StudentLayout>
    );
}