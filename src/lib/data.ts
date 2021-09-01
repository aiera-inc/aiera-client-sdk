/**
 * Utilities for working with data from GQL Query responses.
 * @module
 */
import { DeepPartial, Instrument, Maybe, Quote } from '@aiera/client-sdk/types';

/**
 * Utilities for working with quotes/instruments
 */
interface Primary {
    isPrimary: boolean;
}
function sortByPrimary(a: Primary, b: Primary) {
    return Number(b.isPrimary) - Number(a.isPrimary);
}

/**
 * For the primary quote, US based takes precendence, then isPrimary field on both
 * intrument and quote, and finally the first intrument/quote we find if nothing else.
 *
 * To do this, sort all the primary instruments to the front, then sort the primary quotes
 * for each. This gives us a primary sorted array of quotes.
 * 1. Use the first US based quote if we have one
 * 2. Otherwise use the first primary quote if we have one
 * 2. Otherwise just use the first quote we have
 */
export function getPrimaryQuote(
    company: Maybe<{
        instruments: (Pick<Instrument, 'isPrimary'> & {
            quotes: (Pick<Quote, 'isPrimary'> & { exchange: { country: { countryCode: string } } })[];
        })[];
    }>
): Maybe<DeepPartial<Quote>> {
    const quotes = company?.instruments
        ?.sort(sortByPrimary)
        .flatMap((instrument) => instrument.quotes)
        .sort(sortByPrimary);
    const primaryQuote = quotes?.find((quote) => quote.exchange.country.countryCode === 'US');
    return primaryQuote || quotes?.[0];
}
