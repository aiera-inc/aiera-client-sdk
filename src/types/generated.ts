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
    /**
     * The `Date` scalar type represents a Date
     * value as specified by
     * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
     */
    Date: any;
    /**
     * The `DateTime` scalar type represents a DateTime
     * value as specified by
     * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
     */
    DateTime: any;
    DateTimeDefaultTimezone: any;
    /**
     * The `GenericScalar` scalar type represents a generic
     * GraphQL scalar value that could be:
     * String, Boolean, Int, Float, List or Object.
     */
    GenericScalar: any;
};

export type ActivateOrganization = {
    __typename?: 'ActivateOrganization';
    success?: Maybe<Scalars['Boolean']>;
    organization?: Maybe<Organization>;
};

export type ActivateUser = {
    __typename?: 'ActivateUser';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
};

export type AddCompanyToWatchlist = {
    __typename?: 'AddCompanyToWatchlist';
    success?: Maybe<Scalars['Boolean']>;
    watchlist?: Maybe<Watchlist>;
    company?: Maybe<Company>;
};

export type AddDashboardToSection = {
    __typename?: 'AddDashboardToSection';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created section */
    dashboardSection?: Maybe<DashboardSection>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type AddDefaultEquityFinancialKpi = {
    __typename?: 'AddDefaultEquityFinancialKPI';
    success?: Maybe<Scalars['Boolean']>;
};

export type AddEquityToEventRealtimeNotificationScope = {
    __typename?: 'AddEquityToEventRealtimeNotificationScope';
    success?: Maybe<Scalars['Boolean']>;
    preferences?: Maybe<GlobalRealtimeNotificationPreferences>;
};

export type AddEquityToWatchlist = {
    __typename?: 'AddEquityToWatchlist';
    success?: Maybe<Scalars['Boolean']>;
    watchlist?: Maybe<Watchlist>;
    equity?: Maybe<Equity>;
};

export type AddUserFinancialKpi = {
    __typename?: 'AddUserFinancialKPI';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
    equity?: Maybe<Equity>;
    event?: Maybe<ScheduledAudioCall>;
};

export type AddWatchlistToEventRealtimeNotificationScope = {
    __typename?: 'AddWatchlistToEventRealtimeNotificationScope';
    success?: Maybe<Scalars['Boolean']>;
    preferences?: Maybe<GlobalRealtimeNotificationPreferences>;
};

export type ApiConfiguration = {
    __typename?: 'ApiConfiguration';
    schedule?: Maybe<Scalars['String']>;
    idField?: Maybe<Scalars['String']>;
    tickerField?: Maybe<Scalars['String']>;
    dateField?: Maybe<Scalars['String']>;
    groupingField?: Maybe<Scalars['String']>;
    orderBy?: Maybe<Scalars['String']>;
    filter?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type ApiConfigurationInput = {
    schedule?: Maybe<Scalars['String']>;
    idField?: Maybe<Scalars['String']>;
    tickerField?: Maybe<Scalars['String']>;
    dateField?: Maybe<Scalars['String']>;
    groupingField?: Maybe<Scalars['String']>;
    orderBy?: Maybe<Scalars['String']>;
    filter?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type ArchiveBookmarks = {
    __typename?: 'ArchiveBookmarks';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    affectedTargets?: Maybe<Array<Maybe<BookmarkTarget>>>;
    archived?: Maybe<Array<Maybe<Bookmark>>>;
};

export type AssetClass = {
    __typename?: 'AssetClass';
    name: Scalars['String'];
    description: Scalars['String'];
    parent?: Maybe<AssetClass>;
    id?: Maybe<Scalars['ID']>;
};

export type AssetPurchaseSpotlightContent = Content & {
    __typename?: 'AssetPurchaseSpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
};

export type AssetPurchaseSpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type AssetPurchaseSpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type AssetPurchaseSpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type AssetPurchaseSpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type Attachment = {
    __typename?: 'Attachment';
    title?: Maybe<Scalars['String']>;
    mimeType?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
    archivedUrl?: Maybe<Scalars['String']>;
};

export type BaseStreamRule = {
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
};

export type BasicTemplateConfiguration = {
    __typename?: 'BasicTemplateConfiguration';
    date?: Maybe<Scalars['String']>;
    title?: Maybe<Scalars['String']>;
    subtitle?: Maybe<Scalars['String']>;
    topRight?: Maybe<Scalars['String']>;
    bottomRight?: Maybe<Scalars['String']>;
    body?: Maybe<Scalars['String']>;
    bodyRaw?: Maybe<Scalars['Boolean']>;
    fullPageBody?: Maybe<Scalars['String']>;
    fullPageBodyCss?: Maybe<Scalars['String']>;
    ticker?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type BasicTemplateConfigurationInput = {
    date?: Maybe<Scalars['String']>;
    title?: Maybe<Scalars['String']>;
    subtitle?: Maybe<Scalars['String']>;
    topRight?: Maybe<Scalars['String']>;
    bottomRight?: Maybe<Scalars['String']>;
    body?: Maybe<Scalars['String']>;
    bodyRaw?: Maybe<Scalars['Boolean']>;
    fullPageBody?: Maybe<Scalars['String']>;
    fullPageBodyCss?: Maybe<Scalars['String']>;
    ticker?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type BillingAddressInput = {
    /** Address line 1 (e.g., street, PO Box, or company name) */
    streetLine1: Scalars['String'];
    /** Address line 2 (e.g., apartment, suite, unit, or building) */
    streetLine2?: Maybe<Scalars['String']>;
    /** City, district, suburb, town, or village */
    city: Scalars['String'];
    /** State, county, province, or region */
    stateProvinceRegion: Scalars['String'];
    /** ZIP or postal code */
    postalCode: Scalars['String'];
    /** Two-letter country code */
    countryCode?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum BillingInterval {
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Year = 'year',
}

export type BillingInvoice = {
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    periodStart?: Maybe<Scalars['DateTime']>;
    periodEnd?: Maybe<Scalars['DateTime']>;
    subtotal?: Maybe<Scalars['Int']>;
    tax?: Maybe<Scalars['Int']>;
    taxRate?: Maybe<Scalars['Float']>;
    total?: Maybe<Scalars['Int']>;
    pdfUrl?: Maybe<Scalars['String']>;
    currency?: Maybe<Currency>;
    lines?: Maybe<Array<Maybe<BillingInvoiceLineItem>>>;
};

export type BillingInvoiceLineItem = {
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    periodStart?: Maybe<Scalars['DateTime']>;
    periodEnd?: Maybe<Scalars['DateTime']>;
    amount?: Maybe<Scalars['Int']>;
    description?: Maybe<Scalars['String']>;
    quantity?: Maybe<Scalars['Int']>;
    currency?: Maybe<Currency>;
    price?: Maybe<BillingProductPrice>;
};

export type BillingProduct = {
    __typename?: 'BillingProduct';
    billingProductId: Scalars['ID'];
    /** The type of product */
    type?: Maybe<BillingProductType>;
    /** The user-facing name of the product */
    name?: Maybe<Scalars['String']>;
    /** A short user-facing description of the product */
    description?: Maybe<Scalars['String']>;
    /** An list of marketing features for this product */
    features?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** A marketing monthly MSRP in cents */
    msrp?: Maybe<Scalars['Int']>;
    /** The description of the quantity unit (ex: seat) */
    unitLabel?: Maybe<Scalars['String']>;
    roleId?: Maybe<Scalars['ID']>;
    /** Whether this product is currently available to new users */
    isActive?: Maybe<Scalars['Boolean']>;
    /** The available prices for this product */
    prices?: Maybe<Array<Maybe<BillingProductPrice>>>;
    id?: Maybe<Scalars['ID']>;
};

export type BillingProductPrice = {
    __typename?: 'BillingProductPrice';
    billingProductPriceId: Scalars['ID'];
    billingProductId: Scalars['ID'];
    /** Whether this price is currently available to new users */
    isActive?: Maybe<Scalars['Boolean']>;
    currencyCode: Scalars['String'];
    /** The price of the product per unit in cents */
    unitAmount?: Maybe<Scalars['Int']>;
    /** The frequency at which this price is billed */
    interval?: Maybe<BillingInterval>;
    /** The number of intervals between billings */
    intervalCount?: Maybe<Scalars['Int']>;
    /** How many days before the first billing */
    trialPeriodDays?: Maybe<Scalars['Int']>;
    /** The product to which this price applies */
    product?: Maybe<BillingProduct>;
    /** The currency of the price */
    currency?: Maybe<Currency>;
    id?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum BillingProductType {
    Service = 'service',
    Good = 'good',
}

/** An enumeration. */
export enum BillingSource {
    Manual = 'manual',
    StripeLive = 'stripe_live',
    StripeTest = 'stripe_test',
}

export type BillingSubscription = {
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    currentPeriodEnd?: Maybe<Scalars['DateTime']>;
    currentPeriodStart?: Maybe<Scalars['DateTime']>;
    trialStart?: Maybe<Scalars['DateTime']>;
    trialEnd?: Maybe<Scalars['DateTime']>;
    status?: Maybe<SubscriptionStatus>;
    /** The frequency at which all this subscription's prices (and by extension, the whole subscription itself) are billed. */
    interval?: Maybe<BillingInterval>;
    /** The number of intervals between billings for all this subscription's prices (and by extension, the whole subscription itself). */
    intervalCount?: Maybe<Scalars['Int']>;
    upcomingInvoice?: Maybe<BillingInvoice>;
    items?: Maybe<Array<Maybe<BillingSubscriptionItem>>>;
    paymentMethod?: Maybe<PaymentMethod>;
};

export type BillingSubscriptionItem = {
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    /** The quantity of the attached price.  (Ex: the # of seats at this tier/price) */
    quantity?: Maybe<Scalars['Int']>;
    price?: Maybe<BillingProductPrice>;
};

export type Bookmark = {
    __typename?: 'Bookmark';
    bookmarkId: Scalars['ID'];
    mainVersionId?: Maybe<Scalars['ID']>;
    userId: Scalars['ID'];
    targetType?: Maybe<BookmarkTargetType>;
    targetId: Scalars['ID'];
    targetEndId?: Maybe<Scalars['ID']>;
    groupingId?: Maybe<Scalars['ID']>;
    targetOffset?: Maybe<Scalars['Int']>;
    targetEndOffset?: Maybe<Scalars['Int']>;
    targetEquityId?: Maybe<Scalars['ID']>;
    targetStreamId?: Maybe<Scalars['ID']>;
    highlight?: Maybe<Scalars['String']>;
    highlightHash?: Maybe<Scalars['String']>;
    highlightColor?: Maybe<Scalars['String']>;
    note?: Maybe<Scalars['String']>;
    tags?: Maybe<Scalars['GenericScalar']>;
    equityIds?: Maybe<Scalars['GenericScalar']>;
    reminder?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    status?: Maybe<BookmarkStatus>;
    shared: Scalars['Boolean'];
    created: Scalars['DateTimeDefaultTimezone'];
    modified: Scalars['DateTimeDefaultTimezone'];
    user?: Maybe<User>;
    id?: Maybe<Scalars['ID']>;
    target?: Maybe<BookmarkTarget>;
    equities?: Maybe<Array<Maybe<Equity>>>;
};

/** An enumeration. */
export enum BookmarkStatus {
    Active = 'active',
    Superseded = 'superseded',
    Archived = 'archived',
    Deleted = 'deleted',
}

export type BookmarkStream = Stream & {
    __typename?: 'BookmarkStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type BookmarkStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type BookmarkStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type BookmarkStreamMatch = StreamMatch & {
    __typename?: 'BookmarkStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<BookmarkStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
};

export type BookmarkStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type BookmarkTag = {
    __typename?: 'BookmarkTag';
    tag?: Maybe<Scalars['String']>;
    count?: Maybe<Scalars['Int']>;
};

export type BookmarkTagsFilter = {
    scopes?: Maybe<Array<Maybe<Scalars['String']>>>;
    search?: Maybe<Scalars['String']>;
    companyId?: Maybe<Scalars['ID']>;
    equityId?: Maybe<Scalars['ID']>;
    eventId?: Maybe<Scalars['ID']>;
    dashboardId?: Maybe<Scalars['ID']>;
};

export type BookmarkTarget =
    | ScheduledAudioCall
    | ScheduledAudioCallEvent
    | StreetAccountContent
    | NewsContent
    | FilingContent
    | PartnershipSpotlightContent
    | AssetPurchaseSpotlightContent
    | BuybackSpotlightContent
    | GuidanceSpotlightContent
    | SalesMetricSpotlightContent
    | MAndASpotlightContent
    | SpinOffSpotlightContent
    | IpoSpotlightContent
    | DocumentContent;

/** An enumeration. */
export enum BookmarkTargetType {
    Event = 'event',
    Transcript = 'transcript',
    Content = 'content',
}

export type BookmarksFilter = {
    bookmarkIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type BulkUpdateUserObjectSettings = {
    __typename?: 'BulkUpdateUserObjectSettings';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    settings?: Maybe<Array<Maybe<UserObjectSettings>>>;
};

export type BuybackSpotlightContent = Content & {
    __typename?: 'BuybackSpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    buybackType?: Maybe<Scalars['String']>;
    buybackPurpose?: Maybe<Scalars['String']>;
    offerType?: Maybe<Scalars['String']>;
};

export type BuybackSpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type BuybackSpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type BuybackSpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type BuybackSpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

/** An enumeration. */
export enum CallProviderInput {
    Gridspace = 'gridspace',
    Twilio = 'twilio',
}

export type CancelSubscription = {
    __typename?: 'CancelSubscription';
    success?: Maybe<Scalars['Boolean']>;
    subscription?: Maybe<BillingSubscription>;
};

export type Category = {
    __typename?: 'Category';
    categoryId: Scalars['ID'];
    shortName: Scalars['String'];
    displayName: Scalars['String'];
    id?: Maybe<Scalars['ID']>;
};

export type CleanupDashboard = {
    __typename?: 'CleanupDashboard';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
    /** Returns the dashboard that was cleaned up */
    dashboard?: Maybe<Dashboard>;
};

export type ClearWebcastMarkers = {
    __typename?: 'ClearWebcastMarkers';
    success?: Maybe<Scalars['Boolean']>;
};

export type CloneDashboard = {
    __typename?: 'CloneDashboard';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The cloned dashboard */
    dashboard?: Maybe<Dashboard>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type CloneDashboards = {
    __typename?: 'CloneDashboards';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The cloned dashboards */
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type Code = {
    __typename?: 'Code';
    codeId: Scalars['ID'];
    code: Scalars['String'];
    codeType: CodeType;
    properties?: Maybe<Scalars['GenericScalar']>;
    userId?: Maybe<Scalars['ID']>;
    organizationId?: Maybe<Scalars['ID']>;
    expires?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    created: Scalars['DateTimeDefaultTimezone'];
    user?: Maybe<User>;
    organization?: Maybe<Organization>;
    id?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum CodeType {
    Register = 'register',
    VerifyEmail = 'verify_email',
    Invite = 'invite',
    InviteUser = 'invite_user',
}

export type CommitDataCollection = {
    __typename?: 'CommitDataCollection';
    success?: Maybe<Scalars['Boolean']>;
    dataCollection?: Maybe<DataCollection>;
};

export type CommitStreamMatchTemplate = {
    __typename?: 'CommitStreamMatchTemplate';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    template?: Maybe<StreamMatchTemplate>;
};

export type Company = {
    __typename?: 'Company';
    guid: Scalars['String'];
    legalName: Scalars['String'];
    commonName: Scalars['String'];
    ownership: CompanyOwnership;
    lei?: Maybe<Scalars['String']>;
    cik?: Maybe<Scalars['String']>;
    spacStatus: SpacStatus;
    spacTarget?: Maybe<Scalars['String']>;
    description?: Maybe<Scalars['String']>;
    instruments?: Maybe<Array<Maybe<Instrument>>>;
    primaryInstrument?: Maybe<Instrument>;
    quotes?: Maybe<Array<Maybe<Quote>>>;
    gicsSubSector?: Maybe<GicsSubSector>;
    incorporatedCountry?: Maybe<Country>;
    domiciledCountry?: Maybe<Country>;
    id?: Maybe<Scalars['ID']>;
    shortGuid?: Maybe<Scalars['String']>;
    topicsReport?: Maybe<CompanyTopicReport>;
    /** A URL to the company's homepage */
    url?: Maybe<Scalars['String']>;
    /** A URL to an icon of the company's logo */
    iconUrl?: Maybe<Scalars['String']>;
    /** Any events associated with this company that are currently live */
    liveEvents?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** The next upcoming earnings event */
    nextEarnings?: Maybe<ScheduledAudioCall>;
    /** The most recent earnings event */
    lastEarnings?: Maybe<ScheduledAudioCall>;
    /** The most recent public event */
    lastEvent?: Maybe<ScheduledAudioCall>;
    /** Company rollup statistics */
    statistics?: Maybe<CompanyStatistics>;
    /** Financials for this company */
    financials?: Maybe<Array<Maybe<CompanyFinancial>>>;
    /** Fundamentals for this company */
    fundamentals?: Maybe<CompanyFundamentals>;
    /** Valuations for this company */
    valuations?: Maybe<Array<Maybe<CompanyValuation>>>;
    watchlists?: Maybe<Array<Maybe<Watchlist>>>;
};

export type CompanyTopicsReportArgs = {
    filter?: Maybe<CompanyTopicFilter>;
};

export type CompanyLastEarningsArgs = {
    withAudio?: Maybe<Scalars['Boolean']>;
};

export type CompanyLastEventArgs = {
    withAudio?: Maybe<Scalars['Boolean']>;
};

export type CompanyFinancial = {
    __typename?: 'CompanyFinancial';
    key?: Maybe<Scalars['String']>;
    title?: Maybe<Scalars['String']>;
    format?: Maybe<Scalars['String']>;
    displayUnits?: Maybe<Scalars['Int']>;
    category?: Maybe<Scalars['String']>;
    section?: Maybe<Scalars['String']>;
    subsection?: Maybe<Scalars['String']>;
    ordering?: Maybe<Scalars['Int']>;
    currency?: Maybe<Currency>;
    values?: Maybe<Array<Maybe<CompanyFinancialValue>>>;
    consensuses?: Maybe<Array<Maybe<CompanyFinancialValue>>>;
    actuals?: Maybe<Array<Maybe<CompanyFinancialValue>>>;
};

export type CompanyFinancialValue = {
    __typename?: 'CompanyFinancialValue';
    key?: Maybe<Scalars['String']>;
    type?: Maybe<Scalars['String']>;
    date?: Maybe<Scalars['Date']>;
    year?: Maybe<Scalars['Int']>;
    quarter?: Maybe<Scalars['Int']>;
    value?: Maybe<Scalars['Float']>;
};

export type CompanyFundamentals = {
    __typename?: 'CompanyFundamentals';
    fiftyTwoWeekLow?: Maybe<Scalars['Float']>;
    fiftyTwoWeekHigh?: Maybe<Scalars['Float']>;
    pulled: Scalars['DateTimeDefaultTimezone'];
    marketcap?: Maybe<Scalars['Float']>;
    dividend?: Maybe<Scalars['Float']>;
    employees?: Maybe<Scalars['Float']>;
    splitRatio?: Maybe<Scalars['Float']>;
    totalDebt?: Maybe<Scalars['Float']>;
    preferredStock?: Maybe<Scalars['Float']>;
    minorityInvestments?: Maybe<Scalars['Float']>;
    cashAndEquivalents?: Maybe<Scalars['Float']>;
    id?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum CompanyOwnership {
    Public = 'public',
    Private = 'private',
}

export type CompanyStatistics = {
    __typename?: 'CompanyStatistics';
    /** Statistics representing counts for the interval today */
    newToday?: Maybe<IntervalStatistics>;
};

export type CompanyStream = Stream & {
    __typename?: 'CompanyStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type CompanyStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type CompanyStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type CompanyStreamMatch = StreamMatch & {
    __typename?: 'CompanyStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<CompanyStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    company?: Maybe<Company>;
};

export type CompanyStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type CompanyTopicFilter = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
    /** Filter to topics for the selected call types */
    callTypes?: Maybe<Array<Maybe<ScheduledAudioCallTypes>>>;
};

export type CompanyTopicReport = {
    __typename?: 'CompanyTopicReport';
    topics?: Maybe<Array<Maybe<TopicReport>>>;
};

export type CompanyValuation = {
    __typename?: 'CompanyValuation';
    metric: Scalars['String'];
    trailingTwelveMonths?: Maybe<Scalars['Float']>;
    nextTwelveMonths?: Maybe<Scalars['Float']>;
    currentYear?: Maybe<Scalars['Float']>;
    nextYear?: Maybe<Scalars['Float']>;
    label?: Maybe<Scalars['String']>;
    format?: Maybe<Scalars['String']>;
    section?: Maybe<Scalars['String']>;
    subsection?: Maybe<Scalars['String']>;
    ordering?: Maybe<Scalars['Int']>;
};

export type Conference = EventGroup & {
    __typename?: 'Conference';
    year?: Maybe<Scalars['Int']>;
    hostEquity?: Maybe<Equity>;
    id?: Maybe<Scalars['ID']>;
    title?: Maybe<Scalars['String']>;
    promoted?: Maybe<Scalars['Boolean']>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    firstEvent?: Maybe<ScheduledAudioCall>;
    lastEvent?: Maybe<ScheduledAudioCall>;
    start?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    end?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    numEvents?: Maybe<Scalars['Int']>;
    equities?: Maybe<Array<Maybe<Equity>>>;
};

export type Content = {
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
};

export type ContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type ContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type ContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type ContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type ContentFilter = {
    /** A set of content IDs to retrieve */
    contentIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Content types to restrict results to */
    contentTypes?: Maybe<Array<Maybe<ContentType>>>;
};

export type ContentIssue = Issue & {
    __typename?: 'ContentIssue';
    content?: Maybe<Content>;
    id?: Maybe<Scalars['ID']>;
    raisingUser?: Maybe<User>;
    resolvingUser?: Maybe<User>;
    issueStatus?: Maybe<IssueStatus>;
    issueText?: Maybe<Scalars['String']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    issueCategory?: Maybe<ContentIssueCategory>;
};

/** An enumeration. */
export enum ContentIssueCategory {
    Text = 'text',
    EquityMapping = 'equity_mapping',
    Other = 'other',
}

export type ContentIssueInput = {
    /** The issue text */
    issueText: Scalars['String'];
    /** The content item with an issue */
    contentId: Scalars['ID'];
    /** The type of issue */
    issueCategory: ContentIssueCategory;
};

export type ContentNotificationMessage = {
    __typename?: 'ContentNotificationMessage';
    numMentions?: Maybe<Scalars['Int']>;
    numMentionsChangePercent?: Maybe<Scalars['Float']>;
    period?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum ContentSource {
    Streetaccount = 'streetaccount',
    Lexisnexis = 'lexisnexis',
    Refinitiv = 'refinitiv',
    Eventvestor = 'eventvestor',
    User = 'user',
}

export type ContentStream = Stream & {
    __typename?: 'ContentStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type ContentStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type ContentStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type ContentStreamMatch = StreamMatch & {
    __typename?: 'ContentStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<ContentStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    contentId?: Maybe<Scalars['Int']>;
    content?: Maybe<Content>;
};

export type ContentStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type ContentStreamsFilter = {
    userStreams?: Maybe<Scalars['Boolean']>;
    quicklinkStreams?: Maybe<Scalars['Boolean']>;
};

/** An enumeration. */
export enum ContentType {
    Streetaccount = 'streetaccount',
    News = 'news',
    Filing = 'filing',
    Spotlight = 'spotlight',
    Document = 'document',
}

export type Country = {
    __typename?: 'Country';
    /** ISO 2-char code (PK) */
    countryCode: Scalars['String'];
    /** ISO 3-char code */
    countryCode3: Scalars['String'];
    /** The country's colloquial name */
    shortName: Scalars['String'];
    /** The country's full legal name */
    legalName: Scalars['String'];
    id?: Maybe<Scalars['ID']>;
};

export type CountryCodeStreamRule = BaseStreamRule & {
    __typename?: 'CountryCodeStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    country?: Maybe<Country>;
};

export type CreateBookmark = {
    __typename?: 'CreateBookmark';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    affectedTargets?: Maybe<Array<Maybe<BookmarkTarget>>>;
    bookmark?: Maybe<Bookmark>;
};

export type CreateBookmarkInput = {
    targetType: BookmarkTargetType;
    targetId: Scalars['ID'];
    targetEndId?: Maybe<Scalars['ID']>;
    targetOffset?: Maybe<Scalars['Int']>;
    targetEndOffset?: Maybe<Scalars['Int']>;
    targetStreamId?: Maybe<Scalars['ID']>;
    highlight?: Maybe<Scalars['String']>;
    highlightColor?: Maybe<Scalars['String']>;
    note?: Maybe<Scalars['String']>;
    /** List of tags to associate to the bookmark */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** List of equities to associate to the bookmark */
    equityIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    reminder?: Maybe<Scalars['DateTime']>;
    shared?: Maybe<Scalars['Boolean']>;
};

export type CreateDashboard = {
    __typename?: 'CreateDashboard';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created dashboard */
    dashboard?: Maybe<Dashboard>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type CreateDashboardInput = {
    /** The name of the dashboard */
    name?: Maybe<Scalars['String']>;
    /** Dashboard preferences */
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    /** Categories */
    categories?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** Tags */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    rules?: Maybe<Array<Maybe<StreamRuleInput>>>;
    searchable?: Maybe<Scalars['Boolean']>;
    /** The description of the dashboard */
    description?: Maybe<Scalars['String']>;
    galleryRules?: Maybe<Array<Maybe<StreamRuleInput>>>;
    /** Stream ids to be added to the dashboard */
    streamIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** The section to add the dashboard to */
    sectionId?: Maybe<Scalars['ID']>;
};

export type CreateDashboardSection = {
    __typename?: 'CreateDashboardSection';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created section */
    dashboardSection?: Maybe<DashboardSection>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type CreateDataCollection = {
    __typename?: 'CreateDataCollection';
    success?: Maybe<Scalars['Boolean']>;
    dataCollection?: Maybe<DataCollection>;
};

export type CreateEvent = {
    __typename?: 'CreateEvent';
    success?: Maybe<Scalars['Boolean']>;
    /** Newly created event */
    event?: Maybe<ScheduledAudioCall>;
};

export type CreateEventInput = {
    /** Event datetime */
    date: Scalars['DateTime'];
    /** Event title */
    title: Scalars['String'];
    /** Optional equity_id for the event */
    equityId?: Maybe<Scalars['ID']>;
    /** Webcast url */
    broadcastUrl?: Maybe<Scalars['String']>;
    callProvider?: Maybe<CallProviderInput>;
    streamProvider?: Maybe<StreamProviderInput>;
    /** List of event groups with which to associate this event */
    eventGroupIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type CreateNotification = {
    __typename?: 'CreateNotification';
    success?: Maybe<Scalars['Boolean']>;
    notification?: Maybe<Notification>;
};

export type CreateOntologyNode = {
    __typename?: 'CreateOntologyNode';
    success?: Maybe<Scalars['Boolean']>;
};

export type CreateOrganizationInviteCode = {
    __typename?: 'CreateOrganizationInviteCode';
    success?: Maybe<Scalars['Boolean']>;
    code?: Maybe<Scalars['String']>;
};

export type CreatePrivateRecording = {
    __typename?: 'CreatePrivateRecording';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    privateRecording?: Maybe<PrivateRecording>;
    event?: Maybe<ScheduledAudioCall>;
};

export type CreatePrivateRecordingInput = {
    title: Scalars['String'];
    /** List of tags to associate to the bookmark */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** List of equities to associate to the bookmark */
    equityIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** List of event groups with which to associate this event */
    eventGroupIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    connectionType: PrConnectionType;
    connectPhoneNumber?: Maybe<Scalars['String']>;
    connectAccessId?: Maybe<Scalars['String']>;
    connectPin?: Maybe<Scalars['String']>;
    connectUrl?: Maybe<Scalars['String']>;
    connectOffsetSeconds?: Maybe<Scalars['Int']>;
    onConnectDialNumber?: Maybe<Scalars['String']>;
    smsAlertBeforeCall?: Maybe<Scalars['Boolean']>;
    scheduledFor?: Maybe<Scalars['DateTime']>;
    localeCode?: Maybe<Scalars['String']>;
    onFailure?: Maybe<PrOnFailure>;
    onFailureDialNumber?: Maybe<Scalars['String']>;
    onFailureSmsNumber?: Maybe<Scalars['String']>;
    onFailureInstructions?: Maybe<Scalars['String']>;
    onCompleteEmailCreator?: Maybe<Scalars['Boolean']>;
};

export type CreateStream = {
    __typename?: 'CreateStream';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created stream */
    stream?: Maybe<Stream>;
};

export type CreateStreamMatchTemplate = {
    __typename?: 'CreateStreamMatchTemplate';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created stream_match_template */
    template?: Maybe<StreamMatchTemplate>;
};

export type CreateTrackedTermInput = {
    /** The search string */
    term: Scalars['String'];
    /** ID of the event to add the tracking term to */
    eventId?: Maybe<Scalars['ID']>;
    /** Equities to scope the term to */
    equityIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Sectors to scope the search to */
    gicsSectorIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Sub-sectors to scope the search to */
    gicsSubSectorIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Synonyms */
    synonyms?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** Create a new watchlist. The list will be associated with the current user.  */
export type CreateWatchlist = {
    __typename?: 'CreateWatchlist';
    success?: Maybe<Scalars['Boolean']>;
    watchlist?: Maybe<Watchlist>;
};

/** An enumeration. */
export enum CreditCardBrand {
    Amex = 'amex',
    Diners = 'diners',
    Discover = 'discover',
    Jcb = 'jcb',
    Mastercard = 'mastercard',
    Unionpay = 'unionpay',
    Visa = 'visa',
}

export type CsvConfiguration = {
    __typename?: 'CsvConfiguration';
    schedule?: Maybe<Scalars['String']>;
    idField?: Maybe<Scalars['String']>;
    tickerField?: Maybe<Scalars['String']>;
    dateField?: Maybe<Scalars['String']>;
    groupingField?: Maybe<Scalars['String']>;
    orderBy?: Maybe<Scalars['String']>;
    filter?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type CsvConfigurationInput = {
    schedule?: Maybe<Scalars['String']>;
    idField?: Maybe<Scalars['String']>;
    tickerField?: Maybe<Scalars['String']>;
    dateField?: Maybe<Scalars['String']>;
    groupingField?: Maybe<Scalars['String']>;
    orderBy?: Maybe<Scalars['String']>;
    filter?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type Currency = {
    __typename?: 'Currency';
    /** ISO 3-char code (PK) */
    currencyCode: Scalars['String'];
    /** The currency's full name */
    name: Scalars['String'];
    /** The currency's singular unit name (e.g. dollar) */
    unitName: Scalars['String'];
    /** The country's plural unit name (e.g. dollars) */
    unitNamePlural?: Maybe<Scalars['String']>;
    /** The country's singular minor unit name, if any (e.g. cent */
    minorUnitName?: Maybe<Scalars['String']>;
    /** The country's plural minor unit name, if any (e.g. cents */
    minorUnitNamePlural?: Maybe<Scalars['String']>;
    /** How many digits are displayed after the decimal, if any */
    exponent: Scalars['Int'];
    /** The currency's symbol (e.g. $) */
    symbol?: Maybe<Scalars['String']>;
    /** The currency's minor unit symbol (e.g. ¢ */
    minorSymbol?: Maybe<Scalars['String']>;
    /** Whether to prefix (true) or postfix (false) the currency's symbol */
    symbolPrefix: Scalars['Boolean'];
    /** Whether to prefix (true) or postfix (false) the currency's minor symbol */
    minorSymbolPrefix: Scalars['Boolean'];
    id?: Maybe<Scalars['ID']>;
};

export type CustomDataStream = Stream & {
    __typename?: 'CustomDataStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type CustomDataStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type CustomDataStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type CustomDataStreamMatch = StreamMatch & {
    __typename?: 'CustomDataStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<StreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    record?: Maybe<DataCollectionRecord>;
};

export type CustomDataStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type Dashboard = {
    __typename?: 'Dashboard';
    name: Scalars['String'];
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['ID']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created: Scalars['DateTimeDefaultTimezone'];
    modified: Scalars['DateTimeDefaultTimezone'];
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    deleted: Scalars['Boolean'];
    dashboardId: Scalars['ID'];
    dashboardGuid?: Maybe<Scalars['String']>;
    dashboardKey?: Maybe<Scalars['String']>;
    dashboardType: DashboardType;
    description?: Maybe<Scalars['String']>;
    starred?: Maybe<Scalars['Boolean']>;
    equityId?: Maybe<Scalars['ID']>;
    eventGroupId?: Maybe<Scalars['ID']>;
    galleryScopeId?: Maybe<Scalars['ID']>;
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    streams?: Maybe<Array<Maybe<Stream>>>;
    galleryScope?: Maybe<Watchlist>;
    equity?: Maybe<Equity>;
    eventGroup?: Maybe<EventGroup>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    report?: Maybe<DashboardReport>;
    galleryRules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    referencedEquities?: Maybe<Array<Maybe<EquityAggregation>>>;
    relatedBookmarks?: Maybe<Array<Maybe<BookmarkStreamMatch>>>;
    referencedEntities?: Maybe<Array<Maybe<EntityAggregation>>>;
    recommended?: Maybe<Scalars['Boolean']>;
    ownedByCurrentUser?: Maybe<Scalars['Boolean']>;
    capabilities?: Maybe<Array<Maybe<Scalars['String']>>>;
    categories?: Maybe<Array<Maybe<Scalars['String']>>>;
    numLiveEvents?: Maybe<Scalars['Int']>;
    clonedToId?: Maybe<Scalars['ID']>;
};

export type DashboardUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type DashboardReportArgs = {
    filter?: Maybe<DashboardReportFilter>;
};

export type DashboardReferencedEquitiesArgs = {
    filter?: Maybe<StreamMatchFilter>;
};

export type DashboardRelatedBookmarksArgs = {
    filter?: Maybe<StreamMatchFilter>;
    scope?: Maybe<Scalars['String']>;
    fromIndex?: Maybe<Scalars['Int']>;
    size?: Maybe<Scalars['Int']>;
};

export type DashboardReferencedEntitiesArgs = {
    filter?: Maybe<StreamMatchFilter>;
};

export type DashboardGalleryTag = {
    __typename?: 'DashboardGalleryTag';
    tag?: Maybe<Scalars['String']>;
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
};

export type DashboardReport = {
    __typename?: 'DashboardReport';
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
    dashboard?: Maybe<Dashboard>;
};

export type DashboardReportFilter = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
};

export type DashboardRollupStreamMatch = StreamMatch & {
    __typename?: 'DashboardRollupStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<StreamRollupStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    dashboard?: Maybe<Dashboard>;
    total?: Maybe<Scalars['Int']>;
};

export type DashboardRollupStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type DashboardSection = {
    __typename?: 'DashboardSection';
    sectionId: Scalars['ID'];
    userId: Scalars['ID'];
    name: Scalars['String'];
    position: Scalars['Int'];
    open: Scalars['Boolean'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    id?: Maybe<Scalars['ID']>;
};

export type DashboardSectionInput = {
    /** The name of the section */
    name: Scalars['String'];
    /** The position of the section */
    position?: Maybe<Scalars['Int']>;
};

export type DashboardStream = Stream & {
    __typename?: 'DashboardStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type DashboardStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type DashboardStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type DashboardStreamMatch = StreamMatch & {
    __typename?: 'DashboardStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<DashboardStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    dashboardId?: Maybe<Scalars['Int']>;
    dashboard?: Maybe<Dashboard>;
};

export type DashboardStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

/** An enumeration. */
export enum DashboardType {
    Default = 'default',
    Equity = 'equity',
    EventGroup = 'event_group',
}

export type DashboardsFilter = {
    dashboardIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    equityId?: Maybe<Scalars['ID']>;
    eventGroupId?: Maybe<Scalars['ID']>;
    recommended?: Maybe<Scalars['Boolean']>;
    recentlyAccessed?: Maybe<Scalars['Boolean']>;
    size?: Maybe<Scalars['Int']>;
    capabilities?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DataCollection = {
    __typename?: 'DataCollection';
    dataCollectionId: Scalars['ID'];
    organizationId: Scalars['ID'];
    collectionType?: Maybe<DataCollectionType>;
    name?: Maybe<Scalars['String']>;
    configuration?: Maybe<DataCollectionConfiguration>;
    schedule?: Maybe<Scalars['GenericScalar']>;
    status: DataCollectionStatus;
    processingStatus: DataCollectionProcessingStatus;
    processingStatusMessage?: Maybe<Scalars['String']>;
    lastProcessed?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    previousVersionId?: Maybe<Scalars['ID']>;
    created: Scalars['DateTimeDefaultTimezone'];
    id?: Maybe<Scalars['ID']>;
    records?: Maybe<Array<Maybe<DataCollectionRecord>>>;
    sample?: Maybe<Array<Maybe<DataCollectionRecord>>>;
};

export type DataCollectionRecordsArgs = {
    dataRecordId: Scalars['ID'];
};

export type DataCollectionConfiguration = GSheetConfiguration | CsvConfiguration | ApiConfiguration | ViewConfiguration;

export type DataCollectionField = {
    __typename?: 'DataCollectionField';
    name?: Maybe<Scalars['String']>;
    value?: Maybe<Scalars['GenericScalar']>;
    period?: Maybe<Scalars['String']>;
    formatted?: Maybe<Scalars['GenericScalar']>;
};

export type DataCollectionInput = {
    name: Scalars['String'];
    collectionType?: Maybe<DataCollectionType>;
    gsheetConfiguration?: Maybe<GSheetConfigurationInput>;
    csvConfiguration?: Maybe<CsvConfigurationInput>;
    apiConfiguration?: Maybe<ApiConfigurationInput>;
    viewConfiguration?: Maybe<ViewConfigurationInput>;
};

/** An enumeration. */
export enum DataCollectionProcessingStatus {
    None = 'none',
    Processing = 'processing',
    Complete = 'complete',
    Error = 'error',
}

export type DataCollectionRecord = {
    __typename?: 'DataCollectionRecord';
    dataRecordId: Scalars['ID'];
    dataCollectionId: Scalars['ID'];
    organizationId: Scalars['ID'];
    userId?: Maybe<Scalars['ID']>;
    gicsSectorId?: Maybe<Scalars['ID']>;
    gicsSubSectorId?: Maybe<Scalars['ID']>;
    equityId?: Maybe<Scalars['ID']>;
    recordType: Scalars['String'];
    recordPeriod: DataRecordPeriod;
    recordId: Scalars['String'];
    recordOrdering?: Maybe<Scalars['Float']>;
    recordDate?: Maybe<Scalars['String']>;
    recordDatetime?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    recordTicker?: Maybe<Scalars['String']>;
    recordGroupingId?: Maybe<Scalars['String']>;
    record?: Maybe<Array<Maybe<DataCollectionField>>>;
    isLatest: Scalars['Boolean'];
    created: Scalars['DateTimeDefaultTimezone'];
    modified: Scalars['DateTimeDefaultTimezone'];
    equity?: Maybe<Equity>;
    id?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum DataCollectionStatus {
    Temporary = 'temporary',
    Committed = 'committed',
    Deleted = 'deleted',
}

/** An enumeration. */
export enum DataCollectionType {
    Gsheet = 'gsheet',
    Csv = 'csv',
    External = 'external',
    Api = 'api',
    View = 'view',
}

export type DataCollectionsFilter = {
    dataCollectionIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    collectionType?: Maybe<DataCollectionType>;
};

/** An enumeration. */
export enum DataRecordPeriod {
    None = 'none',
    Monthly = 'monthly',
    Daily = 'daily',
}

export type DateRangeFilter = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
};

export type DeactivateOrganization = {
    __typename?: 'DeactivateOrganization';
    success?: Maybe<Scalars['Boolean']>;
    organization?: Maybe<Organization>;
};

export type DeactivateUser = {
    __typename?: 'DeactivateUser';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
};

export type DefaultEquityFinancialKpi = {
    __typename?: 'DefaultEquityFinancialKPI';
    equityFinancialKpiId: Scalars['ID'];
    equityId?: Maybe<Scalars['ID']>;
    termId: Scalars['Int'];
    scope: EquityFinancialKpiScope;
    order: Scalars['Int'];
    equity?: Maybe<Equity>;
    glossaryTerm?: Maybe<FinanceGlossaryTerm>;
    id?: Maybe<Scalars['ID']>;
};

export type DeleteBookmark = {
    __typename?: 'DeleteBookmark';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    affectedTargets?: Maybe<Array<Maybe<BookmarkTarget>>>;
    bookmark?: Maybe<Bookmark>;
};

export type DeleteBookmarks = {
    __typename?: 'DeleteBookmarks';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    affectedTargets?: Maybe<Array<Maybe<BookmarkTarget>>>;
    deleted?: Maybe<Array<Maybe<Bookmark>>>;
};

export type DeleteDashboard = {
    __typename?: 'DeleteDashboard';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type DeleteDashboardSection = {
    __typename?: 'DeleteDashboardSection';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type DeleteDataCollection = {
    __typename?: 'DeleteDataCollection';
    success?: Maybe<Scalars['Boolean']>;
};

export type DeleteDomainConfiguration = {
    __typename?: 'DeleteDomainConfiguration';
    success?: Maybe<Scalars['Boolean']>;
};

export type DeleteEvent = {
    __typename?: 'DeleteEvent';
    success?: Maybe<Scalars['Boolean']>;
    /** Updated event */
    event?: Maybe<ScheduledAudioCall>;
};

export type DeleteEventItem = {
    __typename?: 'DeleteEventItem';
    success?: Maybe<Scalars['Boolean']>;
};

export type DeletePrivateRecording = {
    __typename?: 'DeletePrivateRecording';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    privateRecording?: Maybe<PrivateRecording>;
    event?: Maybe<ScheduledAudioCall>;
};

export type DeleteStream = {
    __typename?: 'DeleteStream';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
};

export type DeleteStreamMatchTemplate = {
    __typename?: 'DeleteStreamMatchTemplate';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
};

export type DeleteWatchlist = {
    __typename?: 'DeleteWatchlist';
    success?: Maybe<Scalars['Boolean']>;
};

export type Differentials = {
    __typename?: 'Differentials';
    event?: Maybe<ScheduledAudioCall>;
    /** Term monitoring differentials */
    monitors?: Maybe<Array<Maybe<MonitorDifferential>>>;
    /** Stream monitoring differentials */
    streams?: Maybe<Array<Maybe<StreamDifferential>>>;
    financials?: Maybe<Array<Maybe<FinancialDifferential>>>;
};

export type DisconnectCall = {
    __typename?: 'DisconnectCall';
    success?: Maybe<Scalars['Boolean']>;
};

export type DisconnectPrivateRecording = {
    __typename?: 'DisconnectPrivateRecording';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    privateRecording?: Maybe<PrivateRecording>;
    event?: Maybe<ScheduledAudioCall>;
};

export type DocumentContent = Content & {
    __typename?: 'DocumentContent';
    documentFormat: DocumentFormat;
    numPages?: Maybe<Scalars['Int']>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
};

export type DocumentContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type DocumentContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type DocumentContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type DocumentContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

/** An enumeration. */
export enum DocumentFormat {
    Pdf = 'pdf',
}

export type DomainConfiguration = {
    __typename?: 'DomainConfiguration';
    domain?: Maybe<Scalars['String']>;
    weight?: Maybe<Scalars['String']>;
    blacklisted?: Maybe<Scalars['Boolean']>;
};

export type DomainConfigurationInput = {
    /** Domain */
    domain: Scalars['String'];
    /** low/normal/high */
    weight?: Maybe<Scalars['String']>;
    /** Is this domain blacklisted */
    blacklisted?: Maybe<Scalars['Boolean']>;
};

export type DomainSource = StreamSource & {
    __typename?: 'DomainSource';
    id?: Maybe<Scalars['ID']>;
    name?: Maybe<Scalars['String']>;
    domain?: Maybe<Scalars['String']>;
};

export type EntityAggregation = {
    __typename?: 'EntityAggregation';
    entityId?: Maybe<Scalars['Int']>;
    entity?: Maybe<EntityTracking>;
    score?: Maybe<Scalars['Int']>;
    total?: Maybe<Scalars['Int']>;
};

export type EntityTracking = {
    __typename?: 'EntityTracking';
    entityId: Scalars['ID'];
    entityType: Scalars['String'];
    entitySpeak: Scalars['String'];
    entityResolve?: Maybe<Scalars['String']>;
    seenCount: Scalars['ID'];
    isHidden: Scalars['Boolean'];
    id?: Maybe<Scalars['ID']>;
};

/** Represents a stock, fund, etc.  */
export type Equity = {
    __typename?: 'Equity';
    fiftyTwoWeekLow?: Maybe<Scalars['Float']>;
    fiftyTwoWeekHigh?: Maybe<Scalars['Float']>;
    /** Primary key */
    equityId: Scalars['ID'];
    quoteId?: Maybe<Scalars['ID']>;
    /** The ticker as used in the local exchange */
    localTicker: Scalars['String'];
    ric?: Maybe<Scalars['String']>;
    isin?: Maybe<Scalars['String']>;
    cusip?: Maybe<Scalars['String']>;
    bloombergRoot?: Maybe<Scalars['String']>;
    exchangeId: Scalars['ID'];
    /** Name of the equity */
    name: Scalars['String'];
    /** Normalized name of the equity */
    commonName?: Maybe<Scalars['String']>;
    /** Search name */
    searchName?: Maybe<Scalars['String']>;
    /** Description of the equity */
    description?: Maybe<Scalars['String']>;
    /** Normalized description of entity */
    commonDescription?: Maybe<Scalars['String']>;
    gicsSectorId?: Maybe<Scalars['Int']>;
    gicsSubSectorId?: Maybe<Scalars['Int']>;
    gicsSubIndustryCode?: Maybe<Scalars['String']>;
    icon?: Maybe<Scalars['String']>;
    countryCode?: Maybe<Scalars['String']>;
    currencyCode?: Maybe<Scalars['String']>;
    /** The next upcoming earnings event */
    nextEarnings?: Maybe<ScheduledAudioCall>;
    last?: Maybe<Scalars['Float']>;
    lastOpen?: Maybe<Scalars['Float']>;
    lastClose?: Maybe<Scalars['Float']>;
    bid?: Maybe<Scalars['Float']>;
    ask?: Maybe<Scalars['Float']>;
    averageDailyVolume?: Maybe<Scalars['Float']>;
    volume?: Maybe<Scalars['Float']>;
    marketcap?: Maybe<Scalars['Float']>;
    pricetoearnings?: Maybe<Scalars['Float']>;
    totalrevenue?: Maybe<Scalars['Float']>;
    totalDebt?: Maybe<Scalars['Float']>;
    preferredStock?: Maybe<Scalars['Float']>;
    minorityInvestments?: Maybe<Scalars['Float']>;
    cashAndEquivalents?: Maybe<Scalars['Float']>;
    status?: Maybe<Equity_Active>;
    modifiedDate: Scalars['DateTimeDefaultTimezone'];
    priceChange?: Maybe<Scalars['String']>;
    priceChangePercent?: Maybe<Scalars['String']>;
    quote?: Maybe<Quote>;
    ohlc?: Maybe<Array<Maybe<EquityOhlc>>>;
    fundamentals?: Maybe<EquityFundamental>;
    gicsSector?: Maybe<GicsSector>;
    gicsSubSector?: Maybe<Sector>;
    currency?: Maybe<Currency>;
    country?: Maybe<Country>;
    exchange?: Maybe<Exchange>;
    valuation?: Maybe<Array<Maybe<EquityValuation>>>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    bloombergExchangeTicker?: Maybe<Scalars['String']>;
    bloombergCompositeTicker?: Maybe<Scalars['String']>;
    /** Whether this equity is active */
    isActive?: Maybe<Scalars['Boolean']>;
    /** Financials for this equity */
    financials?: Maybe<Array<Maybe<Financial>>>;
    isFollowing?: Maybe<Scalars['Boolean']>;
    watchlists?: Maybe<Array<Maybe<Watchlist>>>;
    /** Fetch scheduled audio calls */
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** A list of financial KPIs relevant to this equity */
    financialKpis?: Maybe<Array<Maybe<EquityFinancialKpi>>>;
    /** The current default financial KPIs for this equity */
    defaultFinancialKpis?: Maybe<Array<Maybe<DefaultEquityFinancialKpi>>>;
    /** Recent financial KPI differentials for this equity */
    financialDifferentials?: Maybe<Array<Maybe<FinancialDifferential>>>;
    nextEarningsDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    /** The most recent earnings event */
    lastEarnings?: Maybe<ScheduledAudioCall>;
};

/** Represents a stock, fund, etc.  */
export type EquityOhlcArgs = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
};

/** Represents a stock, fund, etc.  */
export type EquityUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

/** Represents a stock, fund, etc.  */
export type EquityEventsArgs = {
    eventIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    filter?: Maybe<ScheduledAudioCallFilter>;
};

export type EquityAggregation = {
    __typename?: 'EquityAggregation';
    equityId?: Maybe<Scalars['Int']>;
    equity?: Maybe<Equity>;
    score?: Maybe<Scalars['Int']>;
    total?: Maybe<Scalars['Int']>;
};

export type EquityFinancialKpi = {
    __typename?: 'EquityFinancialKPI';
    /** The internal key for this financial KPI */
    key?: Maybe<Scalars['String']>;
    /** The user-facing name of this financial KPI */
    title?: Maybe<Scalars['String']>;
    /** The format of this financial KPI (percentage/currency/etc. */
    format?: Maybe<Scalars['String']>;
    category?: Maybe<Scalars['String']>;
    ordering?: Maybe<Scalars['Int']>;
    synonyms?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** An enumeration. */
export enum EquityFinancialKpiScope {
    Events = 'events',
}

export type EquityFundamental = {
    __typename?: 'EquityFundamental';
    fiftyTwoWeekLow?: Maybe<Scalars['Float']>;
    fiftyTwoWeekHigh?: Maybe<Scalars['Float']>;
    equityId: Scalars['ID'];
    pulled: Scalars['DateTimeDefaultTimezone'];
    beta?: Maybe<Scalars['Float']>;
    volume?: Maybe<Scalars['Float']>;
    averageDailyVolume?: Maybe<Scalars['Float']>;
    pricetoearnings?: Maybe<Scalars['Float']>;
    pricetocurrentyearearnings?: Maybe<Scalars['Float']>;
    pricetocurrentyearrevenue?: Maybe<Scalars['Float']>;
    marketcap?: Maybe<Scalars['Float']>;
    dividend?: Maybe<Scalars['Float']>;
    employees?: Maybe<Scalars['Float']>;
    splitRatio?: Maybe<Scalars['Float']>;
    totalDebt?: Maybe<Scalars['Float']>;
    preferredStock?: Maybe<Scalars['Float']>;
    minorityInvestments?: Maybe<Scalars['Float']>;
    cashAndEquivalents?: Maybe<Scalars['Float']>;
};

export type EquityIdStreamRule = BaseStreamRule & {
    __typename?: 'EquityIdStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    equity?: Maybe<Equity>;
};

export type EquityOhlc = {
    __typename?: 'EquityOhlc';
    equityId: Scalars['ID'];
    quoteId?: Maybe<Scalars['ID']>;
    ticker?: Maybe<Scalars['String']>;
    date: Scalars['String'];
    open: Scalars['Float'];
    close: Scalars['Float'];
    high: Scalars['Float'];
    low: Scalars['Float'];
    volume: Scalars['Float'];
    split: Scalars['Float'];
    dividend: Scalars['Float'];
    adjOpen: Scalars['Float'];
    adjClose: Scalars['Float'];
    adjHigh: Scalars['Float'];
    adjLow: Scalars['Float'];
    adjVolume: Scalars['Float'];
    source: Source;
    equity?: Maybe<Equity>;
    quote?: Maybe<Quote>;
};

/** An enumeration. */
export enum EquityRequestStatus {
    Requested = 'requested',
    Approved = 'approved',
    Rejected = 'rejected',
    Created = 'created',
    Duplicate = 'duplicate',
    Failed = 'failed',
}

export type EquityResolution = {
    __typename?: 'EquityResolution';
    /** The provided equity identifier */
    identifier?: Maybe<Scalars['String']>;
    /** Zero or more equities the identifier resolves to, ordered by best match */
    equities?: Maybe<Array<Maybe<Equity>>>;
};

export type EquityResolutionFilter = {
    /** limit responses to equities traded on exchanges in the provided countries */
    countries?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** If false, don't return identifiers that successfully resolved to one or more equities */
    includeResolved?: Maybe<Scalars['Boolean']>;
    /** If false, don't return identifiers that did not resolve to any equities */
    includeUnresolved?: Maybe<Scalars['Boolean']>;
};

export type EquitySearchHit = {
    __typename?: 'EquitySearchHit';
    id?: Maybe<Scalars['ID']>;
    equity?: Maybe<Equity>;
};

export type EquitySearchResult = {
    __typename?: 'EquitySearchResult';
    total?: Maybe<Scalars['Int']>;
    hits?: Maybe<Array<Maybe<EquitySearchHit>>>;
    facetGroups?: Maybe<Array<Maybe<SearchFacetGroup>>>;
};

export type EquityStream = Stream & {
    __typename?: 'EquityStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type EquityStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type EquityStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type EquityStreamMatch = StreamMatch & {
    __typename?: 'EquityStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<EquityStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    equity?: Maybe<Equity>;
};

export type EquityStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type EquityValuation = {
    __typename?: 'EquityValuation';
    equityId: Scalars['ID'];
    metric: Scalars['String'];
    trailingTwelveMonths?: Maybe<Scalars['Float']>;
    nextTwelveMonths?: Maybe<Scalars['Float']>;
    currentYear?: Maybe<Scalars['Float']>;
    nextYear?: Maybe<Scalars['Float']>;
    label?: Maybe<Scalars['String']>;
    format?: Maybe<Scalars['String']>;
    section?: Maybe<Scalars['String']>;
    subsection?: Maybe<Scalars['String']>;
    ordering?: Maybe<Scalars['Int']>;
};

export type EventDetails = {
    /** The override event date as a string that will be parsed. */
    eventDateString?: Maybe<Scalars['String']>;
};

export type EventGroup = {
    id?: Maybe<Scalars['ID']>;
    title?: Maybe<Scalars['String']>;
    promoted?: Maybe<Scalars['Boolean']>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    firstEvent?: Maybe<ScheduledAudioCall>;
    lastEvent?: Maybe<ScheduledAudioCall>;
    start?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    end?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    numEvents?: Maybe<Scalars['Int']>;
    equities?: Maybe<Array<Maybe<Equity>>>;
};

export type EventGroupFilter = {
    /** Specific event groups by id */
    eventGroupIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Filter by the beginning of the title */
    titlePrefix?: Maybe<Scalars['String']>;
    /** Filter event groups to those that contain a given date/time */
    eventDate?: Maybe<Scalars['DateTime']>;
};

export type EventGroupIdStreamRule = BaseStreamRule & {
    __typename?: 'EventGroupIdStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    eventGroup?: Maybe<EventGroup>;
};

export type EventGroupStream = Stream & {
    __typename?: 'EventGroupStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type EventGroupStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type EventGroupStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type EventGroupStreamMatch = StreamMatch & {
    __typename?: 'EventGroupStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<StreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    eventGroup?: Maybe<EventGroup>;
};

export type EventGroupStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type EventIssue = Issue & {
    __typename?: 'EventIssue';
    event?: Maybe<ScheduledAudioCall>;
    eventItem?: Maybe<ScheduledAudioCallEvent>;
    id?: Maybe<Scalars['ID']>;
    raisingUser?: Maybe<User>;
    resolvingUser?: Maybe<User>;
    issueStatus?: Maybe<IssueStatus>;
    issueText?: Maybe<Scalars['String']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    issueCategory?: Maybe<EventIssueCategory>;
};

/** An enumeration. */
export enum EventIssueCategory {
    Audio = 'audio',
    ConnectionInfo = 'connection_info',
    Transcription = 'transcription',
    Other = 'other',
}

export type EventIssueInput = {
    /** The issue text */
    issueText: Scalars['String'];
    /** The event with an issue */
    eventId: Scalars['ID'];
    /** Optionally, the specific event item (ie, transcript line) with an issue */
    eventItemId?: Maybe<Scalars['ID']>;
    /** The type of issue */
    issueCategory: EventIssueCategory;
    /** A webcast URL for the event, if the provided one is missing/incorrect */
    webcastUrl?: Maybe<Scalars['String']>;
    /** A dial-in phone number for the event, if the provided one is missing/incorrect */
    dialInPhoneNumber?: Maybe<Scalars['String']>;
    /** A dial-in PIN for the event, if one is required and the provided one is missing/incorrect */
    dialInPin?: Maybe<Scalars['String']>;
};

export type EventPriceHighlight = {
    __typename?: 'EventPriceHighlight';
    id?: Maybe<Scalars['ID']>;
    event?: Maybe<ScheduledAudioCall>;
    movementAbsolute?: Maybe<Scalars['Float']>;
    movementPercent?: Maybe<Scalars['Float']>;
    startPrice?: Maybe<Scalars['Float']>;
    endOrLatestPrice?: Maybe<Scalars['Float']>;
    overThreshold?: Maybe<Scalars['Boolean']>;
};

export type EventPriceReactionNotificationMessage = {
    __typename?: 'EventPriceReactionNotificationMessage';
    movementPercent?: Maybe<Scalars['Float']>;
    movementAbsolute?: Maybe<Scalars['Float']>;
    endOrLatestPrice?: Maybe<Scalars['Float']>;
};

export type EventQuicklinksMatchNotificationMessage = {
    __typename?: 'EventQuicklinksMatchNotificationMessage';
    highlight?: Maybe<Scalars['String']>;
};

export type EventRequest = {
    __typename?: 'EventRequest';
    status: EventRequestStatus;
    equityIdentifier: Scalars['String'];
    title: Scalars['String'];
    time: Scalars['DateTimeDefaultTimezone'];
    webcastUrl?: Maybe<Scalars['String']>;
    dialInPhoneNumber?: Maybe<Scalars['String']>;
    dialInPin?: Maybe<Scalars['String']>;
    requestingUser?: Maybe<User>;
    event?: Maybe<ScheduledAudioCall>;
    id?: Maybe<Scalars['ID']>;
};

export type EventRequestFilter = {
    /** Specific event requests by id */
    requestIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** An enumeration. */
export enum EventRequestStatus {
    Requested = 'requested',
    Created = 'created',
    Duplicate = 'duplicate',
    Deleted = 'deleted',
}

export type EventSource = StreamSource & {
    __typename?: 'EventSource';
    id?: Maybe<Scalars['ID']>;
    name?: Maybe<Scalars['String']>;
};

export type EventState = {
    __typename?: 'EventState';
    eventId: Scalars['Int'];
    stateId: Scalars['ID'];
    stateType: EventStateType;
    state: EventStateValue;
    parameters?: Maybe<Scalars['GenericScalar']>;
    timestamp: Scalars['DateTimeDefaultTimezone'];
    created: Scalars['DateTimeDefaultTimezone'];
};

/** An enumeration. */
export enum EventStateType {
    Session = 'session',
    Agent = 'agent',
    Connection = 'connection',
    Conference = 'conference',
    Recording = 'recording',
    Stream = 'stream',
    AudioOffset = 'audio_offset',
    FirstTranscript = 'first_transcript',
    TranscriptData = 'transcript_data',
    PrivateRecording = 'private_recording',
}

/** An enumeration. */
export enum EventStateValue {
    Initial = 'initial',
    New = 'new',
    Connecting = 'connecting',
    Connected = 'connected',
    Completed = 'completed',
    Receiving = 'receiving',
    Recording = 'recording',
    Disconnected = 'disconnected',
    Error = 'error',
    Stopped = 'stopped',
    NotifyingAgent = 'notifying_agent',
    DialingAgent = 'dialing_agent',
}

export type EventStream = Stream & {
    __typename?: 'EventStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type EventStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type EventStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type EventStreamMatch = StreamMatch & {
    __typename?: 'EventStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<EventStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    eventId?: Maybe<Scalars['Int']>;
    event?: Maybe<ScheduledAudioCall>;
};

export type EventStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type EventStreamMatchNotificationMessage = {
    __typename?: 'EventStreamMatchNotificationMessage';
    highlight?: Maybe<Scalars['String']>;
};

export type EventType = {
    __typename?: 'EventType';
    id?: Maybe<Scalars['ID']>;
    name?: Maybe<Scalars['String']>;
};

export type Exchange = {
    __typename?: 'Exchange';
    name: Scalars['String'];
    shortName: Scalars['String'];
    city: Scalars['String'];
    website: Scalars['String'];
    tz: Scalars['String'];
    localOpenTime?: Maybe<Scalars['String']>;
    localCloseTime?: Maybe<Scalars['String']>;
    localHalfDayOpenTime?: Maybe<Scalars['String']>;
    localHalfDayCloseTime?: Maybe<Scalars['String']>;
    mic: Scalars['String'];
    country?: Maybe<Country>;
    holidays?: Maybe<Array<Maybe<ExchangeHoliday>>>;
    id?: Maybe<Scalars['ID']>;
    priceDelay?: Maybe<PriceDelay>;
};

export type ExchangeHoliday = {
    __typename?: 'ExchangeHoliday';
    date: Scalars['String'];
    holidayType: ExchangeHolidayType;
    name: Scalars['String'];
    exchange?: Maybe<Exchange>;
    id?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum ExchangeHolidayType {
    Full = 'full',
    Half = 'half',
}

export type ExtendWebcastExpiration = {
    __typename?: 'ExtendWebcastExpiration';
    success?: Maybe<Scalars['Boolean']>;
};

export type Filing = {
    __typename?: 'Filing';
    isAmendment: Scalars['Boolean'];
    dcn?: Maybe<Scalars['String']>;
    accessionNumber?: Maybe<Scalars['String']>;
    title: Scalars['String'];
    periodEndDate: Scalars['DateTimeDefaultTimezone'];
    releaseDate: Scalars['DateTimeDefaultTimezone'];
    arrivalDate: Scalars['DateTimeDefaultTimezone'];
    equity?: Maybe<Equity>;
    form?: Maybe<FilingForm>;
    id?: Maybe<Scalars['ID']>;
    /** An official URL (sec.gov, etc.) for this filing */
    officialUrl?: Maybe<Scalars['String']>;
};

export type FilingContent = Content & {
    __typename?: 'FilingContent';
    contentId: Scalars['ID'];
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    sourceId: Scalars['String'];
    organizationId?: Maybe<Scalars['ID']>;
    title?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    language: Scalars['String'];
    parentId?: Maybe<Scalars['ID']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    filingId?: Maybe<Scalars['ID']>;
    bodyPlainFile: Scalars['String'];
    bodyHtmlFile: Scalars['String'];
    filing?: Maybe<Filing>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
};

export type FilingContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type FilingContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type FilingContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type FilingContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type FilingFilter = {
    /** A set of filing IDs to retrieve */
    filingIds: Array<Maybe<Scalars['ID']>>;
};

export type FilingForm = {
    __typename?: 'FilingForm';
    filingOrganization: FilingOrganization;
    filingSystem: FilingSystem;
    formNumber: Scalars['String'];
    formName: Scalars['String'];
    formNameShort: Scalars['String'];
    id?: Maybe<Scalars['ID']>;
    /** A raw key for a filing form category */
    categoryKey?: Maybe<Scalars['ID']>;
};

export type FilingFormFilter = {
    /** A set of filing form IDs to retrieve */
    filingFormIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type FilingFormStreamRule = BaseStreamRule & {
    __typename?: 'FilingFormStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    filingForm?: Maybe<FilingForm>;
};

/** An enumeration. */
export enum FilingOrganization {
    Sec = 'sec',
}

/** An enumeration. */
export enum FilingSystem {
    Edgar = 'edgar',
}

/** An enumeration. */
export enum FilterMode {
    Default = 'default',
    IgnoreDashboard = 'ignore_dashboard',
}

export type FinanceGlossaryTerm = {
    __typename?: 'FinanceGlossaryTerm';
    termId: Scalars['ID'];
    equityId?: Maybe<Scalars['ID']>;
    category?: Maybe<Scalars['String']>;
    section?: Maybe<Scalars['String']>;
    subsection?: Maybe<Scalars['String']>;
    term: Scalars['String'];
    short: Scalars['String'];
    long: Scalars['String'];
    ordering: Scalars['Int'];
    unitMultiplier?: Maybe<Scalars['Float']>;
    valueType?: Maybe<FinanceGlossaryValueType>;
    hide: Scalars['Boolean'];
    supportsEstimates: Scalars['Boolean'];
    overrideTerm?: Maybe<Scalars['String']>;
    synonyms?: Maybe<Scalars['GenericScalar']>;
    id?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum FinanceGlossaryValueType {
    Currency = 'currency',
    Percentage = 'percentage',
    Number = 'number',
    Multiple = 'multiple',
    Raw = 'raw',
}

export type Financial = {
    __typename?: 'Financial';
    key?: Maybe<Scalars['String']>;
    title?: Maybe<Scalars['String']>;
    format?: Maybe<Scalars['String']>;
    displayUnits?: Maybe<Scalars['Int']>;
    category?: Maybe<Scalars['String']>;
    section?: Maybe<Scalars['String']>;
    subsection?: Maybe<Scalars['String']>;
    ordering?: Maybe<Scalars['Int']>;
    currency?: Maybe<Currency>;
    values?: Maybe<Array<Maybe<FinancialValue>>>;
    consensuses?: Maybe<Array<Maybe<FinancialValue>>>;
    actuals?: Maybe<Array<Maybe<FinancialValue>>>;
    equityId?: Maybe<Scalars['ID']>;
};

export type FinancialDifferential = {
    __typename?: 'FinancialDifferential';
    userFinancialKpiId?: Maybe<Scalars['ID']>;
    isDefault?: Maybe<Scalars['Boolean']>;
    kpiTerm?: Maybe<Scalars['String']>;
    kpiTitle?: Maybe<Scalars['String']>;
    kpiFormat?: Maybe<Scalars['String']>;
    kpiCurrency?: Maybe<Scalars['String']>;
    quarters?: Maybe<Array<Maybe<FinancialDifferentialQuarter>>>;
    latestQuarter?: Maybe<FinancialDifferentialQuarter>;
    searchResult?: Maybe<TrackedTermSearchResult>;
};

export type FinancialDifferentialQuarter = {
    __typename?: 'FinancialDifferentialQuarter';
    year?: Maybe<Scalars['Int']>;
    quarter?: Maybe<Scalars['Int']>;
    date?: Maybe<Scalars['Date']>;
    actual?: Maybe<Scalars['Float']>;
    estimate?: Maybe<Scalars['Float']>;
    beatMiss?: Maybe<Scalars['Float']>;
    actualYoy?: Maybe<Scalars['Float']>;
    estimateYoy?: Maybe<Scalars['Float']>;
};

/** A single time series value.  */
export type FinancialTimeSeries = {
    __typename?: 'FinancialTimeSeries';
    timeSeriesId: Scalars['ID'];
    equityId?: Maybe<Scalars['ID']>;
    indexId?: Maybe<Scalars['String']>;
    metricId: Scalars['Int'];
    pulled: Scalars['String'];
    date?: Maybe<Scalars['String']>;
    quarter?: Maybe<Scalars['Int']>;
    year?: Maybe<Scalars['Int']>;
    reportDate?: Maybe<Scalars['String']>;
    numEstimates?: Maybe<Scalars['Int']>;
    valueType: Value_Type;
    value: Scalars['Float'];
    valueMean?: Maybe<Scalars['Float']>;
    valueMedian?: Maybe<Scalars['Float']>;
    valueLow?: Maybe<Scalars['Float']>;
    valueHigh?: Maybe<Scalars['Float']>;
    modified: Scalars['DateTimeDefaultTimezone'];
    equity?: Maybe<Equity>;
    index?: Maybe<Index>;
    metric?: Maybe<FinancialTimeSeriesMeta>;
    id?: Maybe<Scalars['ID']>;
};

export type FinancialTimeSeriesFilter = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
    /** Filter time series by equity id or index id */
    equityId?: Maybe<Scalars['ID']>;
    /** Filter time series by equity id or index id */
    indexId?: Maybe<Scalars['ID']>;
    /** Name of the metric to fetch, eps_12 for example. */
    metric?: Maybe<Scalars['String']>;
    /** Filter to the very latest value for the metric */
    latestOnly?: Maybe<Scalars['Boolean']>;
};

/** Returned in the FinancialTimeSeriesResultSet so clients can distinguish results.  */
export type FinancialTimeSeriesFilterResult = {
    __typename?: 'FinancialTimeSeriesFilterResult';
    /** The equity id used in the filter */
    equityId?: Maybe<Scalars['ID']>;
    /** The index id used in the filter */
    indexId?: Maybe<Scalars['ID']>;
    /** The metric object, with title */
    metric?: Maybe<FinancialTimeSeriesMeta>;
    /** The from date used in the filter */
    fromDate?: Maybe<Scalars['Date']>;
    /** The to date used in the filter */
    toDate?: Maybe<Scalars['Date']>;
    /** If the data was filtered to latest_only */
    latestOnly?: Maybe<Scalars['Boolean']>;
};

/** Time series value metadata, like the field name and title.  */
export type FinancialTimeSeriesMeta = {
    __typename?: 'FinancialTimeSeriesMeta';
    metricId: Scalars['ID'];
    metric: Scalars['String'];
    title?: Maybe<Scalars['String']>;
    format: Format;
    currency?: Maybe<Scalars['String']>;
    id?: Maybe<Scalars['ID']>;
};

/** Represents a set of time series results, along with the filter that was used to fetch them.  */
export type FinancialTimeSeriesResultSet = {
    __typename?: 'FinancialTimeSeriesResultSet';
    /** Describes the filter used for this resultset */
    filter?: Maybe<FinancialTimeSeriesFilterResult>;
    /** The time series results */
    data?: Maybe<Array<Maybe<FinancialTimeSeries>>>;
};

export type FinancialValue = {
    __typename?: 'FinancialValue';
    key?: Maybe<Scalars['String']>;
    type?: Maybe<Scalars['String']>;
    date?: Maybe<Scalars['Date']>;
    year?: Maybe<Scalars['Int']>;
    quarter?: Maybe<Scalars['Int']>;
    value?: Maybe<Scalars['Float']>;
    equityId?: Maybe<Scalars['ID']>;
};

export type Firm = {
    __typename?: 'Firm';
    firmId: Scalars['ID'];
    firm: Scalars['String'];
    domain?: Maybe<Scalars['String']>;
    createDate: Scalars['DateTimeDefaultTimezone'];
    id?: Maybe<Scalars['ID']>;
};

/** Follow or unfollow multiple equities */
export type FollowEquities = {
    __typename?: 'FollowEquities';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
};

/** Sends forgot password email to the email passed in.  */
export type ForgotPassword = {
    __typename?: 'ForgotPassword';
    success?: Maybe<Scalars['Boolean']>;
};

/** An enumeration. */
export enum GcpSpeechRecognitionModel {
    CommandAndSearch = 'command_and_search',
    Default = 'default',
    PhoneCall = 'phone_call',
    Video = 'video',
}

export type GSheetConfiguration = {
    __typename?: 'GSheetConfiguration';
    schedule?: Maybe<Scalars['String']>;
    idField?: Maybe<Scalars['String']>;
    tickerField?: Maybe<Scalars['String']>;
    dateField?: Maybe<Scalars['String']>;
    groupingField?: Maybe<Scalars['String']>;
    orderBy?: Maybe<Scalars['String']>;
    filter?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type GSheetConfigurationInput = {
    schedule?: Maybe<Scalars['String']>;
    idField?: Maybe<Scalars['String']>;
    tickerField?: Maybe<Scalars['String']>;
    dateField?: Maybe<Scalars['String']>;
    groupingField?: Maybe<Scalars['String']>;
    orderBy?: Maybe<Scalars['String']>;
    filter?: Maybe<Scalars['String']>;
    url?: Maybe<Scalars['String']>;
};

export type GSheetStream = Stream & {
    __typename?: 'GSheetStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type GSheetStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type GSheetStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type GSheetStreamMatch = StreamMatch & {
    __typename?: 'GSheetStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<StreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    fields?: Maybe<Array<Maybe<GSheetStreamMatchField>>>;
};

export type GSheetStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type GSheetStreamMatchField = {
    __typename?: 'GSheetStreamMatchField';
    name?: Maybe<Scalars['String']>;
    value?: Maybe<Scalars['String']>;
};

export type GalleryDashboardsFilter = {
    search?: Maybe<Scalars['String']>;
};

export type GicsSector = {
    __typename?: 'GicsSector';
    sectorId: Scalars['ID'];
    gicsCode: Scalars['String'];
    name: Scalars['String'];
    subSectors?: Maybe<Array<Maybe<GicsSubSector>>>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    id?: Maybe<Scalars['ID']>;
    numEquities?: Maybe<Scalars['Int']>;
};

export type GicsSectorSubSectorsArgs = {
    name?: Maybe<Scalars['String']>;
};

export type GicsSectorIdStreamRule = BaseStreamRule & {
    __typename?: 'GicsSectorIdStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    gicsSector?: Maybe<GicsSector>;
};

export type GicsSubSector = {
    __typename?: 'GicsSubSector';
    subSectorId: Scalars['ID'];
    gicsCode: Scalars['String'];
    sectorId?: Maybe<Scalars['Int']>;
    name: Scalars['String'];
    gicsSector?: Maybe<GicsSector>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    id?: Maybe<Scalars['ID']>;
    numEquities?: Maybe<Scalars['Int']>;
};

export type GicsSubSectorIdStreamRule = BaseStreamRule & {
    __typename?: 'GicsSubSectorIdStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    gicsSubSector?: Maybe<GicsSubSector>;
};

export type GlobalNotificationPreferences = {
    __typename?: 'GlobalNotificationPreferences';
    id?: Maybe<Scalars['ID']>;
    dailyDigestEnabled?: Maybe<Scalars['Boolean']>;
    weeklyDigestEnabled?: Maybe<Scalars['Boolean']>;
    globalRealtimePreferences?: Maybe<GlobalRealtimeNotificationPreferences>;
};

export type GlobalRealtimeEventNotificationPreferences = {
    __typename?: 'GlobalRealtimeEventNotificationPreferences';
    inAppEnabled?: Maybe<Scalars['Boolean']>;
    emailEnabled?: Maybe<Scalars['Boolean']>;
    upcomingEventEnabled?: Maybe<Scalars['Boolean']>;
    weeklyUpcomingEventsEmailEnabled?: Maybe<Scalars['Boolean']>;
    quicklinkMatchesEnabled?: Maybe<Scalars['Boolean']>;
    streamMatchesEnabled?: Maybe<Scalars['Boolean']>;
    spotlightMatchesEnabled?: Maybe<Scalars['Boolean']>;
    priceReactionsEnabled?: Maybe<Scalars['Boolean']>;
    id?: Maybe<Scalars['ID']>;
    equityScopeRules?: Maybe<Array<Maybe<WatchlistRule>>>;
};

export type GlobalRealtimeEventNotificationPreferencesInput = {
    inAppEnabled?: Maybe<Scalars['Boolean']>;
    emailEnabled?: Maybe<Scalars['Boolean']>;
    upcomingEventEnabled?: Maybe<Scalars['Boolean']>;
    weeklyUpcomingEventsEmailEnabled?: Maybe<Scalars['Boolean']>;
    quicklinkMatchesEnabled?: Maybe<Scalars['Boolean']>;
    streamMatchesEnabled?: Maybe<Scalars['Boolean']>;
    spotlightMatchesEnabled?: Maybe<Scalars['Boolean']>;
    priceReactionsEnabled?: Maybe<Scalars['Boolean']>;
    equityScopeRules?: Maybe<Array<Maybe<WatchlistRuleInput>>>;
};

export type GlobalRealtimeNotificationPreferences = {
    __typename?: 'GlobalRealtimeNotificationPreferences';
    timezone?: Maybe<Scalars['String']>;
    id?: Maybe<Scalars['ID']>;
    eventPreferences?: Maybe<GlobalRealtimeEventNotificationPreferences>;
    streamPreferences?: Maybe<GlobalRealtimeStreamNotificationPreferences>;
    snoozeUntil?: Maybe<Scalars['DateTime']>;
};

export type GlobalRealtimeNotificationPreferencesInput = {
    timezone?: Maybe<Scalars['String']>;
    eventPreferences: GlobalRealtimeEventNotificationPreferencesInput;
    streamPreferences: GlobalRealtimeStreamNotificationPreferencesInput;
};

export type GlobalRealtimeStreamNotificationPreferences = {
    __typename?: 'GlobalRealtimeStreamNotificationPreferences';
    inAppEnabled?: Maybe<Scalars['Boolean']>;
    emailEnabled?: Maybe<Scalars['Boolean']>;
    everyMatch?: Maybe<Scalars['Boolean']>;
    spikes?: Maybe<Scalars['Boolean']>;
    id?: Maybe<Scalars['ID']>;
};

export type GlobalRealtimeStreamNotificationPreferencesInput = {
    inAppEnabled?: Maybe<Scalars['Boolean']>;
    emailEnabled?: Maybe<Scalars['Boolean']>;
    everyMatch?: Maybe<Scalars['Boolean']>;
    spikes?: Maybe<Scalars['Boolean']>;
};

export type GuidanceSpotlightContent = Content & {
    __typename?: 'GuidanceSpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    guidanceContent?: Maybe<Scalars['String']>;
    guidanceTrend?: Maybe<Scalars['String']>;
    guidanceGaap?: Maybe<Scalars['String']>;
    epsLow?: Maybe<Scalars['Float']>;
    epsHigh?: Maybe<Scalars['Float']>;
    revenueLow?: Maybe<Scalars['Float']>;
    revenueHigh?: Maybe<Scalars['Float']>;
};

export type GuidanceSpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type GuidanceSpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type GuidanceSpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type GuidanceSpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type HierarchyItem = {
    __typename?: 'HierarchyItem';
    id?: Maybe<Scalars['ID']>;
    displayName?: Maybe<Scalars['String']>;
    parent?: Maybe<HierarchyItem>;
    children?: Maybe<Array<Maybe<HierarchyItem>>>;
};

export type HighlightCommand = {
    streamId?: Maybe<Scalars['ID']>;
};

export type IpoSpotlightContent = Content & {
    __typename?: 'IPOSpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    listingType?: Maybe<Scalars['String']>;
    ipoPrice?: Maybe<Scalars['Float']>;
    sharesOffered?: Maybe<Scalars['Int']>;
    amountRaised?: Maybe<Scalars['Int']>;
    quietPeriodEndDate?: Maybe<Scalars['Date']>;
    lockupExpiryDate?: Maybe<Scalars['Date']>;
};

export type IpoSpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type IpoSpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type IpoSpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type IpoSpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type ImportLatestEvents = {
    __typename?: 'ImportLatestEvents';
    success?: Maybe<Scalars['Boolean']>;
};

export type Index = {
    __typename?: 'Index';
    indexId: Scalars['String'];
    indexName?: Maybe<Scalars['String']>;
    indexType?: Maybe<Scalars['String']>;
    description?: Maybe<Scalars['String']>;
    extras?: Maybe<Scalars['String']>;
    last?: Maybe<Scalars['Float']>;
    lastOpen?: Maybe<Scalars['Float']>;
    lastClose?: Maybe<Scalars['Float']>;
    lastUpdated?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    tracking?: Maybe<Array<Maybe<IndexTracking>>>;
    /** Filters sub objects by start date */
    startDateFilter?: Maybe<Scalars['Date']>;
    /** Filters sub objects by target date */
    targetDateFilter?: Maybe<Scalars['Date']>;
    performance?: Maybe<Performance>;
};

export type IndexTrackingArgs = {
    filter?: Maybe<DateRangeFilter>;
};

export type IndexStream = Stream & {
    __typename?: 'IndexStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type IndexStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type IndexStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type IndexStreamMatch = StreamMatch & {
    __typename?: 'IndexStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<IndexStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    index?: Maybe<Index>;
};

export type IndexStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type IndexTracking = {
    __typename?: 'IndexTracking';
    indexId: Scalars['String'];
    pulled: Scalars['DateTimeDefaultTimezone'];
    pulledDate: Scalars['String'];
    last?: Maybe<Scalars['Float']>;
    raw?: Maybe<Scalars['String']>;
    createDate: Scalars['DateTimeDefaultTimezone'];
    index?: Maybe<Index>;
};

export type InitiateNewPaymentMethod = {
    __typename?: 'InitiateNewPaymentMethod';
    success?: Maybe<Scalars['Boolean']>;
    clientSecret?: Maybe<Scalars['ID']>;
};

export type InitiateSubscription = {
    __typename?: 'InitiateSubscription';
    success?: Maybe<Scalars['Boolean']>;
    /** The unique ID to use when continuing the subscription checkout on the client */
    checkoutSessionId?: Maybe<Scalars['ID']>;
    nextInvoice?: Maybe<BillingInvoice>;
};

export type InsecureCodeDetails = {
    __typename?: 'InsecureCodeDetails';
    /** The code type */
    type?: Maybe<Scalars['String']>;
    /** The email of the user on the code, if any */
    email?: Maybe<Scalars['String']>;
    /** The first name of the user on the code, if any */
    firstName?: Maybe<Scalars['String']>;
    /** The last name of the user on the code, if any */
    lastName?: Maybe<Scalars['String']>;
    /** The id of the organization on the code, if any */
    organizationId?: Maybe<Scalars['ID']>;
    /** The name of the organization on the code, if any */
    organizationName?: Maybe<Scalars['String']>;
    /** When this code expires */
    expires?: Maybe<Scalars['DateTime']>;
};

export type Instrument = {
    __typename?: 'Instrument';
    guid: Scalars['String'];
    isPrimary: Scalars['Boolean'];
    name: Scalars['String'];
    isin?: Maybe<Scalars['String']>;
    cusip?: Maybe<Scalars['String']>;
    issuer?: Maybe<Company>;
    assetClass?: Maybe<AssetClass>;
    quotes?: Maybe<Array<Maybe<Quote>>>;
    primaryQuote?: Maybe<Quote>;
    id?: Maybe<Scalars['ID']>;
    shortGuid?: Maybe<Scalars['String']>;
};

export type IntervalStatisticBucket = {
    __typename?: 'IntervalStatisticBucket';
    type?: Maybe<Scalars['String']>;
    count?: Maybe<Scalars['Int']>;
};

export type IntervalStatistics = {
    __typename?: 'IntervalStatistics';
    total?: Maybe<Scalars['Int']>;
    buckets?: Maybe<Array<Maybe<IntervalStatisticBucket>>>;
};

/** Invites a user to the same organization the current user is in.   */
export type InviteUser = {
    __typename?: 'InviteUser';
    success?: Maybe<Scalars['Boolean']>;
};

export type Issue = {
    id?: Maybe<Scalars['ID']>;
    raisingUser?: Maybe<User>;
    resolvingUser?: Maybe<User>;
    issueStatus?: Maybe<IssueStatus>;
    issueText?: Maybe<Scalars['String']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
};

/** An enumeration. */
export enum IssueStatus {
    Raised = 'raised',
    Resolved = 'resolved',
}

export type Language = {
    __typename?: 'Language';
    languageCode: Scalars['String'];
    name: Scalars['String'];
    iso6391: Scalars['String'];
    iso6392B: Scalars['String'];
    iso6392T: Scalars['String'];
    iso6393: Scalars['String'];
    id?: Maybe<Scalars['ID']>;
};

export type LiveEventStream = Stream & {
    __typename?: 'LiveEventStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type LiveEventStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type LiveEventStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type Locale = {
    __typename?: 'Locale';
    localeCode: Scalars['String'];
    displayName: Scalars['String'];
    languageCode: Scalars['String'];
    countryCode?: Maybe<Scalars['String']>;
    gcpSupport: Scalars['Boolean'];
    gcpAutomaticPunctuation: Scalars['Boolean'];
    gcpModels?: Maybe<Array<Maybe<GcpSpeechRecognitionModel>>>;
    gcpEnhanced: Scalars['Boolean'];
    language?: Maybe<Language>;
    country?: Maybe<Country>;
    id?: Maybe<Scalars['ID']>;
};

export type LocaleFilter = {
    gcpSupport?: Maybe<Scalars['Boolean']>;
    gcpAutomaticPunctuation?: Maybe<Scalars['Boolean']>;
    gcpEnhanced?: Maybe<Scalars['Boolean']>;
    gcpModel?: Maybe<GcpSpeechRecognitionModel>;
};

export type Login = {
    __typename?: 'Login';
    success?: Maybe<Scalars['Boolean']>;
    /** The user data for the logged in user. */
    user?: Maybe<User>;
};

/** Clears the users login cookies.  */
export type Logout = {
    __typename?: 'Logout';
    success?: Maybe<Scalars['Boolean']>;
    loginUrl?: Maybe<Scalars['String']>;
};

export type MAndASpotlightContent = Content & {
    __typename?: 'MAndASpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    newsType?: Maybe<Scalars['String']>;
    mnaType?: Maybe<Scalars['String']>;
    firmType?: Maybe<Scalars['String']>;
    paymentMode?: Maybe<Scalars['String']>;
    mnaPurpose?: Maybe<Scalars['String']>;
    relation?: Maybe<Scalars['String']>;
    isFriendly?: Maybe<Scalars['String']>;
    isCrossBorder?: Maybe<Scalars['String']>;
    expectedClose?: Maybe<Scalars['String']>;
    pricePerShare?: Maybe<Scalars['Float']>;
    premiumPct?: Maybe<Scalars['Float']>;
};

export type MAndASpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type MAndASpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type MAndASpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type MAndASpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type MailingAddress = {
    __typename?: 'MailingAddress';
    streetLine1?: Maybe<Scalars['String']>;
    streetLine2?: Maybe<Scalars['String']>;
    city?: Maybe<Scalars['String']>;
    stateProvinceRegion?: Maybe<Scalars['String']>;
    postalCode?: Maybe<Scalars['String']>;
    country?: Maybe<Country>;
};

export type ManuallyCreateOrgAndUser = {
    __typename?: 'ManuallyCreateOrgAndUser';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
    organization?: Maybe<Organization>;
    organizationInviteLink?: Maybe<Scalars['String']>;
    /** Either the password provided, or one randomly generated for the user. */
    password?: Maybe<Scalars['String']>;
};

export type ManuallyCreateOrganization = {
    __typename?: 'ManuallyCreateOrganization';
    success?: Maybe<Scalars['Boolean']>;
    organization?: Maybe<Organization>;
};

export type ManuallySetUserPassword = {
    __typename?: 'ManuallySetUserPassword';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
    /** Either the password provided or one randomly generated */
    password?: Maybe<Scalars['String']>;
};

export type MarkEventDeleted = {
    __typename?: 'MarkEventDeleted';
    success?: Maybe<Scalars['Boolean']>;
};

export type MarkNotificationsRead = {
    __typename?: 'MarkNotificationsRead';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    notifications?: Maybe<Array<Maybe<Notification>>>;
    numMarked?: Maybe<Scalars['Int']>;
};

export type MonitorDifferential = {
    __typename?: 'MonitorDifferential';
    /** A tracked term to check for differentials */
    searchResult?: Maybe<TrackedTermSearchResult>;
    /** Events related to the main event to compare for differentials */
    events?: Maybe<Array<Maybe<MonitorDifferentialEvent>>>;
};

export type MonitorDifferentialEvent = {
    __typename?: 'MonitorDifferentialEvent';
    /** An event that is part if a differential query */
    event?: Maybe<ScheduledAudioCall>;
    /** The number of mentions of a specific tracked term in the event */
    numMatches?: Maybe<Scalars['Int']>;
};

export type MoveUserToOrganization = {
    __typename?: 'MoveUserToOrganization';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
};

/** Aiera graphql mutations.  */
export type Mutations = {
    __typename?: 'Mutations';
    createPrivateRecording?: Maybe<CreatePrivateRecording>;
    updatePrivateRecording?: Maybe<UpdatePrivateRecording>;
    deletePrivateRecording?: Maybe<DeletePrivateRecording>;
    disconnectPrivateRecording?: Maybe<DisconnectPrivateRecording>;
    createBookmark?: Maybe<CreateBookmark>;
    updateBookmark?: Maybe<UpdateBookmark>;
    shareBookmark?: Maybe<ShareBookmark>;
    deleteBookmark?: Maybe<DeleteBookmark>;
    archiveBookmarks?: Maybe<ArchiveBookmarks>;
    deleteBookmarks?: Maybe<DeleteBookmarks>;
    /** Create a new search history entry in the database for the user */
    trackSearch?: Maybe<TrackSearch>;
    setGlobalRealtimeNotificationPreferences?: Maybe<SetGlobalRealtimeNotificationPreferences>;
    addEquityToEventRealtimeNotificationScope?: Maybe<AddEquityToEventRealtimeNotificationScope>;
    removeEquityFromEventRealtimeNotificationScope?: Maybe<RemoveEquityFromEventRealtimeNotificationScope>;
    addWatchlistToEventRealtimeNotificationScope?: Maybe<AddWatchlistToEventRealtimeNotificationScope>;
    removeWatchlistFromEventRealtimeNotificationScope?: Maybe<RemoveWatchlistFromEventRealtimeNotificationScope>;
    markNotificationsRead?: Maybe<MarkNotificationsRead>;
    snoozeNotifications?: Maybe<SnoozeNotifications>;
    createNotification?: Maybe<CreateNotification>;
    /** Begin a subscription checkout that will be finished on the client */
    initiateSubscription?: Maybe<InitiateSubscription>;
    /** Add/update/remove seats for an existing subscription */
    updateSubscription?: Maybe<UpdateSubscription>;
    /** Cancel an active subscription */
    cancelSubscription?: Maybe<CancelSubscription>;
    /** Begin the process of adding a new payment method to the organization which will be finished on the client */
    initiateNewPaymentMethod?: Maybe<InitiateNewPaymentMethod>;
    /** Update non-secret info on an existing payment method (expiration date, address, etc.) */
    updatePaymentMethod?: Maybe<UpdatePaymentMethod>;
    /** Remove a payment method from the organization */
    removePaymentMethod?: Maybe<RemovePaymentMethod>;
    /** Set the active subscription to use a different payment method */
    setSubscriptionPaymentMethod?: Maybe<SetSubscriptionPaymentMethod>;
    /** Raise an issue about a content item */
    raiseContentIssue?: Maybe<RaiseContentIssue>;
    /** Raise an issue about an event */
    raiseEventIssue?: Maybe<RaiseEventIssue>;
    createDataCollection?: Maybe<CreateDataCollection>;
    updateDataCollection?: Maybe<UpdateDataCollection>;
    commitDataCollection?: Maybe<CommitDataCollection>;
    processDataCollection?: Maybe<ProcessDataCollection>;
    deleteDataCollection?: Maybe<DeleteDataCollection>;
    createStreamMatchTemplate?: Maybe<CreateStreamMatchTemplate>;
    updateStreamMatchTemplate?: Maybe<UpdateStreamMatchTemplate>;
    commitStreamMatchTemplate?: Maybe<CommitStreamMatchTemplate>;
    deleteStreamMatchTemplate?: Maybe<DeleteStreamMatchTemplate>;
    createDashboardSection?: Maybe<CreateDashboardSection>;
    updateDashboardSection?: Maybe<UpdateDashboardSection>;
    deleteDashboardSection?: Maybe<DeleteDashboardSection>;
    setDashboardSectionPosition?: Maybe<SetDashboardSectionPosition>;
    setDashboardSectionOpenClose?: Maybe<SetDashboardSectionOpenClose>;
    addDashboardToSection?: Maybe<AddDashboardToSection>;
    removeDashboardFromSection?: Maybe<RemoveDashboardFromSection>;
    /** Creates a stream */
    createStream?: Maybe<CreateStream>;
    /** Update a stream */
    updateStream?: Maybe<UpdateStream>;
    /** Update a stream ux preferences */
    updateStreamUxPreferences?: Maybe<UpdateStreamUxPrefs>;
    /** Update stream lens for the current user */
    setStreamLens?: Maybe<SetStreamLens>;
    /** Update stream rules for the current user */
    setStreamRules?: Maybe<SetStreamRules>;
    /** Delete a stream */
    deleteStream?: Maybe<DeleteStream>;
    /** Update stored stream statistics */
    updateStreamStatistics?: Maybe<UpdateStreamStatistics>;
    /** Creates a streams dashboard */
    createDashboard?: Maybe<CreateDashboard>;
    /** Updates a streams dashboard */
    updateDashboard?: Maybe<UpdateDashboard>;
    /** Updates a dashboard ux prefs */
    updateDashboardUxPreferences?: Maybe<UpdateDashboardUxPrefs>;
    /** Updates the stream sort */
    updateDashboardStreamSortOrder?: Maybe<UpdateDashboardStreamSortOrder>;
    /** Stars a dashboard */
    starDashboard?: Maybe<StarDashboard>;
    /** Clones a dashboard */
    cloneDashboard?: Maybe<CloneDashboard>;
    /** Clone dashboards */
    cloneDashboards?: Maybe<CloneDashboards>;
    /** Run a cleanup on a dashboard */
    cleanupDashboard?: Maybe<CleanupDashboard>;
    /** Deletes a streams dashboard */
    deleteDashboard?: Maybe<DeleteDashboard>;
    /** Tracks a search term */
    trackTerm?: Maybe<TrackTerm>;
    /** Updates a tracked term */
    updateTrackedTerm?: Maybe<UpdateTrackedTerm>;
    /** Untracks a term */
    untrackTerm?: Maybe<UntrackTerm>;
    /** [Support] (Re)activate a single user */
    activateUser?: Maybe<ActivateUser>;
    /** [Support] Deactivate a single user */
    deactivateUser?: Maybe<DeactivateUser>;
    /** [Support] (Re)activate an organization (and optionally, its users) */
    activateOrganization?: Maybe<ActivateOrganization>;
    /** [Support] Deactivate an organization (and optionally, its users) */
    deactivateOrganization?: Maybe<DeactivateOrganization>;
    /** [Support] Trigger a fresh load of events for a given equity */
    importLatestEvents?: Maybe<ImportLatestEvents>;
    /** [Support] Create an invite code for an organization */
    createOrganizationInviteCode?: Maybe<CreateOrganizationInviteCode>;
    /** [Support] Create a new ontology node */
    createOntologyNode?: Maybe<CreateOntologyNode>;
    /** [Support] Manually create a new org and its admin user. */
    manuallyCreateOrganizationAndUser?: Maybe<ManuallyCreateOrgAndUser>;
    /** [Support] Manually create a new org */
    manuallyCreateOrganization?: Maybe<ManuallyCreateOrganization>;
    /** [Support] Set a user's password */
    manuallySetUserPassword?: Maybe<ManuallySetUserPassword>;
    /** [Support] Add a new default financial KPI */
    addDefaultEquityFinancialKpi?: Maybe<AddDefaultEquityFinancialKpi>;
    /** [Support] Remove an existing default financial KPI */
    removeDefaultEquityFinancialKpi?: Maybe<RemoveDefaultEquityFinancialKpi>;
    /** [Support] Set a user's customer type */
    setUserCustomerType?: Maybe<SetUserCustomerType>;
    /** [Support] Set whether or not an org is a customer */
    setOrganizationCustomerStatus?: Maybe<SetOrganizationCustomerStatus>;
    /** [Support] Move a user to a different organization */
    moveUserToOrganization?: Maybe<MoveUserToOrganization>;
    /** Disconnect an event call */
    disconnectCall?: Maybe<DisconnectCall>;
    /** Manually attempt to start our webcast service for an event */
    streamWebcast?: Maybe<StreamWebcast>;
    /** Manually override information about an event */
    overrideEventDetails?: Maybe<OverrideEventDetails>;
    /** [Support] Mark a public event as deleted */
    markEventDeleted?: Maybe<MarkEventDeleted>;
    /** Update the status/target of a SPAC */
    updateSpac?: Maybe<UpdateSpac>;
    /** Creates a new event */
    createEvent?: Maybe<CreateEvent>;
    /** Updates an existing event */
    updateEvent?: Maybe<UpdateEvent>;
    /** Deletes an event */
    deleteEvent?: Maybe<DeleteEvent>;
    /** Extends a webcast expiration */
    extendWebcastExpiration?: Maybe<ExtendWebcastExpiration>;
    /** Clears webcast markers for event */
    clearWebcastMarkers?: Maybe<ClearWebcastMarkers>;
    /** Request a missing event */
    requestEvent?: Maybe<RequestEvent>;
    /**
     * Tracks a search term
     * @deprecated Use trackTerm
     */
    trackEventTerm?: Maybe<TrackEventTerm>;
    /**
     * Untracks a search term
     * @deprecated Use untrackTerm
     */
    untrackEventTerm?: Maybe<UntrackEventTerm>;
    /** Update a transcript */
    updateEventItem?: Maybe<UpdateEventItem>;
    /** Delete a transcript */
    deleteEventItem?: Maybe<DeleteEventItem>;
    /** Update event notification settings */
    updateEventNotificationsSettings?: Maybe<UpdateEventNotificationsSettings>;
    /** Update an organization */
    updateOrganization?: Maybe<UpdateOrganization>;
    /** Add/update a domain config for the org */
    saveDomainConfiguration?: Maybe<SaveDomainConfiguration>;
    /** Delete a domain config for the org */
    deleteDomainConfiguration?: Maybe<DeleteDomainConfiguration>;
    /** Create a new watchlist. The list will be associated with the current user.  */
    createWatchlist?: Maybe<CreateWatchlist>;
    updateWatchlist?: Maybe<UpdateWatchlist>;
    deleteWatchlist?: Maybe<DeleteWatchlist>;
    addEquityToWatchlist?: Maybe<AddEquityToWatchlist>;
    removeEquityFromWatchlist?: Maybe<RemoveEquityFromWatchlist>;
    addCompanyToWatchlist?: Maybe<AddCompanyToWatchlist>;
    removeCompanyFromWatchlist?: Maybe<RemoveCompanyFromWatchlist>;
    /** Request one or more equities to be added to Aiera */
    requestEquities?: Maybe<RequestEquities>;
    /** Update the user */
    updateUser?: Maybe<UpdateUser>;
    /** Save settings for the target object */
    updateUserObjectSettings?: Maybe<UpdateUserObjectSettings>;
    /** Save settings for the target objects */
    bulkUpdateUserObjectSettings?: Maybe<BulkUpdateUserObjectSettings>;
    /** Set stream specific settings for the object */
    updateUserObjectStreamSettings?: Maybe<UpdateUserObjectStreamSettings>;
    /** Set user preferences */
    setPreferences?: Maybe<SetPreferences>;
    /** Follow/unfollow equities */
    followEquities?: Maybe<FollowEquities>;
    /** Invite a new user into the current users group. Only avail to org admins */
    inviteUser?: Maybe<InviteUser>;
    /** Track user activity */
    trackActivity?: Maybe<TrackActivity>;
    /** Add a new UFK at the bottom of the order */
    addUserFinancialKpi?: Maybe<AddUserFinancialKpi>;
    /** Delete a UFK */
    removeUserFinancialKpi?: Maybe<RemoveUserFinancialKpi>;
    /** Replace an existing UFK with a new term */
    replaceUserFinancialKpi?: Maybe<ReplaceUserFinancialKpi>;
    /** Login mutation. Sets auth cookies */
    login?: Maybe<Login>;
    /** Change password mutation */
    setPassword?: Maybe<SetPassword>;
    /** Sends forgot email */
    forgotPassword?: Maybe<ForgotPassword>;
    /** Resets password via code in forgot email */
    resetPassword?: Maybe<ResetPassword>;
    /** Logout mutation, clears cookies */
    logout?: Maybe<Logout>;
    /** Register mutation */
    register?: Maybe<Register>;
    /** Verify email by code mutation */
    verifyEmail?: Maybe<VerifyEmail>;
};

/** Aiera graphql mutations.  */
export type MutationsCreatePrivateRecordingArgs = {
    input: CreatePrivateRecordingInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdatePrivateRecordingArgs = {
    input: UpdatePrivateRecordingInput;
    retry?: Maybe<Scalars['Boolean']>;
};

/** Aiera graphql mutations.  */
export type MutationsDeletePrivateRecordingArgs = {
    privateRecordingId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsDisconnectPrivateRecordingArgs = {
    privateRecordingId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateBookmarkArgs = {
    input: CreateBookmarkInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateBookmarkArgs = {
    input: UpdateBookmarkInput;
};

/** Aiera graphql mutations.  */
export type MutationsShareBookmarkArgs = {
    input: ShareBookmarkInput;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteBookmarkArgs = {
    bookmarkId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsArchiveBookmarksArgs = {
    bookmarkIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteBookmarksArgs = {
    bookmarkIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql mutations.  */
export type MutationsTrackSearchArgs = {
    search?: Maybe<Scalars['String']>;
};

/** Aiera graphql mutations.  */
export type MutationsSetGlobalRealtimeNotificationPreferencesArgs = {
    input: GlobalRealtimeNotificationPreferencesInput;
};

/** Aiera graphql mutations.  */
export type MutationsAddEquityToEventRealtimeNotificationScopeArgs = {
    equityId: Scalars['Int'];
};

/** Aiera graphql mutations.  */
export type MutationsRemoveEquityFromEventRealtimeNotificationScopeArgs = {
    equityId: Scalars['Int'];
};

/** Aiera graphql mutations.  */
export type MutationsAddWatchlistToEventRealtimeNotificationScopeArgs = {
    watchlistId: Scalars['Int'];
};

/** Aiera graphql mutations.  */
export type MutationsRemoveWatchlistFromEventRealtimeNotificationScopeArgs = {
    watchlistId: Scalars['Int'];
};

/** Aiera graphql mutations.  */
export type MutationsMarkNotificationsReadArgs = {
    notificationIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** Aiera graphql mutations.  */
export type MutationsSnoozeNotificationsArgs = {
    until: Scalars['DateTime'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateNotificationArgs = {
    input: NotificationInput;
};

/** Aiera graphql mutations.  */
export type MutationsInitiateSubscriptionArgs = {
    cancelRedirectPage?: Maybe<Scalars['String']>;
    preview?: Maybe<Scalars['Boolean']>;
    productPriceId: Scalars['ID'];
    successRedirectPage?: Maybe<Scalars['String']>;
    zipCode: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsUpdateSubscriptionArgs = {
    newSeats?: Maybe<Array<Maybe<SubscriptionSeatInput>>>;
    organizationId?: Maybe<Scalars['ID']>;
    preview?: Maybe<Scalars['Boolean']>;
    removedSeats?: Maybe<Array<Maybe<SubscriptionSeatInput>>>;
    updatedSeats?: Maybe<Array<Maybe<SubscriptionSeatInput>>>;
};

/** Aiera graphql mutations.  */
export type MutationsCancelSubscriptionArgs = {
    organizationId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsUpdatePaymentMethodArgs = {
    paymentMethodId: Scalars['ID'];
    paymentMethodInput: PaymentMethodInput;
};

/** Aiera graphql mutations.  */
export type MutationsRemovePaymentMethodArgs = {
    paymentMethodId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsSetSubscriptionPaymentMethodArgs = {
    paymentMethodId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsRaiseContentIssueArgs = {
    input: ContentIssueInput;
};

/** Aiera graphql mutations.  */
export type MutationsRaiseEventIssueArgs = {
    input: EventIssueInput;
};

/** Aiera graphql mutations.  */
export type MutationsCreateDataCollectionArgs = {
    input: DataCollectionInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateDataCollectionArgs = {
    input: UpdateDataCollectionInput;
};

/** Aiera graphql mutations.  */
export type MutationsCommitDataCollectionArgs = {
    dataCollectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsProcessDataCollectionArgs = {
    dataCollectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsDeleteDataCollectionArgs = {
    dataCollectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateStreamMatchTemplateArgs = {
    input: StreamMatchTemplateInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateStreamMatchTemplateArgs = {
    input: UpdateStreamMatchTemplateInput;
};

/** Aiera graphql mutations.  */
export type MutationsCommitStreamMatchTemplateArgs = {
    templateId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsDeleteStreamMatchTemplateArgs = {
    templateId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateDashboardSectionArgs = {
    input: DashboardSectionInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateDashboardSectionArgs = {
    input: UpdateDashboardSectionInput;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteDashboardSectionArgs = {
    sectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsSetDashboardSectionPositionArgs = {
    position?: Maybe<Scalars['Int']>;
    sectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsSetDashboardSectionOpenCloseArgs = {
    open: Scalars['Boolean'];
    sectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsAddDashboardToSectionArgs = {
    dashboardId: Scalars['ID'];
    position: Scalars['Int'];
    sectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsRemoveDashboardFromSectionArgs = {
    dashboardId: Scalars['ID'];
    sectionId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateStreamArgs = {
    input: StreamInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateStreamArgs = {
    input: UpdateStreamInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateStreamUxPreferencesArgs = {
    streamId: Scalars['ID'];
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
};

/** Aiera graphql mutations.  */
export type MutationsSetStreamLensArgs = {
    input: SetStreamRulesInput;
};

/** Aiera graphql mutations.  */
export type MutationsSetStreamRulesArgs = {
    input: SetStreamRulesInput;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteStreamArgs = {
    streamId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsUpdateStreamStatisticsArgs = {
    streamId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateDashboardArgs = {
    input: CreateDashboardInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateDashboardArgs = {
    input: UpdateDashboardInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateDashboardUxPreferencesArgs = {
    dashboardId: Scalars['ID'];
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateDashboardStreamSortOrderArgs = {
    dashboardId: Scalars['ID'];
    sortOrder?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** Aiera graphql mutations.  */
export type MutationsStarDashboardArgs = {
    dashboardId: Scalars['ID'];
    starred: Scalars['Boolean'];
};

/** Aiera graphql mutations.  */
export type MutationsCloneDashboardArgs = {
    dashboardId: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
};

/** Aiera graphql mutations.  */
export type MutationsCloneDashboardsArgs = {
    dashboardIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql mutations.  */
export type MutationsCleanupDashboardArgs = {
    dashboardId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsDeleteDashboardArgs = {
    dashboardId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsTrackTermArgs = {
    input: CreateTrackedTermInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateTrackedTermArgs = {
    input: UpdateTrackedTermInput;
};

/** Aiera graphql mutations.  */
export type MutationsUntrackTermArgs = {
    eventId?: Maybe<Scalars['ID']>;
    trackedTermId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsActivateUserArgs = {
    userId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsDeactivateUserArgs = {
    email?: Maybe<Scalars['String']>;
    userId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsActivateOrganizationArgs = {
    activateUsers?: Maybe<Scalars['Boolean']>;
    organizationId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsDeactivateOrganizationArgs = {
    deactivateUsers?: Maybe<Scalars['Boolean']>;
    organizationId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsImportLatestEventsArgs = {
    equityId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateOrganizationInviteCodeArgs = {
    expiration?: Maybe<Scalars['Date']>;
    organizationAdminUserId?: Maybe<Scalars['ID']>;
    organizationId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateOntologyNodeArgs = {
    name: Scalars['String'];
    parentNodeId: Scalars['ID'];
    type: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsManuallyCreateOrganizationAndUserArgs = {
    orgAdminUserEmail: Scalars['String'];
    orgAdminUserFirstName: Scalars['String'];
    orgAdminUserLastName: Scalars['String'];
    orgAdminUserPassword?: Maybe<Scalars['String']>;
    organizationName: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsManuallyCreateOrganizationArgs = {
    organizationName: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsManuallySetUserPasswordArgs = {
    password?: Maybe<Scalars['String']>;
    userId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsAddDefaultEquityFinancialKpiArgs = {
    equityId: Scalars['ID'];
    financialTermKey: Scalars['ID'];
    order?: Maybe<Scalars['Int']>;
    scope?: Maybe<Scalars['String']>;
};

/** Aiera graphql mutations.  */
export type MutationsRemoveDefaultEquityFinancialKpiArgs = {
    equityFinancialKpiId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsSetUserCustomerTypeArgs = {
    customerType: Scalars['String'];
    userId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsSetOrganizationCustomerStatusArgs = {
    isCustomer: Scalars['Boolean'];
    organizationId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsMoveUserToOrganizationArgs = {
    organizationId: Scalars['ID'];
    stayOrgAdmin?: Maybe<Scalars['Boolean']>;
    userId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsDisconnectCallArgs = {
    scheduledAudioCallId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsStreamWebcastArgs = {
    eventId: Scalars['ID'];
    overrideUrl?: Maybe<Scalars['String']>;
};

/** Aiera graphql mutations.  */
export type MutationsOverrideEventDetailsArgs = {
    eventDetails: EventDetails;
    eventId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsMarkEventDeletedArgs = {
    eventId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsUpdateSpacArgs = {
    companyId: Scalars['ID'];
    targetCompanyName: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsCreateEventArgs = {
    input: CreateEventInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateEventArgs = {
    input: UpdateEventInput;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteEventArgs = {
    eventId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsExtendWebcastExpirationArgs = {
    eventId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsClearWebcastMarkersArgs = {
    eventId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsRequestEventArgs = {
    event: RequestEventInput;
};

/** Aiera graphql mutations.  */
export type MutationsTrackEventTermArgs = {
    equityId?: Maybe<Scalars['ID']>;
    eventId?: Maybe<Scalars['ID']>;
    gicsSectorId?: Maybe<Scalars['ID']>;
    synonyms?: Maybe<Array<Maybe<Scalars['String']>>>;
    term: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsUntrackEventTermArgs = {
    eventId?: Maybe<Scalars['ID']>;
    term?: Maybe<Scalars['String']>;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateEventItemArgs = {
    input: UpdateEventItemInput;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteEventItemArgs = {
    itemId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsUpdateEventNotificationsSettingsArgs = {
    emailEnabled?: Maybe<Scalars['Boolean']>;
    eventId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsUpdateOrganizationArgs = {
    organizationId: Scalars['ID'];
    organizationInfo: UpdateOrganizationInput;
};

/** Aiera graphql mutations.  */
export type MutationsSaveDomainConfigurationArgs = {
    input: DomainConfigurationInput;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteDomainConfigurationArgs = {
    input: DomainConfigurationInput;
};

/** Aiera graphql mutations.  */
export type MutationsCreateWatchlistArgs = {
    input: WatchlistInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateWatchlistArgs = {
    input: UpdateWatchlistInput;
};

/** Aiera graphql mutations.  */
export type MutationsDeleteWatchlistArgs = {
    watchlistId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsAddEquityToWatchlistArgs = {
    equityId: Scalars['ID'];
    watchlistId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsRemoveEquityFromWatchlistArgs = {
    equityId: Scalars['ID'];
    watchlistId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsAddCompanyToWatchlistArgs = {
    companyId: Scalars['ID'];
    watchlistId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsRemoveCompanyFromWatchlistArgs = {
    companyId: Scalars['ID'];
    watchlistId: Scalars['ID'];
};

/** Aiera graphql mutations.  */
export type MutationsRequestEquitiesArgs = {
    identifiers: Array<Maybe<Scalars['String']>>;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateUserArgs = {
    input: UserInput;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateUserObjectSettingsArgs = {
    input: UpdateUserObjectSettingsInput;
};

/** Aiera graphql mutations.  */
export type MutationsBulkUpdateUserObjectSettingsArgs = {
    inputs: Array<Maybe<UpdateUserObjectSettingsInput>>;
};

/** Aiera graphql mutations.  */
export type MutationsUpdateUserObjectStreamSettingsArgs = {
    input: UpdateUserObjectStreamSettingsInput;
};

/** Aiera graphql mutations.  */
export type MutationsSetPreferencesArgs = {
    input: Array<Maybe<PreferenceInput>>;
};

/** Aiera graphql mutations.  */
export type MutationsFollowEquitiesArgs = {
    equityIds: Array<Maybe<Scalars['ID']>>;
    follow?: Maybe<Scalars['Boolean']>;
    userId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsInviteUserArgs = {
    email: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsTrackActivityArgs = {
    companyId?: Maybe<Scalars['ID']>;
    contentId?: Maybe<Scalars['ID']>;
    dashboardId?: Maybe<Scalars['ID']>;
    dataRecordId?: Maybe<Scalars['ID']>;
    environment?: Maybe<TrackingEnvironment>;
    eventId?: Maybe<Scalars['ID']>;
    eventType?: Maybe<TrackingEventType>;
    streamId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsAddUserFinancialKpiArgs = {
    equityId: Scalars['ID'];
    eventId?: Maybe<Scalars['ID']>;
    financialTermKey: Scalars['ID'];
    scope?: Maybe<Scalars['String']>;
    userId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsRemoveUserFinancialKpiArgs = {
    eventId?: Maybe<Scalars['ID']>;
    userFinancialKpiId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsReplaceUserFinancialKpiArgs = {
    eventId?: Maybe<Scalars['ID']>;
    financialTermKey: Scalars['ID'];
    userFinancialKpiId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql mutations.  */
export type MutationsLoginArgs = {
    email?: Maybe<Scalars['String']>;
    password?: Maybe<Scalars['String']>;
};

/** Aiera graphql mutations.  */
export type MutationsSetPasswordArgs = {
    newPassword: Scalars['String'];
    oldPassword?: Maybe<Scalars['String']>;
};

/** Aiera graphql mutations.  */
export type MutationsForgotPasswordArgs = {
    email: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsResetPasswordArgs = {
    code: Scalars['String'];
    password: Scalars['String'];
};

/** Aiera graphql mutations.  */
export type MutationsRegisterArgs = {
    input: RegisterInput;
};

/** Aiera graphql mutations.  */
export type MutationsVerifyEmailArgs = {
    code: Scalars['String'];
};

export type NewsContent = Content & {
    __typename?: 'NewsContent';
    url?: Maybe<Scalars['String']>;
    redirectUrl?: Maybe<Scalars['String']>;
    license?: Maybe<NewsLicense>;
    copyright?: Maybe<Scalars['String']>;
    newsSource?: Maybe<NewsSource>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    canShowFullText?: Maybe<Scalars['Boolean']>;
};

export type NewsContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type NewsContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type NewsContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type NewsContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

/** An enumeration. */
export enum NewsLicense {
    Lexisnexis = 'lexisnexis',
    Public = 'public',
}

export type NewsSource = {
    __typename?: 'NewsSource';
    newsSourceId: Scalars['ID'];
    name: Scalars['String'];
    tags?: Maybe<Array<Maybe<NewsSourceTag>>>;
    id?: Maybe<Scalars['ID']>;
};

export type NewsSourceStreamRule = BaseStreamRule & {
    __typename?: 'NewsSourceStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    newsSource?: Maybe<NewsSource>;
};

export type NewsSourceTag = Tag & {
    __typename?: 'NewsSourceTag';
    tagId: Scalars['ID'];
    tagType?: Maybe<TagType>;
    slug?: Maybe<Scalars['String']>;
    displayName?: Maybe<Scalars['String']>;
    newsSources?: Maybe<Array<Maybe<NewsSource>>>;
    id?: Maybe<Scalars['ID']>;
};

export type NewsSourceTagStreamRule = BaseStreamRule & {
    __typename?: 'NewsSourceTagStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    newsSourceTag?: Maybe<NewsSourceTag>;
};

export type Notification = {
    __typename?: 'Notification';
    notificationId: Scalars['ID'];
    notificationType?: Maybe<NotificationType>;
    userId?: Maybe<Scalars['ID']>;
    organizationId?: Maybe<Scalars['ID']>;
    equityId?: Maybe<Scalars['ID']>;
    eventId?: Maybe<Scalars['Int']>;
    contentId?: Maybe<Scalars['ID']>;
    dashboardId?: Maybe<Scalars['ID']>;
    streamId?: Maybe<Scalars['ID']>;
    transcriptId?: Maybe<Scalars['ID']>;
    message?: Maybe<NotificationMessage>;
    schedule?: Maybe<Scalars['GenericScalar']>;
    expires?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    priority: Scalars['Int'];
    isRead: Scalars['Boolean'];
    deleted: Scalars['Boolean'];
    created: Scalars['DateTimeDefaultTimezone'];
    modified: Scalars['DateTimeDefaultTimezone'];
    twitterSent?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    stream?: Maybe<Stream>;
    dashboard?: Maybe<Dashboard>;
    equity?: Maybe<Equity>;
    event?: Maybe<ScheduledAudioCall>;
    content?: Maybe<Content>;
    transcript?: Maybe<ScheduledAudioCallEvent>;
    id?: Maybe<Scalars['ID']>;
};

export type NotificationInput = {
    notificationType: NotificationType;
    userId?: Maybe<Scalars['ID']>;
    organizationId?: Maybe<Scalars['ID']>;
    equityId?: Maybe<Scalars['ID']>;
    eventId?: Maybe<Scalars['ID']>;
    dashboardId?: Maybe<Scalars['ID']>;
    streamId?: Maybe<Scalars['ID']>;
    streamSpikeNotificationMessage?: Maybe<StreamSpikeNotificationMessageInput>;
};

export type NotificationMessage =
    | ContentNotificationMessage
    | StreamMatchNotificationMessage
    | StreamSpikeNotificationMessage
    | StreamMatchRollupNotificationMessage
    | EventStreamMatchNotificationMessage
    | EventQuicklinksMatchNotificationMessage
    | EventPriceReactionNotificationMessage
    | SpotlightMatchNotificationMessage;

export type NotificationStream = Stream & {
    __typename?: 'NotificationStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
    unreadCount?: Maybe<Scalars['Int']>;
};

export type NotificationStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type NotificationStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type NotificationStreamMatch = StreamMatch & {
    __typename?: 'NotificationStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<StreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    notification?: Maybe<Notification>;
};

export type NotificationStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

/** An enumeration. */
export enum NotificationType {
    Content = 'content',
    StreamMatch = 'stream_match',
    StreamMatchRollup = 'stream_match_rollup',
    StreamSpike = 'stream_spike',
    SpotlightMatch = 'spotlight_match',
    Event = 'event',
    EventStreamMatch = 'event_stream_match',
    EventPriceReaction = 'event_price_reaction',
    EventQuicklinksMatch = 'event_quicklinks_match',
}

export type Ohlc = {
    __typename?: 'Ohlc';
    date?: Maybe<Scalars['Date']>;
    open?: Maybe<Scalars['Float']>;
    close?: Maybe<Scalars['Float']>;
    high?: Maybe<Scalars['Float']>;
    low?: Maybe<Scalars['Float']>;
    volume?: Maybe<Scalars['Float']>;
    split?: Maybe<Scalars['Float']>;
    dividend?: Maybe<Scalars['Float']>;
    adjOpen?: Maybe<Scalars['Float']>;
    adjClose?: Maybe<Scalars['Float']>;
    adjHigh?: Maybe<Scalars['Float']>;
    adjLow?: Maybe<Scalars['Float']>;
    adjVolume?: Maybe<Scalars['Float']>;
};

export type OhlcFilter = {
    /** Start of date range */
    fromDate: Scalars['Date'];
    /** End of date range */
    toDate: Scalars['Date'];
};

export type OrgTag = {
    __typename?: 'OrgTag';
    userIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
    users?: Maybe<Array<Maybe<User>>>;
    tag?: Maybe<Scalars['String']>;
};

export type OrgTagsFilter = {
    recommended?: Maybe<Scalars['Boolean']>;
    companyId?: Maybe<Scalars['ID']>;
    contentType?: Maybe<TagsContentType>;
    includeBookmarks?: Maybe<Scalars['Boolean']>;
};

/** Aiera organization  */
export type Organization = {
    __typename?: 'Organization';
    billingSource?: Maybe<BillingSource>;
    organizationId: Scalars['ID'];
    name: Scalars['String'];
    seatAllotment: Scalars['Int'];
    isPremium: Scalars['Boolean'];
    isActive: Scalars['Boolean'];
    isCustomer: Scalars['Boolean'];
    createDate: Scalars['DateTimeDefaultTimezone'];
    pusherToken?: Maybe<Scalars['String']>;
    apiUser?: Maybe<User>;
    /** Users in this organization */
    users?: Maybe<Array<Maybe<User>>>;
    id?: Maybe<Scalars['ID']>;
    configuration?: Maybe<OrganizationConfiguration>;
    /** Organization admins can retrieve an invite code */
    inviteCode?: Maybe<Scalars['String']>;
    numActiveUsers?: Maybe<Scalars['Int']>;
    /** The payment methods this organization has set up */
    paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
    /** Any subscriptions the organization has or had */
    subscriptions?: Maybe<Array<Maybe<BillingSubscription>>>;
    /** The organization's active subscription, if any. */
    activeSubscription?: Maybe<BillingSubscription>;
    /** The organization's invoices */
    invoices?: Maybe<Array<Maybe<BillingInvoice>>>;
    /** If true, this organization directly manages its own billing and permissions. */
    isSelfServeBilling?: Maybe<Scalars['Boolean']>;
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightsCount?: Maybe<Scalars['Int']>;
    privateRecordingCount?: Maybe<Scalars['Int']>;
};

/** Aiera organization  */
export type OrganizationUsersArgs = {
    includeInvited?: Maybe<Scalars['Boolean']>;
    includeInactive?: Maybe<Scalars['Boolean']>;
};

/** Aiera organization  */
export type OrganizationSubscriptionsArgs = {
    includeInactive?: Maybe<Scalars['Boolean']>;
};

/** Aiera organization  */
export type OrganizationTagsArgs = {
    filter?: Maybe<OrgTagsFilter>;
};

export type OrganizationConfiguration = {
    __typename?: 'OrganizationConfiguration';
    organizationId?: Maybe<Scalars['ID']>;
    domains?: Maybe<Array<Maybe<DomainConfiguration>>>;
};

export type OrganizationFilter = {
    includeInactive?: Maybe<Scalars['Boolean']>;
    includeInternal?: Maybe<Scalars['Boolean']>;
    includeNonCustomers?: Maybe<Scalars['Boolean']>;
};

export type OrganizationInput = {
    /** Admins can pass in the org id to add the user to */
    organizationId?: Maybe<Scalars['ID']>;
    /** The new organization name */
    name?: Maybe<Scalars['String']>;
    /** How many seats are being purchased */
    seats?: Maybe<Scalars['Int']>;
    billingSource?: Maybe<BillingSource>;
};

export type OverrideEventDetails = {
    __typename?: 'OverrideEventDetails';
    success?: Maybe<Scalars['Boolean']>;
};

/** An enumeration. */
export enum PrConnectionType {
    Zoom = 'zoom',
    Webex = 'webex',
    MicrosoftTeams = 'microsoft_teams',
    GoogleMeet = 'google_meet',
    GotoMeeting = 'goto_meeting',
    JoinMe = 'join_me',
    Citrix = 'citrix',
    Skype = 'skype',
    UberConference = 'uber_conference',
    Webcast = 'webcast',
    Phone = 'phone',
}

/** An enumeration. */
export enum PrOnFailure {
    None = 'none',
    ManualIntervention = 'manual_intervention',
    AieraIntervention = 'aiera_intervention',
}

/** An enumeration. */
export enum PrStatus {
    Active = 'active',
    Deleted = 'deleted',
}

export type PartnershipSpotlightContent = Content & {
    __typename?: 'PartnershipSpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
};

export type PartnershipSpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type PartnershipSpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type PartnershipSpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type PartnershipSpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

/** An enumeration. */
export enum PasswordStatus {
    User = 'user',
    Generated = 'generated',
}

export type PaymentMethod = {
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    /** The billing address associated with this payment method */
    billingAddress?: Maybe<MailingAddress>;
    /** The name associated with this payment method (ex: the name on the CC) */
    billingName?: Maybe<Scalars['String']>;
    /** The type of payment method (ex: card) */
    type?: Maybe<PaymentMethodType>;
    /** The last four digits of the card. */
    last4?: Maybe<Scalars['String']>;
    /** The expiration month of the card, expressed as a number from 1-12 */
    expMonth?: Maybe<Scalars['Int']>;
    /** The expiration year of the card, expressed as 4 digits */
    expYear?: Maybe<Scalars['Int']>;
    /** The brand of the card */
    brand?: Maybe<CreditCardBrand>;
    /** Subscriptions that use this payment method */
    subscriptions?: Maybe<Array<Maybe<BillingSubscription>>>;
};

export type PaymentMethodInput = {
    /** A number 1-12 representing the card’s expiration month */
    expMonth: Scalars['Int'];
    /** A 4-digit number representing the card’s expiration year */
    expYear: Scalars['Int'];
    /** The name as listed on the card */
    billingName: Scalars['String'];
    /** The card's billing address */
    billingAddress: BillingAddressInput;
};

/** An enumeration. */
export enum PaymentMethodType {
    Card = 'card',
}

export type Performance = {
    __typename?: 'Performance';
    /** The % change from start to target */
    change?: Maybe<Scalars['Float']>;
    /** Index price at the start date */
    startDatePrice?: Maybe<Scalars['Float']>;
    /** Index price at the target date */
    targetDatePrice?: Maybe<Scalars['Float']>;
};

/** Input type for setting preferences.  */
export type PreferenceInput = {
    /** Type of preference, ux is the only one supported right now. */
    preferenceType: Scalars['String'];
    /** Name of the preference, contextSort for example */
    preferenceName: Scalars['String'];
    /** Value of the preference, conviction for example */
    preferenceValue?: Maybe<Scalars['String']>;
    /** JSON blob of the preference, sort order of equities list for example */
    preferenceData?: Maybe<Scalars['GenericScalar']>;
};

/** An enumeration. */
export enum PriceDelay {
    Eod = 'eod',
    FifteenMinute = 'fifteen_minute',
}

export type PrivateRecording = {
    __typename?: 'PrivateRecording';
    privateRecordingId: Scalars['ID'];
    userId: Scalars['ID'];
    organizationId: Scalars['ID'];
    title?: Maybe<Scalars['String']>;
    equityIds?: Maybe<Scalars['GenericScalar']>;
    tags?: Maybe<Scalars['GenericScalar']>;
    connectionType?: Maybe<PrConnectionType>;
    connectPhoneNumber?: Maybe<Scalars['String']>;
    connectAccessId?: Maybe<Scalars['String']>;
    connectPin?: Maybe<Scalars['String']>;
    connectOffsetSeconds: Scalars['Int'];
    onConnectDialNumber?: Maybe<Scalars['String']>;
    smsAlertBeforeCall?: Maybe<Scalars['Boolean']>;
    connectUrl?: Maybe<Scalars['String']>;
    scheduledFor?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    localeCode: Scalars['String'];
    onFailure?: Maybe<PrOnFailure>;
    onFailureDialNumber?: Maybe<Scalars['String']>;
    onFailureSmsNumber?: Maybe<Scalars['String']>;
    onFailureInstructions?: Maybe<Scalars['String']>;
    onCompleteEmailCreator?: Maybe<Scalars['Boolean']>;
    securityPin?: Maybe<Scalars['String']>;
    status: PrStatus;
    id?: Maybe<Scalars['ID']>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    companies?: Maybe<Array<Maybe<Company>>>;
    primaryCompany?: Maybe<Company>;
    /** Event groups (ex conferences) of which this private recording is a part */
    eventGroups?: Maybe<Array<Maybe<EventGroup>>>;
};

export type PrivateRecordingsFilter = {
    privateRecordingIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type ProcessDataCollection = {
    __typename?: 'ProcessDataCollection';
    success?: Maybe<Scalars['Boolean']>;
    dataCollection?: Maybe<DataCollection>;
};

/** An enumeration. */
export enum PublishedTranscriptQuality {
    None = 'none',
    Preliminary = 'preliminary',
    Final = 'final',
}

/** An enumeration. */
export enum PublishedTranscriptSource {
    None = 'none',
    Factset = 'factset',
    Refinitiv = 'refinitiv',
    ScriptsAsia = 'scripts_asia',
}

/** An enumeration. */
export enum PublishedTranscriptStatus {
    None = 'none',
    Identified = 'identified',
    Loaded = 'loaded',
    Processed = 'processed',
}

/** Aiera graphql queries.  */
export type Query = {
    __typename?: 'Query';
    privateRecordings?: Maybe<Array<Maybe<PrivateRecording>>>;
    bookmarks?: Maybe<Array<Maybe<Bookmark>>>;
    bookmarkTags?: Maybe<Array<Maybe<BookmarkTag>>>;
    issues?: Maybe<Array<Maybe<Issue>>>;
    /** Users notifications stream */
    notificationsStream?: Maybe<NotificationStream>;
    notifications?: Maybe<Array<Maybe<Notification>>>;
    tags?: Maybe<Array<Maybe<Tag>>>;
    billingProducts?: Maybe<Array<Maybe<BillingProduct>>>;
    filings?: Maybe<Array<Maybe<Filing>>>;
    filingForms?: Maybe<Array<Maybe<FilingForm>>>;
    dataCollections?: Maybe<Array<Maybe<DataCollection>>>;
    /** Return objects changed after the date passed in */
    changedObjects?: Maybe<Array<Maybe<SyncResult>>>;
    content?: Maybe<Array<Maybe<Content>>>;
    newsSources?: Maybe<Array<Maybe<NewsSource>>>;
    spotlightTypeHierarchy?: Maybe<Array<Maybe<HierarchyItem>>>;
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    galleryDashboards?: Maybe<Array<Maybe<DashboardGalleryTag>>>;
    galleryCategories?: Maybe<Array<Maybe<Scalars['String']>>>;
    streams?: Maybe<Array<Maybe<Stream>>>;
    streamMatchTemplates?: Maybe<Array<Maybe<StreamMatchTemplate>>>;
    assetClasses?: Maybe<Array<Maybe<AssetClass>>>;
    currencies?: Maybe<Array<Maybe<Currency>>>;
    countries?: Maybe<Array<Maybe<Country>>>;
    languages?: Maybe<Array<Maybe<Language>>>;
    locales?: Maybe<Array<Maybe<Locale>>>;
    exchanges?: Maybe<Array<Maybe<Exchange>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    sectors?: Maybe<Array<Maybe<GicsSector>>>;
    /** @deprecated use sectors (for now) */
    gicsSectors?: Maybe<Array<Maybe<Sector>>>;
    gicsSubSectors?: Maybe<Array<Maybe<GicsSubSector>>>;
    /** @deprecated Use eventTypes */
    streamSourceCategories?: Maybe<Array<Maybe<StreamSourceCategory>>>;
    eventTypes?: Maybe<Array<Maybe<EventType>>>;
    /** Returns financial time series results */
    timeseries?: Maybe<Array<Maybe<FinancialTimeSeriesResultSet>>>;
    /** Fetch scheduled audio calls */
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Fetch recommended scheduled audio calls */
    recommendedEvents?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Groups of events (ex: conferences) */
    eventGroups?: Maybe<Array<Maybe<EventGroup>>>;
    /** Event Requests by the current user */
    eventRequests?: Maybe<Array<Maybe<EventRequest>>>;
    /** Returns a score representing whether we think webcasts can handle this domain */
    webcastDomainConnectionQualityScore?: Maybe<Scalars['Float']>;
    search?: Maybe<Search>;
    resolve?: Maybe<Resolution>;
    /** Lookup some details about a generated code */
    code?: Maybe<InsecureCodeDetails>;
    timezones?: Maybe<Array<Maybe<Timezone>>>;
    /** Endpoint for testing slow queries */
    sleep?: Maybe<Scalars['ID']>;
    indices?: Maybe<Array<Maybe<Index>>>;
    /** Fetch watchlists */
    watchlists?: Maybe<Array<Maybe<Watchlist>>>;
    /** Fetch equities by id */
    equities?: Maybe<Array<Maybe<Equity>>>;
    companies?: Maybe<Array<Maybe<Company>>>;
    instruments?: Maybe<Array<Maybe<Instrument>>>;
    quotes?: Maybe<Array<Maybe<Quote>>>;
    organizations?: Maybe<Array<Maybe<Organization>>>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
    /** Retrieve one or more arbitrary users for support/testing purposes */
    users?: Maybe<Array<Maybe<User>>>;
    /** In case the user is logged out, returns the login url to get them back in. Used with SSO. */
    loginUrl?: Maybe<Scalars['String']>;
    id?: Maybe<Scalars['ID']>;
};

/** Aiera graphql queries.  */
export type QueryPrivateRecordingsArgs = {
    filter?: Maybe<PrivateRecordingsFilter>;
};

/** Aiera graphql queries.  */
export type QueryBookmarksArgs = {
    filter?: Maybe<BookmarksFilter>;
};

/** Aiera graphql queries.  */
export type QueryBookmarkTagsArgs = {
    filter?: Maybe<BookmarkTagsFilter>;
};

/** Aiera graphql queries.  */
export type QueryNotificationsArgs = {
    notificationIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql queries.  */
export type QueryTagsArgs = {
    filter?: Maybe<TagFilter>;
};

/** Aiera graphql queries.  */
export type QueryFilingsArgs = {
    filter: FilingFilter;
};

/** Aiera graphql queries.  */
export type QueryFilingFormsArgs = {
    filter?: Maybe<FilingFormFilter>;
};

/** Aiera graphql queries.  */
export type QueryDataCollectionsArgs = {
    filter?: Maybe<DataCollectionsFilter>;
};

/** Aiera graphql queries.  */
export type QueryChangedObjectsArgs = {
    modifiedSince: Scalars['DateTime'];
};

/** Aiera graphql queries.  */
export type QueryContentArgs = {
    filter: ContentFilter;
};

/** Aiera graphql queries.  */
export type QueryDashboardsArgs = {
    filter?: Maybe<DashboardsFilter>;
};

/** Aiera graphql queries.  */
export type QueryGalleryDashboardsArgs = {
    filter?: Maybe<GalleryDashboardsFilter>;
};

/** Aiera graphql queries.  */
export type QueryStreamsArgs = {
    filter?: Maybe<StreamsFilter>;
    clone?: Maybe<Scalars['Boolean']>;
    previewId?: Maybe<Scalars['ID']>;
};

/** Aiera graphql queries.  */
export type QueryStreamMatchTemplatesArgs = {
    filter?: Maybe<StreamMatchTemplatesFilter>;
};

/** Aiera graphql queries.  */
export type QueryLocalesArgs = {
    filter?: Maybe<LocaleFilter>;
};

/** Aiera graphql queries.  */
export type QuerySectorsArgs = {
    name?: Maybe<Scalars['String']>;
    ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** Aiera graphql queries.  */
export type QueryGicsSectorsArgs = {
    name?: Maybe<Scalars['String']>;
    ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** Aiera graphql queries.  */
export type QueryGicsSubSectorsArgs = {
    ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** Aiera graphql queries.  */
export type QueryTimeseriesArgs = {
    filters: Array<Maybe<FinancialTimeSeriesFilter>>;
};

/** Aiera graphql queries.  */
export type QueryEventsArgs = {
    eventIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    shareId?: Maybe<Scalars['ID']>;
    filter?: Maybe<ScheduledAudioCallFilter>;
};

/** Aiera graphql queries.  */
export type QueryEventGroupsArgs = {
    filter?: Maybe<EventGroupFilter>;
};

/** Aiera graphql queries.  */
export type QueryEventRequestsArgs = {
    filter?: Maybe<EventRequestFilter>;
};

/** Aiera graphql queries.  */
export type QueryWebcastDomainConnectionQualityScoreArgs = {
    url: Scalars['String'];
};

/** Aiera graphql queries.  */
export type QueryCodeArgs = {
    codeType?: Maybe<Scalars['String']>;
    code: Scalars['String'];
};

/** Aiera graphql queries.  */
export type QuerySleepArgs = {
    seconds: Scalars['Int'];
    id: Scalars['ID'];
};

/** Aiera graphql queries.  */
export type QueryIndicesArgs = {
    indexIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** Aiera graphql queries.  */
export type QueryEquitiesArgs = {
    equityIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql queries.  */
export type QueryCompaniesArgs = {
    companyIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql queries.  */
export type QueryInstrumentsArgs = {
    instrumentIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql queries.  */
export type QueryQuotesArgs = {
    instrumentIds: Array<Maybe<Scalars['ID']>>;
};

/** Aiera graphql queries.  */
export type QueryOrganizationsArgs = {
    organizationIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    filter?: Maybe<OrganizationFilter>;
};

/** Aiera graphql queries.  */
export type QueryUsersArgs = {
    userIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    filter?: Maybe<UserFilter>;
};

export type Quote = {
    __typename?: 'Quote';
    guid: Scalars['String'];
    isPrimary: Scalars['Boolean'];
    localTicker: Scalars['String'];
    ric: Scalars['String'];
    instrument?: Maybe<Instrument>;
    exchange?: Maybe<Exchange>;
    currency?: Maybe<Currency>;
    ohlc?: Maybe<Array<Maybe<QuoteOhlc>>>;
    id?: Maybe<Scalars['ID']>;
    shortGuid?: Maybe<Scalars['String']>;
    prevClose?: Maybe<Scalars['Float']>;
    latestOhlc?: Maybe<QuoteOhlc>;
    technicals?: Maybe<QuoteTechnicals>;
};

export type QuoteOhlcArgs = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
};

export type QuoteOhlc = {
    __typename?: 'QuoteOhlc';
    date?: Maybe<Scalars['Date']>;
    open?: Maybe<Scalars['Float']>;
    close?: Maybe<Scalars['Float']>;
    high?: Maybe<Scalars['Float']>;
    low?: Maybe<Scalars['Float']>;
    volume?: Maybe<Scalars['Float']>;
    split?: Maybe<Scalars['Float']>;
    dividend?: Maybe<Scalars['Float']>;
    adjOpen?: Maybe<Scalars['Float']>;
    adjClose?: Maybe<Scalars['Float']>;
    adjHigh?: Maybe<Scalars['Float']>;
    adjLow?: Maybe<Scalars['Float']>;
    adjVolume?: Maybe<Scalars['Float']>;
    quote?: Maybe<Quote>;
};

export type QuoteTechnicals = {
    __typename?: 'QuoteTechnicals';
    beta?: Maybe<Scalars['Float']>;
    volume?: Maybe<Scalars['Float']>;
    averageDailyVolume?: Maybe<Scalars['Float']>;
    pricetoearnings?: Maybe<Scalars['Float']>;
    pricetocurrentyearearnings?: Maybe<Scalars['Float']>;
    pricetocurrentyearrevenue?: Maybe<Scalars['Float']>;
    id?: Maybe<Scalars['ID']>;
};

export type RaiseContentIssue = {
    __typename?: 'RaiseContentIssue';
    success?: Maybe<Scalars['Boolean']>;
    issue?: Maybe<ContentIssue>;
};

export type RaiseEventIssue = {
    __typename?: 'RaiseEventIssue';
    success?: Maybe<Scalars['Boolean']>;
    issue?: Maybe<EventIssue>;
};

export type RealtimeEventPrice = {
    __typename?: 'RealtimeEventPrice';
    date?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    price?: Maybe<Scalars['Float']>;
    volume?: Maybe<Scalars['Int']>;
    changeAmount?: Maybe<Scalars['Float']>;
    changePercent?: Maybe<Scalars['Float']>;
    changeAmountSinceLastClose?: Maybe<Scalars['Float']>;
    changePercentSinceLastClose?: Maybe<Scalars['Float']>;
    volumeChangeFromLast?: Maybe<Scalars['Float']>;
    volumeChangeAmount?: Maybe<Scalars['Int']>;
    volumeChangePercent?: Maybe<Scalars['Float']>;
};

export type RealtimePriceFilter = {
    after?: Maybe<Scalars['DateTime']>;
};

export type Register = {
    __typename?: 'Register';
    success?: Maybe<Scalars['Boolean']>;
    /** The newly created user account */
    user?: Maybe<User>;
    /** If a password was generated for the user, it is returned here */
    password?: Maybe<Scalars['String']>;
    /** The code to send other users to invite them to the org */
    inviteCode?: Maybe<Code>;
};

export type RegisterInput = {
    /** Email address for new Aiera account. A verify email is sent here */
    email: Scalars['String'];
    /** First name */
    firstName?: Maybe<Scalars['String']>;
    /** Last name */
    lastName?: Maybe<Scalars['String']>;
    /** Phone */
    phone?: Maybe<Scalars['String']>;
    /** Password for logging back into Aiera. If not passed in, a password will be generated. */
    password?: Maybe<Scalars['String']>;
    /** Invite code. Required if not creating a new self-serve org */
    code?: Maybe<Scalars['String']>;
    /** List of equity IDs to follow */
    equityIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** User preferences */
    preferences?: Maybe<Array<Maybe<PreferenceInput>>>;
    /** Admins can pass in the status of the user */
    status?: Maybe<Scalars['String']>;
    /** Optional org details for creating a new organization */
    organization?: Maybe<OrganizationInput>;
};

export type RemoveCompanyFromWatchlist = {
    __typename?: 'RemoveCompanyFromWatchlist';
    success?: Maybe<Scalars['Boolean']>;
    watchlist?: Maybe<Watchlist>;
    company?: Maybe<Company>;
};

export type RemoveDashboardFromSection = {
    __typename?: 'RemoveDashboardFromSection';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created section */
    dashboardSection?: Maybe<DashboardSection>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type RemoveDefaultEquityFinancialKpi = {
    __typename?: 'RemoveDefaultEquityFinancialKPI';
    success?: Maybe<Scalars['Boolean']>;
};

export type RemoveEquityFromEventRealtimeNotificationScope = {
    __typename?: 'RemoveEquityFromEventRealtimeNotificationScope';
    success?: Maybe<Scalars['Boolean']>;
    preferences?: Maybe<GlobalRealtimeNotificationPreferences>;
};

export type RemoveEquityFromWatchlist = {
    __typename?: 'RemoveEquityFromWatchlist';
    success?: Maybe<Scalars['Boolean']>;
    watchlist?: Maybe<Watchlist>;
    equity?: Maybe<Equity>;
};

export type RemovePaymentMethod = {
    __typename?: 'RemovePaymentMethod';
    success?: Maybe<Scalars['Boolean']>;
    paymentMethod?: Maybe<PaymentMethod>;
};

export type RemoveUserFinancialKpi = {
    __typename?: 'RemoveUserFinancialKPI';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
    equity?: Maybe<Equity>;
    event?: Maybe<ScheduledAudioCall>;
};

export type RemoveWatchlistFromEventRealtimeNotificationScope = {
    __typename?: 'RemoveWatchlistFromEventRealtimeNotificationScope';
    success?: Maybe<Scalars['Boolean']>;
    preferences?: Maybe<GlobalRealtimeNotificationPreferences>;
};

export type ReplaceUserFinancialKpi = {
    __typename?: 'ReplaceUserFinancialKPI';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
    equity?: Maybe<Equity>;
    event?: Maybe<ScheduledAudioCall>;
};

/** Request equities to be added by identifier */
export type RequestEquities = {
    __typename?: 'RequestEquities';
    success?: Maybe<Scalars['Boolean']>;
    requestedEquities?: Maybe<Array<Maybe<RequestedEquity>>>;
};

export type RequestEvent = {
    __typename?: 'RequestEvent';
    success?: Maybe<Scalars['Boolean']>;
    eventRequest?: Maybe<EventRequest>;
};

export type RequestEventInput = {
    equityIdentifier: Scalars['String'];
    time: Scalars['DateTime'];
    title: Scalars['String'];
    webcastUrl?: Maybe<Scalars['String']>;
    dialInPhoneNumber?: Maybe<Scalars['String']>;
    dialInPin?: Maybe<Scalars['String']>;
};

export type RequestedEquity = {
    __typename?: 'RequestedEquity';
    requestId: Scalars['ID'];
    userId: Scalars['ID'];
    ticker: Scalars['String'];
    exchangeId?: Maybe<Scalars['ID']>;
    status: EquityRequestStatus;
    reviewingRetoolUser?: Maybe<Scalars['String']>;
    created: Scalars['DateTimeDefaultTimezone'];
    modified: Scalars['DateTimeDefaultTimezone'];
    user?: Maybe<User>;
    exchange?: Maybe<Exchange>;
    id?: Maybe<Scalars['ID']>;
};

/** Changes the password for the email referenced by the code passed in.  */
export type ResetPassword = {
    __typename?: 'ResetPassword';
    success?: Maybe<Scalars['Boolean']>;
};

export type Resolution = {
    __typename?: 'Resolution';
    equities?: Maybe<Array<Maybe<EquityResolution>>>;
};

export type ResolutionEquitiesArgs = {
    identifiers: Array<Maybe<Scalars['String']>>;
    filter?: Maybe<EquityResolutionFilter>;
};

export type RollupStream = Stream & {
    __typename?: 'RollupStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type RollupStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type RollupStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

/** An enumeration. */
export enum RuleCondition {
    IsEqual = 'is_equal',
    IsNotEqual = 'is_not_equal',
    IsGreaterThan = 'is_greater_than',
    IsLessThan = 'is_less_than',
    IsGreaterThanOrEqualTo = 'is_greater_than_or_equal_to',
    IsLessThanOrEqualTo = 'is_less_than_or_equal_to',
    IsWithin = 'is_within',
    IsWithinPast = 'is_within_past',
    IsBetween = 'is_between',
}

/** An enumeration. */
export enum SpacStatus {
    None = 'none',
    Ipo = 'ipo',
    TargetRumored = 'target_rumored',
    TargetAnnounced = 'target_announced',
    Merged = 'merged',
}

export type SalesMetricSpotlightContent = Content & {
    __typename?: 'SalesMetricSpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    salesMetric?: Maybe<Scalars['String']>;
    percentChange?: Maybe<Scalars['Float']>;
};

export type SalesMetricSpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type SalesMetricSpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type SalesMetricSpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type SalesMetricSpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type SaveDomainConfiguration = {
    __typename?: 'SaveDomainConfiguration';
    success?: Maybe<Scalars['Boolean']>;
    domainConfiguration?: Maybe<DomainConfiguration>;
};

export type ScheduledAudioCall = {
    __typename?: 'ScheduledAudioCall';
    scheduledAudioCallId: Scalars['ID'];
    sacSourceId?: Maybe<Scalars['ID']>;
    equityId?: Maybe<Scalars['ID']>;
    createdByUserId?: Maybe<Scalars['ID']>;
    source?: Maybe<Event_Source>;
    organizationId?: Maybe<Scalars['ID']>;
    callType: Call_Type;
    sourceEventType?: Maybe<Scalars['String']>;
    title?: Maybe<Scalars['String']>;
    callDate: Scalars['DateTimeDefaultTimezone'];
    fiscalQuarter?: Maybe<Scalars['Int']>;
    fiscalYear?: Maybe<Scalars['Int']>;
    callExpires?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    verified: Scalars['Int'];
    conferenceNumber?: Maybe<Scalars['String']>;
    conferenceNumberAlt?: Maybe<Scalars['String']>;
    conferencePin?: Maybe<Scalars['String']>;
    conferenceNotes?: Maybe<Scalars['String']>;
    broadcastUrl?: Maybe<Scalars['String']>;
    replayUrl?: Maybe<Scalars['String']>;
    slidesUrl?: Maybe<Scalars['String']>;
    slidesUrlMimeType?: Maybe<Scalars['String']>;
    archivedSlidesUrl?: Maybe<Scalars['String']>;
    pressUrl?: Maybe<Scalars['String']>;
    pressUrlMimeType?: Maybe<Scalars['String']>;
    localTranscriptFileUrl?: Maybe<Scalars['String']>;
    webcastStatus?: Maybe<ScheduledAudioCallWebcastStatus>;
    callProvider: ScheduledAudioCallCallProvider;
    streamProvider: ScheduledAudioCallStreamProvider;
    transcriptionProvider: ScheduledAudioCallTranscriptionProvider;
    transcriptionStatus?: Maybe<ScheduledAudioCallTranscriptionStatus>;
    transcriptionConnectionId?: Maybe<Scalars['String']>;
    transcriptionConnectedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    transcriptionDisconnectedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    transcriptionAudioOffsetSeconds?: Maybe<Scalars['Int']>;
    /** The URL of file containing the call's audio */
    transcriptionAudioUrl?: Maybe<Scalars['String']>;
    publishedTranscriptStatus: PublishedTranscriptStatus;
    publishedTranscriptSource: PublishedTranscriptSource;
    publishedTranscriptQuality: PublishedTranscriptQuality;
    attachmentsProcessed: Scalars['Boolean'];
    firstLiveTranscriptItemId?: Maybe<Scalars['ID']>;
    agent?: Maybe<Scalars['String']>;
    agentPhone?: Maybe<Scalars['String']>;
    siftTokens?: Maybe<Scalars['GenericScalar']>;
    authToken?: Maybe<Scalars['String']>;
    shareId?: Maybe<Scalars['String']>;
    quoddPriceAtStart?: Maybe<Scalars['ID']>;
    quoddVolumeAtStart?: Maybe<Scalars['ID']>;
    quoddPriceAtEnd?: Maybe<Scalars['ID']>;
    quoddVolumeAtEnd?: Maybe<Scalars['ID']>;
    previousDayClosePrice?: Maybe<Scalars['Float']>;
    currentDayOpenPrice?: Maybe<Scalars['Float']>;
    currentDayClosePrice?: Maybe<Scalars['Float']>;
    /** @deprecated Use previousDayClosePrice or currentDayClosePrice, depending on context */
    lastClosePrice?: Maybe<Scalars['Float']>;
    priority?: Maybe<ScheduledAudioCallPriority>;
    status?: Maybe<ScheduledAudioCallStatus>;
    sourceTranscriptId?: Maybe<Scalars['String']>;
    transcriptCurrentVersion: Scalars['Int'];
    lastUpdated: Scalars['DateTimeDefaultTimezone'];
    hidden: Scalars['Boolean'];
    autodial: Scalars['Boolean'];
    failureCode?: Maybe<ScheduledAudioCallWebcastFailureCode>;
    audioStreamUri?: Maybe<Scalars['String']>;
    localeCode?: Maybe<Scalars['String']>;
    created: Scalars['DateTimeDefaultTimezone'];
    modified: Scalars['DateTimeDefaultTimezone'];
    equity?: Maybe<Equity>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCallEvent>>>;
    createdByUser?: Maybe<User>;
    /** Event groups (ex conferences) of which this event is a part */
    eventGroups?: Maybe<Array<Maybe<EventGroup>>>;
    /** Content items associated with this event */
    content?: Maybe<Array<Maybe<Content>>>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    eventId?: Maybe<Scalars['ID']>;
    date?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    /** The individual items that make up this event -- either live or published, depending on context. */
    items?: Maybe<Array<Maybe<ScheduledAudioCallEvent>>>;
    tokens?: Maybe<ScheduledAudioCallTokens>;
    realtimePrices?: Maybe<Array<Maybe<RealtimeEventPrice>>>;
    /**
     * KPI tracked terms for the event
     * @deprecated Use tracked_term_search_results
     */
    trackedTerms?: Maybe<Array<Maybe<TrackedTerm>>>;
    startPrice?: Maybe<Scalars['Float']>;
    /** Whether or not this call has any transcripts, live or official. */
    hasTranscript?: Maybe<Scalars['Boolean']>;
    /** Whether or not this call has a published transcript available */
    hasPublishedTranscript?: Maybe<Scalars['Boolean']>;
    /** Whether or not this the published transcript for this call has official timestamps */
    hasOfficialTimestamps?: Maybe<Scalars['Boolean']>;
    /** Whether we expect to get a published transcript for this event */
    expectPublishedTranscript?: Maybe<Scalars['Boolean']>;
    attachments?: Maybe<Array<Maybe<Attachment>>>;
    /** Financial and term monitor differentials */
    differentials?: Maybe<Differentials>;
    /** Tracked term matches for this event */
    trackedTermSearchResults?: Maybe<Array<Maybe<TrackedTermSearchResult>>>;
    /** Streams that match this event */
    streams?: Maybe<Array<Maybe<Stream>>>;
    emailNotificationsEnabled?: Maybe<Scalars['Boolean']>;
    /** Notable price changes for event */
    priceHighlight?: Maybe<EventPriceHighlight>;
    deleted?: Maybe<Scalars['Boolean']>;
    isLive?: Maybe<Scalars['Boolean']>;
    /** If true, this event begins after trading hours end and a close price for the day has been set.Currently only valid for events corresponding with equities on US exchanges */
    afterMarketClose?: Maybe<Scalars['Boolean']>;
    privateRecording?: Maybe<PrivateRecording>;
    state?: Maybe<ScheduledAudioCallState>;
    highlightsCount?: Maybe<Scalars['Int']>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    isSharedPublicly?: Maybe<Scalars['Boolean']>;
    /** If true, the specific time listed on this event can be disregarded - only the date is known */
    hasUnknownTime?: Maybe<Scalars['Boolean']>;
};

export type ScheduledAudioCallContentArgs = {
    filter?: Maybe<ContentFilter>;
};

export type ScheduledAudioCallUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type ScheduledAudioCallItemsArgs = {
    afterItemId?: Maybe<Scalars['ID']>;
    outliersOnly?: Maybe<Scalars['Boolean']>;
};

export type ScheduledAudioCallRealtimePricesArgs = {
    filter?: Maybe<RealtimePriceFilter>;
};

export type ScheduledAudioCallStreamsArgs = {
    filter?: Maybe<ScheduledAudioCallStreamsFilter>;
};

/** An enumeration. */
export enum ScheduledAudioCallCallProvider {
    Gridspace = 'gridspace',
    Twilio = 'twilio',
}

export type ScheduledAudioCallEvent = {
    __typename?: 'ScheduledAudioCallEvent';
    eventId: Scalars['ID'];
    scheduledAudioCallId?: Maybe<Scalars['Int']>;
    eventType?: Maybe<Event_Type>;
    status?: Maybe<Status>;
    startTime?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    endTime?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    conversationId?: Maybe<Scalars['String']>;
    connectionId?: Maybe<Scalars['String']>;
    transcript?: Maybe<Scalars['String']>;
    transcriptCorrected?: Maybe<Scalars['String']>;
    startMs?: Maybe<Scalars['Int']>;
    durationMs?: Maybe<Scalars['Int']>;
    startTimestampMs?: Maybe<Scalars['ID']>;
    startTimestamp?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    talkTimes?: Maybe<Scalars['GenericScalar']>;
    topics?: Maybe<Scalars['GenericScalar']>;
    annotated?: Maybe<Scalars['String']>;
    wordDurationsMs?: Maybe<Scalars['GenericScalar']>;
    prettyWordOffsetsMs?: Maybe<Scalars['GenericScalar']>;
    prettyWordDurationsMs?: Maybe<Scalars['GenericScalar']>;
    wordOffsetsMs?: Maybe<Scalars['GenericScalar']>;
    transcriptSpeakerId?: Maybe<Scalars['ID']>;
    transcriptSection?: Maybe<TranscriptSection>;
    transcriptVersion?: Maybe<Scalars['Int']>;
    metrics?: Maybe<Scalars['GenericScalar']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    /** @deprecated Use `event` */
    scheduledAudioCall?: Maybe<ScheduledAudioCall>;
    speaker?: Maybe<Speaker>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    itemId?: Maybe<Scalars['ID']>;
    type?: Maybe<Scalars['String']>;
    section?: Maybe<Scalars['String']>;
    event?: Maybe<ScheduledAudioCall>;
    /** Sentiment data for this event item */
    sentiment?: Maybe<Sentiment>;
    /** For realtime transcript events, this is equivalent to start_timestamp. For published transcript events (for now), this is the parent call's call_date. This exposed graphql field will stay consistent with the logic of the corresponding derived elastic index field and is provided as a convenience for the client in sorting. */
    derivedOrderingTimestamp?: Maybe<Scalars['DateTime']>;
};

export type ScheduledAudioCallEventTranscriptArgs = {
    annotate?: Maybe<Scalars['Boolean']>;
};

export type ScheduledAudioCallEventUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type ScheduledAudioCallFilter = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
    organizationId?: Maybe<Scalars['ID']>;
    /** Filter to audio calls that have a title, ticker, or company name that match the search term */
    term?: Maybe<Scalars['String']>;
    /** Filter to audio calls with the selected call types */
    callTypes?: Maybe<Array<Maybe<ScheduledAudioCallTypes>>>;
    /** If true, filter to audio calls for followed tickers only */
    isFollowed?: Maybe<Scalars['Boolean']>;
    /** If true, include events without a transcript, conference_number, or broadcast_url */
    showHidden?: Maybe<Scalars['Boolean']>;
    exchangeCountryCode?: Maybe<Scalars['String']>;
    countryCode?: Maybe<Scalars['String']>;
    gicsSectorId?: Maybe<Scalars['ID']>;
    gicsSubSectorId?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum ScheduledAudioCallPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export type ScheduledAudioCallState = {
    __typename?: 'ScheduledAudioCallState';
    current?: Maybe<Array<Maybe<EventState>>>;
    history?: Maybe<Array<Maybe<EventState>>>;
};

/** An enumeration. */
export enum ScheduledAudioCallStatus {
    Active = 'active',
    Deleted = 'deleted',
}

/** An enumeration. */
export enum ScheduledAudioCallStreamProvider {
    Gridspace = 'gridspace',
    Twilio = 'twilio',
    Aiera = 'aiera',
    Wcs = 'wcs',
}

export type ScheduledAudioCallStreamsFilter = {
    userStreams?: Maybe<Scalars['Boolean']>;
    quicklinkStreams?: Maybe<Scalars['Boolean']>;
    topicStreams?: Maybe<Scalars['Boolean']>;
};

export type ScheduledAudioCallTokens = {
    __typename?: 'ScheduledAudioCallTokens';
    siftToken?: Maybe<Scalars['String']>;
    callToken?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum ScheduledAudioCallTranscriptionProvider {
    Gridspace = 'gridspace',
    Google = 'google',
    Amazon = 'amazon',
}

/** An enumeration. */
export enum ScheduledAudioCallTranscriptionStatus {
    Submitted = 'submitted',
    AgentConnected = 'agent_connected',
    Connected = 'connected',
    Started = 'started',
    Finished = 'finished',
    Missed = 'missed',
    Archived = 'archived',
}

export enum ScheduledAudioCallTypes {
    Earnings = 'earnings',
    EarningsRelease = 'earnings_release',
    Presentation = 'presentation',
    ShareholderMeeting = 'shareholder_meeting',
    InvestorMeeting = 'investor_meeting',
    SpecialSituation = 'special_situation',
}

/** An enumeration. */
export enum ScheduledAudioCallWebcastFailureCode {
    AgentErrorInterventionTimeout = 'agent_error_intervention_timeout',
    AgentErrorReqEarlyRegistration = 'agent_error_req_early_registration',
    EventErrorCancelled = 'event_error_cancelled',
    EventErrorRescheduled = 'event_error_rescheduled',
    EventErrorNoAudio = 'event_error_no_audio',
    EventErrorNoAccess = 'event_error_no_access',
    EventErrorAccessedNotStarted = 'event_error_accessed_not_started',
    EventErrorWrongInfoGiven = 'event_error_wrong_info_given',
    EventErrorEnded = 'event_error_ended',
    EventErrorOther = 'event_error_other',
    TechErrorZoom = 'tech_error_zoom',
    TechErrorOther = 'tech_error_other',
    Other = 'other',
}

/** An enumeration. */
export enum ScheduledAudioCallWebcastStatus {
    CheckFailed = 'check_failed',
    CheckSucceeded = 'check_succeeded',
    StreamStarted = 'stream_started',
    StreamFailed = 'stream_failed',
    StreamSucceeded = 'stream_succeeded',
}

export type Search = {
    __typename?: 'Search';
    equities?: Maybe<EquitySearchResult>;
};

export type SearchEquitiesArgs = {
    term?: Maybe<Scalars['String']>;
};

export type SearchFacet = {
    __typename?: 'SearchFacet';
    key?: Maybe<Scalars['String']>;
    count?: Maybe<Scalars['Int']>;
};

export type SearchFacetGroup = {
    __typename?: 'SearchFacetGroup';
    name?: Maybe<Scalars['String']>;
    facets?: Maybe<Array<Maybe<SearchFacet>>>;
};

export type SearchHistory = {
    __typename?: 'SearchHistory';
    searchHistoryId: Scalars['ID'];
    userId: Scalars['ID'];
    search: Scalars['String'];
    created: Scalars['DateTimeDefaultTimezone'];
    user?: Maybe<User>;
    id?: Maybe<Scalars['ID']>;
};

export type Sector = {
    __typename?: 'Sector';
    id?: Maybe<Scalars['ID']>;
    name?: Maybe<Scalars['String']>;
    numEquities?: Maybe<Scalars['Int']>;
    subSectors?: Maybe<Array<Maybe<Sector>>>;
    equities?: Maybe<Array<Maybe<Equity>>>;
};

export type Sentiment = {
    __typename?: 'Sentiment';
    primaryEmotion?: Maybe<Scalars['String']>;
    primarySentiment?: Maybe<Scalars['String']>;
    primarySentimentScore?: Maybe<Scalars['Float']>;
};

export type SetDashboardSectionOpenClose = {
    __typename?: 'SetDashboardSectionOpenClose';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created section */
    dashboardSection?: Maybe<DashboardSection>;
};

export type SetDashboardSectionPosition = {
    __typename?: 'SetDashboardSectionPosition';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created section */
    dashboardSection?: Maybe<DashboardSection>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type SetGlobalRealtimeNotificationPreferences = {
    __typename?: 'SetGlobalRealtimeNotificationPreferences';
    success?: Maybe<Scalars['Boolean']>;
    preferences?: Maybe<GlobalRealtimeNotificationPreferences>;
};

export type SetOrganizationCustomerStatus = {
    __typename?: 'SetOrganizationCustomerStatus';
    success?: Maybe<Scalars['Boolean']>;
    organization?: Maybe<Organization>;
};

/** Changes the logged in users password.  */
export type SetPassword = {
    __typename?: 'SetPassword';
    success?: Maybe<Scalars['Boolean']>;
};

/** Set a user preference.  */
export type SetPreferences = {
    __typename?: 'SetPreferences';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
};

/** Sets the lens specific to the user on a stream.  */
export type SetStreamLens = {
    __typename?: 'SetStreamLens';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated stream */
    stream?: Maybe<Stream>;
};

/** Sets the rules specific to the user on a stream.  */
export type SetStreamRules = {
    __typename?: 'SetStreamRules';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated stream */
    stream?: Maybe<Stream>;
};

export type SetStreamRulesInput = {
    /** ID of the stream to set the rules on */
    streamId: Scalars['ID'];
    /** Rules */
    rules: Array<Maybe<StreamRuleInput>>;
};

export type SetSubscriptionPaymentMethod = {
    __typename?: 'SetSubscriptionPaymentMethod';
    success?: Maybe<Scalars['Boolean']>;
    subscription?: Maybe<BillingSubscription>;
};

export type SetUserCustomerType = {
    __typename?: 'SetUserCustomerType';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
};

export type ShareBookmark = {
    __typename?: 'ShareBookmark';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    affectedTargets?: Maybe<Array<Maybe<BookmarkTarget>>>;
    bookmark?: Maybe<Bookmark>;
};

export type ShareBookmarkInput = {
    bookmarkId: Scalars['ID'];
    shared: Scalars['Boolean'];
};

export type SnoozeNotifications = {
    __typename?: 'SnoozeNotifications';
    success?: Maybe<Scalars['Boolean']>;
    preferences?: Maybe<GlobalRealtimeNotificationPreferences>;
};

export type Speaker = {
    __typename?: 'Speaker';
    speakerId: Scalars['ID'];
    entityId?: Maybe<Scalars['String']>;
    speakerType?: Maybe<Scalars['String']>;
    name: Scalars['String'];
    title?: Maybe<Scalars['String']>;
    personId: Scalars['ID'];
    firmId?: Maybe<Scalars['ID']>;
    firm?: Maybe<Firm>;
    id?: Maybe<Scalars['ID']>;
    affiliation?: Maybe<Scalars['String']>;
};

export type SpinOffSpotlightContent = Content & {
    __typename?: 'SpinOffSpotlightContent';
    spotlightType?: Maybe<SpotlightType>;
    eventDate: Scalars['String'];
    tradeDate: Scalars['String'];
    spotlightPeriod?: Maybe<SpotlightPeriod>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    title?: Maybe<Scalars['String']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
    announcementType?: Maybe<Scalars['String']>;
    spinoffType?: Maybe<Scalars['String']>;
    effectiveDateRange?: Maybe<Scalars['String']>;
    effectiveDate?: Maybe<Scalars['Date']>;
};

export type SpinOffSpotlightContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type SpinOffSpotlightContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type SpinOffSpotlightContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type SpinOffSpotlightContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type SpotlightMatchNotificationMessage = {
    __typename?: 'SpotlightMatchNotificationMessage';
    highlight?: Maybe<Scalars['String']>;
    keywordMatches?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** An enumeration. */
export enum SpotlightPeriod {
    Year = 'year',
    Quarter = 'quarter',
    Month = 'month',
}

/** An enumeration. */
export enum SpotlightType {
    Guidance = 'guidance',
    EarningsPreview = 'earnings_preview',
    BusinessUpdate = 'business_update',
    ImpairmentCharge = 'impairment_charge',
    Alliance = 'alliance',
    JointVenture = 'joint_venture',
    JointVentureClose = 'joint_venture_close',
    AssetPurchase = 'asset_purchase',
    BuPurchase = 'bu_purchase',
    MAndAAnnouncement = 'm_and_a_announcement',
    BuybackAuthorization = 'buyback_authorization',
    SameStoreSales = 'same_store_sales',
    SpinOff = 'spin_off',
    Ipo = 'ipo',
}

export type SpotlightTypeStreamRule = BaseStreamRule & {
    __typename?: 'SpotlightTypeStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    spotlightTypeHierarchyItem?: Maybe<HierarchyItem>;
};

export type StarDashboard = {
    __typename?: 'StarDashboard';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated dashboard */
    dashboard?: Maybe<Dashboard>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type Stream = {
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    streamId?: Maybe<Scalars['ID']>;
    streamKey?: Maybe<Scalars['String']>;
    name?: Maybe<Scalars['String']>;
    matches?: Maybe<StreamMatches>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    creatingUser?: Maybe<User>;
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    dataCollection?: Maybe<DataCollection>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    lens?: Maybe<Stream>;
    clonedFrom?: Maybe<Scalars['Int']>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
};

export type StreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type StreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type StreamDifferential = {
    __typename?: 'StreamDifferential';
    stream?: Maybe<Stream>;
    /** Events related to the main event to compare for differentials */
    events?: Maybe<Array<Maybe<StreamDifferentialEvent>>>;
};

export type StreamDifferentialEvent = {
    __typename?: 'StreamDifferentialEvent';
    /** An event that is part if a differential query */
    event?: Maybe<ScheduledAudioCall>;
    /** The number of mentions of a specific tracked term in the event */
    numMatches?: Maybe<Scalars['Int']>;
};

export type StreamInput = {
    /** The name of the dashboard */
    name?: Maybe<Scalars['String']>;
    /** Dashboard preferences */
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    /** Categories */
    categories?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** Tags */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    rules?: Maybe<Array<Maybe<StreamRuleInput>>>;
    searchable?: Maybe<Scalars['Boolean']>;
    streamType: StreamType;
    filterMode?: Maybe<FilterMode>;
    /** IDs of the dashboards to save the stream to */
    dashboardIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Pin the stream to a specific equity */
    pinToEquityId?: Maybe<Scalars['ID']>;
    /** ID of the data collection to associate with the stream */
    dataCollectionId?: Maybe<Scalars['ID']>;
    /** ID of the stream match template to associate with the stream */
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    position?: Maybe<Scalars['Int']>;
};

export type StreamLens = Stream & {
    __typename?: 'StreamLens';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
};

export type StreamLensUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type StreamLensMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type StreamLensInput = {
    rules?: Maybe<Array<Maybe<StreamRuleInput>>>;
};

export type StreamMatch = {
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<StreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
};

export type StreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type StreamMatchAggTarget = ScheduledAudioCall;

export type StreamMatchFilter = {
    dashboardId?: Maybe<Scalars['ID']>;
    lenses?: Maybe<Array<Maybe<StreamLensInput>>>;
    rules?: Maybe<Array<Maybe<StreamRuleInput>>>;
    applyLens?: Maybe<Scalars['Boolean']>;
};

export type StreamMatchNotificationMessage = {
    __typename?: 'StreamMatchNotificationMessage';
    highlight?: Maybe<Scalars['String']>;
    keywordMatches?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type StreamMatchRollupNotificationKeyword = {
    __typename?: 'StreamMatchRollupNotificationKeyword';
    keyword?: Maybe<Scalars['String']>;
    count?: Maybe<Scalars['Int']>;
};

export type StreamMatchRollupNotificationMessage = {
    __typename?: 'StreamMatchRollupNotificationMessage';
    numMentions?: Maybe<Scalars['Int']>;
    since?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    keywords?: Maybe<Array<Maybe<StreamMatchRollupNotificationKeyword>>>;
    equityIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
    equities?: Maybe<Array<Maybe<Equity>>>;
};

export type StreamMatchTemplate = {
    __typename?: 'StreamMatchTemplate';
    templateId: Scalars['ID'];
    organizationId: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
    status: StreamMatchTemplateStatus;
    templateType?: Maybe<StreamMatchTemplateType>;
    configuration?: Maybe<TemplateConfiguration>;
    previousVersionId?: Maybe<Scalars['ID']>;
    id?: Maybe<Scalars['ID']>;
};

export type StreamMatchTemplateInput = {
    name: Scalars['String'];
    templateType?: Maybe<StreamMatchTemplateType>;
    basicConfiguration?: Maybe<BasicTemplateConfigurationInput>;
};

/** An enumeration. */
export enum StreamMatchTemplateStatus {
    Temporary = 'temporary',
    Committed = 'committed',
    Deleted = 'deleted',
}

/** An enumeration. */
export enum StreamMatchTemplateType {
    Card = 'card',
    Row = 'row',
    BasicCard = 'basic_card',
    BasicRow = 'basic_row',
}

export type StreamMatchTemplatesFilter = {
    templateIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type StreamMatchTotalPerDayBucket = {
    __typename?: 'StreamMatchTotalPerDayBucket';
    bucket?: Maybe<Scalars['String']>;
    total?: Maybe<Scalars['Int']>;
};

export type StreamMatches = {
    __typename?: 'StreamMatches';
    total?: Maybe<Scalars['Int']>;
    totalPerDay?: Maybe<Array<Maybe<StreamsMatchTotalPerDay>>>;
    results?: Maybe<Array<Maybe<StreamMatch>>>;
    averageSentimentScore?: Maybe<Scalars['Float']>;
    historicalAverageSentimentScore?: Maybe<Scalars['Float']>;
    averageSentimentScoreMovementAbsolute?: Maybe<Scalars['Float']>;
    averageSentimentScoreMovementPercent?: Maybe<Scalars['Float']>;
};

/** An enumeration. */
export enum StreamProviderInput {
    Gridspace = 'gridspace',
    Twilio = 'twilio',
    Aiera = 'aiera',
    Wcs = 'wcs',
}

export type StreamRollupStreamMatch = StreamMatch & {
    __typename?: 'StreamRollupStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<StreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    stream?: Maybe<Stream>;
    total?: Maybe<Scalars['Int']>;
};

export type StreamRollupStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type StreamRule = BaseStreamRule & {
    __typename?: 'StreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
};

export type StreamRuleInput = {
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum StreamRuleType {
    SearchTerm = 'search_term',
    Date = 'date',
    Status = 'status',
    Type = 'type',
    Source = 'source',
    EventDate = 'event_date',
    EventType = 'event_type',
    Domain = 'domain',
    StreamSourceCategory = 'stream_source_category',
    EventId = 'event_id',
    MediaId = 'media_id',
    ContentId = 'content_id',
    Organization = 'organization',
    ContentType = 'content_type',
    NewsSource = 'news_source',
    NewsSourceTag = 'news_source_tag',
    TranscriptStatus = 'transcript_status',
    PublishedTranscriptSource = 'published_transcript_source',
    EventGroupId = 'event_group_id',
    SpotlightType = 'spotlight_type',
    FilingForm = 'filing_form',
    FilingFormCategory = 'filing_form_category',
    Scope = 'scope',
    Tag = 'tag',
    Collapse = 'collapse',
    IsStarred = 'is_starred',
    IsArchived = 'is_archived',
    IsRead = 'is_read',
    MentioningCompanyId = 'mentioning_company_id',
    GicsSectorId = 'gics_sector_id',
    GicsSubSectorId = 'gics_sub_sector_id',
    OfferingType = 'offering_type',
    SpacStatus = 'spac_status',
    CountryCode = 'country_code',
    Marketcap = 'marketcap',
    Valuation = 'valuation',
    Totalrevenue = 'totalrevenue',
    Pricetoearnings = 'pricetoearnings',
    ExchangeCountryCode = 'exchange_country_code',
    EquityId = 'equity_id',
    CompanyId = 'company_id',
    WatchlistId = 'watchlist_id',
    EvAdjEbit = 'ev_adj_ebit',
    EvAdjEbitda = 'ev_adj_ebitda',
    EvEbitda = 'ev_ebitda',
    EvFcf = 'ev_fcf',
    EvGaapEbit = 'ev_gaap_ebit',
    EvGrossProfit = 'ev_gross_profit',
    EvSales = 'ev_sales',
    FcfYield = 'fcf_yield',
    PBookValue = 'p_book_value',
    PFcf = 'p_fcf',
    PGaapEps = 'p_gaap_eps',
    PNonGaapEps = 'p_non_gaap_eps',
    PNonGaapEpsXSbc = 'p_non_gaap_eps_x_sbc',
    PSales = 'p_sales',
}

export type StreamSource = {
    id?: Maybe<Scalars['ID']>;
    name?: Maybe<Scalars['String']>;
};

export type StreamSourceCategory = {
    __typename?: 'StreamSourceCategory';
    id?: Maybe<Scalars['ID']>;
    name?: Maybe<Scalars['String']>;
    sources?: Maybe<Array<Maybe<StreamSource>>>;
};

export type StreamSpikeNotificationMessage = {
    __typename?: 'StreamSpikeNotificationMessage';
    numMentions?: Maybe<Scalars['Int']>;
    numMentionsChangePercent?: Maybe<Scalars['Float']>;
    period?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type StreamSpikeNotificationMessageInput = {
    numMentions?: Maybe<Scalars['Int']>;
    numMentionsChangePercent?: Maybe<Scalars['Float']>;
    period?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** An enumeration. */
export enum StreamType {
    Content = 'content',
    Companies = 'companies',
    Equities = 'equities',
    Dashboards = 'dashboards',
    Transcripts = 'transcripts',
    Events = 'events',
    LiveEvents = 'live_events',
    Rollup = 'rollup',
    Gsheet = 'gsheet',
    CustomData = 'custom_data',
    Notifications = 'notifications',
    Indices = 'indices',
    Lens = 'lens',
    EventGroups = 'event_groups',
    Bookmarks = 'bookmarks',
}

export type StreamWebcast = {
    __typename?: 'StreamWebcast';
    success?: Maybe<Scalars['Boolean']>;
};

export type StreamsFilter = {
    streamIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    previewStreamTypes?: Maybe<Array<Maybe<StreamType>>>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
};

export type StreamsMatchTotalPerDay = {
    __typename?: 'StreamsMatchTotalPerDay';
    date?: Maybe<Scalars['Date']>;
    total?: Maybe<Scalars['Int']>;
    sampleIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
    buckets?: Maybe<Array<Maybe<StreamMatchTotalPerDayBucket>>>;
    samples?: Maybe<Array<Maybe<StreamMatchAggTarget>>>;
};

export type StreetAccountContent = Content & {
    __typename?: 'StreetAccountContent';
    contentId: Scalars['ID'];
    contentType?: Maybe<ContentType>;
    source?: Maybe<ContentSource>;
    sourceId: Scalars['String'];
    organizationId?: Maybe<Scalars['ID']>;
    title?: Maybe<Scalars['String']>;
    publishedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    language: Scalars['String'];
    parentId?: Maybe<Scalars['ID']>;
    createdDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modifiedDate?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    bodyHtml: Scalars['String'];
    bodyPlain: Scalars['String'];
    product: Scalars['String'];
    storyId: Scalars['String'];
    referencedStoryId?: Maybe<Scalars['String']>;
    organization?: Maybe<Organization>;
    primaryEquity?: Maybe<Equity>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    primaryCompany?: Maybe<Company>;
    companies?: Maybe<Array<Maybe<Company>>>;
    categories?: Maybe<Array<Maybe<Category>>>;
    events?: Maybe<Array<Maybe<ScheduledAudioCall>>>;
    bookmark?: Maybe<Bookmark>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    /** Main content of the article (Expensive) */
    body?: Maybe<Scalars['String']>;
    /** Gensim summary of text */
    summary?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** The type of content (for user-display purposes) */
    displayType?: Maybe<Scalars['String']>;
    /** Streams that match this content */
    streams?: Maybe<Array<Maybe<Stream>>>;
    tags?: Maybe<Array<Maybe<OrgTag>>>;
};

export type StreetAccountContentUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type StreetAccountContentBodyArgs = {
    allowRaw?: Maybe<Scalars['Boolean']>;
    highlight?: Maybe<HighlightCommand>;
};

export type StreetAccountContentSummaryArgs = {
    ratio?: Maybe<Scalars['Float']>;
};

export type StreetAccountContentStreamsArgs = {
    filter?: Maybe<ContentStreamsFilter>;
};

export type StripeInvoice = BillingInvoice & {
    __typename?: 'StripeInvoice';
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    periodStart?: Maybe<Scalars['DateTime']>;
    periodEnd?: Maybe<Scalars['DateTime']>;
    subtotal?: Maybe<Scalars['Int']>;
    tax?: Maybe<Scalars['Int']>;
    taxRate?: Maybe<Scalars['Float']>;
    total?: Maybe<Scalars['Int']>;
    pdfUrl?: Maybe<Scalars['String']>;
    currency?: Maybe<Currency>;
    lines?: Maybe<Array<Maybe<BillingInvoiceLineItem>>>;
};

export type StripeInvoiceLineItem = BillingInvoiceLineItem & {
    __typename?: 'StripeInvoiceLineItem';
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    periodStart?: Maybe<Scalars['DateTime']>;
    periodEnd?: Maybe<Scalars['DateTime']>;
    amount?: Maybe<Scalars['Int']>;
    description?: Maybe<Scalars['String']>;
    quantity?: Maybe<Scalars['Int']>;
    currency?: Maybe<Currency>;
    price?: Maybe<BillingProductPrice>;
};

export type StripePaymentMethod = PaymentMethod & {
    __typename?: 'StripePaymentMethod';
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    /** The billing address associated with this payment method */
    billingAddress?: Maybe<MailingAddress>;
    /** The name associated with this payment method (ex: the name on the CC) */
    billingName?: Maybe<Scalars['String']>;
    /** The type of payment method (ex: card) */
    type?: Maybe<PaymentMethodType>;
    /** The last four digits of the card. */
    last4?: Maybe<Scalars['String']>;
    /** The expiration month of the card, expressed as a number from 1-12 */
    expMonth?: Maybe<Scalars['Int']>;
    /** The expiration year of the card, expressed as 4 digits */
    expYear?: Maybe<Scalars['Int']>;
    /** The brand of the card */
    brand?: Maybe<CreditCardBrand>;
    /** Subscriptions that use this payment method */
    subscriptions?: Maybe<Array<Maybe<BillingSubscription>>>;
};

export type StripeSubscription = BillingSubscription & {
    __typename?: 'StripeSubscription';
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    currentPeriodEnd?: Maybe<Scalars['DateTime']>;
    currentPeriodStart?: Maybe<Scalars['DateTime']>;
    trialStart?: Maybe<Scalars['DateTime']>;
    trialEnd?: Maybe<Scalars['DateTime']>;
    status?: Maybe<SubscriptionStatus>;
    /** The frequency at which all this subscription's prices (and by extension, the whole subscription itself) are billed. */
    interval?: Maybe<BillingInterval>;
    /** The number of intervals between billings for all this subscription's prices (and by extension, the whole subscription itself). */
    intervalCount?: Maybe<Scalars['Int']>;
    upcomingInvoice?: Maybe<BillingInvoice>;
    items?: Maybe<Array<Maybe<BillingSubscriptionItem>>>;
    paymentMethod?: Maybe<PaymentMethod>;
};

export type StripeSubscriptionItem = BillingSubscriptionItem & {
    __typename?: 'StripeSubscriptionItem';
    id?: Maybe<Scalars['ID']>;
    /** The source of the billing data */
    source?: Maybe<BillingSource>;
    /** The billing source's internal identifier for this object */
    sourceId?: Maybe<Scalars['ID']>;
    /** The quantity of the attached price.  (Ex: the # of seats at this tier/price) */
    quantity?: Maybe<Scalars['Int']>;
    price?: Maybe<BillingProductPrice>;
};

export type SubscriptionSeatInput = {
    /** Required for new seats */
    firstName?: Maybe<Scalars['String']>;
    /** Required for new seats */
    lastName?: Maybe<Scalars['String']>;
    /** Required for new seats */
    email?: Maybe<Scalars['String']>;
    /** Required for updated/removed seats */
    userId?: Maybe<Scalars['ID']>;
    /** The ID for a given product price to attach to the seat. Required for new/updated seats */
    productPriceId?: Maybe<Scalars['ID']>;
    /** Optional for new/updated seats */
    isOrgAdmin?: Maybe<Scalars['Boolean']>;
};

/** An enumeration. */
export enum SubscriptionStatus {
    Trialing = 'trialing',
    Incomplete = 'incomplete',
    IncompleteExpired = 'incomplete_expired',
    Active = 'active',
    Canceled = 'canceled',
    PastDue = 'past_due',
}

export type SyncResult = ScheduledAudioCall;

export type Tag = {
    id?: Maybe<Scalars['ID']>;
    tagType?: Maybe<TagType>;
    slug?: Maybe<Scalars['String']>;
    displayName?: Maybe<Scalars['String']>;
};

export type TagFilter = {
    /** A set of tag IDs to retrieve */
    tagIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    tagType?: Maybe<TagType>;
};

/** An enumeration. */
export enum TagType {
    NewsSource = 'news_source',
}

export enum TagsContentType {
    News = 'news',
    Filing = 'filing',
    Spotlight = 'spotlight',
    Transcript = 'transcript',
}

export type TemplateConfiguration = BasicTemplateConfiguration;

export type TermEventMatch = {
    __typename?: 'TermEventMatch';
    eventId?: Maybe<Scalars['Int']>;
    event?: Maybe<ScheduledAudioCall>;
    numMatches?: Maybe<Scalars['Int']>;
};

export type Timezone = {
    __typename?: 'Timezone';
    id?: Maybe<Scalars['String']>;
    name?: Maybe<Scalars['String']>;
    offset?: Maybe<Scalars['Float']>;
};

export type Topic = {
    __typename?: 'Topic';
    topicId: Scalars['ID'];
    topic: Scalars['String'];
};

export type TopicReport = {
    __typename?: 'TopicReport';
    topic?: Maybe<Topic>;
    mentions?: Maybe<Scalars['Int']>;
    rank?: Maybe<Scalars['Int']>;
    history?: Maybe<Array<Maybe<TopicReportHistory>>>;
};

export type TopicReportHistory = {
    __typename?: 'TopicReportHistory';
    date?: Maybe<Scalars['Date']>;
    fiscalQuarter?: Maybe<Scalars['Int']>;
    fiscalYear?: Maybe<Scalars['Int']>;
    rank?: Maybe<Scalars['Int']>;
    rankChange?: Maybe<Scalars['Int']>;
    mentions?: Maybe<Scalars['Int']>;
    mentionsChange?: Maybe<Scalars['Int']>;
};

/** Tracks user activity statistics.  */
export type TrackActivity = {
    __typename?: 'TrackActivity';
    success?: Maybe<Scalars['Boolean']>;
};

export type TrackEventTerm = {
    __typename?: 'TrackEventTerm';
    success?: Maybe<Scalars['Boolean']>;
    event?: Maybe<ScheduledAudioCall>;
    /** The newly tracked term */
    trackedTerm?: Maybe<TrackedTerm>;
};

export type TrackSearch = {
    __typename?: 'TrackSearch';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
};

export type TrackTerm = {
    __typename?: 'TrackTerm';
    success?: Maybe<Scalars['Boolean']>;
    /** The newly tracked term */
    trackedTerm?: Maybe<TrackedTerm>;
    /** The newly tracked term search results */
    searchResult?: Maybe<TrackedTermSearchResult>;
    event?: Maybe<ScheduledAudioCall>;
    user?: Maybe<User>;
};

export type TrackedTerm = {
    __typename?: 'TrackedTerm';
    trackedTermId: Scalars['ID'];
    scheduledAudioCallId?: Maybe<Scalars['Int']>;
    userId?: Maybe<Scalars['ID']>;
    equityId?: Maybe<Scalars['ID']>;
    term: Scalars['String'];
    type: TrackedTermType;
    synonyms?: Maybe<Scalars['GenericScalar']>;
    gicsSectorId?: Maybe<Scalars['Int']>;
    /** Tracked terms can be scoped to specific equities, sectors, etc */
    scopeId?: Maybe<Scalars['ID']>;
    isGlobal: Scalars['Boolean'];
    created: Scalars['DateTimeDefaultTimezone'];
    scheduledAudioCall?: Maybe<ScheduledAudioCall>;
    user?: Maybe<User>;
    gicsSector?: Maybe<GicsSector>;
    scope?: Maybe<Watchlist>;
    id?: Maybe<Scalars['ID']>;
    eventId?: Maybe<Scalars['ID']>;
    equitiesScope?: Maybe<Array<Maybe<Equity>>>;
    gicsSectorsScope?: Maybe<Array<Maybe<GicsSector>>>;
    gicsSubSectorsScope?: Maybe<Array<Maybe<GicsSubSector>>>;
    matchedEvents?: Maybe<Array<Maybe<TermEventMatch>>>;
    /** @deprecated Use event.tracked_term_search_results */
    matches?: Maybe<Array<Maybe<TrackedTermMatch>>>;
};

export type TrackedTermMatchedEventsArgs = {
    afterDate?: Maybe<Scalars['Date']>;
    filter?: Maybe<TrackedTermsFilter>;
};

export type TrackedTermMatchesArgs = {
    afterDate?: Maybe<Scalars['Date']>;
    filter?: Maybe<TrackedTermsFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
};

export type TrackedTermMatch = {
    __typename?: 'TrackedTermMatch';
    termMatchId: Scalars['ID'];
    scheduledAudioCallId?: Maybe<Scalars['ID']>;
    trackedTermId: Scalars['ID'];
    eventId: Scalars['ID'];
    text?: Maybe<Scalars['String']>;
    event?: Maybe<ScheduledAudioCallEvent>;
    trackedTerm?: Maybe<TrackedTerm>;
    id?: Maybe<Scalars['ID']>;
    itemId?: Maybe<Scalars['ID']>;
    item?: Maybe<ScheduledAudioCallEvent>;
    groupedResults?: Maybe<Array<Maybe<TrackedTermMatch>>>;
};

export type TrackedTermSearchResult = {
    __typename?: 'TrackedTermSearchResult';
    id?: Maybe<Scalars['ID']>;
    /** The event this result was attached to */
    eventId?: Maybe<Scalars['ID']>;
    /** If the result came from a filter by from_date this is set */
    fromDate?: Maybe<Scalars['Date']>;
    /** If the result came from a filter by to_date this is set */
    toDate?: Maybe<Scalars['Date']>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    groupResults?: Maybe<Scalars['Boolean']>;
    /** Term corresponding to the matches */
    term?: Maybe<TrackedTerm>;
    /** Actual results */
    matches?: Maybe<Array<Maybe<TrackedTermMatch>>>;
    /** True if 0 result and term was not created in past x minutes */
    hidden?: Maybe<Scalars['Boolean']>;
};

export type TrackedTermSearchResultMatchesArgs = {
    fromIndex?: Maybe<Scalars['Int']>;
    size?: Maybe<Scalars['Int']>;
};

/** An enumeration. */
export enum TrackedTermType {
    Kpi = 'kpi',
    Product = 'product',
}

export type TrackedTermsFilter = {
    fromDate?: Maybe<Scalars['Date']>;
    toDate?: Maybe<Scalars['Date']>;
    eventId?: Maybe<Scalars['ID']>;
    trackedTermIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** An enumeration. */
export enum TrackingEnvironment {
    Production = 'production',
    Development = 'development',
    Staging = 'staging',
    Beta = 'beta',
}

/** An enumeration. */
export enum TrackingEventType {
    Access = 'access',
    SessionStart = 'session_start',
    AudioStart = 'audio_start',
    AudioEnd = 'audio_end',
}

/** An enumeration. */
export enum TranscriptSection {
    Presentation = 'presentation',
    QAndA = 'q_and_a',
}

export type TranscriptStream = Stream & {
    __typename?: 'TranscriptStream';
    name?: Maybe<Scalars['String']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    searchable: Scalars['Boolean'];
    clonedFrom?: Maybe<Scalars['Int']>;
    clonedFromUserId?: Maybe<Scalars['ID']>;
    created?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    modified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    userModified?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    lastViewed: Scalars['DateTimeDefaultTimezone'];
    deleted: Scalars['Boolean'];
    streamId?: Maybe<Scalars['ID']>;
    streamGuid?: Maybe<Scalars['String']>;
    streamKey?: Maybe<Scalars['String']>;
    streamType?: Maybe<StreamType>;
    filterMode?: Maybe<FilterMode>;
    averageDailyVolume?: Maybe<Scalars['Int']>;
    dataCollectionId?: Maybe<Scalars['ID']>;
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    lensedStreamId?: Maybe<Scalars['ID']>;
    equityScopeId: Scalars['ID'];
    creatingUserId: Scalars['ID'];
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    rules?: Maybe<Array<Maybe<BaseStreamRule>>>;
    dataCollection?: Maybe<DataCollection>;
    streamMatchTemplate?: Maybe<StreamMatchTemplate>;
    equityScope?: Maybe<Watchlist>;
    creatingUser?: Maybe<User>;
    userSettings?: Maybe<UserObjectSettings>;
    userStreamSettings?: Maybe<UserObjectStreamSettings>;
    id?: Maybe<Scalars['ID']>;
    matches?: Maybe<StreamMatches>;
    lens?: Maybe<Stream>;
    event?: Maybe<ScheduledAudioCall>;
};

export type TranscriptStreamUserStreamSettingsArgs = {
    streamId: Scalars['ID'];
};

export type TranscriptStreamMatchesArgs = {
    filter?: Maybe<StreamMatchFilter>;
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    sort?: Maybe<Scalars['String']>;
    collapse?: Maybe<Scalars['Boolean']>;
};

export type TranscriptStreamMatch = StreamMatch & {
    __typename?: 'TranscriptStreamMatch';
    id?: Maybe<Scalars['ID']>;
    highlightTitle?: Maybe<Scalars['String']>;
    highlights?: Maybe<Array<Maybe<Scalars['String']>>>;
    highlightFields?: Maybe<Array<Maybe<Scalars['String']>>>;
    collapsed?: Maybe<Array<Maybe<TranscriptStreamMatch>>>;
    userSettings?: Maybe<UserObjectStreamSettings>;
    bookmark?: Maybe<Bookmark>;
    itemId?: Maybe<Scalars['Int']>;
    transcript?: Maybe<ScheduledAudioCallEvent>;
};

export type TranscriptStreamMatchHighlightsArgs = {
    size?: Maybe<Scalars['Int']>;
};

export type UntrackEventTerm = {
    __typename?: 'UntrackEventTerm';
    success?: Maybe<Scalars['Boolean']>;
    event?: Maybe<ScheduledAudioCall>;
};

export type UntrackTerm = {
    __typename?: 'UntrackTerm';
    success?: Maybe<Scalars['Boolean']>;
    event?: Maybe<ScheduledAudioCall>;
    user?: Maybe<User>;
};

export type UpdateBookmark = {
    __typename?: 'UpdateBookmark';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    affectedTargets?: Maybe<Array<Maybe<BookmarkTarget>>>;
    bookmark?: Maybe<Bookmark>;
};

export type UpdateBookmarkInput = {
    bookmarkId: Scalars['ID'];
    highlight?: Maybe<Scalars['String']>;
    highlightColor?: Maybe<Scalars['String']>;
    note?: Maybe<Scalars['String']>;
    /** List of tags to associate to the bookmark */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** List of equities to associate to the bookmark */
    equityIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    reminder?: Maybe<Scalars['DateTime']>;
    shared?: Maybe<Scalars['Boolean']>;
};

export type UpdateDashboard = {
    __typename?: 'UpdateDashboard';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated dashboard */
    dashboard?: Maybe<Dashboard>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type UpdateDashboardInput = {
    /** The name of the dashboard */
    name?: Maybe<Scalars['String']>;
    /** Dashboard preferences */
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    /** Categories */
    categories?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** Tags */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    rules?: Maybe<Array<Maybe<StreamRuleInput>>>;
    searchable?: Maybe<Scalars['Boolean']>;
    /** The description of the dashboard */
    description?: Maybe<Scalars['String']>;
    galleryRules?: Maybe<Array<Maybe<StreamRuleInput>>>;
    /** ID of the dashboard to update */
    dashboardId: Scalars['ID'];
};

export type UpdateDashboardSection = {
    __typename?: 'UpdateDashboardSection';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The newly created section */
    dashboardSection?: Maybe<DashboardSection>;
    /** Returns the current users User object. */
    currentUser?: Maybe<User>;
};

export type UpdateDashboardSectionInput = {
    /** The name of the section */
    name: Scalars['String'];
    /** The position of the section */
    position?: Maybe<Scalars['Int']>;
    /** ID of the section to update */
    sectionId: Scalars['ID'];
};

export type UpdateDashboardStreamSortOrder = {
    __typename?: 'UpdateDashboardStreamSortOrder';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated dashboard */
    dashboard?: Maybe<Dashboard>;
};

export type UpdateDashboardUxPrefs = {
    __typename?: 'UpdateDashboardUxPrefs';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated dashboard */
    dashboard?: Maybe<Dashboard>;
};

export type UpdateDataCollection = {
    __typename?: 'UpdateDataCollection';
    success?: Maybe<Scalars['Boolean']>;
    dataCollection?: Maybe<DataCollection>;
};

export type UpdateDataCollectionInput = {
    name: Scalars['String'];
    collectionType?: Maybe<DataCollectionType>;
    gsheetConfiguration?: Maybe<GSheetConfigurationInput>;
    csvConfiguration?: Maybe<CsvConfigurationInput>;
    apiConfiguration?: Maybe<ApiConfigurationInput>;
    viewConfiguration?: Maybe<ViewConfigurationInput>;
    dataCollectionId: Scalars['ID'];
};

export type UpdateEvent = {
    __typename?: 'UpdateEvent';
    success?: Maybe<Scalars['Boolean']>;
    /** Updated event */
    event?: Maybe<ScheduledAudioCall>;
};

export type UpdateEventInput = {
    /** Event datetime */
    date: Scalars['DateTime'];
    /** Event title */
    title: Scalars['String'];
    /** Optional equity_id for the event */
    equityId?: Maybe<Scalars['ID']>;
    /** Webcast url */
    broadcastUrl?: Maybe<Scalars['String']>;
    callProvider?: Maybe<CallProviderInput>;
    streamProvider?: Maybe<StreamProviderInput>;
    /** List of event groups with which to associate this event */
    eventGroupIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** ID of the event to update */
    eventId?: Maybe<Scalars['ID']>;
};

export type UpdateEventItem = {
    __typename?: 'UpdateEventItem';
    success?: Maybe<Scalars['Boolean']>;
    /** The updated transcript item */
    item?: Maybe<ScheduledAudioCallEvent>;
};

export type UpdateEventItemInput = {
    /** The new transcript text */
    transcript: Scalars['String'];
    /** The id of the event transcript to update */
    itemId: Scalars['ID'];
};

export type UpdateEventNotificationsSettings = {
    __typename?: 'UpdateEventNotificationsSettings';
    success?: Maybe<Scalars['Boolean']>;
    /** Updated event */
    event?: Maybe<ScheduledAudioCall>;
};

export type UpdateOrganization = {
    __typename?: 'UpdateOrganization';
    success?: Maybe<Scalars['Boolean']>;
    organization?: Maybe<Organization>;
};

export type UpdateOrganizationInput = {
    /** The display name of the organization */
    name: Scalars['String'];
};

export type UpdatePaymentMethod = {
    __typename?: 'UpdatePaymentMethod';
    success?: Maybe<Scalars['Boolean']>;
    paymentMethod?: Maybe<PaymentMethod>;
};

export type UpdatePrivateRecording = {
    __typename?: 'UpdatePrivateRecording';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    privateRecording?: Maybe<PrivateRecording>;
    event?: Maybe<ScheduledAudioCall>;
};

export type UpdatePrivateRecordingInput = {
    title: Scalars['String'];
    /** List of tags to associate to the bookmark */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** List of equities to associate to the bookmark */
    equityIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** List of event groups with which to associate this event */
    eventGroupIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    connectionType: PrConnectionType;
    connectPhoneNumber?: Maybe<Scalars['String']>;
    connectAccessId?: Maybe<Scalars['String']>;
    connectPin?: Maybe<Scalars['String']>;
    connectUrl?: Maybe<Scalars['String']>;
    connectOffsetSeconds?: Maybe<Scalars['Int']>;
    onConnectDialNumber?: Maybe<Scalars['String']>;
    smsAlertBeforeCall?: Maybe<Scalars['Boolean']>;
    scheduledFor?: Maybe<Scalars['DateTime']>;
    localeCode?: Maybe<Scalars['String']>;
    onFailure?: Maybe<PrOnFailure>;
    onFailureDialNumber?: Maybe<Scalars['String']>;
    onFailureSmsNumber?: Maybe<Scalars['String']>;
    onFailureInstructions?: Maybe<Scalars['String']>;
    onCompleteEmailCreator?: Maybe<Scalars['Boolean']>;
    privateRecordingId: Scalars['ID'];
};

export type UpdateSpac = {
    __typename?: 'UpdateSPAC';
    success?: Maybe<Scalars['Boolean']>;
    company?: Maybe<Company>;
};

export type UpdateStream = {
    __typename?: 'UpdateStream';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated stream */
    stream?: Maybe<Stream>;
};

export type UpdateStreamInput = {
    /** The name of the dashboard */
    name?: Maybe<Scalars['String']>;
    /** Dashboard preferences */
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    /** Categories */
    categories?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** Tags */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    rules?: Maybe<Array<Maybe<StreamRuleInput>>>;
    searchable?: Maybe<Scalars['Boolean']>;
    streamType: StreamType;
    filterMode?: Maybe<FilterMode>;
    /** IDs of the dashboards to save the stream to */
    dashboardIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Pin the stream to a specific equity */
    pinToEquityId?: Maybe<Scalars['ID']>;
    /** ID of the data collection to associate with the stream */
    dataCollectionId?: Maybe<Scalars['ID']>;
    /** ID of the stream match template to associate with the stream */
    streamMatchTemplateId?: Maybe<Scalars['ID']>;
    position?: Maybe<Scalars['Int']>;
    /** ID of the stream to update */
    streamId: Scalars['ID'];
};

export type UpdateStreamMatchTemplate = {
    __typename?: 'UpdateStreamMatchTemplate';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    template?: Maybe<StreamMatchTemplate>;
};

export type UpdateStreamMatchTemplateInput = {
    name: Scalars['String'];
    templateType?: Maybe<StreamMatchTemplateType>;
    basicConfiguration?: Maybe<BasicTemplateConfigurationInput>;
    templateId: Scalars['ID'];
};

export type UpdateStreamStatistics = {
    __typename?: 'UpdateStreamStatistics';
    success?: Maybe<Scalars['Boolean']>;
    /** The updated stream */
    stream?: Maybe<Stream>;
};

export type UpdateStreamUxPrefs = {
    __typename?: 'UpdateStreamUxPrefs';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    /** The updated stream */
    stream?: Maybe<Stream>;
};

export type UpdateSubscription = {
    __typename?: 'UpdateSubscription';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    immediateInvoice?: Maybe<BillingInvoice>;
    nextInvoice?: Maybe<BillingInvoice>;
    subscription?: Maybe<BillingSubscription>;
};

export type UpdateTrackedTerm = {
    __typename?: 'UpdateTrackedTerm';
    success?: Maybe<Scalars['Boolean']>;
    /** The updated term */
    trackedTerm?: Maybe<TrackedTerm>;
    /** The updated term search result */
    searchResult?: Maybe<TrackedTermSearchResult>;
    event?: Maybe<ScheduledAudioCall>;
    user?: Maybe<User>;
};

export type UpdateTrackedTermInput = {
    /** The search string */
    term: Scalars['String'];
    /** ID of the event to add the tracking term to */
    eventId?: Maybe<Scalars['ID']>;
    /** Equities to scope the term to */
    equityIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Sectors to scope the search to */
    gicsSectorIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Sub-sectors to scope the search to */
    gicsSubSectorIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
    /** Synonyms */
    synonyms?: Maybe<Array<Maybe<Scalars['String']>>>;
    /** ID of the tracked term to update */
    trackedTermId?: Maybe<Scalars['ID']>;
};

/** Update user information. If the user is changing their phone number they will get an sms to verify.   */
export type UpdateUser = {
    __typename?: 'UpdateUser';
    success?: Maybe<Scalars['Boolean']>;
    user?: Maybe<User>;
};

export type UpdateUserObjectSettings = {
    __typename?: 'UpdateUserObjectSettings';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    settings?: Maybe<UserObjectSettings>;
};

export type UpdateUserObjectSettingsInput = {
    targetType: UserObjectSettingsTargetType;
    targetId: Scalars['ID'];
    starred?: Maybe<Scalars['Boolean']>;
    /** Mark the object archived */
    archived?: Maybe<Scalars['Boolean']>;
    /** Mark the object read */
    isRead?: Maybe<Scalars['Boolean']>;
    /** List of tags to associate to the object */
    tags?: Maybe<Array<Maybe<Scalars['String']>>>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    emailNotificationsEnabled?: Maybe<Scalars['Boolean']>;
    realtimeNotificationsEnabled?: Maybe<Scalars['Boolean']>;
    realtimeNotificationsInApp?: Maybe<Scalars['Boolean']>;
    realtimeNotificationsEmail?: Maybe<Scalars['Boolean']>;
    realtimeNotificationsEveryMatch?: Maybe<Scalars['Boolean']>;
    realtimeNotificationsSpikes?: Maybe<Scalars['Boolean']>;
    dailyDigestEnabled?: Maybe<Scalars['Boolean']>;
    weeklyDigestEnabled?: Maybe<Scalars['Boolean']>;
    shareBookmarks?: Maybe<Scalars['Boolean']>;
};

export type UpdateUserObjectStreamSettings = {
    __typename?: 'UpdateUserObjectStreamSettings';
    success?: Maybe<Scalars['Boolean']>;
    query?: Maybe<Query>;
    settings?: Maybe<UserObjectStreamSettings>;
};

export type UpdateUserObjectStreamSettingsInput = {
    streamId: Scalars['ID'];
    targetType: UserObjectSettingsTargetType;
    targetId: Scalars['ID'];
    /** Set how the user scores this result in a stream */
    score?: Maybe<Scalars['Int']>;
};

export type UpdateWatchlist = {
    __typename?: 'UpdateWatchlist';
    success?: Maybe<Scalars['Boolean']>;
    watchlist?: Maybe<Watchlist>;
};

export type UpdateWatchlistInput = {
    /** The name of the watch list */
    name: Scalars['String'];
    rules?: Maybe<Array<Maybe<WatchlistRuleInput>>>;
    /** The ID of the watch list */
    watchlistId: Scalars['ID'];
};

/** Aiera user  */
export type User = {
    __typename?: 'User';
    userId: Scalars['ID'];
    /**
     * The user's email address
     * @deprecated Use `email`
     */
    username?: Maybe<Scalars['String']>;
    usernameVerified: Scalars['Boolean'];
    passwordStatus: PasswordStatus;
    firstName?: Maybe<Scalars['String']>;
    lastName?: Maybe<Scalars['String']>;
    phone?: Maybe<Scalars['String']>;
    customerType: UserCustomerType;
    organizationId: Scalars['ID'];
    organizationAdmin: Scalars['Boolean'];
    canComment: Scalars['Boolean'];
    canAnnotate: Scalars['Boolean'];
    isAdmin: Scalars['Boolean'];
    isAnalyst: Scalars['Boolean'];
    isActive: Scalars['Boolean'];
    isEditor: Scalars['Boolean'];
    status: UserStatus;
    createDate: Scalars['DateTimeDefaultTimezone'];
    lastActive?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    icalToken?: Maybe<Scalars['String']>;
    prefsToken?: Maybe<Scalars['String']>;
    pusherToken?: Maybe<Scalars['String']>;
    partnerUserId?: Maybe<Scalars['String']>;
    billingProductPriceId?: Maybe<Scalars['ID']>;
    timezone?: Maybe<Scalars['String']>;
    lastRequestTimezone?: Maybe<Scalars['String']>;
    organization?: Maybe<Organization>;
    preferences?: Maybe<Array<Maybe<UserPreference>>>;
    /** The watchlists for this user */
    watchlists?: Maybe<Array<Maybe<Watchlist>>>;
    /** All terms for this user */
    trackedTerms?: Maybe<Array<Maybe<TrackedTerm>>>;
    financialKpis?: Maybe<Array<Maybe<UserFinancialKpi>>>;
    dashboardSections?: Maybe<Array<Maybe<DashboardSection>>>;
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    billingProductPrice?: Maybe<BillingProductPrice>;
    notificationPreferences?: Maybe<GlobalNotificationPreferences>;
    id?: Maybe<Scalars['ID']>;
    /** The user's email address */
    email?: Maybe<Scalars['String']>;
    /** Equities the user follows. */
    followedEquities?: Maybe<Array<Maybe<Equity>>>;
    /** Returns the recent search history for the user */
    searchHistory?: Maybe<Array<Maybe<SearchHistory>>>;
    /** List of all permissions this user has */
    permissions?: Maybe<Array<Maybe<Scalars['String']>>>;
    trackedTermSearchResults?: Maybe<Array<Maybe<TrackedTermSearchResult>>>;
    numFollowedEquities?: Maybe<Scalars['Int']>;
    /** Notable price changes for equities during events */
    eventPriceHighlights?: Maybe<Array<Maybe<EventPriceHighlight>>>;
    /** The number of live calls monitored by and visible to the user */
    numMonitoredLiveEvents?: Maybe<Scalars['Int']>;
    /** The next scheduled  event that should be transcribeable and that the user has monitors for */
    nextMonitoredEvent?: Maybe<ScheduledAudioCall>;
    tier?: Maybe<UserTier>;
    zendeskToken?: Maybe<Scalars['String']>;
    zendeskChatToken?: Maybe<Scalars['String']>;
    highlightsCount?: Maybe<Scalars['Int']>;
};

/** Aiera user  */
export type UserWatchlistsArgs = {
    ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
    filter?: Maybe<WatchlistsFilter>;
};

/** Aiera user  */
export type UserTrackedTermsArgs = {
    afterDate?: Maybe<Scalars['Date']>;
    filter?: Maybe<TrackedTermsFilter>;
};

/** Aiera user  */
export type UserDashboardsArgs = {
    filter?: Maybe<UserDashboardsFilter>;
};

/** Aiera user  */
export type UserFollowedEquitiesArgs = {
    start?: Maybe<Scalars['Int']>;
    length?: Maybe<Scalars['Int']>;
};

/** Aiera user  */
export type UserSearchHistoryArgs = {
    text?: Maybe<Scalars['String']>;
};

/** Aiera user  */
export type UserTrackedTermSearchResultsArgs = {
    filter?: Maybe<TrackedTermsFilter>;
    fromIndex?: Maybe<Scalars['Int']>;
    size?: Maybe<Scalars['Int']>;
    highlightSize?: Maybe<Scalars['Int']>;
    groupResults?: Maybe<Scalars['Boolean']>;
};

/** Aiera user  */
export type UserEventPriceHighlightsArgs = {
    threshold?: Maybe<Scalars['Float']>;
};

/** An enumeration. */
export enum UserCustomerType {
    Paid = 'paid',
    Trial = 'trial',
    Gratis = 'gratis',
    Developer = 'developer',
    None = 'none',
}

export type UserDashboardsFilter = {
    dashboardIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type UserFilter = {
    includeInactive?: Maybe<Scalars['Boolean']>;
    includePartnerUsers?: Maybe<Scalars['Boolean']>;
    includeNonCustomers?: Maybe<Scalars['Boolean']>;
    includeInternal?: Maybe<Scalars['Boolean']>;
    organizationIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** A financial KPI that a user has chosen to track in some way  */
export type UserFinancialKpi = {
    __typename?: 'UserFinancialKPI';
    scope: UserFinancialKpiScope;
    user?: Maybe<User>;
    equity?: Maybe<Equity>;
    glossaryTerm?: Maybe<FinanceGlossaryTerm>;
    id?: Maybe<Scalars['ID']>;
};

/** An enumeration. */
export enum UserFinancialKpiScope {
    Events = 'events',
}

/** Fields for updating user.  */
export type UserInput = {
    /** New first name */
    firstName?: Maybe<Scalars['String']>;
    /** New last name */
    lastName?: Maybe<Scalars['String']>;
    /** New phone number. An SMS is sent to verify. */
    phone?: Maybe<Scalars['String']>;
    /** Users timezone. */
    timezone?: Maybe<Scalars['String']>;
};

export type UserObjectSettings = {
    __typename?: 'UserObjectSettings';
    settingsId: Scalars['ID'];
    userId: Scalars['ID'];
    targetType?: Maybe<UserObjectSettingsTargetType>;
    targetId: Scalars['ID'];
    realtimeNotificationsEnabled: Scalars['Boolean'];
    realtimeNotificationsInApp: Scalars['Boolean'];
    realtimeNotificationsEmail: Scalars['Boolean'];
    realtimeNotificationsEveryMatch: Scalars['Boolean'];
    realtimeNotificationsSpikes: Scalars['Boolean'];
    dailyDigestEnabled: Scalars['Boolean'];
    weeklyDigestEnabled: Scalars['Boolean'];
    shareBookmarks: Scalars['Boolean'];
    emailNotificationsEnabled: Scalars['Boolean'];
    starred: Scalars['Boolean'];
    archived: Scalars['Boolean'];
    isRead: Scalars['Boolean'];
    tags?: Maybe<Scalars['GenericScalar']>;
    uxPreferences?: Maybe<Scalars['GenericScalar']>;
    settings?: Maybe<Scalars['GenericScalar']>;
    lastViewed?: Maybe<Scalars['DateTimeDefaultTimezone']>;
    user?: Maybe<User>;
    id?: Maybe<Scalars['ID']>;
    target?: Maybe<UserObjectSettingsTarget>;
};

export type UserObjectSettingsTarget =
    | ScheduledAudioCall
    | ScheduledAudioCallEvent
    | StreetAccountContent
    | NewsContent
    | FilingContent
    | PartnershipSpotlightContent
    | AssetPurchaseSpotlightContent
    | BuybackSpotlightContent
    | GuidanceSpotlightContent
    | SalesMetricSpotlightContent
    | MAndASpotlightContent
    | SpinOffSpotlightContent
    | IpoSpotlightContent
    | DocumentContent;

/** An enumeration. */
export enum UserObjectSettingsTargetType {
    Event = 'event',
    EventItem = 'event_item',
    Equity = 'equity',
    Content = 'content',
    Media = 'media',
    Dashboard = 'dashboard',
    Stream = 'stream',
}

export type UserObjectStreamSettings = {
    __typename?: 'UserObjectStreamSettings';
    settingsId: Scalars['ID'];
    userId: Scalars['ID'];
    streamId: Scalars['ID'];
    targetType?: Maybe<UserObjectSettingsTargetType>;
    targetId: Scalars['ID'];
    score: Scalars['Int'];
    user?: Maybe<User>;
    id?: Maybe<Scalars['ID']>;
};

/** User Preference  */
export type UserPreference = {
    __typename?: 'UserPreference';
    userPreferenceId: Scalars['ID'];
    userId: Scalars['ID'];
    /** Type of pref, ux for example. */
    preferenceType: Preference_Type;
    /** Name of pref, contextSort for example */
    preferenceName: Scalars['String'];
    /** Value of pref, conviction for example */
    preferenceValue?: Maybe<Scalars['String']>;
    /** Data of pref, sort order of equities list for example */
    preferenceData?: Maybe<Scalars['GenericScalar']>;
    user?: Maybe<User>;
};

/** An enumeration. */
export enum UserStatus {
    Invited = 'invited',
    New = 'new',
    Verified = 'verified',
    Active = 'active',
    Duplicate = 'duplicate',
    Deactivated = 'deactivated',
}

/** An enumeration. */
export enum UserTier {
    Basic = 'basic',
    Plus = 'plus',
    Premium = 'premium',
}

export type VerifyEmail = {
    __typename?: 'VerifyEmail';
    success?: Maybe<Scalars['Boolean']>;
    /** The user data for the logged in user. */
    user?: Maybe<User>;
    /** The code to send other users to invite them to the org */
    inviteCode?: Maybe<Code>;
};

export type ViewConfiguration = {
    __typename?: 'ViewConfiguration';
    dataCollectionId?: Maybe<Scalars['ID']>;
    query?: Maybe<Scalars['String']>;
};

export type ViewConfigurationInput = {
    dataCollectionId?: Maybe<Scalars['ID']>;
    query?: Maybe<Scalars['String']>;
};

export type Watchlist = {
    __typename?: 'Watchlist';
    watchlistId: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
    watchlistType: WatchlistType;
    creatorId?: Maybe<Scalars['ID']>;
    created: Scalars['DateTimeDefaultTimezone'];
    modified: Scalars['DateTimeDefaultTimezone'];
    hasRules: Scalars['Boolean'];
    status: WatchlistStatus;
    creator?: Maybe<User>;
    rules?: Maybe<Array<Maybe<WatchlistRule>>>;
    id?: Maybe<Scalars['ID']>;
    /** Get a list of Ohlc data for the input equities */
    ohlc?: Maybe<Array<Maybe<Ohlc>>>;
    equities?: Maybe<Array<Maybe<Equity>>>;
    equityCount?: Maybe<Scalars['Int']>;
    usages?: Maybe<WatchlistUsages>;
};

export type WatchlistOhlcArgs = {
    marketCapWeighted?: Maybe<Scalars['Boolean']>;
    filter?: Maybe<OhlcFilter>;
};

export type WatchlistEquitiesArgs = {
    size?: Maybe<Scalars['Int']>;
    fromIndex?: Maybe<Scalars['Int']>;
    sortKey?: Maybe<WatchlistEquitiesSortKey>;
    sortDirection?: Maybe<WatchlistEquitiesSortDirection>;
    searchTerm?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum WatchlistEquitiesSortDirection {
    Asc = 'asc',
    Desc = 'desc',
}

/** An enumeration. */
export enum WatchlistEquitiesSortKey {
    PriceChangePercent = 'price_change_percent',
    Last = 'last',
    Marketcap = 'marketcap',
    Name = 'name',
    NextEarnings = 'next_earnings',
    Sector = 'sector',
    Ticker = 'ticker',
}

export type WatchlistInput = {
    /** The name of the watch list */
    name: Scalars['String'];
    rules?: Maybe<Array<Maybe<WatchlistRuleInput>>>;
};

export type WatchlistRule = {
    __typename?: 'WatchlistRule';
    ruleId: Scalars['ID'];
    watchlistId: Scalars['ID'];
    ruleType?: Maybe<WatchlistRuleType>;
    condition?: Maybe<WatchlistRuleCondition>;
    value: Scalars['String'];
    groupId?: Maybe<Scalars['String']>;
    created: Scalars['DateTimeDefaultTimezone'];
    watchlist?: Maybe<Watchlist>;
    targetWatchlistId?: Maybe<Scalars['Int']>;
    targetWatchlist?: Maybe<Watchlist>;
    targetEquityId?: Maybe<Scalars['Int']>;
    targetEquity?: Maybe<Equity>;
    targetGicsSectorId?: Maybe<Scalars['Int']>;
    targetGicsSector?: Maybe<GicsSector>;
    targetGicsSubSectorId?: Maybe<Scalars['Int']>;
    targetGicsSubSector?: Maybe<GicsSubSector>;
};

/** An enumeration. */
export enum WatchlistRuleCondition {
    IsEqual = 'is_equal',
    IsNotEqual = 'is_not_equal',
    IsGreaterThan = 'is_greater_than',
    IsLessThan = 'is_less_than',
    IsGreaterThanOrEqualTo = 'is_greater_than_or_equal_to',
    IsLessThanOrEqualTo = 'is_less_than_or_equal_to',
}

export type WatchlistRuleInput = {
    ruleType?: Maybe<WatchlistRuleType>;
    condition?: Maybe<WatchlistRuleCondition>;
    value: Scalars['String'];
    groupId?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum WatchlistRuleType {
    GicsSectorId = 'gics_sector_id',
    GicsSubSectorId = 'gics_sub_sector_id',
    OfferingType = 'offering_type',
    SpacStatus = 'spac_status',
    CountryCode = 'country_code',
    Marketcap = 'marketcap',
    Valuation = 'valuation',
    Totalrevenue = 'totalrevenue',
    Pricetoearnings = 'pricetoearnings',
    ExchangeCountryCode = 'exchange_country_code',
    EquityId = 'equity_id',
    CompanyId = 'company_id',
    WatchlistId = 'watchlist_id',
    EvAdjEbit = 'ev_adj_ebit',
    EvAdjEbitda = 'ev_adj_ebitda',
    EvEbitda = 'ev_ebitda',
    EvFcf = 'ev_fcf',
    EvGaapEbit = 'ev_gaap_ebit',
    EvGrossProfit = 'ev_gross_profit',
    EvSales = 'ev_sales',
    FcfYield = 'fcf_yield',
    PBookValue = 'p_book_value',
    PFcf = 'p_fcf',
    PGaapEps = 'p_gaap_eps',
    PNonGaapEps = 'p_non_gaap_eps',
    PNonGaapEpsXSbc = 'p_non_gaap_eps_x_sbc',
    PSales = 'p_sales',
}

/** An enumeration. */
export enum WatchlistStatus {
    Active = 'active',
    Locked = 'locked',
    Deleted = 'deleted',
}

export type WatchlistStreamRule = BaseStreamRule & {
    __typename?: 'WatchlistStreamRule';
    ruleType?: Maybe<StreamRuleType>;
    condition?: Maybe<RuleCondition>;
    value?: Maybe<Scalars['GenericScalar']>;
    groupId?: Maybe<Scalars['String']>;
    watchlist?: Maybe<Watchlist>;
};

/** An enumeration. */
export enum WatchlistType {
    Watchlist = 'watchlist',
    PrimaryWatchlist = 'primary_watchlist',
    Scope = 'scope',
    EventNotificationsScope = 'event_notifications_scope',
}

export type WatchlistUsages = {
    __typename?: 'WatchlistUsages';
    dashboards?: Maybe<Array<Maybe<Dashboard>>>;
    streams?: Maybe<Array<Maybe<Stream>>>;
    watchlists?: Maybe<Array<Maybe<Watchlist>>>;
};

export type WatchlistsFilter = {
    watchlistIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

/** An enumeration. */
export enum Call_Type {
    Earnings = 'earnings',
    EarningsRelease = 'earnings_release',
    Presentation = 'presentation',
    ShareholderMeeting = 'shareholder_meeting',
    InvestorMeeting = 'investor_meeting',
    SpecialSituation = 'special_situation',
    Custom = 'custom',
    Test = 'test',
}

/** An enumeration. */
export enum Equity_Active {
    Active = 'active',
    ActiveEvents = 'active_events',
    Inactive = 'inactive',
    Delisted = 'delisted',
    Merger = 'merger',
    Suspended = 'suspended',
    New = 'new',
    Requested = 'requested',
    Approved = 'approved',
}

/** An enumeration. */
export enum Event_Source {
    Factset = 'factset',
    Refinitiv = 'refinitiv',
    ScriptsAsia = 'scripts_asia',
    Custom = 'custom',
}

/** An enumeration. */
export enum Event_Type {
    Transcript = 'transcript',
    Started = 'started',
    MemberJoin = 'member_join',
    MemberLeave = 'member_leave',
    Ended = 'ended',
    TalkTime = 'talk_time',
    Topics = 'topics',
    DoneProcessing = 'done_processing',
    OfficialTranscript = 'official_transcript',
}

/** An enumeration. */
export enum Format {
    Currency = 'currency',
    Percentage = 'percentage',
    Number = 'number',
    Multiple = 'multiple',
    Raw = 'raw',
}

/** An enumeration. */
export enum Preference_Type {
    Ux = 'ux',
    Notification = 'notification',
}

/** An enumeration. */
export enum Source {
    Realtime = 'realtime',
    Intrinio = 'intrinio',
    Refinitiv = 'refinitiv',
}

/** An enumeration. */
export enum Status {
    InProgress = 'in_progress',
    Processing = 'processing',
    Ended = 'ended',
    Finished = 'finished',
    DoneProcessing = 'done_processing',
    Deleted = 'deleted',
}

/** An enumeration. */
export enum Value_Type {
    Actual = 'actual',
    Consensus = 'consensus',
    Forecast = 'forecast',
    Guidance = 'guidance',
}

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
    __typename?: 'Query';
    currentUser?: Maybe<{
        __typename?: 'User';
        id?: Maybe<string>;
        firstName?: Maybe<string>;
        lastName?: Maybe<string>;
    }>;
};

export type LoginMutationVariables = Exact<{
    email: Scalars['String'];
    password: Scalars['String'];
}>;

export type LoginMutation = {
    __typename?: 'Mutations';
    login?: Maybe<{ __typename?: 'Login'; success?: Maybe<boolean> }>;
};

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
            success
        }
    }
`;
