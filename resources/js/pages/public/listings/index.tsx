import ListingCard, {
    type Listing,
} from '@/components/listings/listing-card';
import PublicHeader from '@/components/public/public-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import {
    type FormEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';

interface Category {
    id: number;
    name: string;
    description?: string | null;
}

interface ResourceCollection<T> {
    data: T[];
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface PaginatedListingsResponse {
    data: Listing[];
    meta: PaginationMeta;
}

interface ListingFilters {
    search: string;
    category: string;
    transaction_type: string;
    status: string;
}

const initialFilters: ListingFilters = {
    search: '',
    category: '',
    transaction_type: '',
    status: '',
};

export default function ListingsIndex() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<ListingFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] =
        useState<ListingFilters>(initialFilters);

    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
    });

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = useCallback(async () => {
        try {
            setCategoriesLoading(true);

            const response = await fetch('/api/categories', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Não foi possível carregar as categorias.');
            }

            const result: ResourceCollection<Category> =
                await response.json();

            setCategories(result.data ?? []);
        } catch (requestError) {
            console.error(requestError);
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    const loadListings = useCallback(
        async (
            page: number,
            activeFilters: ListingFilters,
        ) => {
            try {
                setLoading(true);
                setError(null);

                const parameters = new URLSearchParams();

                parameters.set('page', String(page));

                if (activeFilters.search.trim()) {
                    parameters.set(
                        'search',
                        activeFilters.search.trim(),
                    );
                }

                if (activeFilters.category) {
                    parameters.set(
                        'category',
                        activeFilters.category,
                    );
                }

                if (activeFilters.transaction_type) {
                    parameters.set(
                        'transaction_type',
                        activeFilters.transaction_type,
                    );
                }

                if (activeFilters.status) {
                    parameters.set(
                        'status',
                        activeFilters.status,
                    );
                }

                const response = await fetch(
                    `/api/listings?${parameters.toString()}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        'Não foi possível carregar os materiais.',
                    );
                }

                const result: PaginatedListingsResponse =
                    await response.json();

                setListings(result.data ?? []);

                if (result.meta) {
                    setPagination(result.meta);
                }
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Ocorreu um erro ao carregar os materiais.',
                );

                setListings([]);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        void loadCategories();
        void loadListings(1, initialFilters);
    }, [loadCategories, loadListings]);

    function handleFilterChange(
        field: keyof ListingFilters,
        value: string,
    ) {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [field]: value,
        }));
    }

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setAppliedFilters(filters);
        void loadListings(1, filters);
    }

    function clearFilters() {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);

        void loadListings(1, initialFilters);
    }

    function changePage(page: number) {
        if (
            page < 1 ||
            page > pagination.last_page ||
            page === pagination.current_page
        ) {
            return;
        }

        void loadListings(page, appliedFilters);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    return (
        <>
            <Head title="Materiais académicos" />

            <div className="min-h-screen bg-background">
                <PublicHeader />

                <main>
                    <section className="border-b bg-gradient-to-br from-primary/10 via-white to-secondary/20">
                        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
                            <div className="max-w-3xl">
                                <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                    Materiais académicos
                                </span>

                                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Encontre o material que você precisa
                                </h1>

                                <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                                    Pesquise livros, apontamentos, exames
                                    anteriores, exercícios e outros materiais
                                    publicados pelos estudantes.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                        <form
                            onSubmit={handleSearch}
                            className="mb-10 rounded-2xl border bg-card p-5 shadow-sm"
                        >
                            <div className="mb-5 flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />

                                <h2 className="font-semibold">
                                    Pesquisar e filtrar
                                </h2>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="relative lg:col-span-2">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        value={filters.search}
                                        onChange={(event) =>
                                            handleFilterChange(
                                                'search',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Pesquisar pelo título..."
                                        className="pl-9"
                                    />
                                </div>

                                <select
                                    value={filters.category}
                                    onChange={(event) =>
                                        handleFilterChange(
                                            'category',
                                            event.target.value,
                                        )
                                    }
                                    disabled={categoriesLoading}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">
                                        Todas as categorias
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={filters.transaction_type}
                                    onChange={(event) =>
                                        handleFilterChange(
                                            'transaction_type',
                                            event.target.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">
                                        Venda ou troca
                                    </option>

                                    <option value="sale">Venda</option>
                                    <option value="exchange">Troca</option>
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(event) =>
                                        handleFilterChange(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">
                                        Todos os estados
                                    </option>

                                    <option value="available">
                                        Disponível
                                    </option>

                                    <option value="sold">Vendido</option>

                                    <option value="exchanged">
                                        Trocado
                                    </option>
                                </select>

                                <div className="flex gap-2 md:col-span-2 lg:col-span-3">
                                    <Button type="submit">
                                        <Search className="mr-2 h-4 w-4" />
                                        Pesquisar
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Limpar filtros
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Materiais disponíveis
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {pagination.total}{' '}
                                    {pagination.total === 1
                                        ? 'material encontrado'
                                        : 'materiais encontrados'}
                                </p>
                            </div>

                            {pagination.from !== null &&
                                pagination.to !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        A mostrar {pagination.from} a{' '}
                                        {pagination.to}
                                    </p>
                                )}
                        </div>

                        {loading && (
                            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border bg-card">
                                <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                                <p className="mt-4 text-sm text-muted-foreground">
                                    A carregar materiais...
                                </p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                                <p className="font-semibold text-destructive">
                                    Não foi possível carregar os materiais
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {error}
                                </p>

                                <Button
                                    className="mt-5"
                                    variant="outline"
                                    onClick={() =>
                                        void loadListings(
                                            pagination.current_page,
                                            appliedFilters,
                                        )
                                    }
                                >
                                    Tentar novamente
                                </Button>
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            listings.length === 0 && (
                                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <BookOpen className="h-8 w-8 text-primary" />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold">
                                        Nenhum material encontrado
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                        Não existem materiais correspondentes
                                        aos critérios informados. Experimente
                                        alterar ou limpar os filtros.
                                    </p>

                                    <Button
                                        className="mt-5"
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Limpar filtros
                                    </Button>
                                </div>
                            )}

                        {!loading &&
                            !error &&
                            listings.length > 0 && (
                                <>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {listings.map((listing) => (
                                            <ListingCard
                                                key={listing.id}
                                                listing={listing}
                                            />
                                        ))}
                                    </div>

                                    {pagination.last_page > 1 && (
                                        <div className="mt-10 flex items-center justify-center gap-4">
                                            <Button
                                                variant="outline"
                                                disabled={
                                                    pagination.current_page ===
                                                    1
                                                }
                                                onClick={() =>
                                                    changePage(
                                                        pagination.current_page -
                                                            1,
                                                    )
                                                }
                                            >
                                                <ChevronLeft className="mr-2 h-4 w-4" />
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
                                                    changePage(
                                                        pagination.current_page +
                                                            1,
                                                    )
                                                }
                                            >
                                                Seguinte
                                                <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                    </section>
                </main>
            </div>
        </>
    );
}