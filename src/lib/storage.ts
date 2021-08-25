export interface Storage {
    put(key: string, value: string): void;
    get(key: string): string | null;
    del(key: string): void;
}

const prefix = 'aiera:sdk';
export const local: Storage = {
    put(key: string, value: string): void {
        localStorage.setItem(`${prefix}:${key}`, value);
    },

    get(key: string): string | null {
        return localStorage.getItem(`${prefix}:${key}`) || null;
    },

    del(key: string): void {
        localStorage.removeItem(`${prefix}:${key}`);
    },
};
