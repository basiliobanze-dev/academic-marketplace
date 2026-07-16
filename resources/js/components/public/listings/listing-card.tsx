import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { BookOpen, User } from 'lucide-react';
import { type ReactNode } from 'react';

export interface Listing {
    id: number;
    title: string;
    description: string;
    price: string | number | null;
    transaction_type: 'sale' | 'exchange';
    status: 'available' | 'sold' | 'exchanged';
    created_at: string;
    updated_at: string;

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

function getTransactionLabel(
    transactionType: Listing['transaction_type'],
): string {
    return transactionType === 'sale' ? 'Venda' : 'Troca';
}

function getStatusLabel(status: Listing['status']): string {
    const labels: Record<Listing['status'], string> = {
        available: 'Disponível',
        sold: 'Vendido',
        exchanged: 'Trocado',
    };

    return labels[status];
}

export default function ListingCard({
    listing,
    actions,
}: ListingCardProps) {
    const description =
        listing.description.length > 130
            ? `${listing.description.substring(0, 130)}...`
            : listing.description;

    return (
        <Card className="flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-44 shrink-0 items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/20">
                <BookOpen className="h-16 w-16 text-primary/70" />
            </div>

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

                <h2 className="line-clamp-2 text-lg leading-snug font-semibold">
                    {listing.title}
                </h2>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col space-y-4">
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />

                    <span className="truncate">
                        {listing.user?.name ??
                            'Utilizador não identificado'}
                    </span>
                </div>

                <p className="mt-auto text-lg font-bold text-primary">
                    {listing.transaction_type === 'sale'
                        ? formatPrice(listing.price)
                        : 'Disponível para troca'}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t pt-4">
                <Button
                    className="w-full"
                    variant="outline"
                    asChild
                >
                    <Link href={`/listings/${listing.id}`}>
                        Ver detalhes
                    </Link>
                </Button>

                {actions && (
                    <div className="flex w-full gap-2">
                        {actions}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}