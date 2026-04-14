import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { IUser } from '../models/User';
import { IAgentBot } from '../models/AgentBot';
import { IAuthRequest } from '../models/AuthRequest';
import { ITopic } from '../models/Topic';
import { Context } from '../auth/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type AgentBot = {
  __typename?: 'AgentBot';
  apiKey?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentId: Scalars['ID']['output'];
  purpose: Scalars['String']['output'];
  status: AgentBotStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum AgentBotStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type ApiKeyPayload = {
  __typename?: 'ApiKeyPayload';
  apiKey: Scalars['String']['output'];
};

export type ApproveAuthRequestPayload = {
  __typename?: 'ApproveAuthRequestPayload';
  agentBot: AgentBot;
  status: AgentBotStatus;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type AuthRequest = {
  __typename?: 'AuthRequest';
  agentBotName?: Maybe<Scalars['String']['output']>;
  agentBotPurpose?: Maybe<Scalars['String']['output']>;
  applicant: User;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
  rejectReason?: Maybe<Scalars['String']['output']>;
  status: AgentBotStatus;
  topicDescription?: Maybe<Scalars['String']['output']>;
  topicName?: Maybe<Scalars['String']['output']>;
  topicSlug?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ClearTopicMessagesPayload = {
  __typename?: 'ClearTopicMessagesPayload';
  clearedCount: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type CreateAgentBotPayload = {
  __typename?: 'CreateAgentBotPayload';
  requestId: Scalars['ID']['output'];
  status: AgentBotStatus;
};

export type CreateTopicPayload = {
  __typename?: 'CreateTopicPayload';
  requestId?: Maybe<Scalars['ID']['output']>;
  status: TopicStatus;
  topic?: Maybe<Topic>;
};

export type FormContent = {
  __typename?: 'FormContent';
  fields: Array<FormField>;
  submitLabel?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type FormContentInput = {
  fields: Array<FormFieldInput>;
  submitLabel?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type FormField = {
  __typename?: 'FormField';
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  type: Scalars['String']['output'];
};

export type FormFieldInput = {
  label: Scalars['String']['input'];
  name: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  type: Scalars['String']['input'];
};

export type LoginPayload = {
  __typename?: 'LoginPayload';
  token: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type Message = {
  __typename?: 'Message';
  content: Scalars['JSON']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  readBy: Array<Scalars['ID']['output']>;
  sender: User;
  topicId: Scalars['ID']['output'];
  type: MessageType;
};

export enum MessageType {
  Form = 'FORM',
  Text = 'TEXT'
}

export type Mutation = {
  __typename?: 'Mutation';
  approveAgentBot: ApproveAuthRequestPayload;
  approveTopic: Topic;
  clearTopicMessages: ClearTopicMessagesPayload;
  createAgentBot: CreateAgentBotPayload;
  createTopic: CreateTopicPayload;
  markAsRead: Scalars['Boolean']['output'];
  regenerateApiKey: ApiKeyPayload;
  rejectAgentBot: RejectAuthRequestPayload;
  rejectTopic: Scalars['Boolean']['output'];
  sendMessage: Message;
};


export type MutationApproveAgentBotArgs = {
  requestId: Scalars['ID']['input'];
};


export type MutationApproveTopicArgs = {
  requestId: Scalars['ID']['input'];
};


export type MutationClearTopicMessagesArgs = {
  topicId: Scalars['ID']['input'];
};


export type MutationCreateAgentBotArgs = {
  name: Scalars['String']['input'];
  purpose: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCreateTopicArgs = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  wait?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationMarkAsReadArgs = {
  topicId: Scalars['ID']['input'];
};


export type MutationRejectAgentBotArgs = {
  reason: Scalars['String']['input'];
  requestId: Scalars['ID']['input'];
};


export type MutationRejectTopicArgs = {
  reason: Scalars['String']['input'];
  requestId: Scalars['ID']['input'];
};


export type MutationSendMessageArgs = {
  content: Scalars['JSON']['input'];
  topicId: Scalars['ID']['input'];
  type: MessageType;
};

export type Query = {
  __typename?: 'Query';
  agentBots: Array<AgentBot>;
  authRequests: Array<AuthRequest>;
  me?: Maybe<User>;
  messages: Array<Message>;
  searchTopics: Array<TopicSearchResult>;
  topic?: Maybe<Topic>;
  topicBySlug?: Maybe<Topic>;
  topics: Array<Topic>;
};


export type QueryAuthRequestsArgs = {
  status?: InputMaybe<AgentBotStatus>;
};


export type QueryMessagesArgs = {
  before?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  topicId: Scalars['ID']['input'];
};


export type QuerySearchTopicsArgs = {
  keyword: Scalars['String']['input'];
};


export type QueryTopicArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTopicBySlugArgs = {
  slug: Scalars['String']['input'];
};

export type RegisterPayload = {
  __typename?: 'RegisterPayload';
  apiKey: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type RejectAuthRequestPayload = {
  __typename?: 'RejectAuthRequestPayload';
  status: AgentBotStatus;
};

export type Topic = {
  __typename?: 'Topic';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastMessage?: Maybe<Message>;
  members: Array<User>;
  name: Scalars['String']['output'];
  ownerId: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  status: TopicStatus;
  type: TopicType;
  unreadCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TopicSearchResult = {
  __typename?: 'TopicSearchResult';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  relateScore: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
};

export enum TopicStatus {
  Active = 'ACTIVE',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum TopicType {
  Auth = 'AUTH',
  Direct = 'DIRECT',
  Group = 'GROUP'
}

export type User = {
  __typename?: 'User';
  apiKey?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  type: UserType;
  updatedAt: Scalars['DateTime']['output'];
};

export enum UserType {
  Agent = 'AGENT',
  Human = 'HUMAN'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AgentBot: ResolverTypeWrapper<IAgentBot>;
  AgentBotStatus: AgentBotStatus;
  ApiKeyPayload: ResolverTypeWrapper<ApiKeyPayload>;
  ApproveAuthRequestPayload: ResolverTypeWrapper<Omit<ApproveAuthRequestPayload, 'agentBot'> & { agentBot: ResolversTypes['AgentBot'] }>;
  AuthPayload: ResolverTypeWrapper<Omit<AuthPayload, 'user'> & { user: ResolversTypes['User'] }>;
  AuthRequest: ResolverTypeWrapper<IAuthRequest>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ClearTopicMessagesPayload: ResolverTypeWrapper<ClearTopicMessagesPayload>;
  CreateAgentBotPayload: ResolverTypeWrapper<CreateAgentBotPayload>;
  CreateTopicPayload: ResolverTypeWrapper<Omit<CreateTopicPayload, 'topic'> & { topic?: Maybe<ResolversTypes['Topic']> }>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FormContent: ResolverTypeWrapper<FormContent>;
  FormContentInput: FormContentInput;
  FormField: ResolverTypeWrapper<FormField>;
  FormFieldInput: FormFieldInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  LoginPayload: ResolverTypeWrapper<LoginPayload>;
  Message: ResolverTypeWrapper<Omit<Message, 'sender'> & { sender: ResolversTypes['User'] }>;
  MessageType: MessageType;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RegisterPayload: ResolverTypeWrapper<RegisterPayload>;
  RejectAuthRequestPayload: ResolverTypeWrapper<RejectAuthRequestPayload>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Topic: ResolverTypeWrapper<ITopic>;
  TopicSearchResult: ResolverTypeWrapper<TopicSearchResult>;
  TopicStatus: TopicStatus;
  TopicType: TopicType;
  User: ResolverTypeWrapper<IUser>;
  UserType: UserType;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AgentBot: IAgentBot;
  ApiKeyPayload: ApiKeyPayload;
  ApproveAuthRequestPayload: Omit<ApproveAuthRequestPayload, 'agentBot'> & { agentBot: ResolversParentTypes['AgentBot'] };
  AuthPayload: Omit<AuthPayload, 'user'> & { user: ResolversParentTypes['User'] };
  AuthRequest: IAuthRequest;
  Boolean: Scalars['Boolean']['output'];
  ClearTopicMessagesPayload: ClearTopicMessagesPayload;
  CreateAgentBotPayload: CreateAgentBotPayload;
  CreateTopicPayload: Omit<CreateTopicPayload, 'topic'> & { topic?: Maybe<ResolversParentTypes['Topic']> };
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  FormContent: FormContent;
  FormContentInput: FormContentInput;
  FormField: FormField;
  FormFieldInput: FormFieldInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  LoginPayload: LoginPayload;
  Message: Omit<Message, 'sender'> & { sender: ResolversParentTypes['User'] };
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  RegisterPayload: RegisterPayload;
  RejectAuthRequestPayload: RejectAuthRequestPayload;
  String: Scalars['String']['output'];
  Topic: ITopic;
  TopicSearchResult: TopicSearchResult;
  User: IUser;
};

export type AgentBotResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AgentBot'] = ResolversParentTypes['AgentBot']> = {
  apiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  purpose?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgentBotStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type ApiKeyPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ApiKeyPayload'] = ResolversParentTypes['ApiKeyPayload']> = {
  apiKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ApproveAuthRequestPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ApproveAuthRequestPayload'] = ResolversParentTypes['ApproveAuthRequestPayload']> = {
  agentBot?: Resolver<ResolversTypes['AgentBot'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgentBotStatus'], ParentType, ContextType>;
};

export type AuthPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
};

export type AuthRequestResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthRequest'] = ResolversParentTypes['AuthRequest']> = {
  agentBotName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  agentBotPurpose?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  applicant?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rejectReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgentBotStatus'], ParentType, ContextType>;
  topicDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topicName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topicSlug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type ClearTopicMessagesPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ClearTopicMessagesPayload'] = ResolversParentTypes['ClearTopicMessagesPayload']> = {
  clearedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CreateAgentBotPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateAgentBotPayload'] = ResolversParentTypes['CreateAgentBotPayload']> = {
  requestId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgentBotStatus'], ParentType, ContextType>;
};

export type CreateTopicPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTopicPayload'] = ResolversParentTypes['CreateTopicPayload']> = {
  requestId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TopicStatus'], ParentType, ContextType>;
  topic?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FormContentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FormContent'] = ResolversParentTypes['FormContent']> = {
  fields?: Resolver<Array<ResolversTypes['FormField']>, ParentType, ContextType>;
  submitLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type FormFieldResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FormField'] = ResolversParentTypes['FormField']> = {
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  options?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type LoginPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginPayload'] = ResolversParentTypes['LoginPayload']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type MessageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = {
  content?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  readBy?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  topicId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['MessageType'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  approveAgentBot?: Resolver<ResolversTypes['ApproveAuthRequestPayload'], ParentType, ContextType, RequireFields<MutationApproveAgentBotArgs, 'requestId'>>;
  approveTopic?: Resolver<ResolversTypes['Topic'], ParentType, ContextType, RequireFields<MutationApproveTopicArgs, 'requestId'>>;
  clearTopicMessages?: Resolver<ResolversTypes['ClearTopicMessagesPayload'], ParentType, ContextType, RequireFields<MutationClearTopicMessagesArgs, 'topicId'>>;
  createAgentBot?: Resolver<ResolversTypes['CreateAgentBotPayload'], ParentType, ContextType, RequireFields<MutationCreateAgentBotArgs, 'name' | 'purpose' | 'reason'>>;
  createTopic?: Resolver<ResolversTypes['CreateTopicPayload'], ParentType, ContextType, RequireFields<MutationCreateTopicArgs, 'description' | 'name' | 'slug'>>;
  markAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkAsReadArgs, 'topicId'>>;
  regenerateApiKey?: Resolver<ResolversTypes['ApiKeyPayload'], ParentType, ContextType>;
  rejectAgentBot?: Resolver<ResolversTypes['RejectAuthRequestPayload'], ParentType, ContextType, RequireFields<MutationRejectAgentBotArgs, 'reason' | 'requestId'>>;
  rejectTopic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRejectTopicArgs, 'reason' | 'requestId'>>;
  sendMessage?: Resolver<ResolversTypes['Message'], ParentType, ContextType, RequireFields<MutationSendMessageArgs, 'content' | 'topicId' | 'type'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  agentBots?: Resolver<Array<ResolversTypes['AgentBot']>, ParentType, ContextType>;
  authRequests?: Resolver<Array<ResolversTypes['AuthRequest']>, ParentType, ContextType, Partial<QueryAuthRequestsArgs>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  messages?: Resolver<Array<ResolversTypes['Message']>, ParentType, ContextType, RequireFields<QueryMessagesArgs, 'topicId'>>;
  searchTopics?: Resolver<Array<ResolversTypes['TopicSearchResult']>, ParentType, ContextType, RequireFields<QuerySearchTopicsArgs, 'keyword'>>;
  topic?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<QueryTopicArgs, 'id'>>;
  topicBySlug?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<QueryTopicBySlugArgs, 'slug'>>;
  topics?: Resolver<Array<ResolversTypes['Topic']>, ParentType, ContextType>;
};

export type RegisterPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RegisterPayload'] = ResolversParentTypes['RegisterPayload']> = {
  apiKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type RejectAuthRequestPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RejectAuthRequestPayload'] = ResolversParentTypes['RejectAuthRequestPayload']> = {
  status?: Resolver<ResolversTypes['AgentBotStatus'], ParentType, ContextType>;
};

export type TopicResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Topic'] = ResolversParentTypes['Topic']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastMessage?: Resolver<Maybe<ResolversTypes['Message']>, ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ownerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TopicStatus'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TopicType'], ParentType, ContextType>;
  unreadCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type TopicSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TopicSearchResult'] = ResolversParentTypes['TopicSearchResult']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  relateScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  apiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['UserType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AgentBot?: AgentBotResolvers<ContextType>;
  ApiKeyPayload?: ApiKeyPayloadResolvers<ContextType>;
  ApproveAuthRequestPayload?: ApproveAuthRequestPayloadResolvers<ContextType>;
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  AuthRequest?: AuthRequestResolvers<ContextType>;
  ClearTopicMessagesPayload?: ClearTopicMessagesPayloadResolvers<ContextType>;
  CreateAgentBotPayload?: CreateAgentBotPayloadResolvers<ContextType>;
  CreateTopicPayload?: CreateTopicPayloadResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  FormContent?: FormContentResolvers<ContextType>;
  FormField?: FormFieldResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  LoginPayload?: LoginPayloadResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RegisterPayload?: RegisterPayloadResolvers<ContextType>;
  RejectAuthRequestPayload?: RejectAuthRequestPayloadResolvers<ContextType>;
  Topic?: TopicResolvers<ContextType>;
  TopicSearchResult?: TopicSearchResultResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

