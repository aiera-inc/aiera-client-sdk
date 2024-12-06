import { useState, useEffect, useCallback } from 'react';
import { ContentBlock } from '../Messages/MessageFactory/Block';

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
    // First conversation cycle - Language Model Performance
    {
        id: 'msg1',
        ordinalId: '001',
        timestamp: '2024-12-06T10:00:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are the performance metrics of leading language models?',
        type: ChatMessageType.prompt,
    },
    {
        id: 'msg2',
        ordinalId: '002',
        timestamp: '2024-12-06T10:00:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are the performance metrics of leading language models?',
        type: ChatMessageType.sources,
        confirmed: true,
        sources: [
            {
                targetType: 'report',
                targetId: 'nlp-market-analysis',
                targetTitle: 'NLP Market Analysis 2024',
            },
        ],
    },
    {
        id: 'msg3',
        ordinalId: '003',
        timestamp: '2024-12-06T10:00:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are the performance metrics of leading language models?',
        type: ChatMessageType.response,
        blocks: [
            {
                id: 'context-intro',
                type: 'text',
                content: [
                    'Latest performance analysis of leading language models shows significant improvements in accuracy and latency, while maintaining competitive pricing. Here is a detailed comparison across key metrics:',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'llm-performance',
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
        ],
        sources: [
            {
                targetType: 'report',
                targetId: 'nlp-market-analysis',
                targetTitle: 'NLP Market Analysis 2024',
            },
        ],
    },

    // Second conversation cycle - Industry Adoption
    {
        id: 'msg4',
        ordinalId: '004',
        timestamp: '2024-12-06T10:01:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Show me the AI adoption rates across industries.',
        type: ChatMessageType.prompt,
    },
    {
        id: 'msg5',
        ordinalId: '005',
        timestamp: '2024-12-06T10:01:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Show me the AI adoption rates across industries.',
        type: ChatMessageType.sources,
        confirmed: true,
        sources: [
            {
                targetType: 'report',
                targetId: 'industry-adoption',
                targetTitle: 'Global AI Industry Adoption Report 2024',
            },
        ],
    },
    {
        id: 'msg6',
        ordinalId: '006',
        timestamp: '2024-12-06T10:01:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Show me the AI adoption rates across industries.',
        type: ChatMessageType.response,
        blocks: [
            {
                id: 'adoption-intro',
                type: 'text',
                content: [
                    'AI adoption continues to accelerate across all major industries, with the financial sector leading implementation rates. The following chart shows current adoption rates and projected growth through 2025:',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'market-share',
                type: 'chart',
                data: [
                    { industry: 'Finance', current: 75, projected: 90 },
                    { industry: 'Healthcare', current: 60, projected: 85 },
                    { industry: 'Manufacturing', current: 45, projected: 70 },
                    { industry: 'Retail', current: 40, projected: 65 },
                ],
                meta: {
                    chartType: 'bar',
                    title: 'Industry-wise AI Adoption',
                    xAxis: 'Industry',
                    yAxis: 'Adoption Rate (%)',
                    series: [
                        { key: 'current', label: 'Current Adoption', color: '#8884d8' },
                        { key: 'projected', label: '2025 Projection', color: '#82ca9d' },
                    ],
                },
            },
        ],
        sources: [
            {
                targetType: 'report',
                targetId: 'industry-adoption',
                targetTitle: 'Global AI Industry Adoption Report 2024',
            },
        ],
    },

    // Third conversation cycle - Regional Market Distribution
    {
        id: 'msg7',
        ordinalId: '007',
        timestamp: '2024-12-06T10:02:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What is the global distribution of AI market value?',
        type: ChatMessageType.prompt,
    },
    {
        id: 'msg8',
        ordinalId: '008',
        timestamp: '2024-12-06T10:02:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What is the global distribution of AI market value?',
        type: ChatMessageType.sources,
        confirmed: true,
        sources: [
            {
                targetType: 'report',
                targetId: 'global-market',
                targetTitle: 'Global AI Market Distribution Report',
            },
        ],
    },
    {
        id: 'msg9',
        ordinalId: '009',
        timestamp: '2024-12-06T10:02:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What is the global distribution of AI market value?',
        type: ChatMessageType.response,
        blocks: [
            {
                id: 'distribution-intro',
                type: 'text',
                content: [
                    'The global AI market shows significant regional variations in market value, with North America maintaining its leadership position. Key factors influencing this distribution include technological infrastructure, talent availability, and regulatory environments.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'regional-distribution',
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
        ],
        sources: [
            {
                targetType: 'report',
                targetId: 'global-market',
                targetTitle: 'Global AI Market Distribution Report',
            },
        ],
    },

    // Fourth conversation cycle - Expert Insights
    {
        id: 'msg10',
        ordinalId: '010',
        timestamp: '2024-12-06T10:03:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What do industry experts say about enterprise AI adoption?',
        type: ChatMessageType.prompt,
    },
    {
        id: 'msg11',
        ordinalId: '011',
        timestamp: '2024-12-06T10:03:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What do industry experts say about enterprise AI adoption?',
        type: ChatMessageType.sources,
        confirmed: true,
        sources: [
            {
                targetType: 'conference',
                targetId: 'ai-summit-2024',
                targetTitle: 'Enterprise AI Summit 2024 Keynote',
            },
        ],
    },
    {
        id: 'msg12',
        ordinalId: '012',
        timestamp: '2024-12-06T10:03:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What do industry experts say about enterprise AI adoption?',
        type: ChatMessageType.response,
        blocks: [
            {
                id: 'expert-context',
                type: 'text',
                content: [
                    'Industry leaders at the Enterprise AI Summit 2024 emphasized the transformative impact of AI on business operations. A particularly noteworthy perspective came from Dr. Michael Chang, a leading researcher in enterprise AI implementation:',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'expert-insights',
                type: 'quote',
                content:
                    'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
                meta: {
                    author: 'Dr. Michael Chang',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                },
            },
        ],
        sources: [
            {
                targetType: 'conference',
                targetId: 'ai-summit-2024',
                targetTitle: 'Enterprise AI Summit 2024 Keynote',
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
