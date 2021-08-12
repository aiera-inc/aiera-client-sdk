import { useMutation, useQuery } from 'urql';
import gql from 'graphql-tag';
import { CurrentUserQuery, LoginMutation, LoginMutationVariables, Mutation, Query } from 'types';

type UserQuery = Query<CurrentUserQuery>;
type UserLogin = Mutation<LoginMutation, LoginMutationVariables>;
type UseUser = UserQuery & { login: UserLogin['mutate'] };

export function useUser(): UseUser {
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

    const [_, login] = useMutation<LoginMutation, LoginMutationVariables>(gql`
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                success
            }
        }
    `);

    return {
        ...result,
        refetch,
        login: (variables?: LoginMutationVariables) =>
            login(variables).then((resp) => {
                refetch({ requestPolicy: 'cache-and-network' });
                return resp;
            }),
    };
}
