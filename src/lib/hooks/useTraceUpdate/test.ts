/* eslint-disable @typescript-eslint/ban-ts-comment */
import { renderHook } from '@testing-library/react-hooks';

import { useTraceUpdate } from '.';

describe('useTraceUpdate', () => {
    test('it does its thing', () => {
        console.log = jest.fn();
        const { rerender } = renderHook((props) => useTraceUpdate(props), { initialProps: { text: 'test 1' } });
        rerender({ text: 'test 2' });
        expect(console.log).toHaveBeenCalledWith(
            'Changed props:',
            expect.objectContaining({ text: ['test 1', 'test 2'] })
        );
    });
});
