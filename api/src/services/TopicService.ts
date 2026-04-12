import { TopicModel, TopicDocument, ITopic } from '../models';
import mongoose from 'mongoose';

export interface CreateTopicInput {
  type: 'direct' | 'group' | 'auth';
  name: string;
  ownerId: string;
  members?: string[];
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class TopicService {
  async createTopic(input: CreateTopicInput): Promise<TopicDocument> {
    const topic = await TopicModel.create({
      type: input.type,
      name: input.name,
      ownerId: new mongoose.Types.ObjectId(input.ownerId),
      members: input.members?.map((id) => new mongoose.Types.ObjectId(id)) || [
        new mongoose.Types.ObjectId(input.ownerId),
      ],
      messages: [],
    });

    return topic;
  }

  async createAuthTopic(authRequestId: string, ownerId: string): Promise<TopicDocument> {
    return this.createTopic({
      type: 'auth',
      name: `auth-request-${authRequestId}`,
      ownerId,
      members: [ownerId],
    });
  }

  async getTopicById(topicId: string): Promise<TopicDocument | null> {
    if (!isValidObjectId(topicId)) {
      return null;
    }
    return TopicModel.findById(topicId);
  }

  async getTopicsByUser(userId: string): Promise<TopicDocument[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }
    return TopicModel.find({
      members: new mongoose.Types.ObjectId(userId),
    }).sort({ updatedAt: -1 });
  }

  async addMember(topicId: string, userId: string): Promise<TopicDocument | null> {
    if (!isValidObjectId(topicId) || !isValidObjectId(userId)) {
      return null;
    }
    return TopicModel.findByIdAndUpdate(
      topicId,
      { $addToSet: { members: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    );
  }

  async removeMember(topicId: string, userId: string): Promise<TopicDocument | null> {
    if (!isValidObjectId(topicId) || !isValidObjectId(userId)) {
      return null;
    }
    return TopicModel.findByIdAndUpdate(
      topicId,
      { $pull: { members: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    );
  }

  async canAccessTopic(topicId: string, userId: string): Promise<boolean> {
    if (!isValidObjectId(topicId)) {
      return false;
    }
    const topic = await TopicModel.findById(topicId);
    if (!topic) return false;

    if (topic.type === 'auth') {
      return topic.ownerId.toString() === userId;
    }

    return topic.members.some((m) => m.toString() === userId);
  }
}

export const topicService = new TopicService();
