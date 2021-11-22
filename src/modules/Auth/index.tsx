import React, { ReactElement, ReactNode, useState, FormEvent, FormEventHandler, MouseEventHandler } from 'react';
import { useMutation, useQuery } from 'urql';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';

import { CurrentUserQuery, LoginMutation, LoginMutationVariables } from '@aiera/client-sdk/types/generated';
import { Input } from '@aiera/client-sdk/components/Input';
import { Button } from '@aiera/client-sdk/components/Button';
import { QueryError } from '@aiera/client-sdk/types';
import { useClient } from '@aiera/client-sdk/api/client';
import { useChangeHandlers, ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { AuthTokens, TokenAuthConfig, defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';
import './styles.css';

export type LoginState = 'none' | 'loading' | 'error';

/**
 * @notExported
 */
interface AuthProps {
    children?: ReactNode;
    error?: QueryError;
    loading: boolean;
    login: FormEventHandler;
    logout: MouseEventHandler;
    loginState: LoginState;
    showLogout: boolean;
    user?: CurrentUserQuery['currentUser'] | null;
    email: string;
    onChangeEmail: ChangeHandler<string>;
    password: string;
    onChangePassword: ChangeHandler<string>;
}

export const AuthUI = (props: AuthProps): ReactElement => {
    const {
        children,
        user,
        loading,
        login,
        logout,
        loginState,
        showLogout,
        email,
        onChangeEmail,
        password,
        onChangePassword,
    } = props;

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center bg-white h-full">
                <h2>Aiera</h2>
                <form className="flex flex-col items-center justify-center mt-4" action="#" onSubmit={login}>
                    <div className="flex w-full m-2">
                        <label className="flex-1 text-right mr-4" htmlFor="email">
                            Email
                        </label>
                        <Input
                            className="w-44"
                            id="email"
                            name="email"
                            placeholder="email"
                            value={email}
                            onChange={onChangeEmail}
                        />
                    </div>
                    <div className="flex w-full m-3 mb-4">
                        <label className="flex-1 text-right mr-4" htmlFor="password">
                            Password
                        </label>
                        <Input
                            className="w-44"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={onChangePassword}
                        />
                    </div>
                    {match(loginState)
                        .with('none', 'error', () => {
                            return (
                                <Button kind="primary" type="submit">
                                    Login
                                </Button>
                            );
                        })
                        .with('loading', () => {
                            return <Button kind="primary">Logging in...</Button>;
                        })
                        .exhaustive()}
                </form>
            </div>
        );
    }

    return (
        <div className="h-full">
            {(showLogout || !children) && (
                <div className="h-6">
                    Logged in as {user.firstName} {user.lastName}
                    <button className="px-1 ml-2 text-white bg-blue-500 rounded" onClick={logout}>
                        Logout
                    </button>
                </div>
            )}
            {children && <div className="h-full pb-6">{children}</div>}
        </div>
    );
};

export const Auth = ({
    children,
    config = defaultTokenAuthConfig,
    showLogout = false,
}: {
    children?: ReactNode;
    config?: TokenAuthConfig<AuthTokens>;
    showLogout?: boolean;
}): ReactElement => {
    const initialAuthform = { email: '', password: '' };
    const { state, mergeState, handlers } = useChangeHandlers(initialAuthform);
    const [loginState, setLoginState] = useState<'none' | 'loading' | 'error'>('none');

    const [result, refetch] = useQuery<CurrentUserQuery>({
        query: gql`
            query CurrentUser {
                currentUser {
                    id
                    firstName
                    lastName
                }
            }
        `,
    });

    const [_, loginMutation] = useMutation<LoginMutation, LoginMutationVariables>(gql`
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                accessToken
                refreshToken
            }
        }
    `);

    const { reset } = useClient();

    const login = async (event: FormEvent) => {
        event.preventDefault();
        setLoginState('loading');
        return loginMutation(state)
            .then(async (resp) => {
                if (resp.data?.login) {
                    await config.writeAuth(resp.data.login);
                    refetch({ requestPolicy: 'cache-and-network' });
                    setLoginState('none');
                } else {
                    throw new Error('Error logging in');
                }
            })
            .catch((_e) => {
                setLoginState('error');
            });
    };

    const logout = async () => {
        await config.clearAuth();
        mergeState(initialAuthform);
        reset();
    };

    return (
        <AuthUI
            user={result.data?.currentUser}
            loading={result.fetching}
            error={result.error}
            email={state.email}
            onChangeEmail={handlers.email}
            password={state.password}
            onChangePassword={handlers.password}
            login={login}
            logout={logout}
            showLogout={showLogout}
            loginState={loginState}
        >
            {children}
        </AuthUI>
    );
};
