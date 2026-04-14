import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  type: 'TEXT' | 'FORM';
  content: Record<string, unknown>;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface ITopic {
  type: 'direct' | 'group' | 'auth';
  slug: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'rejected';
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export type TopicDocument = Document & ITopic;

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['TEXT', 'FORM'], required: true },
    content: { type: Schema.Types.Mixed, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: true }
);

MessageSchema.set('timestamps', { createdAt: true, updatedAt: false });

const TopicSchema = new Schema<TopicDocument>(
  {
    type: { type: String, enum: ['direct', 'group', 'auth'], required: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'active' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [MessageSchema],
  },
  { timestamps: true }
);

TopicSchema.index({ type: 1 });
TopicSchema.index({ members: 1 });
TopicSchema.index({ slug: 1 }, { unique: true });
TopicSchema.index({ name: 'text', description: 'text' });

export const TopicModel = mongoose.model<TopicDocument>('Topic', TopicSchema);
