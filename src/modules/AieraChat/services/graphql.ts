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
        runnerVersion
        sessionId
        updatedAt
        userId
        blocks {
            ... on ChartBlock {
                __typename
                type
                data {
                    __typename
                    name
                    properties
                    value
                }
                chartMeta {
                    __typename
                    chartType
                    properties
                }
            }
            ... on ImageBlock {
                __typename
                type
                url
                imageMeta {
                    __typename
                    altText
                    title
                    source
                    date
                }
            }
            ... on ListBlock {
                __typename
                type
                listMeta {
                    __typename
                    style
                }
                items {
                    ... on ChartBlock {
                        __typename
                        type
                        data {
                            __typename
                            name
                            properties
                            value
                        }
                        chartMeta {
                            __typename
                            chartType
                            properties
                        }
                    }
                    ... on ImageBlock {
                        __typename
                        type
                        url
                        imageMeta {
                            __typename
                            altText
                            title
                            source
                            date
                        }
                    }
                    ... on QuoteBlock {
                        __typename
                        type
                        quoteContent
                        quoteMeta {
                            __typename
                            author
                            source
                            date
                            url
                        }
                    }
                    ... on TableBlock {
                        __typename
                        headers
                        type
                        rows {
                            __typename
                            value
                            citation {
                                __typename
                                author
                                contentId
                                contentType
                                date
                                quote
                                source {
                                    __typename
                                    name
                                    sourceId
                                    type
                                }
                                url
                            }
                        }
                        tableMeta {
                            __typename
                            columnAlignment
                            columnMeta {
                                __typename
                                currency
                                unit
                                format
                                decimals
                            }
                        }
                    }
                    ... on TextBlock {
                        __typename
                        type
                        textContent {
                            __typename
                            value
                            citation {
                                __typename
                                author
                                contentId
                                contentType
                                date
                                quote
                                source {
                                    __typename
                                    name
                                    sourceId
                                    type
                                }
                                url
                            }
                        }
                        textMeta {
                            __typename
                            style
                        }
                    }
                }
            }
            ... on QuoteBlock {
                __typename
                quoteContent
                type
                quoteMeta {
                    __typename
                    author
                    source
                    date
                    url
                }
            }
            ... on TableBlock {
                __typename
                headers
                type
                rows {
                    __typename
                    value
                    citation {
                        __typename
                        author
                        contentId
                        contentType
                        date
                        quote
                        source {
                            __typename
                            name
                            sourceId
                            type
                        }
                        url
                    }
                }
                tableMeta {
                    __typename
                    columnAlignment
                    columnMeta {
                        __typename
                        currency
                        unit
                        format
                        decimals
                    }
                }
            }
            ... on TextBlock {
                __typename
                type
                textContent {
                    __typename
                    value
                    citation {
                        __typename
                        author
                        contentId
                        contentType
                        date
                        quote
                        source {
                            __typename
                            name
                            sourceId
                            type
                        }
                        url
                    }
                }
                textMeta {
                    __typename
                    style
                }
            }
        }
    }
`;

const CHAT_MESSAGE_SOURCE_CONFIRMATION_FRAGMENT = gql`
    fragment ChatMessageSourceConfirmationFragment on ChatMessageSourceConfirmation {
        id
        __typename
        createdAt
        messageType
        ordinalId
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
                sourceId
                type
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
