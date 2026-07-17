import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import StudentLayout from '@/layouts/student-layout';
import { type Message, type MessageUser } from '@/types/message';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AxiosError } from 'axios';
import {
    ArrowLeft,
    LoaderCircle,
    Send,
    Star,
    User,
} from 'lucide-react';
import {
    type FormEvent,
    useEffect,
    useRef,
    useState,
} from 'react';

interface ChatProps {
    contact: MessageUser;
}

interface MessagesResponse {
    data: Message[];
}

function formatMessageTime(date: string): string {
    return new Intl.DateTimeFormat('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export default function Chat({ contact }: ChatProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Painel principal',
            href: '/dashboard',
        },
        {
            title: 'Mensagens',
            href: '/messages',
        },
        {
            title: contact.name,
            href: `/messages/${contact.id}`,
        },
    ];

    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }

    async function loadConversation(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError('');

            const response = await api.get(
                `/api/messages/${contact.id}`,
            );

            const responseData = response.data;

            const loadedMessages = Array.isArray(responseData)
                ? responseData
                : responseData.data ?? [];

            setMessages(loadedMessages);
        } catch (requestError) {
            const error = requestError as AxiosError<{
                message?: string;
            }>;

            console.error(
                'Erro ao carregar conversa:',
                error.response?.status,
                error.response?.data,
            );

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            setError(
                error.response?.data.message ??
                    'Não foi possível carregar esta conversa.',
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    async function sendMessage(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const text = messageText.trim();

        if (!text || sending) {
            return;
        }

        try {
            setSending(true);
            setError('');

            await api.get('/sanctum/csrf-cookie');

            const response = await api.post('/api/messages', {
                receiver_id: contact.id,
                message: text,
            });

            const createdMessage =
                response.data.data ?? response.data;

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    ...createdMessage,
                    is_mine: true,
                },
            ]);

            setMessageText('');
        } catch (requestError) {
            const error = requestError as AxiosError<{
                message?: string;
                errors?: Record<string, string[]>;
            }>;

            console.error(
                'Erro ao enviar mensagem:',
                error.response?.status,
                error.response?.data,
            );

            if (error.response?.status === 401) {
                router.visit('/login');
                return;
            }

            if (error.response?.status === 403) {
                setError(
                    'Não possui autorização para enviar mensagens.',
                );
                return;
            }

            if (error.response?.status === 422) {
                const validationMessage =
                    error.response.data.errors?.message?.[0];

                setError(
                    validationMessage ??
                        error.response.data.message ??
                        'Verifique os dados da mensagem.',
                );

                return;
            }

            setError(
                error.response?.data.message ??
                    'Não foi possível enviar a mensagem.',
            );
        } finally {
            setSending(false);
        }
    }

    useEffect(() => {
        void loadConversation();
    }, [contact.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            void loadConversation(false);
        }, 5000);

        return () => {
            window.clearInterval(interval);
        };
    }, [contact.id]);

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title={`Conversa com ${contact.name}`} />

            <div className="flex flex-1 flex-col p-4 md:p-6">
                <div className="mx-auto flex h-[calc(100vh-9rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-card">
                    <header className="flex items-center justify-between gap-4 border-b p-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <Button
                                size="icon"
                                variant="ghost"
                                asChild
                            >
                                <Link href="/messages">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate font-semibold">
                                    {contact.name}
                                </h1>

                                <p className="text-xs text-muted-foreground">
                                    Conversa entre estudantes
                                </p>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            asChild
                        >
                            <Link href={`/reviews/create/${contact.id}`}>
                                <Star className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Avaliar
                                </span>
                            </Link>
                        </Button>
                    </header>

                    <div className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
                        {loading && (
                            <div className="flex h-full flex-col items-center justify-center">
                                <LoaderCircle className="h-9 w-9 animate-spin text-primary" />

                                <p className="mt-3 text-sm text-muted-foreground">
                                    A carregar conversa...
                                </p>
                            </div>
                        )}

                        {!loading && messages.length === 0 && (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <MessageEmptyIcon />

                                <h2 className="mt-4 font-semibold">
                                    Inicie a conversa
                                </h2>

                                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                    Envie uma mensagem para saber mais
                                    sobre o material anunciado.
                                </p>
                            </div>
                        )}

                        {!loading && messages.length > 0 && (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            message.is_mine
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[82%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                                                message.is_mine
                                                    ? 'rounded-br-md bg-primary text-primary-foreground'
                                                    : 'rounded-bl-md border bg-background'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                                {message.message}
                                            </p>

                                            <div
                                                className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
                                                    message.is_mine
                                                        ? 'text-primary-foreground/70'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {formatMessageTime(
                                                    message.created_at,
                                                )}

                                                {message.is_mine && (
                                                    <span>
                                                        {message.is_read
                                                            ? ' · Lida'
                                                            : ' · Enviada'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={sendMessage}
                        className="flex items-end gap-3 border-t bg-background p-4"
                    >
                        <textarea
                            value={messageText}
                            onChange={(event) =>
                                setMessageText(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key === 'Enter' &&
                                    !event.shiftKey
                                ) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                            rows={1}
                            maxLength={2000}
                            placeholder="Escreva uma mensagem..."
                            className="min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />

                        <Button
                            type="submit"
                            size="icon"
                            disabled={
                                sending || !messageText.trim()
                            }
                        >
                            {sending ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </StudentLayout>
    );
}

function MessageEmptyIcon() {
    return (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Send className="h-7 w-7" />
        </div>
    );
}