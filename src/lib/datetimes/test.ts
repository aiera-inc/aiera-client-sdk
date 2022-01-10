import { isToday } from '.';

describe('Datetimes', () => {
    test('isToday', () => {
        const today = new Date();
        const yesterday = new Date(new Date().getTime() - 90000000); // 25 hours ago
        expect(isToday(today)).toBe(true);
        expect(isToday(yesterday)).toBe(false);
    });
});
