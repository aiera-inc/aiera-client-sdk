import { areDatesSameDay, isToday } from '.';

describe('Datetimes', () => {
    test('areDatesSameDay', () => {
        const today = new Date();
        const laterToday = new Date(new Date().getTime() + 600000); // 10 minutes from now
        const yesterday = new Date(new Date().getTime() - 90000000); // 25 hours ago
        expect(areDatesSameDay(today, laterToday)).toBe(true);
        expect(areDatesSameDay(today, yesterday)).toBe(false);
    });

    test('isToday', () => {
        const today = new Date();
        const yesterday = new Date(new Date().getTime() - 90000000); // 25 hours ago
        expect(isToday(today)).toBe(true);
        expect(isToday(yesterday)).toBe(false);
    });
});
