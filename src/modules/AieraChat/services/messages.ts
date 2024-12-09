import { useState, useEffect, useCallback } from 'react';
import { ContentBlock } from '../components/Messages/MessageFactory/Block';

export enum ChatMessageType {
    prompt = 'prompt',
    sources = 'sources',
    response = 'response',
}

interface ChatMessageSource {
    targetType: string;
    targetId: string;
    targetTitle: string;
}

export enum ChatMessageStatus {
    // Initial states
    QUEUED = 'queued', // Message is queued for processing
    PENDING = 'pending', // Message is being processed

    // Streaming states
    STREAMING = 'streaming', // Message is currently streaming its response

    // Completion states
    COMPLETED = 'completed', // Message completed successfully
    STOPPED = 'stopped', // Message was manually stopped by user

    // Error states
    FAILED = 'failed', // Message processing failed
    RATE_LIMITED = 'rateLimited', // Message was blocked due to rate limiting
}

export interface ChatMessageBase {
    id: string;
    ordinalId: string;
    timestamp: string;
    status: ChatMessageStatus;
    prompt: string;
    type: ChatMessageType;
}

export interface ChatMessageResponse extends ChatMessageBase {
    type: ChatMessageType.response;
    blocks: ContentBlock[];
    sources: ChatMessageSource[];
}

export interface ChatMessagePrompt extends ChatMessageBase {
    type: ChatMessageType.prompt;
}

export interface ChatMessageSources extends ChatMessageBase {
    type: ChatMessageType.sources;
    confirmed: boolean;
    sources: ChatMessageSource[];
}

export type ChatMessage = ChatMessageResponse | ChatMessagePrompt | ChatMessageSources;

interface UseChatMessagesReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

