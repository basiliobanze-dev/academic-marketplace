import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    MessageSquare,
    RefreshCcw,
    Search,
    ShieldCheck,
    ShoppingBag,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sobre a plataforma',
        href: '/about',
    },
];

export default function About() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sobre a plataforma" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="rounded-xl border bg-card p-6 md:p-8">
                    <div className="max-w-3xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>

                        <h1 className="text-3xl font-bold">
                            Sobre a plataforma
                        </h1>

                        <p className="mt-4 text-muted-foreground">
                            Esta plataforma foi desenvolvida para apoiar
                            estudantes do ensino superior na procura,
                            venda e troca de materiais académicos.
                        </p>

                        <p className="mt-3 text-muted-foreground">
                            O sistema permite publicar anúncios, pesquisar
                            materiais, entrar em contacto com outros
                            estudantes e avaliar as transacções realizadas.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-xl font-semibold">
                        Principais funcionalidades
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FeatureCard
                            icon={Search}
                            title="Pesquisar materiais"
                            description="Encontre materiais académicos disponíveis para venda ou troca."
                        />

                        <FeatureCard
                            icon={ShoppingBag}
                            title="Publicar anúncios"
                            description="Publique materiais que pretende vender ou trocar."
                        />

                        <FeatureCard
                            icon={RefreshCcw}
                            title="Venda e troca"
                            description="Escolha a forma de transacção mais adequada."
                        />

                        <FeatureCard
                            icon={MessageSquare}
                            title="Mensagens"
                            description="Comunique directamente com outros estudantes."
                        />

                        <FeatureCard
                            icon={Users}
                            title="Comunidade académica"
                            description="Promova a partilha de recursos entre estudantes."
                        />

                        <FeatureCard
                            icon={ShieldCheck}
                            title="Moderação"
                            description="Denúncias e gestão administrativa ajudam a manter a plataforma segura."
                        />
                    </div>
                </section>

                <section className="rounded-xl border bg-card p-6">
                    <h2 className="text-xl font-semibold">
                        Objectivo da plataforma
                    </h2>

                    <p className="mt-3 text-muted-foreground">
                        O principal objectivo é facilitar o acesso a
                        materiais académicos, reduzir dificuldades na sua
                        aquisição e incentivar a reutilização de recursos
                        entre estudantes.
                    </p>
                </section>
            </div>
        </AppLayout>
    );
}

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>

            <h3 className="font-semibold">{title}</h3>

            <p className="mt-2 text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}