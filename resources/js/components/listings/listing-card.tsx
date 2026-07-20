import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BookOpen, User } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { type SharedData } from '@/types';

export interface Listing {
    id: number;
    title: string;
    description: string;
    price: string | number | null;
    transaction_type: 'sale' | 'exchange';
    status: 'available' | 'sold' | 'exchanged';
    created_at: string;
    updated_at: string;
    image?: string | null;
    image_url?: string | null;

    user?: {
        id: number;
        name: string;
        email?: string;
        role?: string;
    } | null;

    category?: {
        id: number;
        name: string;
        description?: string | null;
    } | null;
}

interface ListingCardProps {
    listing: Listing;
    actions?: ReactNode;
}

function formatPrice(price: string | number | null): string {
    if (price === null || price === '') {
        return 'Preço não indicado';
    }

    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 2,
    }).format(Number(price));
}

function getTransactionLabel(transactionType: Listing['transaction_type']) {
    return transactionType === 'sale' ? 'Venda' : 'Troca';
}

function getStatusLabel(status: Listing['status']) {
    const labels = {
        available: 'Disponível',
        sold: 'Vendido',
        exchanged: 'Trocado',
    };

    return labels[status];
}

export default function ListingCard({ listing, actions }: ListingCardProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';
    const isAuthenticated = Boolean(auth.user);

    const description =
        listing.description.length > 130
            ? `${listing.description.substring(0, 130)}...`
            : listing.description;

    return (
        <Card className="flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            {listing.image_url ? (
                <div className="h-44 w-full overflow-hidden bg-muted">
                    <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/20">
                    <BookOpen className="h-16 w-16 text-primary/70" />
                </div>
            )}

            <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge>
                        {getTransactionLabel(listing.transaction_type)}
                    </Badge>

                    <Badge variant="outline">
                        {getStatusLabel(listing.status)}
                    </Badge>

                    {listing.category && (
                        <Badge variant="secondary">
                            {listing.category.name}
                        </Badge>
                    )}
                </div>

                <h2 className="line-clamp-2 text-lg font-semibold leading-snug">
                    {listing.title}
                </h2>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />

                    <span>
                        {listing.user?.name ?? 'Utilizador não identificado'}
                    </span>
                </div>

                <p className="text-lg font-bold text-primary">
                    {listing.transaction_type === 'sale'
                        ? formatPrice(listing.price)
                        : 'Disponível para troca'}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
                {!isAdmin && (
                    <Button className="w-full" variant="outline" asChild>
                        <Link
                            href={
                                isAuthenticated
                                    ? `/listings/${listing.id}`
                                    : '/login'
                            }
                            onClick={(event) => {
                                if (!isAuthenticated) {
                                    event.preventDefault();
                                    router.visit('/login');
                                }
                            }}
                        >
                            Ver detalhes
                        </Link>
                    </Button>
                )}

                {actions && <div className="flex w-full gap-2">{actions}</div>}
            </CardFooter>
        </Card>
    );
}