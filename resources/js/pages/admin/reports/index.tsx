import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import api from '@/lib/api';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Eye,
    LoaderCircle,
    Search,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ReportUser {
    id: number;
    name: string;
    email?: string;
}

interface ReportListing {
    id: number;
    title: string;
}

interface Report {
    id: number;
    reason: string;
    description?: string | null;
    status: 'pending' | 'resolved';
    created_at: string;
    reporter?: ReportUser | null;
    reported_user?: ReportUser | null;
    listing?: ReportListing | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ReportsResponse {
    data: Report[];
    meta?: PaginationMeta;
}

interface ErrorResponse {
    message?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administração',
        href: '/admin/dashboard',
    },
    {
        title: 'Denúncias',
        href: '/admin/reports',
    },
];

export default function AdminReportsIndex() {
    const [reports, setReports] = useState<Report[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'pending' | 'resolved'
    >('all');

    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<number | null>(
        null,
    );
    const [error, setError] = useState('');

    const filteredReports = useMemo(() => {
        const term = search.trim().toLowerCase();

        return reports.filter((report) => {
            const matchesStatus =
                statusFilter === 'all' ||
                report.status === statusFilter;

            const searchableValues = [
                report.reason,
                report.description ?? '',
                report.reporter?.name ?? '',
                report.reported_user?.name ?? '',
                report.listing?.title ?? '',
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch =
                !term || searchableValues.includes(term);

            return matchesStatus && matchesSearch;
        });
    }, [reports, search, statusFilter]);

    const pendingCount = reports.filter(
        (report) => report.status === 'pending',
    ).length;

    const resolvedCount = reports.filter(
        (report) => report.status === 'resolved',
    ).length;

    useEffect(() => {
        void loadReports();
    }, []);

    async function loadReports(page = 1) {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<ReportsResponse>(
                `/api/admin/reports?page=${page}`,
            );

            const loadedReports = Array.isArray(response.data.data)
                ? response.data.data
                : [];

            setReports(loadedReports);

            setPagination(
                response.data.meta ?? {
                    current_page: 1,
                    last_page: 1,
                    per_page: loadedReports.length || 10,
                    total: loadedReports.length,
                },
            );
        } catch (requestError) {
            const axiosError =
                requestError as AxiosError<ErrorResponse>;

            if (axiosError.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (axiosError.response?.status === 403) {
                router.visit('/dashboard');
                return;
            }

            setError(
                axiosError.response?.data.message ??
                    'Não foi possível carregar as denúncias.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function resolveReport(report: Report) {
        if (report.status === 'resolved') {
            return;
        }

        const confirmed = window.confirm(
            'Tem a certeza de que pretende marcar esta denúncia como resolvida?',
        );

        if (!confirmed) {
            return;
        }

        try {
            setResolvingId(report.id);
            setError('');

            await api.get('/sanctum/csrf-cookie');

            await api.patch(
                `/api/admin/reports/${report.id}/resolve`,
            );

            setReports((currentReports) =>
                currentReports.map((currentReport) =>
                    currentReport.id === report.id
                        ? {
                              ...currentReport,
                              status: 'resolved',
                          }
                        : currentReport,
                ),
            );
        } catch (requestError) {
            const axiosError =
                requestError as AxiosError<ErrorResponse>;

            if (axiosError.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (axiosError.response?.status === 403) {
                setError(
                    'Não possui autorização para resolver esta denúncia.',
                );
                return;
            }

            setError(
                axiosError.response?.data.message ??
                    'Não foi possível resolver a denúncia.',
            );
        } finally {
            setResolvingId(null);
        }
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de denúncias" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Gestão de denúncias
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consulte e resolva denúncias submetidas pelos
                        utilizadores.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard
                        title="Total"
                        value={pagination.total}
                        icon={AlertTriangle}
                    />

                    <SummaryCard
                        title="Pendentes nesta página"
                        value={pendingCount}
                        icon={Clock3}
                    />

                    <SummaryCard
                        title="Resolvidas nesta página"
                        value={resolvedCount}
                        icon={CheckCircle2}
                    />
                </div>

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Pesquisar por motivo, utilizador ou anúncio..."
                            className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value as
                                    | 'all'
                                    | 'pending'
                                    | 'resolved',
                            )
                        }
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Todos os estados</option>
                        <option value="pending">Pendentes</option>
                        <option value="resolved">Resolvidas</option>
                    </select>
                </div>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar denúncias...
                        </p>
                    </div>
                )}

                {!loading && filteredReports.length === 0 && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground" />

                        <h2 className="mt-4 text-lg font-semibold">
                            Nenhuma denúncia encontrada
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Não existem denúncias correspondentes aos
                            filtros seleccionados.
                        </p>
                    </div>
                )}

                {!loading && filteredReports.length > 0 && (
                    <div className="space-y-4">
                        {filteredReports.map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                resolving={
                                    resolvingId === report.id
                                }
                                onResolve={() =>
                                    void resolveReport(report)
                                }
                            />
                        ))}
                    </div>
                )}

                {!loading && pagination.last_page > 1 && (
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                void loadReports(
                                    pagination.current_page - 1,
                                )
                            }
                        >
                            Anterior
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            Página {pagination.current_page} de{' '}
                            {pagination.last_page}
                        </span>

                        <Button
                            variant="outline"
                            disabled={
                                pagination.current_page ===
                                pagination.last_page
                            }
                            onClick={() =>
                                void loadReports(
                                    pagination.current_page + 1,
                                )
                            }
                        >
                            Seguinte
                        </Button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function ReportCard({
    report,
    resolving,
    onResolve,
}: {
    report: Report;
    resolving: boolean;
    onResolve: () => void;
}) {
    const isPending = report.status === 'pending';

    return (
        <article className="rounded-xl border bg-card p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                isPending
                                    ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                    : 'bg-green-500/10 text-green-700 dark:text-green-400'
                            }`}
                        >
                            {isPending ? 'Pendente' : 'Resolvida'}
                        </span>

                        <span className="text-xs text-muted-foreground">
                            {formatDate(report.created_at)}
                        </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold">
                        {report.reason}
                    </h2>

                    {report.description && (
                        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                            {report.description}
                        </p>
                    )}
                </div>

                {isPending ? (
                    <Button
                        disabled={resolving}
                        onClick={onResolve}
                    >
                        {resolving ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                A resolver...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marcar como resolvida
                            </>
                        )}
                    </Button>
                ) : (
                    <Button variant="outline" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Resolvida
                    </Button>
                )}
            </div>

            <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-3">
                <InformationItem
                    label="Denunciante"
                    value={report.reporter?.name ?? 'Não informado'}
                    icon={User}
                />

                <InformationItem
                    label="Utilizador denunciado"
                    value={
                        report.reported_user?.name ??
                        'Não aplicável'
                    }
                    icon={AlertTriangle}
                />

                <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                        Anúncio
                    </p>

                    {report.listing ? (
                        <Button
                            variant="link"
                            className="h-auto justify-start p-0"
                            asChild
                        >
                            <Link
                                href={`/listings/${report.listing.id}`}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {report.listing.title}
                            </Link>
                        </Button>
                    ) : (
                        <p className="mt-1 text-sm font-medium">
                            Não aplicável
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

function SummaryCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: number;
    icon: React.ElementType;
}) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
        </div>
    );
}

function InformationItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
                {label}
            </p>

            <div className="mt-1 flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

function formatDate(date?: string | null): string {
    if (!date) {
        return 'Data não disponível';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Data não disponível';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate);
}