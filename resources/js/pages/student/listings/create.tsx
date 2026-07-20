import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student-layout';
import api from '@/lib/api';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    ArrowLeft,
    CircleDollarSign,
    FileText,
    ImagePlus,
    LoaderCircle,
    PackagePlus,
    RefreshCcw,
    Save,
    Tag,
    X,
} from 'lucide-react';
import {
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

interface Category {
    id: number;
    name: string;
    description?: string | null;
}

interface CategoriesResponse {
    data: Category[];
}

interface ValidationErrors {
    category_id?: string[];
    title?: string[];
    description?: string[];
    price?: string[];
    transaction_type?: string[];
}

interface ErrorResponse {
    message?: string;
    errors?: ValidationErrors;
}

interface ListingForm {
    category_id: string;
    title: string;
    description: string;
    price: string;
    transaction_type: 'sale' | 'exchange';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Meus anúncios',
        href: '/my-listings',
    },
    {
        title: 'Publicar anúncio',
        href: '/listings/create',
    },
];

const initialForm: ListingForm = {
    category_id: '',
    title: '',
    description: '',
    price: '',
    transaction_type: 'sale',
};

export default function CreateListing() {
    const [form, setForm] = useState<ListingForm>(initialForm);
    const [categories, setCategories] = useState<Category[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState('');
    const [loadingCategories, setLoadingCategories] =
        useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<
        string | null
    >(null);

    const titleCharacters = form.title.length;
    const descriptionCharacters = form.description.length;

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (category) =>
                    category.id === Number(form.category_id),
            ),
        [categories, form.category_id],
    );

    useEffect(() => {
        void loadCategories();
    }, []);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    async function loadCategories() {
        try {
            setLoadingCategories(true);
            setGeneralError('');

            const response =
                await api.get<CategoriesResponse>('/api/categories');

            setCategories(response.data.data ?? []);
        } catch {
            setGeneralError(
                'Não foi possível carregar as categorias.',
            );
        } finally {
            setLoadingCategories(false);
        }
    }

    function updateField<K extends keyof ListingForm>(
        field: K,
        value: ListingForm[K],
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => ({
            ...current,
            [field]: undefined,
        }));

        setGeneralError('');
    }

    function handleImageChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0] ?? null;

        setImagePreview((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }

            return file ? URL.createObjectURL(file) : null;
        });

        setImage(file);
        event.target.value = '';
    }

    function removeImage() {
        setImagePreview((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }

            return null;
        });

        setImage(null);
    }

    function changeTransactionType(
        transactionType: 'sale' | 'exchange',
    ) {
        setForm((current) => ({
            ...current,
            transaction_type: transactionType,
            price:
                transactionType === 'exchange'
                    ? ''
                    : current.price,
        }));

        setErrors((current) => ({
            ...current,
            transaction_type: undefined,
            price: undefined,
        }));
    }

    function validateForm(): boolean {
        const newErrors: ValidationErrors = {};

        if (!form.category_id) {
            newErrors.category_id = [
                'Seleccione uma categoria.',
            ];
        }

        if (!form.title.trim()) {
            newErrors.title = [
                'Informe o título do anúncio.',
            ];
        } else if (form.title.trim().length > 255) {
            newErrors.title = [
                'O título não pode exceder 255 caracteres.',
            ];
        }

        if (!form.description.trim()) {
            newErrors.description = [
                'Informe a descrição do material.',
            ];
        }

        if (
            form.transaction_type === 'sale' &&
            form.price.trim() === ''
        ) {
            newErrors.price = [
                'Informe o preço do material.',
            ];
        }

        if (
            form.transaction_type === 'sale' &&
            form.price !== '' &&
            Number(form.price) < 0
        ) {
            newErrors.price = [
                'O preço não pode ser negativo.',
            ];
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setErrors({});
            setGeneralError('');

            await api.get('/sanctum/csrf-cookie');

            const payload = new FormData();

            payload.append(
                'category_id',
                String(Number(form.category_id)),
            );
            payload.append('title', form.title.trim());
            payload.append(
                'description',
                form.description.trim(),
            );
            payload.append(
                'transaction_type',
                form.transaction_type,
            );

            if (form.transaction_type === 'sale') {
                payload.append(
                    'price',
                    String(Number(form.price)),
                );
            }

            if (image) {
                payload.append('image', image);
            }

            await api.post('/api/listings', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            router.visit('/my-listings');
        } catch (requestError) {
            const error =
                requestError as AxiosError<ErrorResponse>;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (error.response?.status === 403) {
                setGeneralError(
                    'Não possui autorização para publicar anúncios.',
                );
                return;
            }

            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});

                setGeneralError(
                    error.response.data.message ??
                        'Verifique os dados introduzidos.',
                );

                return;
            }

            setGeneralError(
                error.response?.data.message ??
                    'Não foi possível publicar o anúncio.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    function resetForm() {
        setForm(initialForm);
        setErrors({});
        setGeneralError('');
        removeImage();
    }

    function firstError(field: keyof ValidationErrors) {
        return errors[field]?.[0];
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Publicar anúncio" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Publicar anúncio
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Preencha os dados do material académico que
                            pretende vender ou trocar.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            router.visit('/my-listings')
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </div>

                {generalError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        {generalError}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
                >
                    <div className="space-y-6">
                        <section className="rounded-xl border bg-card p-5 md:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Informações do material
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        Cadastre o material de forma
                                        clara.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Título do anúncio
                                    </label>

                                    <input
                                        id="title"
                                        type="text"
                                        value={form.title}
                                        maxLength={255}
                                        disabled={submitting}
                                        placeholder="Ex.: Livro de Programação em Java"
                                        onChange={(event) =>
                                            updateField(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        className={`h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring ${
                                            firstError('title')
                                                ? 'border-destructive'
                                                : 'border-input'
                                        }`}
                                    />

                                    <div className="mt-1 flex justify-between gap-4">
                                        <FieldError
                                            message={firstError(
                                                'title',
                                            )}
                                        />

                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {titleCharacters}/255
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Descrição
                                    </label>

                                    <textarea
                                        id="description"
                                        rows={7}
                                        value={form.description}
                                        disabled={submitting}
                                        placeholder="Descreva o estado, conteúdo, edição e outras informações importantes..."
                                        onChange={(event) =>
                                            updateField(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        className={`w-full resize-y rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring ${
                                            firstError('description')
                                                ? 'border-destructive'
                                                : 'border-input'
                                        }`}
                                    />

                                    <div className="mt-1 flex justify-between gap-4">
                                        <FieldError
                                            message={firstError(
                                                'description',
                                            )}
                                        />

                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {descriptionCharacters}{' '}
                                            caracteres
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="category"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Categoria
                                    </label>

                                    <select
                                        id="category"
                                        value={form.category_id}
                                        disabled={
                                            submitting ||
                                            loadingCategories
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                'category_id',
                                                event.target.value,
                                            )
                                        }
                                        className={`h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                                            firstError('category_id')
                                                ? 'border-destructive'
                                                : 'border-input'
                                        }`}
                                    >
                                        <option value="">
                                            {loadingCategories
                                                ? 'A carregar categorias...'
                                                : 'Seleccione uma categoria'}
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    <FieldError
                                        message={firstError(
                                            'category_id',
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Imagem do material
                                    </label>

                                    {imagePreview ? (
                                        <div className="relative w-fit">
                                            <img
                                                src={imagePreview}
                                                alt="Pré-visualização do material"
                                                className="h-40 w-40 rounded-lg border object-cover"
                                            />

                                            <button
                                                type="button"
                                                disabled={submitting}
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="image"
                                            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
                                        >
                                            <ImagePlus className="h-6 w-6" />
                                            Clique para carregar uma
                                            imagem
                                        </label>
                                    )}

                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        disabled={submitting}
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border bg-card p-5 md:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Tag className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Tipo de transacção
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        Escolha entre venda e troca.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() =>
                                        changeTransactionType(
                                            'sale',
                                        )
                                    }
                                    className={`rounded-xl border p-4 text-left transition ${
                                        form.transaction_type ===
                                        'sale'
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-input hover:bg-muted/50'
                                    }`}
                                >
                                    <CircleDollarSign className="mb-3 h-6 w-6 text-primary" />

                                    <p className="font-semibold">
                                        Venda
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        O material será anunciado com
                                        um preço.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() =>
                                        changeTransactionType(
                                            'exchange',
                                        )
                                    }
                                    className={`rounded-xl border p-4 text-left transition ${
                                        form.transaction_type ===
                                        'exchange'
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-input hover:bg-muted/50'
                                    }`}
                                >
                                    <RefreshCcw className="mb-3 h-6 w-6 text-primary" />

                                    <p className="font-semibold">
                                        Troca
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        O material será trocado por
                                        outro recurso académico.
                                    </p>
                                </button>
                            </div>

                            <FieldError
                                message={firstError(
                                    'transaction_type',
                                )}
                            />

                            {form.transaction_type === 'sale' && (
                                <div className="mt-5">
                                    <label
                                        htmlFor="price"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Preço
                                    </label>

                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                            MZN
                                        </span>

                                        <input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            disabled={submitting}
                                            placeholder="0,00"
                                            onChange={(event) =>
                                                updateField(
                                                    'price',
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            className={`h-11 w-full rounded-md border bg-background pr-3 pl-14 text-sm outline-none focus:ring-2 focus:ring-ring ${
                                                firstError('price')
                                                    ? 'border-destructive'
                                                    : 'border-input'
                                            }`}
                                        />
                                    </div>

                                    <FieldError
                                        message={firstError('price')}
                                    />
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-xl border bg-card p-5 lg:sticky lg:top-6">
                            <div className="mb-4 flex items-center gap-3">
                                <PackagePlus className="h-5 w-5 text-primary" />

                                <h2 className="font-semibold">
                                    Resumo
                                </h2>
                            </div>

                            <div className="space-y-4 text-sm">
                                <SummaryItem
                                    label="Título"
                                    value={
                                        form.title.trim() ||
                                        'Não informado'
                                    }
                                />

                                <SummaryItem
                                    label="Categoria"
                                    value={
                                        selectedCategory?.name ??
                                        'Não seleccionada'
                                    }
                                />

                                <SummaryItem
                                    label="Transacção"
                                    value={
                                        form.transaction_type ===
                                        'sale'
                                            ? 'Venda'
                                            : 'Troca'
                                    }
                                />

                                <SummaryItem
                                    label="Preço"
                                    value={
                                        form.transaction_type ===
                                        'sale'
                                            ? form.price
                                                ? `${form.price} MZN`
                                                : 'Não informado'
                                            : 'Não aplicável'
                                    }
                                />

                                <SummaryItem
                                    label="Estado inicial"
                                    value="Disponível"
                                />
                            </div>

                            <div className="mt-6 space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                        submitting ||
                                        loadingCategories
                                    }
                                >
                                    {submitting ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            A publicar...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Publicar anúncio
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={submitting}
                                    onClick={resetForm}
                                >
                                    Limpar formulário
                                </Button>
                            </div>
                        </section>
                    </aside>
                </form>
            </div>
        </StudentLayout>
    );
}

function FieldError({
    message,
}: {
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1 text-sm text-destructive">
            {message}
        </p>
    );
}

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="border-b pb-3 last:border-b-0 last:pb-0">
            <p className="text-muted-foreground">{label}</p>
            <p className="mt-1 break-words font-medium">
                {value}
            </p>
        </div>
    );
}