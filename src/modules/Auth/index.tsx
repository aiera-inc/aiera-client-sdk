import React, { FC, ReactElement, useState, FormEventHandler, MouseEventHandler } from 'react';
import { useMutation, useQuery } from 'urql';
import gql from 'graphql-tag';

import { CurrentUserQuery, LoginMutation, LoginMutationVariables } from 'types/generated';
import { QueryError } from 'types';
import { useClient } from 'client';
import { setAuth, clearAuth } from 'client/auth';
import './styles.css';

interface AuthForm {
    email: string;
    password: string;
}

interface UIProps {
    user?: CurrentUserQuery['currentUser'] | null;
    loading: boolean;
    error?: QueryError;
    authForm: AuthForm;
    setAuthForm: (authForm: AuthForm) => void;
    login: FormEventHandler;
    logout: MouseEventHandler;
}

export const AuthUI: FC<UIProps> = (props: UIProps): ReactElement => {
    const { user, loading, authForm, setAuthForm, login, logout } = props;

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <form action="#" onSubmit={login}>
                <div>
                    <input
                        type="text"
                        data-testid="auth-email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        data-testid="auth-password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        );
    }

    return (
        <div>
            {user.firstName} {user.lastName}
            <div>
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    );
};

export const Auth: FC<unknown> = (): ReactElement => {
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

    const login = () =>
        loginMutation(authForm).then((resp) => {
            if (resp.data?.login) {
                setAuth(resp.data.login);
                refetch({ requestPolicy: 'cache-and-network' });
            }
        });

    const logout = () => {
        clearAuth();
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
        />
    );
};
