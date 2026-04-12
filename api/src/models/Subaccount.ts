import mongoose, { Document, Schema } from 'mongoose';

export interface ISubaccount {
  parentId: mongoose.Types.ObjectId;
  name: string;
  purpose: string;
  apiKey: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export type SubaccountDocument = Document & ISubaccount;

const SubaccountSchema = new Schema<SubaccountDocument>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    purpose: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

SubaccountSchema.index({ parentId: 1 });
SubaccountSchema.index({ apiKey: 1 }, { unique: true });

export const SubaccountModel = mongoose.model<SubaccountDocument>(
  'Subaccount',
  SubaccountSchema
);
