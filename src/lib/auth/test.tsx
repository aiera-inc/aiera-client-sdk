import React, { FC } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useAuthContext, AuthProvider } from '.';

describe('realtime', () => {
    test('returns undefined with no provider', () => {
        const { result } = renderHook(() => useAuthContext());
        expect(result.current.logout).toBeUndefined();
    });

    test('returns logout funciton when provided', () => {
        const logout = jest.fn();

        const Wrapper: FC = ({ children }) => {
            return <AuthProvider logout={logout}>{children}</AuthProvider>;
        };
        const { result } = renderHook(() => useAuthContext(), { wrapper: Wrapper });
        expect(result.current.logout).toBe(logout);
    });
});
