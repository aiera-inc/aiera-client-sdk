import React, { FormEvent } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { fromValue } from 'wonka';

import { CurrentUserQuery } from '@aiera/client-sdk/types/generated';
import { QueryResult } from '@aiera/client-sdk/api/client';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { AuthTokens, TokenAuthConfig } from '@aiera/client-sdk/api/auth';
import { useAuthContext } from '@aiera/client-sdk/lib/auth';
import { Auth, AuthUI, LoginState } from '.';
import { CombinedError } from 'urql';

const email = 'test@example.com';
const password = 'password';
const accessToken = 'accessToken';
const refreshToken = 'refreshToken';
const errorUserQuery = { status: 'error' } as QueryResult<CurrentUserQuery>;
const loadingUserQuery = { status: 'loading' } as QueryResult<CurrentUserQuery>;

const defaultProps = {
    login: () => undefined,
    email: '',
    onChangeEmail: () => undefined,
    password: '',
    onChangePassword: () => undefined,
    loginState: 'none' as LoginState,
};

describe('AuthUI', () => {
    test('renders a loading state', () => {
        render(<AuthUI {...defaultProps} userQuery={loadingUserQuery} />);
        screen.getByTitle('Logo');
        expect(screen.queryByPlaceholderText('email')).toBeNull();
    });

    test('renders a logging form if the user is logged out', () => {
        const login = jest.fn((e: FormEvent) => e.preventDefault());
        const onChangeEmail = jest.fn();
        const onChangePassword = jest.fn();
        render(
            <AuthUI
                {...defaultProps}
                userQuery={errorUserQuery}
                login={login}
                onChangeEmail={onChangeEmail}
                onChangePassword={onChangePassword}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: email } });
        expect(onChangeEmail).toHaveBeenCalledWith(expect.anything(), { name: 'email', value: email });

        fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: password } });
        expect(onChangePassword).toHaveBeenCalledWith(expect.anything(), { name: 'password', value: password });

        fireEvent.click(screen.getByText('Login'));
        expect(login).toHaveBeenCalled();
    });
});

describe('Auth', () => {
    function createMockAuth(): TokenAuthConfig<AuthTokens> {
        return {
            readAuth: jest.fn(),
            writeAuth: jest.fn(),
            clearAuth: jest.fn(),
            getAuth: jest.fn(),
            addAuthToOperation: jest.fn(),
        };
    }

    test('handles loading state', () => {
        renderWithProvider(<Auth />);
        screen.getByTitle('Logo');
        expect(screen.queryByPlaceholderText('email')).toBeNull();
    });

    test('handles logged in state with user', async () => {
        const config = createMockAuth();
        const AuthButton = () => {
            const { logout } = useAuthContext();
            return <button onClick={logout}>Logout</button>;
        };
        const { reset } = renderWithProvider(
            <Auth config={config}>
                <div>Hello World!</div>
                <AuthButton />
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
        screen.getByText('Hello World!');
        fireEvent.click(screen.getByText('Logout'));
        await waitFor(() => {
            expect(config.clearAuth).toHaveBeenCalled();
            expect(reset).toHaveBeenCalled();
        });
    });

    test('handles logging in when in logged out state', async () => {
        const config = createMockAuth();
        const { client } = renderWithProvider(<Auth config={config} />, {
            executeQuery: () =>
                fromValue({
                    error: new CombinedError({ graphQLErrors: ['Not Authenticated'] }),
                }),
            executeMutation: () =>
                fromValue({
                    data: {
                        login: { accessToken, refreshToken },
                    },
                }),
        });

        fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: password } });
        fireEvent.click(screen.getByText('Login'));
        await waitFor(() => {
            expect(client.executeMutation).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: { email, password },
                }),
                expect.anything()
            );
            expect(config.writeAuth).toHaveBeenCalledWith({ accessToken, refreshToken });
        });
    });
});
