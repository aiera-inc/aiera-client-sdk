export function prettyLineBreak(line: string): string {
    const centerIndex = (line.length / 9) * 5;
    const start = line.slice(0, centerIndex);
    const end = line.slice(centerIndex).replace(/ /g, '\u00a0');
    return start + end;
}
