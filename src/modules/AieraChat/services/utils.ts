import { ChatSource, Citation as RawCitation } from '@aiera/client-sdk/types';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

/**
 * Map raw citations from the server
 */
export function normalizeCitation(rawCitation: RawCitation): Citation {
    const source = rawCitation.source;
    const sourceParent = source.parent as ChatSource;
    return {
        author: rawCitation.author || '',
        contentId: source.sourceId,
        date: rawCitation.date as string,
        marker: rawCitation.marker,
        meta: rawCitation.meta as object,
        source: source.name,
        sourceId: sourceParent.sourceId || source.sourceId,
        text: rawCitation.quote,
        url: rawCitation.url || undefined,
    };
}
