/**
 * Simple insecure hash function for strings
 *
 * based on https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
 *
 * @param   - str - the string to hash
 *
 * @returns - a 32 bit number
 */
export function hash(str: string): number {
    return [...str].reduce((hash, char) => {
        const newHash = (hash << 5) - hash + char.charCodeAt(0);
        return newHash & newHash;
    }, 0);
}

export function prettyLineBreak(line: string): string {
    const centerIndex = (line.length / 9) * 5;
    const start = line.slice(0, centerIndex);
    const end = line.slice(centerIndex).replace(/ /g, '\u00a0');
    return start + end;
}

/**
 * Takes a string, removes certain special characters,
 * splits up the words and capitalizes the first one,
 * then returns the combined string with leading and trailing whitespaces removed
 *
 * @param str - the string to titleize
 */
export function titleize(str = ''): string {
    const titleized = str
        .replace(/([a-z])([A-Z])/g, (_allMatches, firstMatch: string, secondMatch: string) => {
            return `${firstMatch} ${secondMatch}`;
        })
        .toLowerCase()
        .replace(/([ -_]|^)(.)/g, (_allMatches, firstMatch: string, secondMatch: string) => {
            return (firstMatch ? ' ' : '') + secondMatch.toUpperCase();
        });
    return titleized.trim();
}
