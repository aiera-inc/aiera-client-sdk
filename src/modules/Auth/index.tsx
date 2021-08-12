import React, { FC, ReactElement, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'urql';
import { CurrentUserQuery, LoginMutation, LoginMutationVariables, QueryError } from 'types';
import './styles.css';

interface AuthForm {
    email?: string;
    password?: string;
}

interface UIProps {
    user?: CurrentUserQuery['currentUser'] | null;
    loading: boolean;
    error?: QueryError;
    authForm: AuthForm;
    setAuthForm: (authForm: AuthForm) => void;
    submit: () => void;
}

export const AuthUI: FC<UIProps> = (props: UIProps): ReactElement => {
    const { user, loading, error, authForm, setAuthForm, submit } = props;

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
                <button type="submit" onClick={submit}>
                    Login
                </button>
            </div>
        );
    }

    return (
        <div>
            {user.firstName} {user.lastName}
        </div>
    );
};

export const Auth: FC<unknown> = (): ReactElement => {
    const [authForm, setAuthForm] = useState<AuthForm>({
        email: '',
        password: '',
    });

    const [result] = useQuery<CurrentUserQuery>({
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

    const [_, login] = useMutation<LoginMutation, LoginMutationVariables>(gql`
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
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
            submit={login}
        />
    );
};
