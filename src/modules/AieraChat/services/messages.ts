import { useState, useEffect, useCallback } from 'react';
import { ContentBlock } from '../Messages/MessageFactory/Block';

type ChatMessageType = 'prompt' | 'sources' | 'response';
export type ChatMessageStatus = 'finished' | 'thinking' | 'updating' | 'confirmed';
type User = 'me' | 'other';

export interface ChatMessage {
    id?: string;
    timestamp?: string;
    blocks?: ContentBlock[];
    type: ChatMessageType;
    key: string;
    text: string;
    status: ChatMessageStatus;
    prompt?: string;
    user: User;
}

interface UseChatMessagesReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

const sampleMessages: ChatMessage[] = [
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
        blocks: [
            {
                id: 'main-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry continues its rapid evolution in 2024, with ',
                    {
                        id: 'cit1',
                        text: 'global AI revenue reaching $500 billion',
                        source: 'Global AI Market Report',
                        author: 'Dr. Sarah Chen',
                        date: '2024-03',
                        url: 'https://example.com/report2024',
                    },
                    '. This comprehensive analysis examines key trends, market segments, and future projections.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'market-overview',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth Trajectory'],
                        secondary: ['Quarter-over-quarter analysis of major AI sectors'],
                    },
                    {
                        id: 'sector-growth',
                        type: 'chart',
                        data: [
                            { quarter: 'Q1 2024', enterprise: 120, consumer: 80, research: 40 },
                            { quarter: 'Q2 2024', enterprise: 150, consumer: 95, research: 45 },
                            { quarter: 'Q3 2024', enterprise: 180, consumer: 110, research: 55 },
                            { quarter: 'Q4 2024', enterprise: 220, consumer: 130, research: 70 },
                        ],
                        meta: {
                            chartType: 'area',
                            title: 'AI Market Growth by Sector',
                            xAxis: 'Quarter',
                            yAxis: 'Revenue (Billion USD)',
                            stackedSeries: true,
                            series: [
                                { key: 'enterprise', label: 'Enterprise AI', color: '#8884d8' },
                                { key: 'consumer', label: 'Consumer AI', color: '#82ca9d' },
                                { key: 'research', label: 'Research & Development', color: '#ffc658' },
                            ],
                        },
                    },
                    {
                        primary: ['Technology Segments'],
                        secondary: ['Detailed breakdown of AI technologies and their market impact'],
                    },
                    {
                        id: 'tech-segments',
                        type: 'list',
                        items: [
                            {
                                primary: ['Language Models and NLP'],
                                secondary: [
                                    'Leading segment with ',
                                    {
                                        id: 'cit2',
                                        text: '40% year-over-year growth',
                                        source: 'NLP Market Analysis',
                                        date: '2024-02',
                                    },
                                ],
                            },
                            {
                                id: 'nlp-market',
                                type: 'chart',
                                data: [
                                    { segment: 'Enterprise Chat', value: 40 },
                                    { segment: 'Document Analysis', value: 25 },
                                    { segment: 'Translation', value: 20 },
                                    { segment: 'Other NLP', value: 15 },
                                ],
                                meta: {
                                    chartType: 'pie',
                                    title: 'NLP Market Distribution',
                                    valueKey: 'value',
                                    nameKey: 'segment',
                                    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
                                },
                            },
                            {
                                primary: ['Performance Metrics'],
                                secondary: ['Comparison of leading language models'],
                            },
                            {
                                id: 'model-performance',
                                type: 'table',
                                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                                rows: [
                                    [
                                        ['GPT-4'],
                                        ['98.5%'],
                                        ['120ms'],
                                        [
                                            '$0.60',
                                            { id: 'cit3', text: ' (enterprise rate)', source: 'Provider Pricing' },
                                        ],
                                    ],
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
                        meta: { style: 'unordered' },
                    },
                    {
                        primary: ['Model Efficiency Analysis'],
                        secondary: ['Performance vs. Resource Usage Comparison'],
                    },
                    {
                        id: 'efficiency-scatter',
                        type: 'chart',
                        data: [
                            { name: 'Model A', accuracy: 98, speed: 150, cost: 25 },
                            { name: 'Model B', accuracy: 96, speed: 180, cost: 20 },
                            { name: 'Model C', accuracy: 94, speed: 200, cost: 15 },
                            { name: 'Model D', accuracy: 92, speed: 220, cost: 12 },
                        ],
                        meta: {
                            chartType: 'scatter',
                            title: 'Model Efficiency Matrix',
                            xAxis: 'Accuracy (%)',
                            yAxis: 'Processing Speed (tokens/s)',
                            xKey: 'accuracy',
                            yKey: 'speed',
                            sizeKey: 'cost',
                            nameKey: 'name',
                            colors: ['#8884d8'],
                        },
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'adoption-header',
                type: 'text',
                content: ['Industry Adoption Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'adoption-trends',
                type: 'chart',
                data: [
                    { month: 'Jan', implementation: 45, planning: 30 },
                    { month: 'Feb', implementation: 48, planning: 35 },
                    { month: 'Mar', implementation: 52, planning: 40 },
                    { month: 'Apr', implementation: 58, planning: 45 },
                    { month: 'May', implementation: 65, planning: 50 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'AI Adoption Timeline',
                    xAxis: 'Month',
                    yAxis: 'Companies (%)',
                    series: [
                        { key: 'implementation', label: 'In Implementation', color: '#8884d8' },
                        { key: 'planning', label: 'Planning Stage', color: '#82ca9d' },
                    ],
                },
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
                    title: 'Regional Market Distribution',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
                meta: {
                    author: 'Dr. Michael Chang',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    url: 'https://example.com/summit2024',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: 'https://example.com/ai-architecture-2024.png',
                meta: {
                    title: 'Modern AI System Architecture',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    altText:
                        'Detailed diagram showing the architecture of modern AI systems, including data flow and integration points',
                },
            },
        ],
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
        blocks: [
            {
                id: 'main-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry continues its rapid evolution in 2024, with ',
                    {
                        id: 'cit1',
                        text: 'global AI revenue reaching $500 billion',
                        source: 'Global AI Market Report',
                        author: 'Dr. Sarah Chen',
                        date: '2024-03',
                        url: 'https://example.com/report2024',
                    },
                    '. This comprehensive analysis examines key trends, market segments, and future projections.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'market-overview',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth Trajectory'],
                        secondary: ['Quarter-over-quarter analysis of major AI sectors'],
                    },
                    {
                        id: 'sector-growth',
                        type: 'chart',
                        data: [
                            { quarter: 'Q1 2024', enterprise: 120, consumer: 80, research: 40 },
                            { quarter: 'Q2 2024', enterprise: 150, consumer: 95, research: 45 },
                            { quarter: 'Q3 2024', enterprise: 180, consumer: 110, research: 55 },
                            { quarter: 'Q4 2024', enterprise: 220, consumer: 130, research: 70 },
                        ],
                        meta: {
                            chartType: 'area',
                            title: 'AI Market Growth by Sector',
                            xAxis: 'Quarter',
                            yAxis: 'Revenue (Billion USD)',
                            stackedSeries: true,
                            series: [
                                { key: 'enterprise', label: 'Enterprise AI', color: '#8884d8' },
                                { key: 'consumer', label: 'Consumer AI', color: '#82ca9d' },
                                { key: 'research', label: 'Research & Development', color: '#ffc658' },
                            ],
                        },
                    },
                    {
                        primary: ['Technology Segments'],
                        secondary: ['Detailed breakdown of AI technologies and their market impact'],
                    },
                    {
                        id: 'tech-segments',
                        type: 'list',
                        items: [
                            {
                                primary: ['Language Models and NLP'],
                                secondary: [
                                    'Leading segment with ',
                                    {
                                        id: 'cit2',
                                        text: '40% year-over-year growth',
                                        source: 'NLP Market Analysis',
                                        date: '2024-02',
                                    },
                                ],
                            },
                            {
                                id: 'nlp-market',
                                type: 'chart',
                                data: [
                                    { segment: 'Enterprise Chat', value: 40 },
                                    { segment: 'Document Analysis', value: 25 },
                                    { segment: 'Translation', value: 20 },
                                    { segment: 'Other NLP', value: 15 },
                                ],
                                meta: {
                                    chartType: 'pie',
                                    title: 'NLP Market Distribution',
                                    valueKey: 'value',
                                    nameKey: 'segment',
                                    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
                                },
                            },
                            {
                                primary: ['Performance Metrics'],
                                secondary: ['Comparison of leading language models'],
                            },
                            {
                                id: 'model-performance',
                                type: 'table',
                                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                                rows: [
                                    [
                                        ['GPT-4'],
                                        ['98.5%'],
                                        ['120ms'],
                                        [
                                            '$0.60',
                                            { id: 'cit3', text: ' (enterprise rate)', source: 'Provider Pricing' },
                                        ],
                                    ],
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
                        meta: { style: 'unordered' },
                    },
                    {
                        primary: ['Model Efficiency Analysis'],
                        secondary: ['Performance vs. Resource Usage Comparison'],
                    },
                    {
                        id: 'efficiency-scatter',
                        type: 'chart',
                        data: [
                            { name: 'Model A', accuracy: 98, speed: 150, cost: 25 },
                            { name: 'Model B', accuracy: 96, speed: 180, cost: 20 },
                            { name: 'Model C', accuracy: 94, speed: 200, cost: 15 },
                            { name: 'Model D', accuracy: 92, speed: 220, cost: 12 },
                        ],
                        meta: {
                            chartType: 'scatter',
                            title: 'Model Efficiency Matrix',
                            xAxis: 'Accuracy (%)',
                            yAxis: 'Processing Speed (tokens/s)',
                            xKey: 'accuracy',
                            yKey: 'speed',
                            sizeKey: 'cost',
                            nameKey: 'name',
                            colors: ['#8884d8'],
                        },
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'adoption-header',
                type: 'text',
                content: ['Industry Adoption Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'adoption-trends',
                type: 'chart',
                data: [
                    { month: 'Jan', implementation: 45, planning: 30 },
                    { month: 'Feb', implementation: 48, planning: 35 },
                    { month: 'Mar', implementation: 52, planning: 40 },
                    { month: 'Apr', implementation: 58, planning: 45 },
                    { month: 'May', implementation: 65, planning: 50 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'AI Adoption Timeline',
                    xAxis: 'Month',
                    yAxis: 'Companies (%)',
                    series: [
                        { key: 'implementation', label: 'In Implementation', color: '#8884d8' },
                        { key: 'planning', label: 'Planning Stage', color: '#82ca9d' },
                    ],
                },
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
                    title: 'Regional Market Distribution',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
                meta: {
                    author: 'Dr. Michael Chang',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    url: 'https://example.com/summit2024',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: 'https://example.com/ai-architecture-2024.png',
                meta: {
                    title: 'Modern AI System Architecture',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    altText:
                        'Detailed diagram showing the architecture of modern AI systems, including data flow and integration points',
                },
            },
        ],
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
        blocks: [
            {
                id: 'main-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry continues its rapid evolution in 2024, with ',
                    {
                        id: 'cit1',
                        text: 'global AI revenue reaching $500 billion',
                        source: 'Global AI Market Report',
                        author: 'Dr. Sarah Chen',
                        date: '2024-03',
                        url: 'https://example.com/report2024',
                    },
                    '. This comprehensive analysis examines key trends, market segments, and future projections.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'market-overview',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth Trajectory'],
                        secondary: ['Quarter-over-quarter analysis of major AI sectors'],
                    },
                    {
                        id: 'sector-growth',
                        type: 'chart',
                        data: [
                            { quarter: 'Q1 2024', enterprise: 120, consumer: 80, research: 40 },
                            { quarter: 'Q2 2024', enterprise: 150, consumer: 95, research: 45 },
                            { quarter: 'Q3 2024', enterprise: 180, consumer: 110, research: 55 },
                            { quarter: 'Q4 2024', enterprise: 220, consumer: 130, research: 70 },
                        ],
                        meta: {
                            chartType: 'area',
                            title: 'AI Market Growth by Sector',
                            xAxis: 'Quarter',
                            yAxis: 'Revenue (Billion USD)',
                            stackedSeries: true,
                            series: [
                                { key: 'enterprise', label: 'Enterprise AI', color: '#8884d8' },
                                { key: 'consumer', label: 'Consumer AI', color: '#82ca9d' },
                                { key: 'research', label: 'Research & Development', color: '#ffc658' },
                            ],
                        },
                    },
                    {
                        primary: ['Technology Segments'],
                        secondary: ['Detailed breakdown of AI technologies and their market impact'],
                    },
                    {
                        id: 'tech-segments',
                        type: 'list',
                        items: [
                            {
                                primary: ['Language Models and NLP'],
                                secondary: [
                                    'Leading segment with ',
                                    {
                                        id: 'cit2',
                                        text: '40% year-over-year growth',
                                        source: 'NLP Market Analysis',
                                        date: '2024-02',
                                    },
                                ],
                            },
                            {
                                id: 'nlp-market',
                                type: 'chart',
                                data: [
                                    { segment: 'Enterprise Chat', value: 40 },
                                    { segment: 'Document Analysis', value: 25 },
                                    { segment: 'Translation', value: 20 },
                                    { segment: 'Other NLP', value: 15 },
                                ],
                                meta: {
                                    chartType: 'pie',
                                    title: 'NLP Market Distribution',
                                    valueKey: 'value',
                                    nameKey: 'segment',
                                    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
                                },
                            },
                            {
                                primary: ['Performance Metrics'],
                                secondary: ['Comparison of leading language models'],
                            },
                            {
                                id: 'model-performance',
                                type: 'table',
                                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                                rows: [
                                    [
                                        ['GPT-4'],
                                        ['98.5%'],
                                        ['120ms'],
                                        [
                                            '$0.60',
                                            { id: 'cit3', text: ' (enterprise rate)', source: 'Provider Pricing' },
                                        ],
                                    ],
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
                        meta: { style: 'unordered' },
                    },
                    {
                        primary: ['Model Efficiency Analysis'],
                        secondary: ['Performance vs. Resource Usage Comparison'],
                    },
                    {
                        id: 'efficiency-scatter',
                        type: 'chart',
                        data: [
                            { name: 'Model A', accuracy: 98, speed: 150, cost: 25 },
                            { name: 'Model B', accuracy: 96, speed: 180, cost: 20 },
                            { name: 'Model C', accuracy: 94, speed: 200, cost: 15 },
                            { name: 'Model D', accuracy: 92, speed: 220, cost: 12 },
                        ],
                        meta: {
                            chartType: 'scatter',
                            title: 'Model Efficiency Matrix',
                            xAxis: 'Accuracy (%)',
                            yAxis: 'Processing Speed (tokens/s)',
                            xKey: 'accuracy',
                            yKey: 'speed',
                            sizeKey: 'cost',
                            nameKey: 'name',
                            colors: ['#8884d8'],
                        },
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'adoption-header',
                type: 'text',
                content: ['Industry Adoption Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'adoption-trends',
                type: 'chart',
                data: [
                    { month: 'Jan', implementation: 45, planning: 30 },
                    { month: 'Feb', implementation: 48, planning: 35 },
                    { month: 'Mar', implementation: 52, planning: 40 },
                    { month: 'Apr', implementation: 58, planning: 45 },
                    { month: 'May', implementation: 65, planning: 50 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'AI Adoption Timeline',
                    xAxis: 'Month',
                    yAxis: 'Companies (%)',
                    series: [
                        { key: 'implementation', label: 'In Implementation', color: '#8884d8' },
                        { key: 'planning', label: 'Planning Stage', color: '#82ca9d' },
                    ],
                },
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
                    title: 'Regional Market Distribution',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
                meta: {
                    author: 'Dr. Michael Chang',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    url: 'https://example.com/summit2024',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: 'https://example.com/ai-architecture-2024.png',
                meta: {
                    title: 'Modern AI System Architecture',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    altText:
                        'Detailed diagram showing the architecture of modern AI systems, including data flow and integration points',
                },
            },
        ],
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
        blocks: [
            {
                id: 'main-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry continues its rapid evolution in 2024, with ',
                    {
                        id: 'cit1',
                        text: 'global AI revenue reaching $500 billion',
                        source: 'Global AI Market Report',
                        author: 'Dr. Sarah Chen',
                        date: '2024-03',
                        url: 'https://example.com/report2024',
                    },
                    '. This comprehensive analysis examines key trends, market segments, and future projections.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'market-overview',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth Trajectory'],
                        secondary: ['Quarter-over-quarter analysis of major AI sectors'],
                    },
                    {
                        id: 'sector-growth',
                        type: 'chart',
                        data: [
                            { quarter: 'Q1 2024', enterprise: 120, consumer: 80, research: 40 },
                            { quarter: 'Q2 2024', enterprise: 150, consumer: 95, research: 45 },
                            { quarter: 'Q3 2024', enterprise: 180, consumer: 110, research: 55 },
                            { quarter: 'Q4 2024', enterprise: 220, consumer: 130, research: 70 },
                        ],
                        meta: {
                            chartType: 'area',
                            title: 'AI Market Growth by Sector',
                            xAxis: 'Quarter',
                            yAxis: 'Revenue (Billion USD)',
                            stackedSeries: true,
                            series: [
                                { key: 'enterprise', label: 'Enterprise AI', color: '#8884d8' },
                                { key: 'consumer', label: 'Consumer AI', color: '#82ca9d' },
                                { key: 'research', label: 'Research & Development', color: '#ffc658' },
                            ],
                        },
                    },
                    {
                        primary: ['Technology Segments'],
                        secondary: ['Detailed breakdown of AI technologies and their market impact'],
                    },
                    {
                        id: 'tech-segments',
                        type: 'list',
                        items: [
                            {
                                primary: ['Language Models and NLP'],
                                secondary: [
                                    'Leading segment with ',
                                    {
                                        id: 'cit2',
                                        text: '40% year-over-year growth',
                                        source: 'NLP Market Analysis',
                                        date: '2024-02',
                                    },
                                ],
                            },
                            {
                                id: 'nlp-market',
                                type: 'chart',
                                data: [
                                    { segment: 'Enterprise Chat', value: 40 },
                                    { segment: 'Document Analysis', value: 25 },
                                    { segment: 'Translation', value: 20 },
                                    { segment: 'Other NLP', value: 15 },
                                ],
                                meta: {
                                    chartType: 'pie',
                                    title: 'NLP Market Distribution',
                                    valueKey: 'value',
                                    nameKey: 'segment',
                                    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
                                },
                            },
                            {
                                primary: ['Performance Metrics'],
                                secondary: ['Comparison of leading language models'],
                            },
                            {
                                id: 'model-performance',
                                type: 'table',
                                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                                rows: [
                                    [
                                        ['GPT-4'],
                                        ['98.5%'],
                                        ['120ms'],
                                        [
                                            '$0.60',
                                            { id: 'cit3', text: ' (enterprise rate)', source: 'Provider Pricing' },
                                        ],
                                    ],
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
                        meta: { style: 'unordered' },
                    },
                    {
                        primary: ['Model Efficiency Analysis'],
                        secondary: ['Performance vs. Resource Usage Comparison'],
                    },
                    {
                        id: 'efficiency-scatter',
                        type: 'chart',
                        data: [
                            { name: 'Model A', accuracy: 98, speed: 150, cost: 25 },
                            { name: 'Model B', accuracy: 96, speed: 180, cost: 20 },
                            { name: 'Model C', accuracy: 94, speed: 200, cost: 15 },
                            { name: 'Model D', accuracy: 92, speed: 220, cost: 12 },
                        ],
                        meta: {
                            chartType: 'scatter',
                            title: 'Model Efficiency Matrix',
                            xAxis: 'Accuracy (%)',
                            yAxis: 'Processing Speed (tokens/s)',
                            xKey: 'accuracy',
                            yKey: 'speed',
                            sizeKey: 'cost',
                            nameKey: 'name',
                            colors: ['#8884d8'],
                        },
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'adoption-header',
                type: 'text',
                content: ['Industry Adoption Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'adoption-trends',
                type: 'chart',
                data: [
                    { month: 'Jan', implementation: 45, planning: 30 },
                    { month: 'Feb', implementation: 48, planning: 35 },
                    { month: 'Mar', implementation: 52, planning: 40 },
                    { month: 'Apr', implementation: 58, planning: 45 },
                    { month: 'May', implementation: 65, planning: 50 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'AI Adoption Timeline',
                    xAxis: 'Month',
                    yAxis: 'Companies (%)',
                    series: [
                        { key: 'implementation', label: 'In Implementation', color: '#8884d8' },
                        { key: 'planning', label: 'Planning Stage', color: '#82ca9d' },
                    ],
                },
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
                    title: 'Regional Market Distribution',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
                meta: {
                    author: 'Dr. Michael Chang',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    url: 'https://example.com/summit2024',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: 'https://example.com/ai-architecture-2024.png',
                meta: {
                    title: 'Modern AI System Architecture',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    altText:
                        'Detailed diagram showing the architecture of modern AI systems, including data flow and integration points',
                },
            },
        ],
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
        blocks: [
            {
                id: 'main-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry continues its rapid evolution in 2024, with ',
                    {
                        id: 'cit1',
                        text: 'global AI revenue reaching $500 billion',
                        source: 'Global AI Market Report',
                        author: 'Dr. Sarah Chen',
                        date: '2024-03',
                        url: 'https://example.com/report2024',
                    },
                    '. This comprehensive analysis examines key trends, market segments, and future projections.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'market-overview',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth Trajectory'],
                        secondary: ['Quarter-over-quarter analysis of major AI sectors'],
                    },
                    {
                        id: 'sector-growth',
                        type: 'chart',
                        data: [
                            { quarter: 'Q1 2024', enterprise: 120, consumer: 80, research: 40 },
                            { quarter: 'Q2 2024', enterprise: 150, consumer: 95, research: 45 },
                            { quarter: 'Q3 2024', enterprise: 180, consumer: 110, research: 55 },
                            { quarter: 'Q4 2024', enterprise: 220, consumer: 130, research: 70 },
                        ],
                        meta: {
                            chartType: 'area',
                            title: 'AI Market Growth by Sector',
                            xAxis: 'Quarter',
                            yAxis: 'Revenue (Billion USD)',
                            stackedSeries: true,
                            series: [
                                { key: 'enterprise', label: 'Enterprise AI', color: '#8884d8' },
                                { key: 'consumer', label: 'Consumer AI', color: '#82ca9d' },
                                { key: 'research', label: 'Research & Development', color: '#ffc658' },
                            ],
                        },
                    },
                    {
                        primary: ['Technology Segments'],
                        secondary: ['Detailed breakdown of AI technologies and their market impact'],
                    },
                    {
                        id: 'tech-segments',
                        type: 'list',
                        items: [
                            {
                                primary: ['Language Models and NLP'],
                                secondary: [
                                    'Leading segment with ',
                                    {
                                        id: 'cit2',
                                        text: '40% year-over-year growth',
                                        source: 'NLP Market Analysis',
                                        date: '2024-02',
                                    },
                                ],
                            },
                            {
                                id: 'nlp-market',
                                type: 'chart',
                                data: [
                                    { segment: 'Enterprise Chat', value: 40 },
                                    { segment: 'Document Analysis', value: 25 },
                                    { segment: 'Translation', value: 20 },
                                    { segment: 'Other NLP', value: 15 },
                                ],
                                meta: {
                                    chartType: 'pie',
                                    title: 'NLP Market Distribution',
                                    valueKey: 'value',
                                    nameKey: 'segment',
                                    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
                                },
                            },
                            {
                                primary: ['Performance Metrics'],
                                secondary: ['Comparison of leading language models'],
                            },
                            {
                                id: 'model-performance',
                                type: 'table',
                                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                                rows: [
                                    [
                                        ['GPT-4'],
                                        ['98.5%'],
                                        ['120ms'],
                                        [
                                            '$0.60',
                                            { id: 'cit3', text: ' (enterprise rate)', source: 'Provider Pricing' },
                                        ],
                                    ],
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
                        meta: { style: 'unordered' },
                    },
                    {
                        primary: ['Model Efficiency Analysis'],
                        secondary: ['Performance vs. Resource Usage Comparison'],
                    },
                    {
                        id: 'efficiency-scatter',
                        type: 'chart',
                        data: [
                            { name: 'Model A', accuracy: 98, speed: 150, cost: 25 },
                            { name: 'Model B', accuracy: 96, speed: 180, cost: 20 },
                            { name: 'Model C', accuracy: 94, speed: 200, cost: 15 },
                            { name: 'Model D', accuracy: 92, speed: 220, cost: 12 },
                        ],
                        meta: {
                            chartType: 'scatter',
                            title: 'Model Efficiency Matrix',
                            xAxis: 'Accuracy (%)',
                            yAxis: 'Processing Speed (tokens/s)',
                            xKey: 'accuracy',
                            yKey: 'speed',
                            sizeKey: 'cost',
                            nameKey: 'name',
                            colors: ['#8884d8'],
                        },
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'adoption-header',
                type: 'text',
                content: ['Industry Adoption Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'adoption-trends',
                type: 'chart',
                data: [
                    { month: 'Jan', implementation: 45, planning: 30 },
                    { month: 'Feb', implementation: 48, planning: 35 },
                    { month: 'Mar', implementation: 52, planning: 40 },
                    { month: 'Apr', implementation: 58, planning: 45 },
                    { month: 'May', implementation: 65, planning: 50 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'AI Adoption Timeline',
                    xAxis: 'Month',
                    yAxis: 'Companies (%)',
                    series: [
                        { key: 'implementation', label: 'In Implementation', color: '#8884d8' },
                        { key: 'planning', label: 'Planning Stage', color: '#82ca9d' },
                    ],
                },
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
                    title: 'Regional Market Distribution',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
                meta: {
                    author: 'Dr. Michael Chang',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    url: 'https://example.com/summit2024',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: 'https://example.com/ai-architecture-2024.png',
                meta: {
                    title: 'Modern AI System Architecture',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    altText:
                        'Detailed diagram showing the architecture of modern AI systems, including data flow and integration points',
                },
            },
        ],
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
        blocks: [
            {
                id: 'main-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry continues its rapid evolution in 2024, with ',
                    {
                        id: 'cit1',
                        text: 'global AI revenue reaching $500 billion',
                        source: 'Global AI Market Report',
                        author: 'Dr. Sarah Chen',
                        date: '2024-03',
                        url: 'https://example.com/report2024',
                    },
                    '. This comprehensive analysis examines key trends, market segments, and future projections.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'market-overview',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth Trajectory'],
                        secondary: ['Quarter-over-quarter analysis of major AI sectors'],
                    },
                    {
                        id: 'sector-growth',
                        type: 'chart',
                        data: [
                            { quarter: 'Q1 2024', enterprise: 120, consumer: 80, research: 40 },
                            { quarter: 'Q2 2024', enterprise: 150, consumer: 95, research: 45 },
                            { quarter: 'Q3 2024', enterprise: 180, consumer: 110, research: 55 },
                            { quarter: 'Q4 2024', enterprise: 220, consumer: 130, research: 70 },
                        ],
                        meta: {
                            chartType: 'area',
                            title: 'AI Market Growth by Sector',
                            xAxis: 'Quarter',
                            yAxis: 'Revenue (Billion USD)',
                            stackedSeries: true,
                            series: [
                                { key: 'enterprise', label: 'Enterprise AI', color: '#8884d8' },
                                { key: 'consumer', label: 'Consumer AI', color: '#82ca9d' },
                                { key: 'research', label: 'Research & Development', color: '#ffc658' },
                            ],
                        },
                    },
                    {
                        primary: ['Technology Segments'],
                        secondary: ['Detailed breakdown of AI technologies and their market impact'],
                    },
                    {
                        id: 'tech-segments',
                        type: 'list',
                        items: [
                            {
                                primary: ['Language Models and NLP'],
                                secondary: [
                                    'Leading segment with ',
                                    {
                                        id: 'cit2',
                                        text: '40% year-over-year growth',
                                        source: 'NLP Market Analysis',
                                        date: '2024-02',
                                    },
                                ],
                            },
                            {
                                id: 'nlp-market',
                                type: 'chart',
                                data: [
                                    { segment: 'Enterprise Chat', value: 40 },
                                    { segment: 'Document Analysis', value: 25 },
                                    { segment: 'Translation', value: 20 },
                                    { segment: 'Other NLP', value: 15 },
                                ],
                                meta: {
                                    chartType: 'pie',
                                    title: 'NLP Market Distribution',
                                    valueKey: 'value',
                                    nameKey: 'segment',
                                    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
                                },
                            },
                            {
                                primary: ['Performance Metrics'],
                                secondary: ['Comparison of leading language models'],
                            },
                            {
                                id: 'model-performance',
                                type: 'table',
                                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                                rows: [
                                    [
                                        ['GPT-4'],
                                        ['98.5%'],
                                        ['120ms'],
                                        [
                                            '$0.60',
                                            { id: 'cit3', text: ' (enterprise rate)', source: 'Provider Pricing' },
                                        ],
                                    ],
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
                        meta: { style: 'unordered' },
                    },
                    {
                        primary: ['Model Efficiency Analysis'],
                        secondary: ['Performance vs. Resource Usage Comparison'],
                    },
                    {
                        id: 'efficiency-scatter',
                        type: 'chart',
                        data: [
                            { name: 'Model A', accuracy: 98, speed: 150, cost: 25 },
                            { name: 'Model B', accuracy: 96, speed: 180, cost: 20 },
                            { name: 'Model C', accuracy: 94, speed: 200, cost: 15 },
                            { name: 'Model D', accuracy: 92, speed: 220, cost: 12 },
                        ],
                        meta: {
                            chartType: 'scatter',
                            title: 'Model Efficiency Matrix',
                            xAxis: 'Accuracy (%)',
                            yAxis: 'Processing Speed (tokens/s)',
                            xKey: 'accuracy',
                            yKey: 'speed',
                            sizeKey: 'cost',
                            nameKey: 'name',
                            colors: ['#8884d8'],
                        },
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'adoption-header',
                type: 'text',
                content: ['Industry Adoption Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'adoption-trends',
                type: 'chart',
                data: [
                    { month: 'Jan', implementation: 45, planning: 30 },
                    { month: 'Feb', implementation: 48, planning: 35 },
                    { month: 'Mar', implementation: 52, planning: 40 },
                    { month: 'Apr', implementation: 58, planning: 45 },
                    { month: 'May', implementation: 65, planning: 50 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'AI Adoption Timeline',
                    xAxis: 'Month',
                    yAxis: 'Companies (%)',
                    series: [
                        { key: 'implementation', label: 'In Implementation', color: '#8884d8' },
                        { key: 'planning', label: 'Planning Stage', color: '#82ca9d' },
                    ],
                },
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
                    title: 'Regional Market Distribution',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
                meta: {
                    author: 'Dr. Michael Chang',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    url: 'https://example.com/summit2024',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: 'https://example.com/ai-architecture-2024.png',
                meta: {
                    title: 'Modern AI System Architecture',
                    source: 'Enterprise AI Summit 2024',
                    date: '2024-03-15',
                    altText:
                        'Detailed diagram showing the architecture of modern AI systems, including data flow and integration points',
                },
            },
        ],
    },
];

const sampleBlocks = [
    {
        id: 'main-title',
        type: 'text',
        content: ['2024 Artificial Intelligence Industry Analysis'],
        meta: { style: 'h1' },
    },
    {
        id: 'executive-summary',
        type: 'text',
        content: [
            'The AI industry continues its rapid evolution in 2024, with ',
            {
                id: 'cit1',
                text: 'global AI revenue reaching $500 billion',
                source: 'Global AI Market Report',
                author: 'Dr. Sarah Chen',
                date: '2024-03',
                url: 'https://example.com/report2024',
            },
            '. This comprehensive analysis examines key trends, market segments, and future projections.',
        ],
        meta: { style: 'paragraph' },
    },
    {
        id: 'market-overview',
        type: 'list',
        items: [
            {
                primary: ['Market Growth Trajectory'],
                secondary: ['Quarter-over-quarter analysis of major AI sectors'],
            },
            {
                id: 'sector-growth',
                type: 'chart',
                data: [
                    { quarter: 'Q1 2024', enterprise: 120, consumer: 80, research: 40 },
                    { quarter: 'Q2 2024', enterprise: 150, consumer: 95, research: 45 },
                    { quarter: 'Q3 2024', enterprise: 180, consumer: 110, research: 55 },
                    { quarter: 'Q4 2024', enterprise: 220, consumer: 130, research: 70 },
                ],
                meta: {
                    chartType: 'area',
                    title: 'AI Market Growth by Sector',
                    xAxis: 'Quarter',
                    yAxis: 'Revenue (Billion USD)',
                    stackedSeries: true,
                    series: [
                        { key: 'enterprise', label: 'Enterprise AI', color: '#8884d8' },
                        { key: 'consumer', label: 'Consumer AI', color: '#82ca9d' },
                        { key: 'research', label: 'Research & Development', color: '#ffc658' },
                    ],
                },
            },
            {
                primary: ['Technology Segments'],
                secondary: ['Detailed breakdown of AI technologies and their market impact'],
            },
            {
                id: 'tech-segments',
                type: 'list',
                items: [
                    {
                        primary: ['Language Models and NLP'],
                        secondary: [
                            'Leading segment with ',
                            {
                                id: 'cit2',
                                text: '40% year-over-year growth',
                                source: 'NLP Market Analysis',
                                date: '2024-02',
                            },
                        ],
                    },
                    {
                        id: 'nlp-market',
                        type: 'chart',
                        data: [
                            { segment: 'Enterprise Chat', value: 40 },
                            { segment: 'Document Analysis', value: 25 },
                            { segment: 'Translation', value: 20 },
                            { segment: 'Other NLP', value: 15 },
                        ],
                        meta: {
                            chartType: 'pie',
                            title: 'NLP Market Distribution',
                            valueKey: 'value',
                            nameKey: 'segment',
                            colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
                        },
                    },
                    {
                        primary: ['Performance Metrics'],
                        secondary: ['Comparison of leading language models'],
                    },
                    {
                        id: 'model-performance',
                        type: 'table',
                        headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                        rows: [
                            [
                                ['GPT-4'],
                                ['98.5%'],
                                ['120ms'],
                                ['$0.60', { id: 'cit3', text: ' (enterprise rate)', source: 'Provider Pricing' }],
                            ],
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
                meta: { style: 'unordered' },
            },
            {
                primary: ['Model Efficiency Analysis'],
                secondary: ['Performance vs. Resource Usage Comparison'],
            },
            {
                id: 'efficiency-scatter',
                type: 'chart',
                data: [
                    { name: 'Model A', accuracy: 98, speed: 150, cost: 25 },
                    { name: 'Model B', accuracy: 96, speed: 180, cost: 20 },
                    { name: 'Model C', accuracy: 94, speed: 200, cost: 15 },
                    { name: 'Model D', accuracy: 92, speed: 220, cost: 12 },
                ],
                meta: {
                    chartType: 'scatter',
                    title: 'Model Efficiency Matrix',
                    xAxis: 'Accuracy (%)',
                    yAxis: 'Processing Speed (tokens/s)',
                    xKey: 'accuracy',
                    yKey: 'speed',
                    sizeKey: 'cost',
                    nameKey: 'name',
                    colors: ['#8884d8'],
                },
            },
        ],
        meta: { style: 'ordered' },
    },
    {
        id: 'adoption-header',
        type: 'text',
        content: ['Industry Adoption Trends'],
        meta: { style: 'h2' },
    },
    {
        id: 'adoption-trends',
        type: 'chart',
        data: [
            { month: 'Jan', implementation: 45, planning: 30 },
            { month: 'Feb', implementation: 48, planning: 35 },
            { month: 'Mar', implementation: 52, planning: 40 },
            { month: 'Apr', implementation: 58, planning: 45 },
            { month: 'May', implementation: 65, planning: 50 },
        ],
        meta: {
            chartType: 'line',
            title: 'AI Adoption Timeline',
            xAxis: 'Month',
            yAxis: 'Companies (%)',
            series: [
                { key: 'implementation', label: 'In Implementation', color: '#8884d8' },
                { key: 'planning', label: 'Planning Stage', color: '#82ca9d' },
            ],
        },
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
            title: 'Regional Market Distribution',
            valueKey: 'value',
            nameKey: 'name',
        },
    },
    {
        id: 'expert-quote',
        type: 'quote',
        content:
            'The integration of AI into enterprise workflows has reached a critical inflection point. Organizations are now moving beyond experimentation to full-scale deployment, fundamentally transforming their operational models.',
        meta: {
            author: 'Dr. Michael Chang',
            source: 'Enterprise AI Summit 2024',
            date: '2024-03-15',
            url: 'https://example.com/summit2024',
        },
    },
    {
        id: 'system-architecture',
        type: 'image',
        url: 'https://example.com/ai-architecture-2024.png',
        meta: {
            title: 'Modern AI System Architecture',
            source: 'Enterprise AI Summit 2024',
            date: '2024-03-15',
            altText:
                'Detailed diagram showing the architecture of modern AI systems, including data flow and integration points',
        },
    },
];

const generateRandomMessages = (count: number): ChatMessage[] => {
    const messages: ChatMessage[] = [];
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
                blocks: isPrompt ? [] : sampleBlocks,
                user: isPrompt ? 'me' : 'other',
            });
        }
    }
    return messages;
};

const fetchChatMessages = async (_: string): Promise<ChatMessage[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const messageCount = (Math.floor(Math.random() * 4) + 4) * 2; // Generates 8, 10, 12, or 14 messages
    return generateRandomMessages(messageCount);
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
