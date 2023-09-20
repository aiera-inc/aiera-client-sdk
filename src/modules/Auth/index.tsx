import React, { ReactElement, ReactNode, useEffect, useState, useCallback, FormEvent, FormEventHandler } from 'react';
import { useMutation } from 'urql';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';

import {
    CurrentUserQuery,
    LoginMutation,
    LoginMutationVariables,
    LoginWithPublicApiKeyMutation,
    LoginWithPublicApiKeyMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { Input } from '@aiera/client-sdk/components/Input';
import { Button } from '@aiera/client-sdk/components/Button';
import { Logo } from '@aiera/client-sdk/components/Svg/Logo';
import { useClient } from '@aiera/client-sdk/api/client';
import { AuthProvider } from '@aiera/client-sdk/lib/auth';
import { useChangeHandlers, ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { Message, MessageBusEvents, useMessageBus } from '@aiera/client-sdk/lib/msg';
import { AuthTokens, TokenAuthConfig, defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';
import './styles.css';
import { useConfig } from '@aiera/client-sdk/lib/config';

export type LoginState = 'none' | 'loading' | 'error';

/**
 * @notExported
 */
interface AuthProps {
    children?: ReactNode;
    login: FormEventHandler;
    loginState: LoginState;
    userQuery: QueryResult<CurrentUserQuery>;
    email: string;
    onChangeEmail: ChangeHandler<string>;
    password: string;
    onChangePassword: ChangeHandler<string>;
}

export const AuthUI = (props: AuthProps) => {
    const { children, userQuery, login, loginState, email, onChangeEmail, password, onChangePassword } = props;
    const config = useConfig();
    const styleOverrides = config.overrides?.style;

    return (
        <>
            <style>{styleOverrides}</style>
            {match(userQuery.status)
                .with('loading', 'paused', () => (
                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                        <div className="absolute w-32 top-10 right-10">
                            <Logo />
                        </div>
                        <div className="flex">
                            <div className="w-2 h-2 bg-[#FE590C] rounded-full animate-bounce animation" />
                            <div className="w-2 h-2 ml-1 bg-[#FE590C] rounded-full animate-bounce animation-delay-100" />
                            <div className="w-2 h-2 ml-1 bg-[#FE590C] rounded-full animate-bounce animation-delay-200" />
                        </div>
                    </div>
                ))
                .with('error', 'empty', () => (
                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                        <div className="absolute w-32 top-10 right-10">
                            <Logo />
                        </div>

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
                    </div>
                ))
                .with('success', () => children || <div />)
                .exhaustive()}
        </>
    );
};

export const ApiAuthUI = (props: AuthProps) => {
    const { children, userQuery, loginState } = props;
    const config = useConfig();
    const styleOverrides = config.overrides?.style;

    return (
        <>
            <style>{styleOverrides}</style>
            {match(userQuery.status)
                .with('loading', 'paused', () => (
                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                        <div className="flex">
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce animation" />
                            <div className="w-2 h-2 ml-1 bg-slate-400 rounded-full animate-bounce animation-delay-100" />
                            <div className="w-2 h-2 ml-1 bg-slate-200 rounded-full animate-bounce animation-delay-200" />
                        </div>
                    </div>
                ))
                .with('error', 'empty', () => (
                    <div className="bg-white relative flex flex-col items-center justify-center w-full h-full">
                        {match(loginState)
                            .with('error', () => <p className="text-sm text-slate-500">Unable to connect</p>)
                            .with('none', () => <p className="text-sm text-slate-500">Waiting for API key...</p>)
                            .with('loading', () => (
                                <div className="relative flex flex-col items-center justify-center w-full h-full">
                                    <div className="flex">
                                        <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce animation" />
                                        <div className="w-2 h-2 ml-1 bg-slate-400 rounded-full animate-bounce animation-delay-100" />
                                        <div className="w-2 h-2 ml-1 bg-slate-200 rounded-full animate-bounce animation-delay-200" />
                                    </div>
                                </div>
                            ))
                            .exhaustive()}
                    </div>
                ))
                .with('success', () => children || <div />)
                .exhaustive()}
        </>
    );
};

export const Auth = ({
    apiMode,
    children,
    config = defaultTokenAuthConfig,
}: {
    apiMode?: boolean;
    children?: ReactNode;
    config?: TokenAuthConfig<AuthTokens>;
}): ReactElement => {
    const initialAuthform = { email: '', password: '' };
    const { state, mergeState, handlers } = useChangeHandlers(initialAuthform);
    const [loginState, setLoginState] = useState<'none' | 'loading' | 'error'>('none');
    const [parentOrigin, setParentOrigin] = useState<string>(document.location.href);
    const [publicApiKey, setPublicApiKey] = useState<string>('');
    const { reset } = useClient();

    const userQuery = useQuery<CurrentUserQuery>({
        query: gql`
            query CurrentUser {
                currentUser {
                    id
                    firstName
                    lastName
                    apiKey
                }
            }
        `,
    });

    const bus = useMessageBus();
    useEffect(() => {
        if (userQuery.status === 'success') {
            bus.emit('authenticated', null, 'out');
        }
    }, [userQuery.status]);

    const [__, loginMutation] = useMutation<LoginMutation, LoginMutationVariables>(gql`
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                accessToken
                refreshToken
            }
        }
    `);
    const login = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();
            setLoginState('loading');
            return loginMutation(state)
                .then(async (resp) => {
                    if (resp.data?.login) {
                        await config.writeAuth(resp.data.login);
                        userQuery.refetch({ requestPolicy: 'cache-and-network' });
                        setLoginState('none');
                    } else {
                        throw new Error('Error logging in');
                    }
                })
                .catch((_e) => {
                    setLoginState('error');
                });
        },
        [loginMutation, config, userQuery.refetch, state, setLoginState]
    );

    const logout = useCallback(async () => {
        await config.clearAuth();
        mergeState(initialAuthform);
        reset();
    }, [config, mergeState, reset]);

    // Login with public api key
    const [_, loginWithPublicApiMutation] = useMutation<
        LoginWithPublicApiKeyMutation,
        LoginWithPublicApiKeyMutationVariables
    >(gql`
        mutation LoginWithPublicApiKey($apiKey: String!, $origin: String) {
            loginWithPublicApiKey(apiKey: $apiKey, origin: $origin) {
                accessToken
                refreshToken
            }
        }
    `);

    // We need the parent origin, as the window origin will default to the iframe
    // which will always be an aiera URL
    useEffect(() => {
        if (window.location != window.parent.location) {
            const newParentOrigin = document.referrer;
            setParentOrigin(newParentOrigin);
            // Re-auth with public api key when previous auth failed and the parent origin changes
            if (parentOrigin !== newParentOrigin && loginState === 'error' && publicApiKey) {
                void loginWithApiKey(publicApiKey);
            }
        }
    }, [
        document.referrer,
        window.location,
        window.parent.location,
        loginState,
        parentOrigin,
        publicApiKey,
        setParentOrigin,
    ]);

    const loginWithApiKey = useCallback(
        async (apiKey: string) => {
            await logout();
            setLoginState('loading');
            const result = await loginWithPublicApiMutation({ apiKey, origin: parentOrigin });
            if (result?.data?.loginWithPublicApiKey) {
                await config.writeAuth(result.data.loginWithPublicApiKey);
                userQuery.refetch({ requestPolicy: 'cache-and-network' });
                setLoginState('none');
            } else {
                setLoginState('error');
                await logout();
            }
        },
        [loginWithPublicApiMutation, config, parentOrigin, state, setLoginState, userQuery.refetch]
    );

    useEffect(() => {
        const refetchOnAuth = () => userQuery.refetch();
        const loginApiKey = <E extends keyof MessageBusEvents>(msg: Message<E>) => {
            const apiKey = (msg?.data as string) || '';
            setPublicApiKey(apiKey);
            void loginWithApiKey(apiKey);
        };
        if (bus) {
            bus.on('authenticate', refetchOnAuth, 'in');
            bus.on('authenticateWithApiKey', loginApiKey, 'in');
        }

        return () => {
            if (bus) {
                bus.off('authenticate', refetchOnAuth, 'in');
                bus.off('authenticateWithApiKey', loginApiKey, 'in');
            }
        };
    }, [bus]);

    return (
        <AuthProvider logout={logout}>
            {apiMode ? (
                <ApiAuthUI
                    userQuery={userQuery}
                    email={state.email}
                    onChangeEmail={handlers.email}
                    password={state.password}
                    onChangePassword={handlers.password}
                    login={login}
                    loginState={loginState}
                >
                    {children}
                </ApiAuthUI>
            ) : (
                <AuthUI
                    userQuery={userQuery}
                    email={state.email}
                    onChangeEmail={handlers.email}
                    password={state.password}
                    onChangePassword={handlers.password}
                    login={login}
                    loginState={loginState}
                >
                    {children}
                </AuthUI>
            )}
        </AuthProvider>
    );
};
