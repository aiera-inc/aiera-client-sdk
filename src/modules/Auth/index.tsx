import React, { FC, ReactElement, useState, MouseEventHandler } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'urql';
import { CurrentUserQuery, LoginMutation, LoginMutationVariables, LogoutMutation } from 'types/generated';
import { QueryError } from 'types';
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
    login: MouseEventHandler;
    logout: MouseEventHandler;
}

export const AuthUI: FC<UIProps> = (props: UIProps): ReactElement => {
    const { user, loading, error, authForm, setAuthForm, login, logout } = props;

    if (error) {
        return <div>Error occurred</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div>
                <div>
                    <input
                        type="text"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    />
                </div>
                <button type="submit" onClick={login}>
                    Login
                </button>
            </div>
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
    const [authForm, setAuthForm] = useState<AuthForm>({
        email: '',
        password: '',
    });

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

    const [_login, login] = useMutation<LoginMutation, LoginMutationVariables>(gql`
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                success
            }
        }
    `);

    const [_logout, logout] = useMutation<LogoutMutation>(gql`
        mutation Logout {
            logout {
                success
            }
        }
    `);

    return (
        <AuthUI
            user={result.data?.currentUser}
            loading={result.fetching}
            error={result.error}
            authForm={authForm}
            setAuthForm={setAuthForm}
            login={() => login(authForm).then(() => refetch({ requestPolicy: 'cache-and-network' }))}
            logout={() => logout().then(() => refetch({ requestPolicy: 'cache-and-network' }))}
        />
    );
};
