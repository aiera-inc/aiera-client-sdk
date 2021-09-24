import { local as storage } from '.';

describe('storage library', () => {
    test('writes to local storage', async () => {
        jest.spyOn(window.localStorage.__proto__, 'setItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.setItem = jest.fn();
        await storage.put('key', 'value');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        void expect(window.localStorage.setItem).toHaveBeenCalledWith('aiera:sdk:key', 'value');
    });

    test('reads from local storage', async () => {
        jest.spyOn(window.localStorage.__proto__, 'getItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn();
        await storage.get('key');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        void expect(window.localStorage.getItem).toHaveBeenCalledWith('aiera:sdk:key');
    });

    test('deletes from local storage', async () => {
        jest.spyOn(window.localStorage.__proto__, 'removeItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.removeItem = jest.fn();
        await storage.del('key');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        void expect(window.localStorage.removeItem).toHaveBeenCalledWith('aiera:sdk:key');
    });
});
