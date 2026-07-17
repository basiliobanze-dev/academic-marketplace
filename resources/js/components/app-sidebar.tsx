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
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    BookOpen,
    FileText,
    FolderOpen,
    LayoutDashboard,
    MessageSquare,
    PlusCircle,
    Search,
    ShieldCheck,
    Star,
    User,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const studentNavItems: NavItem[] = [
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

const adminNavItems: NavItem[] = [
    {
        title: 'Painel administrativo',
        url: '/admin/dashboard',
        icon: ShieldCheck,
    },
    {
        title: 'Utilizadores',
        url: '/admin/users',
        icon: Users,
    },
    {
        title: 'Anúncios',
        url: '/admin/listings',
        icon: FileText,
    },
    {
        title: 'Denúncias',
        url: '/admin/reports',
        icon: AlertTriangle,
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
    const { auth } = usePage<SharedData>().props;

    const isAdmin = auth.user.role === 'admin';

    const mainNavItems = isAdmin
        ? adminNavItems
        : studentNavItems;

    const dashboardUrl = isAdmin
        ? '/admin/dashboard'
        : '/dashboard';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
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