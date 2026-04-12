import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  type: 'text' | 'form';
  content: Record<string, unknown>;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface ITopic {
  type: 'direct' | 'group' | 'auth';
  name: string;
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
    type: { type: String, enum: ['text', 'form'], required: true },
    content: { type: Schema.Types.Mixed, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: true }
);

MessageSchema.set('timestamps', { createdAt: true, updatedAt: false });

const TopicSchema = new Schema<TopicDocument>(
  {
    type: { type: String, enum: ['direct', 'group', 'auth'], required: true },
    name: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [MessageSchema],
  },
  { timestamps: true }
);

TopicSchema.index({ type: 1 });
TopicSchema.index({ members: 1 });

export const TopicModel = mongoose.model<TopicDocument>('Topic', TopicSchema);
