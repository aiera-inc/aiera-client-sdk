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
            ... on TextBlock {
                __typename
                content
                citations {
                    __typename
                    author
                    date
                    marker
                    quote
                    source {
                        __typename
                        name
                        parent {
                            __typename
                            name
                            sourceId
                            type
                        }
                        sourceId
                        type
                    }
                    url
                }
                type
            }
        }
        statuses {
            id
            content
            createdAt
            messageType
            ordinalId
            promptMessageId
            runnerVersion
            sessionId
            updatedAt
        }
        sources {
            name
            sourceId
            type
            meta {
                url
            }
            parent {
                name
                sourceId
                type
                meta {
                    url
                }
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
                name
                parent {
                    __typename
                    name
                    sourceId
                    type
                }
                sourceId
                type
            }
            promptMessages {
                ...ChatMessagePromptFragment
            }
            responseMessages {
                ...ChatMessageResponseFragment
            }
        }
    }
    ${CHAT_MESSAGE_PROMPT_FRAGMENT}
    ${CHAT_MESSAGE_RESPONSE_FRAGMENT}
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
