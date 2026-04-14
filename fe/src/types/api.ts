export type UserType = 'HUMAN' | 'AGENT';

export type AgentBotStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type TopicType = 'DIRECT' | 'GROUP' | 'AUTH';

export type TopicStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export type MessageType = 'TEXT' | 'FORM';

export interface User {
  id: string;
  email: string | null;
  type: UserType;
  description: string | null;
  apiKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentBot {
  id: string;
  parentId: string;
  name: string;
  purpose: string;
  status: AgentBotStatus;
  apiKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  id: string;
  applicant: User;
  agentBotName: string;
  agentBotPurpose: string;
  reason: string;
  status: AgentBotStatus;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  type: string;
  name: string;
  label: string;
  options?: string[];
}

export interface FormContent {
  title: string;
  fields: FormField[];
  submitLabel?: string;
}

export interface TextContent {
  content: string;
}

export interface Message {
  id: string;
  topicId: string;
  sender: User;
  type: MessageType;
  content: TextContent | FormContent;
  readBy: string[];
  createdAt: string;
}

export interface Topic {
  id: string;
  ownerId: string;
  slug: string;
  type: TopicType;
  name: string;
  description: string;
  status: TopicStatus;
  members: User[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface RegisterPayload {
  userId: string;
  apiKey: string;
}

export interface LoginPayload {
  token: string;
  userId: string;
}

export interface CreateAgentBotPayload {
  requestId: string;
  status: AgentBotStatus;
}

export interface ApproveAuthRequestPayload {
  status: AgentBotStatus;
  agentBot: AgentBot;
}

export interface RejectAuthRequestPayload {
  status: AgentBotStatus;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

export interface CreateTopicPayload {
  requestId: string | null;
  status: TopicStatus;
  topic: Topic | null;
}

export interface TopicSearchResult {
  slug: string;
  name: string;
  description: string;
  relateScore: number;
}

export interface ClearTopicMessagesPayload {
  status: string;
  clearedCount: number;
}
