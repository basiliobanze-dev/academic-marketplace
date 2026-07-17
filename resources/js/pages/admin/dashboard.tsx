import api from '@/lib/api';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    AlertTriangle,
    CheckCircle2,
    FileText,
    LoaderCircle,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardData {
    users: number;
    students: number;
    admins: number;
    listings: number;
    reports: number;
    pending_reports: number;
    resolved_reports: number;
}

interface DashboardResponse {
    data: DashboardData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administração',
        href: '/admin/dashboard',
    },
    {
        title: 'Painel principal',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadDashboard() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<
                DashboardResponse | DashboardData
            >('/api/admin/dashboard');

            const responseData = response.data;

            const dashboardData =
                'data' in responseData
                    ? responseData.data
                    : responseData;

            setData(dashboardData);
        } catch (requestError) {
            const error = requestError as AxiosError<{
                message?: string;
            }>;

            console.error(
                'Erro ao carregar painel administrativo:',
                error.response?.status,
                error.response?.data,
            );

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (error.response?.status === 403) {
                router.visit('/dashboard');
                return;
            }

            setError(
                error.response?.data.message ??
                    'Não foi possível carregar o painel administrativo.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadDashboard();
    }, []);

    const cards = data
        ? [
              {
                  title: 'Utilizadores',
                  value: data.users,
                  description: `${data.students} estudantes e ${data.admins} administradores`,
                  icon: Users,
                  href: '/admin/users',
              },
              {
                  title: 'Anúncios',
                  value: data.listings,
                  description:
                      'Materiais publicados na plataforma',
                  icon: FileText,
                  href: '/admin/listings',
              },
              {
                  title: 'Denúncias pendentes',
                  value: data.pending_reports,
                  description:
                      'Denúncias que aguardam análise',
                  icon: AlertTriangle,
                  href: '/admin/reports',
              },
              {
                  title: 'Denúncias resolvidas',
                  value: data.resolved_reports,
                  description:
                      'Denúncias já analisadas',
                  icon: CheckCircle2,
                  href: '/admin/reports',
              },
          ]
        : [];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Painel administrativo" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-white to-secondary/20 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <ShieldCheck className="h-7 w-7" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold">
                                Painel administrativo
                            </h1>

                            <p className="mt-2 max-w-2xl text-muted-foreground">
                                Faça a gestão dos utilizadores, anúncios
                                e denúncias do Marketplace Académico.
                            </p>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar painel administrativo...
                        </p>
                    </div>
                )}

                {!loading && data && (
                    <>
                        <section>
                            <h2 className="text-xl font-semibold">
                                Resumo da plataforma
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Informações gerais do sistema.
                            </p>

                            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {cards.map((card) => {
                                    const Icon = card.icon;

                                    return (
                                        <Link
                                            key={card.title}
                                            href={card.href}
                                            className="rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-3">
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

                        <section className="grid gap-5 md:grid-cols-3">
                            <Link
                                href="/admin/users"
                                className="rounded-xl border bg-card p-6 transition hover:bg-muted/40"
                            >
                                <Users className="h-7 w-7 text-primary" />

                                <h2 className="mt-4 font-semibold">
                                    Gerir utilizadores
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Consulte e elimine contas da
                                    plataforma.
                                </p>
                            </Link>

                            <Link
                                href="/admin/listings"
                                className="rounded-xl border bg-card p-6 transition hover:bg-muted/40"
                            >
                                <FileText className="h-7 w-7 text-primary" />

                                <h2 className="mt-4 font-semibold">
                                    Gerir anúncios
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Consulte e remova anúncios
                                    inadequados.
                                </p>
                            </Link>

                            <Link
                                href="/admin/reports"
                                className="rounded-xl border bg-card p-6 transition hover:bg-muted/40"
                            >
                                <AlertTriangle className="h-7 w-7 text-primary" />

                                <h2 className="mt-4 font-semibold">
                                    Gerir denúncias
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Analise e resolva denúncias
                                    submetidas.
                                </p>
                            </Link>
                        </section>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}