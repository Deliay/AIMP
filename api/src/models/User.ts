import mongoose, { Document, Schema } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash?: string;
  apiKey: string;
  type: 'human' | 'agent';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = Document & IUser;

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    apiKey: { type: String, required: true, unique: true },
    type: { type: String, enum: ['human', 'agent'], required: true },
    description: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ apiKey: 1 }, { unique: true });

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
