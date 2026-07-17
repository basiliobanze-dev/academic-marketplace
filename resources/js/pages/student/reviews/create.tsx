import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import { LoaderCircle, Star, User } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface ReviewedUser {
    id: number;
    name: string;
}

interface CreateReviewProps {
    reviewedUser: ReviewedUser;
}

interface ValidationErrors {
    [key: string]: string[];
}

export default function CreateReview({
    reviewedUser,
}: CreateReviewProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Painel principal',
            href: '/dashboard',
        },
        {
            title: 'Avaliações',
            href: '/reviews',
        },
        {
            title: `Avaliar ${reviewedUser.name}`,
            href: `/reviews/create/${reviewedUser.id}`,
        },
    ];

    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState('');

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (rating === 0) {
            setErrors({
                rating: ['Seleccione uma classificação.'],
            });

            return;
        }

        try {
            setSubmitting(true);
            setErrors({});
            setGeneralError('');

            await api.get('/sanctum/csrf-cookie');

            await api.post('/api/reviews', {
                reviewed_user_id: reviewedUser.id,
                rating,
                comment: comment.trim() || null,
            });

            router.visit('/reviews');
        } catch (requestError) {
            const error = requestError as AxiosError<{
                message?: string;
                errors?: ValidationErrors;
            }>;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                setGeneralError(
                    error.response.data.message ?? '',
                );

                return;
            }

            setGeneralError(
                error.response?.data.message ??
                    'Não foi possível criar a avaliação.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title={`Avaliar ${reviewedUser.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Avaliar utilizador
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Partilhe a sua experiência com este estudante.
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </span>

                            {reviewedUser.name}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {generalError && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                    {generalError}
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label>Classificação</Label>

                                <div
                                    className="flex gap-2"
                                    onMouseLeave={() =>
                                        setHoveredRating(0)
                                    }
                                >
                                    {Array.from(
                                        { length: 5 },
                                        (_, index) => {
                                            const value = index + 1;
                                            const active =
                                                value <=
                                                (hoveredRating || rating);

                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() =>
                                                        setRating(value)
                                                    }
                                                    onMouseEnter={() =>
                                                        setHoveredRating(value)
                                                    }
                                                    className="rounded-md p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
                                                    aria-label={`${value} estrelas`}
                                                >
                                                    <Star
                                                        className={`h-8 w-8 ${
                                                            active
                                                                ? 'fill-primary text-primary'
                                                                : 'text-muted-foreground/30'
                                                        }`}
                                                    />
                                                </button>
                                            );
                                        },
                                    )}
                                </div>

                                {rating > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        {rating} de 5 estrelas
                                    </p>
                                )}

                                {errors.rating?.[0] && (
                                    <p className="text-sm text-destructive">
                                        {errors.rating[0]}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">
                                    Comentário
                                </Label>

                                <textarea
                                    id="comment"
                                    rows={6}
                                    maxLength={1000}
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(event.target.value)
                                    }
                                    placeholder="Descreva como foi a comunicação, negociação ou troca com este utilizador."
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />

                                <div className="flex justify-between gap-3">
                                    <div>
                                        {errors.comment?.[0] && (
                                            <p className="text-sm text-destructive">
                                                {errors.comment[0]}
                                            </p>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        {comment.length}/1000
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(
                                            `/messages/${reviewedUser.id}`,
                                        )
                                    }
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={submitting || rating === 0}
                                >
                                    {submitting && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}

                                    Enviar avaliação
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}