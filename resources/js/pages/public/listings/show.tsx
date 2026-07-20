import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Edit,
    LoaderCircle,
    MessageSquare,
    RefreshCcw,
    ShoppingBag,
    Star,
    Tag,
    User,
    X,
} from 'lucide-react';
import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

interface ListingUser {
    id: number;
    name: string;
    email?: string;
    role?: string;
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
    image?: string | null;
    image_url?: string | null;
    user?: ListingUser | null;
    category?: ListingCategory | null;
}

interface ListingResponse {
    data?: Listing;
}

interface ValidationErrors {
    reason?: string[];
    listing_id?: string[];
    target?: string[];
}

interface ErrorResponse {
    message?: string;
    errors?: ValidationErrors;
}

interface PageProps extends SharedData {
    listingId: number;
}

export default function ListingShow() {
    const { auth, listingId } = usePage<PageProps>().props;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportError, setReportError] = useState('');
    const [reportSuccess, setReportSuccess] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    const isOwner = useMemo(() => {
        return (
            listing?.user?.id !== undefined &&
            auth.user?.id === listing.user.id
        );
    }, [auth.user?.id, listing?.user?.id]);

    const isAdmin = auth.user?.role === 'admin';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Anúncios',
            href: '/listings',
        },
        {
            title: listing?.title ?? 'Detalhes',
            href: `/listings/${listingId}`,
        },
    ];

    useEffect(() => {
        void loadListing();
    }, [listingId]);

    async function loadListing() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<ListingResponse | Listing>(
                `/api/listings/${listingId}`,
            );

            const responseBody = response.data;

            const loadedListing =
                'data' in responseBody && responseBody.data
                    ? responseBody.data
                    : (responseBody as Listing);

            setListing(loadedListing);
        } catch (requestError) {
            const axiosError =
                requestError as AxiosError<ErrorResponse>;

            if (axiosError.response?.status === 404) {
                setError('O anúncio solicitado não foi encontrado.');
                return;
            }

            setError(
                axiosError.response?.data.message ??
                    'Não foi possível carregar o anúncio.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function submitReport(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!listing) {
            return;
        }

        if (!reportReason.trim()) {
            setReportError('Indique o motivo da denúncia.');
            return;
        }

        try {
            setSubmittingReport(true);
            setReportError('');
            setReportSuccess('');

            await api.get('/sanctum/csrf-cookie');

            await api.post('/api/reports', {
                listing_id: listing.id,
                reason: reportReason.trim(),
            });

            setReportSuccess('Denúncia submetida com sucesso.');
            setReportReason('');

            window.setTimeout(() => {
                setReportModalOpen(false);
                setReportSuccess('');
            }, 1500);
        } catch (requestError) {
            const axiosError =
                requestError as AxiosError<ErrorResponse>;

            if (axiosError.response?.status === 401) {
                router.visit('/login');
                return;
            }

            const validationErrors =
                axiosError.response?.data.errors;

            setReportError(
                validationErrors?.reason?.[0] ??
                    validationErrors?.listing_id?.[0] ??
                    validationErrors?.target?.[0] ??
                    axiosError.response?.data.message ??
                    'Não foi possível submeter a denúncia.',
            );
        } finally {
            setSubmittingReport(false);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={listing?.title ?? 'Detalhes do anúncio'} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <Button variant="ghost" asChild>
                        <Link href="/listings">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar aos anúncios
                        </Link>
                    </Button>
                </div>

                {loading && (
                    <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar anúncio...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-destructive" />

                        <h1 className="mt-4 text-xl font-semibold">
                            Anúncio indisponível
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {error}
                        </p>

                        <Button className="mt-5" asChild>
                            <Link href="/listings">
                                Ver outros anúncios
                            </Link>
                        </Button>
                    </div>
                )}

                {!loading && !error && listing && (
                    <>
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                            <div className="space-y-6">
                                <Card className="overflow-hidden">
                                    {listing.image_url ? (
                                        <div className="min-h-72 w-full overflow-hidden bg-muted">
                                            <img
                                                src={listing.image_url}
                                                alt={listing.title}
                                                className="h-72 w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex min-h-72 items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20">
                                            <BookOpen className="h-28 w-28 text-primary/60" />
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>
                                                {getTransactionLabel(
                                                    listing.transaction_type,
                                                )}
                                            </Badge>

                                            <Badge variant="outline">
                                                {getStatusLabel(
                                                    listing.status,
                                                )}
                                            </Badge>

                                            {listing.category && (
                                                <Badge variant="secondary">
                                                    {
                                                        listing.category
                                                            .name
                                                    }
                                                </Badge>
                                            )}
                                        </div>

                                        <CardTitle className="mt-3 text-2xl md:text-3xl">
                                            {listing.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <h2 className="font-semibold">
                                            Descrição
                                        </h2>

                                        <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">
                                            {listing.description}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Informações do anúncio
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid gap-5 sm:grid-cols-2">
                                        <InformationItem
                                            icon={Tag}
                                            label="Categoria"
                                            value={
                                                listing.category
                                                    ?.name ??
                                                'Sem categoria'
                                            }
                                        />

                                        <InformationItem
                                            icon={
                                                listing.transaction_type ===
                                                'sale'
                                                    ? ShoppingBag
                                                    : RefreshCcw
                                            }
                                            label="Tipo de transacção"
                                            value={getTransactionLabel(
                                                listing.transaction_type,
                                            )}
                                        />

                                        <InformationItem
                                            icon={CheckCircle2}
                                            label="Estado"
                                            value={getStatusLabel(
                                                listing.status,
                                            )}
                                        />

                                        <InformationItem
                                            icon={CalendarDays}
                                            label="Publicado em"
                                            value={formatDate(
                                                listing.created_at,
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {listing.transaction_type ===
                                            'sale'
                                                ? 'Preço'
                                                : 'Tipo de negócio'}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-3xl font-bold text-primary">
                                            {listing.transaction_type ===
                                            'sale'
                                                ? formatPrice(
                                                      listing.price,
                                                  )
                                                : 'Disponível para troca'}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Anunciante
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <User className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="font-semibold">
                                                    {listing.user
                                                        ?.name ??
                                                        'Utilizador não identificado'}
                                                </p>

                                                <p className="text-sm text-muted-foreground">
                                                    Estudante anunciante
                                                </p>
                                            </div>
                                        </div>

                                        {!isOwner &&
                                            !isAdmin &&
                                            listing.user && (
                                                <div className="space-y-2">
                                                    <Button
                                                        className="w-full"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/messages/${listing.user.id}`}
                                                        >
                                                            <MessageSquare className="mr-2 h-4 w-4" />
                                                            Contactar anunciante
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        className="w-full"
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/reviews/create/${listing.user.id}`}
                                                        >
                                                            <Star className="mr-2 h-4 w-4" />
                                                            Avaliar utilizador
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        className="w-full"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setReportError(
                                                                '',
                                                            );
                                                            setReportSuccess(
                                                                '',
                                                            );
                                                            setReportModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                                        Denunciar anúncio
                                                    </Button>
                                                </div>
                                            )}

                                        {isOwner && (
                                            <div className="space-y-2">
                                                <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                                    Este anúncio pertence a
                                                    si.
                                                </div>

                                                <Button
                                                    className="w-full"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/my-listings/${listing.id}/edit`}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar anúncio
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {reportModalOpen && listing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg rounded-xl border bg-background shadow-xl">
                        <div className="flex items-center justify-between border-b p-5">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Denunciar anúncio
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Explique por que este anúncio deve ser
                                    analisado.
                                </p>
                            </div>

                            <Button
                                size="icon"
                                variant="ghost"
                                disabled={submittingReport}
                                onClick={() =>
                                    setReportModalOpen(false)
                                }
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={submitReport}>
                            <div className="space-y-4 p-5">
                                <div>
                                    <p className="text-sm font-medium">
                                        Anúncio
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {listing.title}
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="reason"
                                        className="text-sm font-medium"
                                    >
                                        Motivo da denúncia
                                    </label>

                                    <textarea
                                        id="reason"
                                        value={reportReason}
                                        onChange={(event) =>
                                            setReportReason(
                                                event.target.value,
                                            )
                                        }
                                        rows={6}
                                        maxLength={1000}
                                        disabled={submittingReport}
                                        placeholder="Descreva o problema encontrado neste anúncio..."
                                        className="mt-2 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />

                                    <p className="mt-1 text-right text-xs text-muted-foreground">
                                        {reportReason.length}/1000
                                    </p>
                                </div>

                                {reportError && (
                                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                        {reportError}
                                    </div>
                                )}

                                {reportSuccess && (
                                    <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
                                        {reportSuccess}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t p-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={submittingReport}
                                    onClick={() =>
                                        setReportModalOpen(false)
                                    }
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={
                                        submittingReport ||
                                        !reportReason.trim()
                                    }
                                >
                                    {submittingReport ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            A submeter...
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                            Submeter denúncia
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function InformationItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>

            <div>
                <p className="text-xs uppercase text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

function getTransactionLabel(
    transactionType: Listing['transaction_type'],
): string {
    return transactionType === 'sale' ? 'Venda' : 'Troca';
}

function getStatusLabel(status: Listing['status']): string {
    const labels: Record<Listing['status'], string> = {
        available: 'Disponível',
        sold: 'Vendido',
        exchanged: 'Trocado',
    };

    return labels[status];
}

function formatPrice(price: string | number | null): string {
    if (price === null || price === '') {
        return 'Preço não indicado';
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return 'Preço não indicado';
    }

    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2,
    }).format(numericPrice);
}

function formatDate(date?: string | null): string {
    if (!date) {
        return 'Data não disponível';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Data não disponível';
    }

    return new Intl.DateTimeFormat('pt-MZ', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(parsedDate);
}