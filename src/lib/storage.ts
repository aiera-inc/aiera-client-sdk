const prefix = 'aiera:sdk';

function put(key: string, value: string): void {
    localStorage.setItem(`${prefix}:${key}`, value);
}

function get(key: string): string | null {
    return localStorage.getItem(`${prefix}:${key}`) || null;
}

function del(key: string): void {
    localStorage.removeItem(`${prefix}:${key}`);
}

export default { put, get, del };
