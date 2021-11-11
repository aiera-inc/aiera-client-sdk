import React, { ReactElement, ReactNode, createContext, useContext } from 'react';

export interface Storage {
    put(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
}

const prefix = 'aiera:sdk';
export const local: Storage = {
    async put(key: string, value: string): Promise<void> {
        localStorage.setItem(`${prefix}:${key}`, value);
        return Promise.resolve();
    },

    async get(key: string): Promise<string | null> {
        return Promise.resolve(localStorage.getItem(`${prefix}:${key}`) || null);
    },

    async del(key: string): Promise<void> {
        localStorage.removeItem(`${prefix}:${key}`);
        return Promise.resolve();
    },
};

export const Context = createContext<Storage>(local);

export function Provider({ children, storage = local }: { children: ReactNode; storage?: Storage }): ReactElement {
    return <Context.Provider value={storage}>{children}</Context.Provider>;
}

export function useStorage(): Storage {
    return useContext(Context);
}
