import PublicHeader from '@/components/public/public-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    LoaderCircle,
    MessageSquare,
    Tag,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ListingUser {
    id: number;
    name: string;
    email?: string;
}

interface ListingCategory {
    id: number;
    name: string;
    description?: string | null;
}

interface Listing {
    id: number;
    title: string;
    description: string;
    price: string | number | null;
    transaction_type: 'sale' | 'exchange';
    status: 'available' | 'sold' | 'exchanged';
    created_at: string;
    updated_at: string;
    user?: ListingUser | null;
    category?: ListingCategory | null;
}

interface ShowListingProps {
    listingId: number;
}

function formatPrice(price: string | number | null): string {
    if (price === null || price === '') {
        return 'Preço não indicado';
    }

    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2,
    }).format(Number(price));
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

function transactionLabel(type: Listing['transaction_type']) {
    return type === 'sale' ? 'Venda' : 'Troca';
}

function statusLabel(status: Listing['status']) {
    const labels = {
        available: 'Disponível',
        sold: 'Vendido',
        exchanged: 'Trocado',
    };

    return labels[status];
}

export default function ShowListing({
    listingId,
}: ShowListingProps) {
    const { auth } = usePage<SharedData>().props;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadListing() {
            try {
                setLoading(true);
                setError('');

                const response = await api.get(`/api/listings/${listingId}`);

                setListing(response.data.data);
            } catch {
                setError(
                    'Não foi possível carregar os detalhes do material.',
                );
            } finally {
                setLoading(false);
            }
        }

        void loadListing();
    }, [listingId]);

    return (
        <>
            <Head title={listing?.title ?? 'Detalhes do material'} />

            <div className="min-h-screen bg-background">
                <PublicHeader />

                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    <Button variant="ghost" asChild className="mb-6">
                        <Link href="/listings">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar aos materiais
                        </Link>
                    </Button>

                    {loading && (
                        <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border bg-card">
                            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />

                            <p className="mt-4 text-sm text-muted-foreground">
                                A carregar detalhes...
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                            <p className="font-semibold text-destructive">
                                Ocorreu um erro
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                                {error}
                            </p>

                            <Button
                                className="mt-5"
                                variant="outline"
                                asChild
                            >
                                <Link href="/listings">
                                    Voltar aos materiais
                                </Link>
                            </Button>
                        </div>
                    )}

                    {!loading && listing && (
                        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
                            <section className="space-y-6">
                                <div className="flex min-h-80 items-center justify-center rounded-2xl border bg-gradient-to-br from-primary/10 via-white to-secondary/20">
                                    <BookOpen className="h-28 w-28 text-primary/60" />
                                </div>

                                <Card>
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>
                                                {transactionLabel(
                                                    listing.transaction_type,
                                                )}
                                            </Badge>

                                            <Badge variant="outline">
                                                {statusLabel(listing.status)}
                                            </Badge>

                                            {listing.category && (
                                                <Badge variant="secondary">
                                                    {listing.category.name}
                                                </Badge>
                                            )}
                                        </div>

                                        <h1 className="mt-5 text-3xl font-bold tracking-tight">
                                            {listing.title}
                                        </h1>

                                        <div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" />
                                                Publicado em{' '}
                                                {formatDate(
                                                    listing.created_at,
                                                )}
                                            </div>

                                            {listing.category && (
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4" />
                                                    {listing.category.name}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8">
                                            <h2 className="text-lg font-semibold">
                                                Descrição do material
                                            </h2>

                                            <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">
                                                {listing.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            <aside className="space-y-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <p className="text-sm text-muted-foreground">
                                            {listing.transaction_type ===
                                            'sale'
                                                ? 'Preço'
                                                : 'Tipo de transacção'}
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-primary">
                                            {listing.transaction_type ===
                                            'sale'
                                                ? formatPrice(listing.price)
                                                : 'Disponível para troca'}
                                        </p>

                                        <div className="mt-6 border-t pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <User className="h-5 w-5" />
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Anunciante
                                                    </p>

                                                    <p className="font-semibold">
                                                        {listing.user?.name ??
                                                            'Utilizador não identificado'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            {auth?.user ? (
                                                auth.user.id === listing.user?.id ? (
                                                    <Button
                                                        className="w-full"
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/my-listings/${listing.id}/edit`}
                                                        >
                                                            Editar o meu anúncio
                                                        </Link>
                                                    </Button>
                                                ) : listing.user ? (
                                                    <Button className="w-full" asChild>
                                                        <Link href={`/messages/${listing.user.id}`}>
                                                            <MessageSquare className="mr-2 h-4 w-4" />
                                                            Contactar anunciante
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button className="w-full" disabled>
                                                        Anunciante indisponível
                                                    </Button>
                                                )
                                            ) : (
                                                <Button className="w-full" asChild>
                                                    <Link href="/login">
                                                        Entrar para contactar
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                        <p className="mt-4 text-center text-xs text-muted-foreground">
                                            A negociação é realizada
                                            directamente entre os estudantes.
                                        </p>
                                    </CardContent>
                                </Card>
                            </aside>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}