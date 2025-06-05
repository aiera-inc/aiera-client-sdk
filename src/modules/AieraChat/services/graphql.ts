import gql from 'graphql-tag';

const CHAT_MESSAGE_PROMPT_FRAGMENT = gql`
    fragment ChatMessagePromptFragment on ChatMessagePrompt {
        id
        __typename
        content
        createdAt
        messageType
        ordinalId
        runnerVersion
        sessionId
        updatedAt
        userId
    }
`;

// Do not use inline fragment for the content blocks to avoid recursive issues
const CHAT_MESSAGE_RESPONSE_FRAGMENT = gql`
    fragment ChatMessageResponseFragment on ChatMessageResponse {
        __typename
        id
        createdAt
        messageType
        ordinalId
        promptMessageId
        runnerVersion
        sessionId
        updatedAt
        userId
        blocks {
            content
            type
            citations {
                __typename
                author
                date
                marker
                meta
                quote
                url
                source {
                    __typename
                    name
                    sourceId
                    type
                    parent {
                        __typename
                        name
                        sourceId
                        type
                    }
                }
            }
        }
    }
`;

const CHAT_MESSAGE_SOURCE_CONFIRMATION_FRAGMENT = gql`
    fragment ChatMessageSourceConfirmationFragment on ChatMessageSourceConfirmation {
        __typename
        id
        createdAt
        messageType
        ordinalId
        promptMessageId
        runnerVersion
        sessionId
        updatedAt
        userId
        sources {
            __typename
            confirmed
            name
            sourceId
            type
            parent {
                __typename
                name
                sourceId
                type
            }
        }
    }
`;

export const CHAT_SESSION_QUERY = gql`
    query ChatSessionWithMessages($filter: ChatSessionFilter!) {
        chatSession(filter: $filter) {
            __typename
            id
            activeMessageId
            createdAt
            modelId
            modelGenerationParams
            status
            title
            titleStatus
            updatedAt
            userId
            sources {
                __typename
                confirmed
                name
                sourceId
                type
                parent {
                    __typename
                    name
                    sourceId
                    type
                }
            }
            promptMessages {
                ...ChatMessagePromptFragment
            }
            responseMessages {
                ...ChatMessageResponseFragment
            }
            sourceConfirmationMessages {
                ...ChatMessageSourceConfirmationFragment
            }
        }
    }
    ${CHAT_MESSAGE_PROMPT_FRAGMENT}
    ${CHAT_MESSAGE_RESPONSE_FRAGMENT}
    ${CHAT_MESSAGE_SOURCE_CONFIRMATION_FRAGMENT}
`;

export const CONFIRM_SOURCE_CONFIRMATION_MUTATION = gql`
    mutation ConfirmChatMessageSourceConfirmation($input: ConfirmSourceConfirmationInput!) {
        confirmChatMessageSourceConfirmation(input: $input) {
            chatMessage {
                ...ChatMessageSourceConfirmationFragment
            }
        }
    }
    ${CHAT_MESSAGE_SOURCE_CONFIRMATION_FRAGMENT}
`;

export const CREATE_CHAT_MESSAGE_MUTATION = gql`
    mutation CreateChatMessagePrompt($input: CreateChatMessagePromptInput!) {
        createChatMessagePrompt(input: $input) {
            chatMessage {
                ...ChatMessagePromptFragment
            }
        }
    }
    ${CHAT_MESSAGE_PROMPT_FRAGMENT}
`;
