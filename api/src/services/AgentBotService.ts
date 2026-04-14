import { AgentBotModel, AgentBotDocument, AuthRequestModel } from '../models';
import { generateApiKey } from '../utils';
import mongoose from 'mongoose';

export interface CreateAgentBotInput {
  parentId: string;
  name: string;
  purpose: string;
  reason: string;
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class AgentBotService {
  async createAgentBotWithAuthRequest(input: CreateAgentBotInput): Promise<{ requestId: string; status: string }> {
    const authRequest = await AuthRequestModel.create({
      applicantId: input.parentId,
      agentBotName: input.name,
      agentBotPurpose: input.purpose,
      reason: input.reason,
      status: 'PENDING',
    });

    return {
      requestId: authRequest._id.toString(),
      status: 'PENDING',
    };
  }

  async approveAgentBot(authRequestId: string): Promise<AgentBotDocument> {
    if (!isValidObjectId(authRequestId)) {
      throw new Error('Auth request not found');
    }
    const authRequest = await AuthRequestModel.findById(authRequestId);
    if (!authRequest) {
      throw new Error('Auth request not found');
    }

    if (authRequest.status !== 'PENDING') {
      throw new Error('Auth request is not pending');
    }

    const apiKey = generateApiKey();

    const agentBot = await AgentBotModel.create({
      parentId: authRequest.applicantId,
      name: authRequest.agentBotName,
      purpose: authRequest.agentBotPurpose,
      apiKey,
      status: 'APPROVED',
    });

    authRequest.status = 'APPROVED';
    await authRequest.save();

    return agentBot;
  }

  async rejectAgentBot(authRequestId: string, rejectReason: string): Promise<void> {
    if (!isValidObjectId(authRequestId)) {
      throw new Error('Auth request not found');
    }
    const authRequest = await AuthRequestModel.findById(authRequestId);
    if (!authRequest) {
      throw new Error('Auth request not found');
    }

    authRequest.status = 'REJECTED';
    authRequest.rejectReason = rejectReason;
    await authRequest.save();
  }

  async getAgentBotsByParent(parentId: string): Promise<AgentBotDocument[]> {
    if (!isValidObjectId(parentId)) {
      return [];
    }
    return AgentBotModel.find({ parentId: new mongoose.Types.ObjectId(parentId) });
  }

  async getAgentBotById(agentBotId: string): Promise<AgentBotDocument | null> {
    if (!isValidObjectId(agentBotId)) {
      return null;
    }
    return AgentBotModel.findById(agentBotId);
  }
}

export const agentBotService = new AgentBotService();