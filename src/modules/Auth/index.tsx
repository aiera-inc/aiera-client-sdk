import React, { ReactElement, ReactNode, useState, FormEvent, FormEventHandler, MouseEventHandler } from 'react';
import { useMutation, useQuery } from 'urql';
import gql from 'graphql-tag';

import { CurrentUserQuery, LoginMutation, LoginMutationVariables } from 'types/generated';
import { QueryError } from 'types';
import { useClient } from 'client';
import { AuthTokens, TokenAuthConfig, defaultTokenAuthConfig } from 'client/auth';
import './styles.css';

/**
 * @notExported
 */
interface AuthForm {
    email: string;
    password: string;
}

/**
 * @notExported
 */
interface AuthProps {
    authForm: AuthForm;
    children?: ReactNode;
    error?: QueryError;
    loading: boolean;
    login: FormEventHandler;
    logout: MouseEventHandler;
    setAuthForm: (authForm: AuthForm) => void;
    user?: CurrentUserQuery['currentUser'] | null;
}

export const AuthUI = (props: AuthProps): ReactElement => {
    const { children, user, loading, authForm, setAuthForm, login, logout } = props;

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <form action="#" onSubmit={login}>
                <div>
                    <input
                        className="rounded border border-gray-400"
                        type="text"
                        data-testid="auth-email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    />
                </div>
                <div>
                    <input
                        className="border border-gray-400 rounded"
                        type="password"
                        data-testid="auth-password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    />
                </div>
                <button className="px-1 ml-2 text-white bg-blue-500 rounded" type="submit">
                    Login
                </button>
            </form>
        );
    }

    return (
        <div>
            Logged in as {user.firstName} {user.lastName}
            <button className="px-1 ml-2 text-white bg-blue-500 rounded" onClick={logout}>
                Logout
            </button>
            {children && <div>{children}</div>}
        </div>
    );
};

export const Auth = ({
    children,
    config = defaultTokenAuthConfig,
}: {
    children?: ReactNode;
    config?: TokenAuthConfig<AuthTokens>;
}): ReactElement => {
    const initialAuthform = { email: '', password: '' };
    const [authForm, setAuthForm] = useState<AuthForm>(initialAuthform);

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
        return loginMutation(authForm).then(async (resp) => {
            if (resp.data?.login) {
                await config.writeAuth(resp.data.login);
                refetch({ requestPolicy: 'cache-and-network' });
            }
        });
    };

    const logout = async () => {
        await config.clearAuth();
        setAuthForm(initialAuthform);
        reset();
    };

    return (
        <AuthUI
            user={result.data?.currentUser}
            loading={result.fetching}
            error={result.error}
            authForm={authForm}
            setAuthForm={setAuthForm}
            login={login}
            logout={logout}
        >
            {children}
        </AuthUI>
    );
};