const sampleMessages = [
    // First conversation - Comprehensive AI Report
    {
        id: 'msg1',
        ordinalId: '001',
        timestamp: '2024-12-06T10:00:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Give me a comprehensive overview of the AI industry in 2024.',
        type: ChatMessageType.prompt,
    },
    {
        id: 'msg2',
        ordinalId: '002',
        timestamp: '2024-12-06T10:00:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Give me a comprehensive overview of the AI industry in 2024.',
        type: ChatMessageType.sources,
        confirmed: true,
        sources: [
            {
                targetType: 'report',
                targetId: 'ai-market-2024',
                targetTitle: '2024 AI Industry Analysis',
            },
        ],
    },
    {
        id: 'msg3',
        ordinalId: '003',
        timestamp: '2024-12-06T10:00:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Give me a comprehensive overview of the AI industry in 2024.',
        type: ChatMessageType.response,
        blocks: [
            {
                id: 'report-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'report-subtitle',
                type: 'text',
                content: ['Market Overview and Key Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry has experienced unprecedented growth in 2024, with global revenues reaching new heights and adoption accelerating across all sectors.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'key-findings',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth'],
                        secondary: [
                            'Global AI revenue reached $500 billion, representing a 45% year-over-year increase',
                        ],
                    },
                    {
                        primary: ['Technology Adoption'],
                        secondary: ['Enterprise AI implementation grew by 65% across Fortune 500 companies'],
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'market-share',
                type: 'chart',
                data: [
                    { name: 'North America', value: 450, color: '#8884d8' },
                    { name: 'Europe', value: 380, color: '#82ca9d' },
                    { name: 'Asia Pacific', value: 350, color: '#ffc658' },
                    { name: 'Rest of World', value: 150, color: '#ff8042' },
                ],
                meta: {
                    chartType: 'treemap',
                    title: 'Regional Market Distribution (Billion USD)',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: '/api/placeholder/800/400',
                meta: {
                    title: 'Modern AI System Architecture',
                    altText: 'Diagram showing the components and relationships in modern AI systems',
                    caption: 'Typical enterprise AI system architecture in 2024',
                },
            },
        ],
        sources: [
            {
                targetType: 'report',
                targetId: 'ai-market-2024',
                targetTitle: '2024 AI Industry Analysis',
            },
        ],
    },

    // Second conversation - Model Performance
    {
        id: 'msg4',
        ordinalId: '004',
        timestamp: '2024-12-06T10:01:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Compare the performance of top AI models across different metrics.',
        type: ChatMessageType.prompt,
    },
    {
        id: 'msg5',
        ordinalId: '005',
        timestamp: '2024-12-06T10:01:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Compare the performance of top AI models across different metrics.',
        type: ChatMessageType.sources,
        confirmed: true,
        sources: [
            {
                targetType: 'benchmark',
                targetId: 'model-performance',
                targetTitle: 'AI Model Performance Benchmark 2024',
            },
        ],
    },
    {
        id: 'msg6',
        ordinalId: '006',
        timestamp: '2024-12-06T10:01:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Compare the performance of top AI models across different metrics.',
        type: ChatMessageType.response,
        blocks: [
            {
                id: 'perf-intro',
                type: 'text',
                content: [
                    'Analysis of leading AI models reveals significant variations in performance across key metrics:',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'model-comparison',
                type: 'table',
                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                rows: [
                    [['GPT-4'], ['98.5%'], ['120ms'], ['$0.60']],
                    [['Claude-3'], ['97.8%'], ['115ms'], ['$0.55']],
                    [['PaLM'], ['96.5%'], ['125ms'], ['$0.45']],
                ],
                meta: {
                    columnAlignment: ['left', 'center', 'center', 'right'],
                    columnMeta: [
                        {},
                        { format: 'percentage', decimals: 1 },
                        { unit: 'ms', format: 'number' },
                        { currency: 'USD', format: 'number' },
                    ],
                },
            },
            {
                id: 'key-features',
                type: 'list',
                items: [
                    {
                        primary: ['Specialized Capabilities'],
                        secondary: ['Each model exhibits unique strengths in specific domains'],
                    },
                    {
                        primary: ['Trade-offs'],
                        secondary: ['Higher accuracy generally correlates with increased cost'],
                    },
                ],
                meta: { style: 'unordered' },
            },
        ],
        sources: [
            {
                targetType: 'benchmark',
                targetId: 'model-performance',
                targetTitle: 'AI Model Performance Benchmark 2024',
            },
        ],
    },

    // Third conversation - Expert Commentary
    {
        id: 'msg7',
        ordinalId: '007',
        timestamp: '2024-12-06T10:02:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are experts saying about the future of AI?',
        type: ChatMessageType.prompt,
    },
    {
        id: 'msg8',
        ordinalId: '008',
        timestamp: '2024-12-06T10:02:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are experts saying about the future of AI?',
        type: ChatMessageType.sources,
        confirmed: true,
        sources: [
            {
                targetType: 'conference',
                targetId: 'future-ai-summit',
                targetTitle: 'Future of AI Summit 2024',
            },
        ],
    },
    {
        id: 'msg9',
        ordinalId: '009',
        timestamp: '2024-12-06T10:02:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are experts saying about the future of AI?',
        type: ChatMessageType.response,
        blocks: [
            {
                id: 'future-heading',
                type: 'text',
                content: ['Expert Perspectives on AI Evolution'],
                meta: { style: 'h3' },
            },
            {
                id: 'future-context',
                type: 'text',
                content: [
                    'Leading experts at the Future of AI Summit 2024 shared insights on emerging trends and future developments:',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'We are witnessing the emergence of truly general-purpose AI systems that can seamlessly adapt to diverse tasks while maintaining high performance and reliability.',
                meta: {
                    author: 'Dr. Sarah Chen',
                    source: 'Future of AI Summit 2024',
                    date: '2024-03-15',
                },
            },
            {
                id: 'future-metrics',
                type: 'chart',
                data: [
                    { year: '2024', capability: 65, adoption: 45 },
                    { year: '2025', capability: 80, adoption: 60 },
                    { year: '2026', capability: 90, adoption: 75 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'Projected AI Evolution',
                    xAxis: 'Year',
                    yAxis: 'Score',
                    series: [
                        { key: 'capability', label: 'Capability Score', color: '#8884d8' },
                        { key: 'adoption', label: 'Adoption Rate', color: '#82ca9d' },
                    ],
                },
            },
        ],
        sources: [
            {
                targetType: 'conference',
                targetId: 'future-ai-summit',
                targetTitle: 'Future of AI Summit 2024',
            },
        ],
    },
];

const fetchChatMessages = async (_: string): Promise<ChatMessage[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return sampleMessages as ChatMessage[];
};

export const useChatMessages = (sessionId: string | null): UseChatMessagesReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        try {
            if (sessionId !== 'new') {
                setIsLoading(true);
            }
            setError(null);
            if (sessionId && sessionId !== 'new') {
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
    }, [sessionId]);

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
