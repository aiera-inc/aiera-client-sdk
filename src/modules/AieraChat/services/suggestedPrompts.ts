import { useState, useEffect, useCallback } from 'react';

interface SuggestedPrompt {
    id: string;
    prompt: string;
    category: string;
}

interface UseSuggestedPromptsReturn {
    prompts: SuggestedPrompt[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

// Simulated async fetch function
const fetchSuggestedPrompts = async (): Promise<SuggestedPrompt[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [
        {
            id: 'comp_ai_qa',
            prompt: "Compare the Q&A segments from $NVDA's and $AMD's latest earnings calls, focusing on questions about AI infrastructure and data center demand.",
            category: 'comparative_analysis',
        },
        {
            id: 'supply_chain_trend',
            prompt: "Analyze mentions of supply chain challenges across $AAPL's last four earnings calls. How has management's tone and messaging evolved?",
            category: 'trend_analysis',
        },
        {
            id: 'strategic_initiatives',
            prompt: "Review $TSLA's latest conference presentation and identify the top 3 key strategic initiatives mentioned. How do these differ from what was emphasized in the previous quarter?",
            category: 'strategic_analysis',
        },
        {
            id: 'margin_comparison',
            prompt: 'Compare the margin outlook discussions between $WMT and $TGT in their most recent earnings calls. What are the key differences in their approach to managing inflationary pressures?',
            category: 'comparative_analysis',
        },
        {
            id: 'capital_allocation',
            prompt: "Extract and summarize all analyst questions about capital allocation from $META's last earnings call. How did management's responses compare to their previous guidance?",
            category: 'financial_analysis',
        },
        {
            id: 'ai_competition',
            prompt: 'Analyze the competitive positioning statements made by $MSFT and $CRM regarding their AI strategies. What are the key differentiators each company emphasizes?',
            category: 'competitive_analysis',
        },
        {
            id: 'credit_quality',
            prompt: "Review $JPM's latest earnings call and summarize management's comments on credit quality trends. How does this compare to commentary from $BAC and $C?",
            category: 'financial_analysis',
        },
        {
            id: 'international_expansion',
            prompt: "Extract all mentions of international expansion from $AMZN's last four conference presentations. Create a timeline of their strategic priorities by region.",
            category: 'strategic_analysis',
        },
        {
            id: 'esg_comparison',
            prompt: 'Compare the discussion of ESG initiatives between $XOM and $CVX in their latest earnings calls. How do their approaches to energy transition differ?',
            category: 'esg_analysis',
        },
        {
            id: 'pipeline_sentiment',
            prompt: "Analyze the tone and sentiment of $PFE's management responses during Q&A sessions about pipeline development across the last two earnings calls. Has their confidence level changed?",
            category: 'sentiment_analysis',
        },
    ];
};

export const useSuggestedPrompts = (): UseSuggestedPromptsReturn => {
    const [prompts, setPrompts] = useState<SuggestedPrompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use useCallback to memoize the fetch function
    const fetchPrompts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchSuggestedPrompts();
            setPrompts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array since it doesn't depend on any props or state

    useEffect(() => {
        void fetchPrompts();
    }, [fetchPrompts]);

    const refresh = async () => {
        await fetchPrompts();
    };

    return {
        prompts,
        isLoading,
        error,
        refresh,
    };
};
