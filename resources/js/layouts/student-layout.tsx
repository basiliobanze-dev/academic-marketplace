import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface StudentLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function StudentLayout({
    children,
    breadcrumbs = [],
}: StudentLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {children}
        </AppLayout>
    );
}