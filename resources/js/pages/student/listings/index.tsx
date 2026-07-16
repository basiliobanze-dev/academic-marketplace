import ListingCard, {
    type Listing,
} from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    LoaderCircle,
    PackageOpen,
    PlusCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

interface ListingsResponse {
    data: Listing[];
    meta: PaginationMeta;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel principal',
        href: '/dashboard',
    },
    {
        title: 'Meus anúncios',
        href: '/my-listings',
    },
];

export default function MyListings() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(
        null,
    );
    const [error, setError] = useState('');

    async function loadListings(page = 1) {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<ListingsResponse>(
                `/api/my-listings?page=${page}`,
            );

            setListings(response.data.data ?? []);
            setPagination(response.data.meta);
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError(
                'Não foi possível carregar os seus anúncios.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function deleteListing(id: number) {
        const confirmed = window.confirm(
            'Tem a certeza de que pretende eliminar este anúncio?',
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            setError('');

            await api.get('/sanctum/csrf-cookie');
            await api.delete(`/api/listings/${id}`);

            const shouldGoToPreviousPage =
                listings.length === 1 &&
                pagination.current_page > 1;

            const nextPage = shouldGoToPreviousPage
                ? pagination.current_page - 1
                : pagination.current_page;

            await loadListings(nextPage);
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (error.response?.status === 403) {
                setError(
                    'Não possui autorização para eliminar este anúncio.',
                );
                return;
            }

            setError(
                'Não foi possível eliminar o anúncio.',
            );
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        void loadListings();
    }, []);

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Meus anúncios" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Meus anúncios
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Consulte e faça a gestão dos materiais
                            que publicou.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/listings/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Publicar anúncio
                        </Link>
                    </Button>
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
                            A carregar anúncios...
                        </p>
                    </div>
                )}

                {!loading && listings.length === 0 && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                        <PackageOpen className="h-12 w-12 text-muted-foreground" />

                        <h2 className="mt-4 text-lg font-semibold">
                            Ainda não publicou anúncios
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Publique o seu primeiro material académico.
                        </p>

                        <Button className="mt-5" asChild>
                            <Link href="/listings/create">
                                Publicar anúncio
                            </Link>
                        </Button>
                    </div>
                )}

                {!loading && listings.length > 0 && (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {listings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    actions={
                                        <>
                                            <Button
                                                className="flex-1"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={`/my-listings/${listing.id}/edit`}
                                                >
                                                    Editar
                                                </Link>
                                            </Button>

                                            <Button
                                                className="flex-1"
                                                variant="destructive"
                                                disabled={
                                                    deletingId ===
                                                    listing.id
                                                }
                                                onClick={() =>
                                                    void deleteListing(
                                                        listing.id,
                                                    )
                                                }
                                            >
                                                {deletingId ===
                                                listing.id
                                                    ? 'A eliminar...'
                                                    : 'Eliminar'}
                                            </Button>
                                        </>
                                    }
                                />
                            ))}
                        </div>

                        {pagination.last_page > 1 && (
                            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button
                                    variant="outline"
                                    disabled={
                                        pagination.current_page === 1 ||
                                        loading
                                    }
                                    onClick={() =>
                                        void loadListings(
                                            pagination.current_page -
                                                1,
                                        )
                                    }
                                >
                                    Anterior
                                </Button>

                                <span className="flex items-center text-sm text-muted-foreground">
                                    Página {pagination.current_page} de{' '}
                                    {pagination.last_page}
                                </span>

                                <Button
                                    variant="outline"
                                    disabled={
                                        pagination.current_page ===
                                            pagination.last_page ||
                                        loading
                                    }
                                    onClick={() =>
                                        void loadListings(
                                            pagination.current_page +
                                                1,
                                        )
                                    }
                                >
                                    Seguinte
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </StudentLayout>
    );
}