import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import { LoaderCircle } from 'lucide-react';
import {
    type FormEvent,
    useEffect,
    useState,
} from 'react';

interface Category {
    id: number;
    name: string;
}

interface ValidationErrors {
    [key: string]: string[];
}

interface EditListingProps {
    listingId: number;
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
    {
        title: 'Editar anúncio',
        href: '#',
    },
];

export default function EditListing({
    listingId,
}: EditListingProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState('');

    const [form, setForm] = useState({
        category_id: '',
        title: '',
        description: '',
        price: '',
        transaction_type: 'sale',
        status: 'available',
    });

    useEffect(() => {
        async function loadPageData() {
            try {
                setLoading(true);

                const [listingResponse, categoriesResponse] =
                    await Promise.all([
                        api.get(`/api/listings/${listingId}`),
                        api.get('/api/categories'),
                    ]);

                const listing = listingResponse.data.data;

                setCategories(
                    categoriesResponse.data.data ?? [],
                );

                setForm({
                    category_id: String(
                        listing.category?.id ??
                            listing.category_id ??
                            '',
                    ),
                    title: listing.title ?? '',
                    description: listing.description ?? '',
                    price:
                        listing.price === null
                            ? ''
                            : String(listing.price),
                    transaction_type:
                        listing.transaction_type ?? 'sale',
                    status: listing.status ?? 'available',
                });
            } catch {
                setGeneralError(
                    'Não foi possível carregar os dados do anúncio.',
                );
            } finally {
                setLoading(false);
            }
        }

        void loadPageData();
    }, [listingId]);

    function updateField(
        field: keyof typeof form,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
            ...(field === 'transaction_type' &&
            value === 'exchange'
                ? { price: '' }
                : {}),
        }));

        setErrors((current) => ({
            ...current,
            [field]: [],
        }));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setSubmitting(true);
        setErrors({});
        setGeneralError('');

        try {
            await api.get('/sanctum/csrf-cookie');

            await api.put(`/api/listings/${listingId}`, {
                category_id: Number(form.category_id),
                title: form.title,
                description: form.description,
                price:
                    form.transaction_type === 'exchange' ||
                    form.price === ''
                        ? null
                        : Number(form.price),
                transaction_type: form.transaction_type,
                status: form.status,
            });

            router.visit('/my-listings');
        } catch (error) {
            const requestError = error as AxiosError<{
                message?: string;
                errors?: ValidationErrors;
            }>;

            if (requestError.response?.status === 422) {
                setErrors(
                    requestError.response.data.errors ?? {},
                );
            } else if (
                requestError.response?.status === 403
            ) {
                setGeneralError(
                    'Não possui autorização para editar este anúncio.',
                );
            } else {
                setGeneralError(
                    requestError.response?.data.message ??
                        'Não foi possível actualizar o anúncio.',
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar anúncio" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Editar anúncio
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Actualize os dados e o estado do seu
                        anúncio.
                    </p>
                </div>

                {loading ? (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar anúncio...
                        </p>
                    </div>
                ) : (
                    <Card className="max-w-3xl">
                        <CardHeader>
                            <CardTitle>
                                Dados do anúncio
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

                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Título
                                    </Label>

                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={(event) =>
                                            updateField(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.title?.[0] && (
                                        <p className="text-sm text-destructive">
                                            {errors.title[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">
                                        Categoria
                                    </Label>

                                    <select
                                        id="category_id"
                                        value={form.category_id}
                                        onChange={(event) =>
                                            updateField(
                                                'category_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">
                                            Seleccione uma categoria
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    {errors.category_id?.[0] && (
                                        <p className="text-sm text-destructive">
                                            {
                                                errors
                                                    .category_id[0]
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Descrição
                                    </Label>

                                    <textarea
                                        id="description"
                                        rows={6}
                                        value={form.description}
                                        onChange={(event) =>
                                            updateField(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />

                                    {errors.description?.[0] && (
                                        <p className="text-sm text-destructive">
                                            {
                                                errors
                                                    .description[0]
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_type">
                                            Tipo de transacção
                                        </Label>

                                        <select
                                            id="transaction_type"
                                            value={
                                                form.transaction_type
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    'transaction_type',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="sale">
                                                Venda
                                            </option>

                                            <option value="exchange">
                                                Troca
                                            </option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Preço em MZN
                                        </Label>

                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            disabled={
                                                form.transaction_type ===
                                                'exchange'
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    'price',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        {errors.price?.[0] && (
                                            <p className="text-sm text-destructive">
                                                {errors.price[0]}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Estado do anúncio
                                    </Label>

                                    <select
                                        id="status"
                                        value={form.status}
                                        onChange={(event) =>
                                            updateField(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="available">
                                            Disponível
                                        </option>

                                        <option value="sold">
                                            Vendido
                                        </option>

                                        <option value="exchanged">
                                            Trocado
                                        </option>
                                    </select>

                                    {errors.status?.[0] && (
                                        <p className="text-sm text-destructive">
                                            {errors.status[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.visit(
                                                '/my-listings',
                                            )
                                        }
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                    >
                                        {submitting && (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        )}

                                        Guardar alterações
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}