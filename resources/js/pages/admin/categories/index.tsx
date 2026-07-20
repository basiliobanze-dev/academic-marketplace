import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    Edit,
    FolderKanban,
    LoaderCircle,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

interface Category {
    id: number;
    name: string;
    description?: string | null;
    listings_count?: number;
}

interface CategoriesResponse {
    data: Category[];
}

interface ValidationErrors {
    name?: string[];
    description?: string[];
}

interface ErrorResponse {
    message?: string;
    errors?: ValidationErrors;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administração',
        href: '/admin/dashboard',
    },
    {
        title: 'Categorias',
        href: '/admin/categories',
    },
];

const emptyForm = {
    name: '',
    description: '',
};

export default function AdminCategoriesIndex() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(
        null,
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [modalError, setModalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return categories;
        }

        return categories.filter((category) =>
            category.name.toLowerCase().includes(term),
        );
    }, [categories, search]);

    useEffect(() => {
        void loadCategories();
    }, []);

    async function loadCategories() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get<CategoriesResponse>(
                '/api/admin/categories',
            );

            setCategories(response.data.data ?? []);
        } catch (requestError) {
            const axiosError = requestError as AxiosError;

            if (axiosError.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (axiosError.response?.status === 403) {
                router.visit('/dashboard');
                return;
            }

            setError('Não foi possível carregar as categorias.');
        } finally {
            setLoading(false);
        }
    }

    function openCreateModal() {
        setEditingCategory(null);
        setForm(emptyForm);
        setErrors({});
        setModalError('');
        setModalOpen(true);
    }

    function openEditModal(category: Category) {
        setEditingCategory(category);
        setForm({
            name: category.name,
            description: category.description ?? '',
        });
        setErrors({});
        setModalError('');
        setModalOpen(true);
    }

    function closeModal() {
        if (submitting) {
            return;
        }

        setModalOpen(false);
    }

    function updateField(
        field: keyof typeof form,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => ({
            ...current,
            [field]: undefined,
        }));
    }

    async function submitCategory(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        try {
            setSubmitting(true);
            setErrors({});
            setModalError('');

            await api.get('/sanctum/csrf-cookie');

            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
            };

            if (editingCategory) {
                await api.put(
                    `/api/admin/categories/${editingCategory.id}`,
                    payload,
                );
            } else {
                await api.post(
                    '/api/admin/categories',
                    payload,
                );
            }

            setModalOpen(false);
            await loadCategories();
        } catch (requestError) {
            const axiosError =
                requestError as AxiosError<ErrorResponse>;

            if (axiosError.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (axiosError.response?.status === 403) {
                setModalError(
                    'Não possui autorização para gerir categorias.',
                );
                return;
            }

            if (axiosError.response?.status === 422) {
                setErrors(axiosError.response.data.errors ?? {});
                setModalError(
                    axiosError.response.data.message ??
                        'Verifique os dados introduzidos.',
                );
                return;
            }

            setModalError(
                axiosError.response?.data.message ??
                    'Não foi possível guardar a categoria.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function deleteCategory(category: Category) {
        const confirmed = window.confirm(
            `Tem a certeza de que pretende eliminar a categoria "${category.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(category.id);
            setError('');

            await api.get('/sanctum/csrf-cookie');
            await api.delete(
                `/api/admin/categories/${category.id}`,
            );

            await loadCategories();
        } catch (requestError) {
            const axiosError =
                requestError as AxiosError<ErrorResponse>;

            if (axiosError.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (axiosError.response?.status === 403) {
                setError(
                    'Não possui autorização para eliminar esta categoria.',
                );
                return;
            }

            setError(
                axiosError.response?.data.message ??
                    'Não foi possível eliminar a categoria.',
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de categorias" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Gestão de categorias
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Crie, edite e remova categorias
                            disponíveis para os anúncios.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Pesquisar categoria..."
                                className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <Button onClick={openCreateModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova categoria
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderKanban className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total de categorias
                            </p>

                            <p className="text-2xl font-bold">
                                {categories.length}
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
                            A carregar categorias...
                        </p>
                    </div>
                )}

                {!loading && filteredCategories.length === 0 && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                        <FolderKanban className="h-12 w-12 text-muted-foreground" />

                        <h2 className="mt-4 text-lg font-semibold">
                            Nenhuma categoria encontrada
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Crie a primeira categoria para os
                            anúncios.
                        </p>

                        <Button
                            className="mt-5"
                            onClick={openCreateModal}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nova categoria
                        </Button>
                    </div>
                )}

                {!loading && filteredCategories.length > 0 && (
                    <div className="overflow-hidden rounded-xl border bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3 font-medium">
                                        Nome
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Descrição
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Acções
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCategories.map(
                                    (category) => (
                                        <tr
                                            key={category.id}
                                            className="border-b last:border-b-0"
                                        >
                                            <td className="px-5 py-4 font-medium">
                                                {category.name}
                                            </td>

                                            <td className="px-5 py-4 text-muted-foreground">
                                                {category.description ||
                                                    'Sem descrição'}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openEditModal(
                                                                category,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                                        Editar
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={
                                                            deletingId ===
                                                            category.id
                                                        }
                                                        onClick={() =>
                                                            void deleteCategory(
                                                                category,
                                                            )
                                                        }
                                                    >
                                                        {deletingId ===
                                                        category.id ? (
                                                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                Eliminar
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md rounded-xl border bg-background shadow-xl">
                        <div className="flex items-center justify-between border-b p-5">
                            <h2 className="text-lg font-semibold">
                                {editingCategory
                                    ? 'Editar categoria'
                                    : 'Nova categoria'}
                            </h2>

                            <Button
                                size="icon"
                                variant="ghost"
                                disabled={submitting}
                                onClick={closeModal}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={submitCategory}>
                            <div className="space-y-4 p-5">
                                {modalError && (
                                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                        {modalError}
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Nome
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        value={form.name}
                                        maxLength={255}
                                        disabled={submitting}
                                        placeholder="Ex.: Livros de Programação"
                                        onChange={(event) =>
                                            updateField(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        className={`h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                                            errors.name?.[0]
                                                ? 'border-destructive'
                                                : 'border-input'
                                        }`}
                                    />

                                    {errors.name?.[0] && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.name[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Descrição (opcional)
                                    </label>

                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={form.description}
                                        disabled={submitting}
                                        placeholder="Breve descrição da categoria..."
                                        onChange={(event) =>
                                            updateField(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        className={`w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${
                                            errors.description?.[0]
                                                ? 'border-destructive'
                                                : 'border-input'
                                        }`}
                                    />

                                    {errors.description?.[0] && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.description[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t p-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={submitting}
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            A guardar...
                                        </>
                                    ) : (
                                        'Guardar'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}