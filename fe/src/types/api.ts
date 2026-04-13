export type UserType = 'HUMAN' | 'AGENT';

export type SubaccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type TopicType = 'DIRECT' | 'GROUP' | 'AUTH';

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

export interface Subaccount {
  id: string;
  parentId: string;
  name: string;
  purpose: string;
  status: SubaccountStatus;
  apiKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  id: string;
  applicant: User;
  subaccountName: string;
  subaccountPurpose: string;
  reason: string;
  status: SubaccountStatus;
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
  type: TopicType;
  name: string | null;
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

export interface CreateSubaccountPayload {
  requestId: string;
  status: SubaccountStatus;
}

export interface ApproveAuthRequestPayload {
  status: SubaccountStatus;
  subaccount: Subaccount;
}

export interface RejectAuthRequestPayload {
  status: SubaccountStatus;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}
