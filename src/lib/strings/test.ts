import { hash, prettyLineBreak, titleize } from '.';

describe('Strings', () => {
    test('hash', () => {
        expect(hash('a')).toBe(hash('a'));
        expect(hash('alongerword')).toBe(hash('alongerword'));
        expect(hash('ab')).not.toBe(hash('a'));
        expect(hash('alongerword')).not.toBe(hash('alongerw0rd'));
    });

    test('prettyLineBreak', () => {
        const example = 'this is my test string, there are 11 spaces plus more words';
        expect(prettyLineBreak(example).match(/ /g)?.length).toBe(6);
    });

    test('titleize', () => {
        const expected = 'I Am Titleized';
        expect(titleize('I Am Titleized')).toBe(expected);
        expect(titleize('i am titleized')).toBe(expected);
        expect(titleize('I AM TITLEIZED')).toBe(expected);
        expect(titleize('i_am_titleized')).toBe(expected);
        expect(titleize('i-am-titleized')).toBe(expected);
        expect(titleize(' i am titleized ')).toBe(expected);
        expect(titleize('i&am*titleized')).toBe(expected);
        expect(titleize('i__am__titleized')).not.toBe(expected);
        expect(titleize(undefined)).toBe('');
    });
});
