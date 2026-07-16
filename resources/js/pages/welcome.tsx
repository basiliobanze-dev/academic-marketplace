import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    MessageSquare,
    Search,
    ShieldCheck,
    ShoppingBag,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Marketplace Académico" />

            <div className="min-h-screen bg-background text-foreground">
                {/* Cabeçalho */}
                <header className="border-b bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/images/marketplace-logo.png"
                                alt="Marketplace Académico"
                                className="h-14 w-14 object-contain"
                            />

                            <div className="hidden sm:block">
                                <h1 className="text-base font-bold text-primary">
                                    Marketplace Académico
                                </h1>

                                <p className="text-xs text-muted-foreground">
                                    Instituto Superior Dom Bosco
                                </p>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-3">
                            {auth?.user ? (
                                <Button asChild>
                                    <Link href="/dashboard">
                                        Aceder ao painel
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">Entrar</Link>
                                    </Button>

                                    <Button asChild>
                                        <Link href="/register">
                                            Criar conta
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    {/* Secção principal */}
                    <section className="bg-gradient-to-br from-white via-green-50 to-amber-50">
                        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
                            <div>
                                <span className="mb-5 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                    Plataforma académica
                                </span>

                                <h2 className="max-w-2xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                                    Encontre, venda e troque materiais académicos
                                    de forma simples
                                </h2>

                                <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                                    Uma plataforma que conecta estudantes para a troca e venda de materiais acadêmicos, 
                                    promovendo o acesso a recursos de estudo de forma simples, segura e acessível.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button size="lg" asChild>
                                        <Link href="/listings">
                                            Explorar materiais
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>

                                    {!auth?.user && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link href="/register">
                                                Publicar um anúncio
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className="relative flex min-h-[360px] w-full max-w-lg items-center justify-center rounded-3xl border bg-white p-10 shadow-xl">
                                    <div className="absolute top-6 left-6 h-16 w-16 rounded-full bg-primary/10" />
                                    <div className="absolute right-8 bottom-8 h-24 w-24 rounded-full bg-secondary/30" />

                                    <div className="relative text-center">
                                        <img
                                            src="/images/marketplace-logo.png"
                                            alt="Logótipo do Marketplace Académico"
                                            className="mx-auto h-52 w-52 object-contain"
                                        />

                                        <p className="mt-5 text-lg font-semibold text-primary">
                                            Partilhe conhecimento
                                        </p>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Apoie outros estudantes e encontre
                                            os materiais de que precisa.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Benefícios */}
                    <section className="mx-auto max-w-7xl px-6 py-20">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold">
                                Tudo o que precisa numa única plataforma
                            </h2>

                            <p className="mt-4 text-muted-foreground">
                                Recursos organizados, contacto directo e maior
                                segurança nas interacções entre estudantes.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={Search}
                                title="Pesquisar materiais"
                                description="Encontre materiais por título, categoria, estado ou tipo de transacção."
                            />

                            <FeatureCard
                                icon={ShoppingBag}
                                title="Vender ou trocar"
                                description="Publique materiais que pretende vender ou trocar com outros estudantes."
                            />

                            <FeatureCard
                                icon={MessageSquare}
                                title="Comunicação directa"
                                description="Converse com o anunciante e negocie através da plataforma."
                            />

                            <FeatureCard
                                icon={BookOpen}
                                title="Categorias académicas"
                                description="Consulte materiais organizados por áreas e categorias."
                            />

                            <FeatureCard
                                icon={ShieldCheck}
                                title="Maior organização"
                                description="Evite a desorganização dos grupos informais e redes sociais."
                            />

                            <FeatureCard
                                icon={ArrowRight}
                                title="Acesso simples"
                                description="Utilize a plataforma através do navegador, sem necessidade de instalação."
                            />
                        </div>
                    </section>

                    {/* Chamada final */}
                    <section className="bg-primary">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-14 text-center text-primary-foreground md:flex-row md:text-left">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Pronto para começar?
                                </h2>

                                <p className="mt-2 text-sm opacity-90">
                                    Crie a sua conta já!
                                </p>
                            </div>

                            <Button
                                size="lg"
                                variant="secondary"
                                asChild
                            >
                                <Link href={auth?.user ? '/dashboard' : '/register'}>
                                    {auth?.user
                                        ? 'Aceder ao painel'
                                        : 'Criar conta gratuitamente'}
                                </Link>
                            </Button>
                        </div>
                    </section>
                </main>

                <footer className="border-t bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
                        <p>
                            © {new Date().getFullYear()} Marketplace Académico.
                        </p>

                        <p>Desenvolvido por Basílio Banze</p>
                    </div>
                </footer>
            </div>
        </>
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
        <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-semibold">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}