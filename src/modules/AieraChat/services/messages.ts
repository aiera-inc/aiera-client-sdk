import { useState, useEffect, useCallback } from 'react';

type MessageType = 'prompt' | 'sources' | 'response';
type MessageStatus = 'finished' | 'thinking' | 'updating';
type User = 'me' | 'other';

interface Message {
    type: MessageType;
    key: string;
    text: string;
    status: MessageStatus;
    prompt?: string;
    user: User;
}

interface UseChatMessagesReturn {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

const sampleMessages: Message[] = [
    {
        key: 'msg-1',
        type: 'prompt',
        text: 'What are the key trends in artificial intelligence for 2024?',
        status: 'finished',
        prompt: 'What are the key trends in artificial intelligence for 2024?',
        user: 'me',
    },
    {
        key: 'msg-3',
        type: 'response',
        text: 'Based on current developments, the major AI trends include: 1) Increased focus on explainable AI and transparency, 2) Growth in multimodal models combining text, image, and audio, 3) Enhanced regulatory frameworks worldwide, 4) Integration of AI in healthcare diagnostics, 5) Emergence of more efficient and smaller language models',
        status: 'finished',
        user: 'other',
    },
    {
        key: 'msg-4',
        type: 'prompt',
        text: 'Could you explain how quantum computing might affect cybersecurity?',
        status: 'finished',
        prompt: 'Could you explain how quantum computing might affect cybersecurity?',
        user: 'me',
    },
    {
        key: 'msg-5',
        type: 'response',
        text: 'Quantum computing poses both challenges and opportunities for cybersecurity. The primary concern is that quantum computers could potentially break current encryption methods, particularly RSA and elliptic curve cryptography. This has led to the development of quantum-resistant encryption algorithms.',
        status: 'finished',
        user: 'other',
    },
    {
        key: 'msg-6',
        type: 'prompt',
        text: 'What are the most promising renewable energy technologies?',
        status: 'finished',
        prompt: 'What are the most promising renewable energy technologies?',
        user: 'me',
    },
    {
        key: 'msg-8',
        type: 'response',
        text: 'Current data indicates that solar photovoltaics and offshore wind are showing the most rapid cost reductions and efficiency improvements. Advanced battery storage technologies are also emerging as crucial components. Hydrogen fuel cells and next-generation nuclear fusion are gaining significant research attention.',
        status: 'finished',
        user: 'other',
    },
    {
        key: 'msg-9',
        type: 'prompt',
        text: 'How is machine learning transforming healthcare diagnostics?',
        status: 'finished',
        prompt: 'How is machine learning transforming healthcare diagnostics?',
        user: 'me',
    },
    {
        key: 'msg-10',
        type: 'response',
        text: 'Machine learning is revolutionizing healthcare diagnostics through improved image analysis for radiology, pathology, and dermatology. AI systems can now detect patterns in medical imaging that might be missed by human observers, leading to earlier disease detection and more accurate diagnoses.',
        status: 'finished',
        user: 'other',
    },
    {
        key: 'msg-11',
        type: 'prompt',
        text: 'What are the latest developments in autonomous vehicles?',
        status: 'finished',
        prompt: 'What are the latest developments in autonomous vehicles?',
        user: 'me',
    },
    {
        key: 'msg-13',
        type: 'response',
        text: 'Recent advances in autonomous vehicles include improved LiDAR technology, enhanced neural networks for real-time decision making, and better integration with smart city infrastructure. Companies are also making progress in handling edge cases and adverse weather conditions.',
        status: 'finished',
        user: 'other',
    },
    {
        key: 'msg-14',
        type: 'prompt',
        text: 'Can you explain the potential of blockchain in supply chain management?',
        status: 'finished',
        prompt: 'Can you explain the potential of blockchain in supply chain management?',
        user: 'me',
    },
    {
        key: 'msg-15',
        type: 'response',
        text: 'Blockchain technology offers unprecedented transparency and traceability in supply chain management. It enables real-time tracking of products, verification of authenticity, and automated smart contracts. This can significantly reduce fraud, improve efficiency, and enhance trust between parties.',
        status: 'finished',
        user: 'other',
    },
];

const generateRandomMessages = (count: number): Message[] => {
    const messages: Message[] = [];
    const promptMessages = sampleMessages.filter((m) => m.type === 'prompt');
    const responseMessages = sampleMessages.filter((m) => m.type === 'response');

    for (let i = 0; i < count; i++) {
        const isPrompt = i % 2 === 0;
        const sourceMessages = isPrompt ? promptMessages : responseMessages;
        const randomIndex = Math.floor(Math.random() * sourceMessages.length);
        const sourceMesage = sourceMessages[randomIndex];
        const previousPrompt = messages[messages.length - 1];

        if (sourceMesage?.text) {
            messages.push({
                key: `msg-${i}`,
                type: isPrompt ? 'prompt' : 'response',
                text: sourceMesage.text,
                status: 'finished',
                prompt: isPrompt ? sourceMesage.text : previousPrompt?.text,
                user: isPrompt ? 'me' : 'other',
            });
        }
    }
    return messages;
};

const fetchChatMessages = async (_: string): Promise<Message[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const messageCount = (Math.floor(Math.random() * 4) + 4) * 2; // Generates 8, 10, 12, or 14 messages
    return generateRandomMessages(messageCount);
};

export const useChatMessages = (sessionId: string | null): UseChatMessagesReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            if (sessionId) {
                const data = await fetchChatMessages(sessionId);
                setMessages(data);
            } else {
                setMessages([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchMessages();
    }, [sessionId, fetchMessages]);

    const refresh = async () => {
        await fetchMessages();
    };

    return {
        messages,
        isLoading,
        error,
        refresh,
    };
};
