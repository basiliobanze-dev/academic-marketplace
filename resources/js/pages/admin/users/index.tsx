import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    LoaderCircle,
    ShieldCheck,
    Trash2,
    UserRound,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface UsersResponse {
    data: User[];
    meta: PaginationMeta;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administração',
        href: '/admin/dashboard',
    },
    {
        title: 'Utilizadores',
        href: '/admin/users',
    },
];

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

export default function AdminUsersIndex() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    async function loadUsers(page = 1) {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<UsersResponse>(
                `/api/admin/users?page=${page}`,
            );

            setUsers(response.data.data ?? []);
            setPagination(response.data.meta);
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

            setError('Não foi possível carregar os utilizadores.');
        } finally {
            setLoading(false);
        }
    }

    async function deleteUser(user: User) {
        const confirmed = window.confirm(
            `Tem a certeza de que pretende eliminar a conta de ${user.name}?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(user.id);
            setError('');

            await api.get('/sanctum/csrf-cookie');
            await api.delete(`/api/admin/users/${user.id}`);

            const shouldGoToPreviousPage =
                users.length === 1 &&
                pagination.current_page > 1;

            const nextPage = shouldGoToPreviousPage
                ? pagination.current_page - 1
                : pagination.current_page;

            await loadUsers(nextPage);
        } catch (requestError) {
            const error = requestError as AxiosError<{
                message?: string;
            }>;

            if (error.response?.status === 422) {
                setError(
                    error.response.data.message ??
                        'Não foi possível eliminar este utilizador.',
                );
                return;
            }

            setError('Não foi possível eliminar o utilizador.');
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        void loadUsers();
    }, []);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de utilizadores" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Gestão de utilizadores
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consulte e faça a gestão das contas registadas na plataforma.
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Users className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total de utilizadores
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
                            A carregar utilizadores...
                        </p>
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                        <Users className="h-12 w-12 text-muted-foreground" />

                        <h2 className="mt-4 text-lg font-semibold">
                            Nenhum utilizador encontrado
                        </h2>
                    </div>
                )}

                {!loading && users.length > 0 && (
                    <>
                        <div className="overflow-hidden rounded-xl border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Utilizador
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Papel
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Registo
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Acções
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                            <UserRound className="h-5 w-5" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                {user.name}
                                                            </p>

                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            user.role === 'admin'
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {user.role === 'admin' ? (
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <UserRound className="h-3.5 w-3.5" />
                                                        )}

                                                        {user.role === 'admin'
                                                            ? 'Administrador'
                                                            : 'Estudante'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-muted-foreground">
                                                    {formatDate(user.created_at)}
                                                </td>

                                                <td className="px-4 py-4 text-right">
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        disabled={
                                                            deletingId === user.id
                                                        }
                                                        onClick={() =>
                                                            void deleteUser(user)
                                                        }
                                                        aria-label="Eliminar utilizador"
                                                    >
                                                        {deletingId === user.id ? (
                                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {pagination.last_page > 1 && (
                            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button
                                    variant="outline"
                                    disabled={pagination.current_page === 1}
                                    onClick={() =>
                                        void loadUsers(
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
                                        void loadUsers(
                                            pagination.current_page + 1,
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