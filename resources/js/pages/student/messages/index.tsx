import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type Message, type MessageUser } from '@/types/message';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    LoaderCircle,
    MessageSquare,
    Search,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface MessagesResponse {
    data: Message[];
}

interface Conversation {
    contact: MessageUser;
    lastMessage: Message;
    unreadCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel principal',
        href: '/dashboard',
    },
    {
        title: 'Mensagens',
        href: '/messages',
    },
];

function formatMessageDate(date: string): string {
    const messageDate = new Date(date);
    const today = new Date();

    const isToday =
        messageDate.getDate() === today.getDate() &&
        messageDate.getMonth() === today.getMonth() &&
        messageDate.getFullYear() === today.getFullYear();

    if (isToday) {
        return new Intl.DateTimeFormat('pt-PT', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(messageDate);
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(messageDate);
}

export default function MessagesIndex() {
    const { auth } = usePage<SharedData>().props;

    const [messages, setMessages] = useState<Message[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadMessages() {
        try {
            setLoading(true);
            setError('');

            const response =
                await api.get<MessagesResponse>('/api/messages');

            setMessages(response.data.data ?? []);
        } catch (requestError) {
            const error = requestError as AxiosError;

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError('Não foi possível carregar as suas mensagens.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadMessages();
    }, []);

    const conversations = useMemo<Conversation[]>(() => {
        const grouped = new Map<number, Conversation>();
        const authenticatedUserId = auth.user.id;

        messages.forEach((message) => {
            const contact =
                message.sender.id === authenticatedUserId
                    ? message.receiver
                    : message.sender;

            const currentConversation = grouped.get(contact.id);

            const unreadMessage =
                !message.is_mine && !message.is_read ? 1 : 0;

            if (!currentConversation) {
                grouped.set(contact.id, {
                    contact,
                    lastMessage: message,
                    unreadCount: unreadMessage,
                });

                return;
            }

            currentConversation.unreadCount += unreadMessage;

            if (
                new Date(message.created_at).getTime() >
                new Date(
                    currentConversation.lastMessage.created_at,
                ).getTime()
            ) {
                currentConversation.lastMessage = message;
            }
        });

        return Array.from(grouped.values()).sort(
            (conversationA, conversationB) =>
                new Date(
                    conversationB.lastMessage.created_at,
                ).getTime() -
                new Date(
                    conversationA.lastMessage.created_at,
                ).getTime(),
        );
    }, [messages, auth.user.id]);

    const filteredConversations = conversations.filter(
        (conversation) =>
            conversation.contact.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            conversation.lastMessage.message
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensagens" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Mensagens
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consulte as conversas com outros estudantes.
                    </p>
                </div>

                <div className="relative max-w-xl">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Pesquisar conversa..."
                        className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card">
                        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                        <p className="mt-3 text-sm text-muted-foreground">
                            A carregar conversas...
                        </p>
                    </div>
                )}

                {!loading &&
                    filteredConversations.length === 0 && (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground" />

                            <h2 className="mt-4 text-lg font-semibold">
                                Nenhuma conversa disponível
                            </h2>

                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Entre nos detalhes de um material e
                                contacte o anunciante para iniciar uma
                                conversa.
                            </p>

                            <Button className="mt-5" asChild>
                                <Link href="/listings">
                                    Pesquisar materiais
                                </Link>
                            </Button>
                        </div>
                    )}

                {!loading &&
                    filteredConversations.length > 0 && (
                        <div className="overflow-hidden rounded-xl border bg-card">
                            {filteredConversations.map(
                                (conversation) => (
                                    <Link
                                        key={conversation.contact.id}
                                        href={`/messages/${conversation.contact.id}`}
                                        className="flex items-center gap-4 border-b p-4 transition last:border-b-0 hover:bg-muted/50"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <User className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <h2 className="truncate font-semibold">
                                                    {
                                                        conversation
                                                            .contact
                                                            .name
                                                    }
                                                </h2>

                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatMessageDate(
                                                        conversation
                                                            .lastMessage
                                                            .created_at,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center justify-between gap-3">
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {conversation
                                                        .lastMessage
                                                        .is_mine
                                                        ? 'Você: '
                                                        : ''}
                                                    {
                                                        conversation
                                                            .lastMessage
                                                            .message
                                                    }
                                                </p>

                                                {conversation.unreadCount >
                                                    0 && (
                                                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                                                        {
                                                            conversation.unreadCount
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ),
                            )}
                        </div>
                    )}
            </div>
        </StudentLayout>
    );
}