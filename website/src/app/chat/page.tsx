'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Message {
    id: string;
    content: string;
    isUser: boolean;
}

export default function ChatPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const token = api.getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        async function fetchHistory() {
            setLoading(true);
            try {
                const response = await api.getChatHistory();
                if (response.success && response.data?.messages) {
                    const history = response.data.messages as Array<{ id: string; content: string; role: string }>;
                    setMessages(
                        history.map((m) => ({
                            id: m.id,
                            content: m.content,
                            isUser: m.role === 'user',
                        }))
                    );
                }
            } catch {
                // Ignore errors
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || sending) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: messageText,
            isUser: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setSending(true);

        // Add placeholder AI message for streaming
        const aiMessageId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, { id: aiMessageId, content: '', isUser: false }]);

        try {
            const token = api.getToken();
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Handle SSE streaming
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let fullContent = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.chunk) {
                                    fullContent += data.chunk;
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m.id === aiMessageId ? { ...m, content: fullContent } : m
                                        )
                                    );
                                }
                            } catch {
                                // Ignore parse errors
                            }
                        }
                    }
                }
            }
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === aiMessageId
                        ? { ...m, content: 'Sorry, I encountered an error. Please try again.' }
                        : m
                )
            );
        } finally {
            setSending(false);
        }
    };

    const suggestions = [
        'How many days do I have left?',
        'When does my membership expire?',
        'Which destinations are available?',
    ];

    return (
        <div className="min-h-screen pt-20 pb-4 flex flex-col">
            <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 py-4 border-b mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-[var(--text-primary)]">Travel Assistant</h1>
                        <span className="text-xs text-[var(--success)]">● Online</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-6">
                                <span className="text-5xl">🤖</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                Hi! I&apos;m your Travel Assistant
                            </h2>
                            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                                Ask me about your membership, travel days, destinations, or anything else!
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => sendMessage(suggestion)}
                                        className="px-4 py-2 rounded-full border border-[var(--primary)]/30 text-[var(--primary)] text-sm hover:bg-[var(--primary)]/5 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!message.isUser && (
                                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                                            <span>🤖</span>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[70%] px-4 py-3 rounded-2xl ${message.isUser
                                            ? 'gradient-primary text-white rounded-tr-none'
                                            : 'bg-white card-shadow text-[var(--text-primary)] rounded-tl-none'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {sending && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                                        <span>🤖</span>
                                    </div>
                                    <div className="bg-white card-shadow px-4 py-3 rounded-2xl rounded-tl-none">
                                        <p className="text-lg">...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="py-4 border-t bg-[var(--background)]">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask me anything..."
                            className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                            disabled={sending}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || sending}
                            className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
