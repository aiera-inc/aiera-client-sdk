import { hash, prettyLineBreak, safeRegExp, titleize } from '.';

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

    test('safeRegExp', () => {
        const text = 'how many bears could Bear Grylls grill?';
        const unsafeText = 'how {many} bear$ could Bear Gry**s grill?';
        const textRegExp = new RegExp(`(${text})`, 'gi');
        const unsafeTextRegExp = new RegExp('(how \\{many\\} bear\\$ could Bear Gry\\*\\*s grill\\?)', 'gi');
        expect(safeRegExp(text)).toStrictEqual(textRegExp);
        expect(safeRegExp(unsafeText)).toStrictEqual(unsafeTextRegExp);
        expect(safeRegExp(undefined)).toBeNull();
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
