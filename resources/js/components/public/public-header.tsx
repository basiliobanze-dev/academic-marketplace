import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export default function PublicHeader() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/images/marketplace-logo.png"
                        alt="Marketplace Académico"
                        className="h-12 w-12 object-contain"
                    />

                    <div className="hidden sm:block">
                        <p className="text-sm font-bold leading-tight text-primary">
                            Marketplace Académico
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Instituto Superior Dom Bosco
                        </p>
                    </div>
                </Link>

                <nav className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/">Página inicial</Link>
                    </Button>

                    {auth?.user ? (
                        <Button asChild>
                            <Link href="/dashboard">Aceder ao painel</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" asChild>
                                <Link href="/login">Entrar</Link>
                            </Button>

                            <Button asChild className="hidden sm:inline-flex">
                                <Link href="/register">Criar conta</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}