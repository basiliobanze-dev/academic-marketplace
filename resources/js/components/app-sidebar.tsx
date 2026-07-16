import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    FolderOpen,
    LayoutDashboard,
    MessageSquare,
    PlusCircle,
    Search,
    Star,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Painel principal',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Pesquisar materiais',
        url: '/listings',
        icon: Search,
    },
    {
        title: 'Publicar anúncio',
        url: '/listings/create',
        icon: PlusCircle,
    },
    {
        title: 'Meus anúncios',
        url: '/my-listings',
        icon: FolderOpen,
    },
    {
        title: 'Mensagens',
        url: '/messages',
        icon: MessageSquare,
    },
    {
        title: 'Avaliações',
        url: '/reviews',
        icon: Star,
    },
    {
        title: 'Notificações',
        url: '/notifications',
        icon: Bell,
    },
    {
        title: 'Meu perfil',
        url: '/settings/profile',
        icon: User,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Sobre a plataforma',
        url: '/about',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <NavMain items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}