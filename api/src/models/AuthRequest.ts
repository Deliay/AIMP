import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthRequest {
  applicantId: mongoose.Types.ObjectId;
  subaccountName: string;
  subaccountPurpose: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthRequestDocument = Document & IAuthRequest;

const AuthRequestSchema = new Schema<AuthRequestDocument>(
  {
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subaccountName: { type: String, required: true },
    subaccountPurpose: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectReason: { type: String },
  },
  { timestamps: true }
);

AuthRequestSchema.index({ applicantId: 1 });
AuthRequestSchema.index({ status: 1 });

export const AuthRequestModel = mongoose.model<AuthRequestDocument>(
  'AuthRequest',
  AuthRequestSchema
);
