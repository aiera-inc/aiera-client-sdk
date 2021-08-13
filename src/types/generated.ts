/* eslint-disable @typescript-eslint/no-explicit-any */
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    /** Date with time (isoformat) */
    DateTime: any;
};

export enum BillingSource {
    Manual = 'manual',
    StripeLive = 'stripe_live',
    StripeTest = 'stripe_test',
}

export type Error = {
    code: Scalars['String'];
};

export type Event = {
    __typename?: 'Event';
    id: Scalars['ID'];
    eventType: EventType;
    title: Scalars['String'];
    eventDate: Scalars['DateTime'];
    fiscalQuarter?: Maybe<Scalars['Int']>;
    fiscalYear?: Maybe<Scalars['Int']>;
    conferenceNumber?: Maybe<Scalars['String']>;
    conferenceNumberAlt?: Maybe<Scalars['String']>;
    conferencePin?: Maybe<Scalars['String']>;
    conferenceNotes?: Maybe<Scalars['String']>;
    broadcastUrl?: Maybe<Scalars['String']>;
    transcriptionStatus?: Maybe<EventTranscriptionStatus>;
    status: EventStatus;
    hidden: Scalars['Boolean'];
};

export enum EventStatus {
    Active = 'active',
    Deleted = 'deleted',
}

export enum EventTranscriptionStatus {
    Submitted = 'submitted',
    AgentConnected = 'agent_connected',
    Connected = 'connected',
    Started = 'started',
    Finished = 'finished',
    Missed = 'missed',
    Archived = 'archived',
}

export enum EventType {
    Earnings = 'earnings',
    EarningsRelease = 'earnings_release',
    Presentation = 'presentation',
    ShareholderMeeting = 'shareholder_meeting',
    InvestorMeeting = 'investor_meeting',
    SpecialSituation = 'special_situation',
    Custom = 'custom',
    Test = 'test',
}

export type LoginResponse = MutationResponse & {
    __typename?: 'LoginResponse';
    success: Scalars['Boolean'];
    errors: Array<Error>;
    user: User;
    accessToken: Scalars['String'];
    refreshToken: Scalars['String'];
};

export type Mutation = {
    __typename?: 'Mutation';
    login: LoginResponse;
    refresh: RefreshResponse;
};

export type MutationLoginArgs = {
    email: Scalars['String'];
    password: Scalars['String'];
};

export type MutationResponse = {
    success: Scalars['Boolean'];
    errors: Array<Error>;
};

export type Organization = {
    __typename?: 'Organization';
    id: Scalars['ID'];
    name: Scalars['String'];
    isPremium: Scalars['Boolean'];
    isActive: Scalars['Boolean'];
    isCustomer: Scalars['Boolean'];
    billingSource: BillingSource;
};

export enum PasswordStatus {
    User = 'user',
    Generated = 'generated',
}

export type Query = {
    __typename?: 'Query';
    events: Array<Event>;
    currentUser: User;
};

export type RefreshResponse = MutationResponse & {
    __typename?: 'RefreshResponse';
    success: Scalars['Boolean'];
    errors: Array<Error>;
    user: User;
    accessToken: Scalars['String'];
    refreshToken: Scalars['String'];
};

export type User = {
    __typename?: 'User';
    id: Scalars['ID'];
    firstName: Scalars['String'];
    lastName: Scalars['String'];
    status: UserStatus;
    passwordStatus: PasswordStatus;
    organization: Organization;
    email: Scalars['String'];
};

export enum UserStatus {
    Invited = 'invited',
    New = 'new',
    Verified = 'verified',
    Active = 'active',
    Duplicate = 'duplicate',
    Deactivated = 'deactivated',
}

export type RefreshMutationVariables = Exact<{ [key: string]: never }>;

export type RefreshMutation = {
    __typename: 'Mutation';
    refresh: { __typename: 'RefreshResponse'; accessToken: string; refreshToken: string };
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
    __typename?: 'Query';
    currentUser: { __typename?: 'User'; id: string; firstName: string; lastName: string };
};

export type LoginMutationVariables = Exact<{
    email: Scalars['String'];
    password: Scalars['String'];
}>;

export type LoginMutation = {
    __typename?: 'Mutation';
    login: { __typename?: 'LoginResponse'; accessToken: string; refreshToken: string };
};

export const RefreshDocument = gql`
    mutation Refresh {
        __typename
        refresh {
            __typename
            accessToken
            refreshToken
        }
    }
`;
export const CurrentUserDocument = gql`
    query CurrentUser {
        currentUser {
            id
            firstName
            lastName
        }
    }
`;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            accessToken
            refreshToken
        }
    }
`;
