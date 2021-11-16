import React, { ReactElement, ReactNode, createContext, useContext, useMemo } from 'react';
import EventEmitter from 'eventemitter3';

export type StorageListener = (key: string, value: string) => void;

export interface Storage {
    put(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    addListener?: (listener: StorageListener) => void;
    removeListener?: (listener: StorageListener) => void;
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

class InternalStorage implements Storage {
    events: EventEmitter;
    storage: Storage;

    constructor(storage: Storage) {
        this.events = new EventEmitter();
        this.storage = storage;
    }

    async get(key: string) {
        return this.storage.get(key);
    }

    async put(key: string, value: string) {
        await this.storage.put(key, value);
        this.events.emit('modified', key, value);
    }

    async del(key: string) {
        await this.storage.del(key);
        this.events.emit('modified', key, null);
    }

    addListener(listener: StorageListener) {
        this.events.addListener('modified', listener);
    }

    removeListener(listener: StorageListener) {
        this.events.addListener('modified', listener);
    }
}

export const Context = createContext<Storage>(local);

export function Provider({ children, storage = local }: { children: ReactNode; storage?: Storage }): ReactElement {
    return (
        <Context.Provider value={useMemo(() => new InternalStorage(storage), [storage])}>{children}</Context.Provider>
    );
}

export function useStorage(): Storage {
    return useContext(Context);
}
