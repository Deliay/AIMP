import mongoose, { Document, Schema } from 'mongoose';

export interface IAgentBot {
  parentId: mongoose.Types.ObjectId;
  name: string;
  purpose: string;
  apiKey: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export type AgentBotDocument = Document & IAgentBot;

const AgentBotSchema = new Schema<AgentBotDocument>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    purpose: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

AgentBotSchema.index({ parentId: 1 });
AgentBotSchema.index({ apiKey: 1 }, { unique: true });

export const AgentBotModel = mongoose.model<AgentBotDocument>(
  'AgentBot',
  AgentBotSchema
);