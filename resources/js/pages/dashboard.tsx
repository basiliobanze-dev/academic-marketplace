import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    MessageSquare,
    PackageOpen,
    PlusCircle,
    Search,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel principal',
        href: '/dashboard',
    },
];

const dashboardCards = [
    {
        title: 'Meus anúncios',
        description: 'Consulte e faça a gestão dos materiais que publicou.',
        value: '0',
        icon: PackageOpen,
        href: '/my-listings',
    },
    {
        title: 'Mensagens',
        description: 'Consulte as conversas com outros estudantes.',
        value: '0',
        icon: MessageSquare,
        href: '/messages',
    },
    {
        title: 'Notificações',
        description: 'Veja os avisos e eventos recentes da sua conta.',
        value: '0',
        icon: Bell,
        href: '/notifications',
    },
];

export default function Dashboard() {
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Painel principal" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-white to-secondary/20 p-6 md:p-8">
                    <div className="max-w-3xl">
                        <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            Marketplace Académico
                        </span>

                        <h1 className="mt-5 text-3xl font-bold tracking-tight">
                            Bem-vindo ao seu painel
                        </h1>

                        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                            Publique materiais académicos, acompanhe os seus
                            anúncios e comunique com outros estudantes através
                            da plataforma.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/listings/create"
                                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Publicar anúncio
                            </Link>

                            <Link
                                href="/listings"
                                className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Pesquisar materiais
                            </Link>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Resumo da conta
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Consulte rapidamente as principais informações da
                            sua actividade na plataforma.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {dashboardCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className="group rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
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

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BookOpen className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Anúncios recentes
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Os seus materiais publicados recentemente.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                            <PackageOpen className="h-9 w-9 text-muted-foreground" />

                            <p className="mt-4 font-medium">
                                Ainda não publicou anúncios
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Publique o primeiro material académico na
                                plataforma.
                            </p>

                            <Link
                                href="/listings/create"
                                className="mt-4 text-sm font-medium text-primary hover:underline"
                            >
                                Publicar anúncio
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <MessageSquare className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Mensagens recentes
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    As conversas mais recentes da sua conta.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                            <MessageSquare className="h-9 w-9 text-muted-foreground" />

                            <p className="mt-4 font-medium">
                                Nenhuma mensagem disponível
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                As mensagens trocadas com outros estudantes
                                aparecerão aqui.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </StudentLayout>
    );
}