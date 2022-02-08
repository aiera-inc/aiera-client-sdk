import React, { ReactElement, ReactNode, useState, useCallback, FormEvent, FormEventHandler } from 'react';
import { useMutation, useQuery } from 'urql';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';

import { CurrentUserQuery, LoginMutation, LoginMutationVariables } from '@aiera/client-sdk/types/generated';
import { Input } from '@aiera/client-sdk/components/Input';
import { Button } from '@aiera/client-sdk/components/Button';
import { Logo } from '@aiera/client-sdk/components/Svg/Logo';
import { QueryError } from '@aiera/client-sdk/types';
import { useClient } from '@aiera/client-sdk/api/client';
import { AuthProvider } from '@aiera/client-sdk/lib/auth';
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
    loginState: LoginState;
    user?: CurrentUserQuery['currentUser'] | null;
    email: string;
    onChangeEmail: ChangeHandler<string>;
    password: string;
    onChangePassword: ChangeHandler<string>;
}

export const AuthUI = (props: AuthProps): ReactElement => {
    const { children, user, loading, login, loginState, email, onChangeEmail, password, onChangePassword } = props;

    if (!user) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full">
                <div className="absolute w-32 top-10 right-10">
                    <Logo />
                </div>
                {match(loading)
                    .with(true, () => (
                        <div className="flex">
                            <div className="w-2 h-2 bg-[#FE590C] rounded-full animate-bounce animation" />
                            <div className="w-2 h-2 ml-1 bg-[#FE590C] rounded-full animate-bounce animation-delay-100" />
                            <div className="w-2 h-2 ml-1 bg-[#FE590C] rounded-full animate-bounce animation-delay-200" />
                        </div>
                    ))
                    .with(false, () => (
                        <div className="bg-white">
                            <h1 className="text-3xl font-semibold text-left">Sign In</h1>
                            <form className="mt-4" action="#" onSubmit={login}>
                                <div className="mb-6">
                                    <label className="flex-1 mr-4 text-right" htmlFor="email">
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
                                <div>
                                    <label className="flex-1 mr-4 text-right" htmlFor="password">
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
                                    <div className="flex justify-end mt-1">
                                        <a
                                            className="right-0 text-xs text-gray-500 cursor-pointer hover:underline"
                                            href="https://dashboard.aiera.com/auth/reset-password"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Forgot Password?
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center h-10">
                                    {match(loginState)
                                        .with('error', () => (
                                            <div className="text-sm text-red-500">There was an error logging in.</div>
                                        ))
                                        .otherwise(() => null)}
                                </div>
                                <div className="flex justify-center">
                                    {match(loginState)
                                        .with('none', 'error', () => {
                                            return (
                                                <Button className="justify-center w-32" kind="primary" type="submit">
                                                    Login
                                                </Button>
                                            );
                                        })
                                        .with('loading', () => {
                                            return (
                                                <Button className="justify-center w-32" disabled kind="primary">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animation" />
                                                    <div className="w-2 h-2 ml-1 bg-white rounded-full animate-bounce animation-delay-100" />
                                                    <div className="w-2 h-2 ml-1 bg-white rounded-full animate-bounce animation-delay-200" />
                                                </Button>
                                            );
                                        })
                                        .exhaustive()}
                                </div>
                                <div className="flex justify-center mt-2">
                                    {match(loginState)
                                        .with('none', 'error', () => {
                                            return (
                                                <a
                                                    href="https://dashboard.aiera.com/pricing"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Button
                                                        className="justify-center w-32"
                                                        kind="secondary"
                                                        type="button"
                                                    >
                                                        Sign Up
                                                    </Button>
                                                </a>
                                            );
                                        })
                                        .with('loading', () => {
                                            return (
                                                <Button
                                                    className="justify-center w-32"
                                                    disabled
                                                    kind="secondary"
                                                    type="button"
                                                >
                                                    Sign Up
                                                </Button>
                                            );
                                        })
                                        .exhaustive()}
                                </div>
                            </form>
                        </div>
                    ))
                    .exhaustive()}
            </div>
        );
    }

    return <div className="h-full">{children}</div>;
};

export const Auth = ({
    children,
    config = defaultTokenAuthConfig,
}: {
    children?: ReactNode;
    config?: TokenAuthConfig<AuthTokens>;
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

    const login = useCallback(
        async (event: FormEvent) => {
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
        },
        [loginMutation, config, refetch, state, setLoginState]
    );

    const logout = useCallback(async () => {
        await config.clearAuth();
        mergeState(initialAuthform);
        reset();
    }, [config, mergeState, reset]);

    return (
        <AuthProvider logout={logout}>
            <AuthUI
                user={result.data?.currentUser}
                loading={result.fetching}
                error={result.error}
                email={state.email}
                onChangeEmail={handlers.email}
                password={state.password}
                onChangePassword={handlers.password}
                login={login}
                loginState={loginState}
            >
                {children}
            </AuthUI>
        </AuthProvider>
    );
};
