import React, { FormEvent } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { fromValue } from 'wonka';

import { renderWithClient } from 'testUtils';
import { Auth, AuthUI } from '.';

// mocked dependencies
import * as clientAuth from 'client/auth';
jest.mock('client/auth', () => ({
    ...jest.requireActual('client/auth'),
    clearAuth: jest.fn(),
    setAuth: jest.fn(),
}));

const email = 'test@example.com';
const password = 'password';
const accessToken = 'accessToken';
const refreshToken = 'refreshToken';
const defaultProps = {
    user: undefined,
    loading: false,
    error: undefined,
    authForm: { email: '', password: '' },
    setAuthForm: () => undefined,
    login: () => undefined,
    logout: () => undefined,
};

describe('AuthUI', () => {
    test('renders a loading state', () => {
        render(<AuthUI {...defaultProps} loading />);
        screen.getByText('Loading...');
    });

    test('renders the user and a logout button if logged in', () => {
        const logout = jest.fn();
        render(<AuthUI {...defaultProps} user={{ id: 'id', firstName: 'Test', lastName: 'User' }} logout={logout} />);
        fireEvent.click(screen.getByText('Logout'));
        expect(logout).toHaveBeenCalled();
    });

    test('renders a logging form if the user is logged out', () => {
        const login = jest.fn((e: FormEvent) => e.preventDefault());
        const setAuthForm = jest.fn();
        render(<AuthUI {...defaultProps} setAuthForm={setAuthForm} login={login} />);

        fireEvent.change(screen.getByTestId('auth-email'), { target: { value: email } });
        expect(setAuthForm).toHaveBeenCalledWith({ email, password: '' });

        fireEvent.change(screen.getByTestId('auth-password'), { target: { value: password } });
        expect(setAuthForm).toHaveBeenCalledWith({ email: '', password: password });

        fireEvent.click(screen.getByText('Login'));
        expect(login).toHaveBeenCalled();
    });
});

describe('Auth', () => {
    test('handles loading state', () => {
        renderWithClient(<Auth />);
        screen.getByText('Loading...');
    });

    test('handles logged in state with user', () => {
        const { reset } = renderWithClient(
            <Auth>
                <div>Hello World!</div>
            </Auth>,
            {
                executeQuery: () =>
                    fromValue({
                        data: {
                            currentUser: { id: 1, firstName: 'Test', lastName: 'User' },
                        },
                    }),
            }
        );
        screen.getByText('Logged in as Test User');
        screen.getByText('Hello World!');
        fireEvent.click(screen.getByText('Logout'));
        expect(clientAuth.clearAuth).toHaveBeenCalled();
        expect(reset).toHaveBeenCalled();
    });

    test('handles logging in when in logged out state', async () => {
        const { client } = renderWithClient(<Auth />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        currentUser: null,
                    },
                }),
            executeMutation: () =>
                fromValue({
                    data: {
                        login: { accessToken, refreshToken },
                    },
                }),
        });

        fireEvent.change(screen.getByTestId('auth-email'), { target: { value: email } });
        fireEvent.change(screen.getByTestId('auth-password'), { target: { value: password } });
        fireEvent.click(screen.getByText('Login'));
        await waitFor(() => {
            expect(client.executeMutation).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: { email, password },
                }),
                expect.anything()
            );
            expect(clientAuth.setAuth).toHaveBeenCalledWith({ accessToken, refreshToken });
        });
    });
});
