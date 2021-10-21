import { prettyLineBreak } from '.';

describe('Strings', () => {
    test('prettyLineBreak', () => {
        const example = 'this is my test string, there are 11 spaces plus more words';

        // This util will replace the spaces in the last 5/9ths of the string with
        // nbsp;'s and this will prevent those words from being orphaned
        expect(prettyLineBreak(example).match(/ /g)?.length).toBe(6);
    });
});
