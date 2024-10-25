import { renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { AuthProvider, useAuthContext } from '.';

interface ComponentProps {
    children: ReactNode;
}

describe('realtime', () => {
    test('returns undefined with no provider', () => {
        const { result } = renderHook(() => useAuthContext());
        expect(result.current.logout).toBeUndefined();
    });

    test('returns logout funciton when provided', () => {
        const logout = jest.fn();

        const Wrapper = ({ children }: ComponentProps) => {
            return <AuthProvider logout={logout}>{children}</AuthProvider>;
        };
        const { result } = renderHook(() => useAuthContext(), { wrapper: Wrapper });
        expect(result.current.logout).toBe(logout);
    });
});
