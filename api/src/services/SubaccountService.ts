import { SubaccountModel, SubaccountDocument, AuthRequestModel, UserModel } from '../models';
import { generateApiKey } from '../utils';
import mongoose from 'mongoose';

export interface CreateSubaccountInput {
  parentId: string;
  name: string;
  purpose: string;
  reason: string;
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class SubaccountService {
  async createSubaccountWithAuthRequest(input: CreateSubaccountInput): Promise<{ authRequestId: string; subaccountId: string }> {
    const authRequest = await AuthRequestModel.create({
      applicantId: input.parentId,
      subaccountName: input.name,
      subaccountPurpose: input.purpose,
      reason: input.reason,
      status: 'pending',
    });

    return {
      authRequestId: authRequest._id.toString(),
      subaccountId: authRequest._id.toString(),
    };
  }

  async approveSubaccount(authRequestId: string): Promise<SubaccountDocument> {
    if (!isValidObjectId(authRequestId)) {
      throw new Error('Auth request not found');
    }
    const authRequest = await AuthRequestModel.findById(authRequestId);
    if (!authRequest) {
      throw new Error('Auth request not found');
    }

    if (authRequest.status !== 'pending') {
      throw new Error('Auth request is not pending');
    }

    const apiKey = generateApiKey();

    const subaccount = await SubaccountModel.create({
      parentId: authRequest.applicantId,
      name: authRequest.subaccountName,
      purpose: authRequest.subaccountPurpose,
      apiKey,
      status: 'approved',
    });

    authRequest.status = 'approved';
    await authRequest.save();

    await UserModel.create({
      email: `subaccount_${subaccount._id}@aimp.local`,
      passwordHash: '',
      apiKey,
      type: 'agent',
      description: authRequest.subaccountPurpose,
    });

    return subaccount;
  }

  async rejectSubaccount(authRequestId: string, rejectReason: string): Promise<void> {
    if (!isValidObjectId(authRequestId)) {
      throw new Error('Auth request not found');
    }
    const authRequest = await AuthRequestModel.findById(authRequestId);
    if (!authRequest) {
      throw new Error('Auth request not found');
    }

    authRequest.status = 'rejected';
    authRequest.rejectReason = rejectReason;
    await authRequest.save();
  }

  async getSubaccountsByParent(parentId: string): Promise<SubaccountDocument[]> {
    if (!isValidObjectId(parentId)) {
      return [];
    }
    return SubaccountModel.find({ parentId: new mongoose.Types.ObjectId(parentId) });
  }

  async getSubaccountById(subaccountId: string): Promise<SubaccountDocument | null> {
    if (!isValidObjectId(subaccountId)) {
      return null;
    }
    return SubaccountModel.findById(subaccountId);
  }
}

export const subaccountService = new SubaccountService();
