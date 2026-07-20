import ListingCard, {
    type Listing,
} from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    FileText,
    FolderKanban,
    LoaderCircle,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ListingsResponse {
    data: Listing[];
    meta: PaginationMeta;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administração',
        href: '/admin/dashboard',
    },
    {
        title: 'Anúncios',
        href: '/admin/listings',
    },
];

export default function AdminListingsIndex() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(
        null,
    );
    const [error, setError] = useState('');

    const filteredListings = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return listings;
        }

        return listings.filter((listing) => {
            const title = listing.title.toLowerCase();
            const userName =
                listing.user?.name?.toLowerCase() ?? '';
            const categoryName =
                listing.category?.name?.toLowerCase() ?? '';

            return (
                title.includes(term) ||
                userName.includes(term) ||
                categoryName.includes(term)
            );
        });
    }, [listings, search]);

    async function loadListings(page = 1) {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<ListingsResponse>(
                `/api/admin/listings?page=${page}`,
            );

            setListings(response.data.data ?? []);

            setPagination(
                response.data.meta ?? {
                    current_page: 1,
                    last_page: 1,
                    per_page:
                        response.data.data?.length ?? 10,
                    total:
                        response.data.data?.length ?? 0,
                },
            );
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (error.response?.status === 403) {
                router.visit('/dashboard');
                return;
            }

            setError(
                'Não foi possível carregar os anúncios.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function deleteListing(listing: Listing) {
        const confirmed = window.confirm(
            `Tem a certeza de que pretende eliminar o anúncio "${listing.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(listing.id);
            setError('');

            await api.get('/sanctum/csrf-cookie');

            await api.delete(
                `/api/admin/listings/${listing.id}`,
            );

            const shouldGoToPreviousPage =
                listings.length === 1 &&
                pagination.current_page > 1;

            const nextPage = shouldGoToPreviousPage
                ? pagination.current_page - 1
                : pagination.current_page;

            await loadListings(nextPage);
        } catch (requestError) {
            const error = requestError as AxiosError<{
                message?: string;
            }>;

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
                error.response?.data.message ??
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
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de anúncios" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Gestão de anúncios
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Consulte e remova anúncios publicados na
                            plataforma.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Pesquisar anúncio..."
                                className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <Button variant="outline" asChild>
                            <Link href="/admin/categories">
                                <FolderKanban className="mr-2 h-4 w-4" />
                                Categorias
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total de anúncios
                            </p>

                            <p className="text-2xl font-bold">
                                {pagination.total}
                            </p>
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
                            A carregar anúncios...
                        </p>
                    </div>
                )}

                {!loading &&
                    filteredListings.length === 0 && (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground" />

                            <h2 className="mt-4 text-lg font-semibold">
                                Nenhum anúncio encontrado
                            </h2>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Não existem anúncios correspondentes à
                                pesquisa.
                            </p>
                        </div>
                    )}

                {!loading &&
                    filteredListings.length > 0 && (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredListings.map((listing) => (
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
                                                        href={`/listings/${listing.id}`}
                                                    >
                                                        Visualizar
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
                                                            listing,
                                                        )
                                                    }
                                                >
                                                    {deletingId ===
                                                    listing.id ? (
                                                        <>
                                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                            A eliminar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </>
                                                    )}
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
                                            pagination.current_page ===
                                            1
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

                                    <span className="text-sm text-muted-foreground">
                                        Página{' '}
                                        {pagination.current_page} de{' '}
                                        {pagination.last_page}
                                    </span>

                                    <Button
                                        variant="outline"
                                        disabled={
                                            pagination.current_page ===
                                            pagination.last_page
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
        </AdminLayout>
    );
}