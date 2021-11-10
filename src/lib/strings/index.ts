export function prettyLineBreak(line: string): string {
    const centerIndex = (line.length / 9) * 5;
    const start = line.slice(0, centerIndex);
    const end = line.slice(centerIndex).replace(/ /g, '\u00a0');
    return start + end;
}

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
