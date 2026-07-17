import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem } from '@/types';
import { type Review } from '@/types/review';
import { Head, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    LoaderCircle,
    MessageSquareText,
    Star,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ReviewFilter = 'received' | 'given';

interface ReviewsResponse {
    data: Review[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel principal',
        href: '/dashboard',
    },
    {
        title: 'Avaliações',
        href: '/reviews',
    },
];

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

export default function ReviewsIndex() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [filter, setFilter] =
        useState<ReviewFilter>('received');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] =
        useState<number | null>(null);
    const [error, setError] = useState('');

    const averageRating = useMemo(() => {
        if (filter !== 'received' || reviews.length === 0) {
            return 0;
        }

        const total = reviews.reduce(
            (sum, review) => sum + review.rating,
            0,
        );

        return total / reviews.length;
    }, [reviews, filter]);

    async function loadReviews(
        selectedFilter: ReviewFilter,
    ) {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<ReviewsResponse>(
                `/api/reviews?type=${selectedFilter}`,
            );

            setReviews(response.data.data ?? []);
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError(
                'Não foi possível carregar as avaliações.',
            );
        } finally {
            setLoading(false);
        }
    }

    function changeFilter(selectedFilter: ReviewFilter) {
        setFilter(selectedFilter);
        void loadReviews(selectedFilter);
    }

    async function deleteReview(reviewId: number) {
        const confirmed = window.confirm(
            'Tem a certeza de que pretende eliminar esta avaliação?',
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(reviewId);
            setError('');

            await api.get('/sanctum/csrf-cookie');
            await api.delete(`/api/reviews/${reviewId}`);

            setReviews((currentReviews) =>
                currentReviews.filter(
                    (review) => review.id !== reviewId,
                ),
            );
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 403) {
                setError(
                    'Não possui autorização para eliminar esta avaliação.',
                );
                return;
            }

            setError(
                'Não foi possível eliminar a avaliação.',
            );
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        void loadReviews('received');
    }, []);

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Avaliações" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Avaliações
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consulte as avaliações recebidas e feitas
                        por si.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={
                            filter === 'received'
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() =>
                            changeFilter('received')
                        }
                    >
                        Avaliações recebidas
                    </Button>

                    <Button
                        variant={
                            filter === 'given'
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() =>
                            changeFilter('given')
                        }
                    >
                        Avaliações feitas
                    </Button>
                </div>

                {filter === 'received' && !loading && (
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Star className="h-6 w-6 fill-current" />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Classificação média
                                </p>

                                <p className="text-2xl font-bold">
                                    {averageRating.toFixed(1)} / 5
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {reviews.length}{' '}
                                    {reviews.length === 1
                                        ? 'avaliação recebida'
                                        : 'avaliações recebidas'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar avaliações...
                        </p>
                    </div>
                )}

                {!loading && reviews.length === 0 && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                        <MessageSquareText className="h-12 w-12 text-muted-foreground" />

                        <h2 className="mt-4 text-lg font-semibold">
                            Nenhuma avaliação disponível
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {filter === 'received'
                                ? 'Ainda não recebeu avaliações.'
                                : 'Ainda não avaliou outros utilizadores.'}
                        </p>
                    </div>
                )}

                {!loading && reviews.length > 0 && (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {reviews.map((review) => (
                            <article
                                key={review.id}
                                className="rounded-xl border bg-card p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <User className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="truncate font-semibold">
                                                {filter === 'received'
                                                    ? review.reviewer.name
                                                    : review.reviewed_user
                                                          .name}
                                            </h2>

                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    review.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {review.is_mine && (
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            disabled={
                                                deletingId === review.id
                                            }
                                            onClick={() =>
                                                void deleteReview(
                                                    review.id,
                                                )
                                            }
                                            aria-label="Eliminar avaliação"
                                        >
                                            {deletingId === review.id ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-4 flex gap-1">
                                    {Array.from(
                                        { length: 5 },
                                        (_, index) => {
                                            const starNumber =
                                                index + 1;

                                            return (
                                                <Star
                                                    key={starNumber}
                                                    className={`h-5 w-5 ${
                                                        starNumber <=
                                                        review.rating
                                                            ? 'fill-primary text-primary'
                                                            : 'text-muted-foreground/30'
                                                    }`}
                                                />
                                            );
                                        },
                                    )}
                                </div>

                                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                    {review.comment ||
                                        'Nenhum comentário foi adicionado.'}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}