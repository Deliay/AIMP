import { TopicModel, TopicDocument, ITopic, AuthRequestModel } from '../models';
import mongoose from 'mongoose';

export interface CreateTopicInput {
  type: 'direct' | 'group' | 'auth';
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  members?: string[];
}

export interface TopicSearchResult {
  slug: string;
  name: string;
  description: string;
  relateScore: number;
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class TopicService {
  async createTopic(input: CreateTopicInput): Promise<TopicDocument> {
    const topic = await TopicModel.create({
      type: input.type,
      slug: input.slug,
      name: input.name,
      description: input.description || '',
      status: 'active',
      ownerId: new mongoose.Types.ObjectId(input.ownerId),
      members: input.members?.map((id) => new mongoose.Types.ObjectId(id)) || [
        new mongoose.Types.ObjectId(input.ownerId),
      ],
      messages: [],
    });

    return topic;
  }

  async createPendingTopic(input: CreateTopicInput): Promise<TopicDocument> {
    const topic = await TopicModel.create({
      type: input.type,
      slug: input.slug,
      name: input.name,
      description: input.description || '',
      status: 'pending',
      ownerId: new mongoose.Types.ObjectId(input.ownerId),
      members: input.members?.map((id) => new mongoose.Types.ObjectId(id)) || [
        new mongoose.Types.ObjectId(input.ownerId),
      ],
      messages: [],
    });

    return topic;
  }

  async createPendingTopicWithAuthRequest(input: CreateTopicInput): Promise<{ topic: TopicDocument; requestId: string }> {
    const authRequest = await AuthRequestModel.create({
      applicantId: new mongoose.Types.ObjectId(input.ownerId),
      reason: `Topic creation: ${input.name}`,
      status: 'PENDING',
      topicName: input.name,
      topicSlug: input.slug,
      topicDescription: input.description || '',
    });

    const topic = await TopicModel.create({
      type: input.type,
      slug: input.slug,
      name: input.name,
      description: input.description || '',
      status: 'pending',
      ownerId: new mongoose.Types.ObjectId(input.ownerId),
      members: input.members?.map((id) => new mongoose.Types.ObjectId(id)) || [
        new mongoose.Types.ObjectId(input.ownerId),
      ],
      messages: [],
    });

    return {
      topic,
      requestId: authRequest._id.toString(),
    };
  }

  async createAuthTopic(authRequestId: string, ownerId: string): Promise<TopicDocument> {
    return this.createTopic({
      type: 'auth',
      name: `auth-request-${authRequestId}`,
      slug: `auth-${authRequestId}`,
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

  async getTopicBySlug(slug: string): Promise<TopicDocument | null> {
    return TopicModel.findOne({ slug });
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

  async approveTopic(topicId: string): Promise<TopicDocument | null> {
    if (!isValidObjectId(topicId)) {
      return null;
    }
    return TopicModel.findByIdAndUpdate(
      topicId,
      { status: 'active' },
      { new: true }
    );
  }

  async rejectTopic(topicId: string): Promise<boolean> {
    if (!isValidObjectId(topicId)) {
      return false;
    }
    const result = await TopicModel.findByIdAndUpdate(
      topicId,
      { status: 'rejected' },
      { new: true }
    );
    return result !== null;
  }

  async deleteTopic(topicId: string): Promise<boolean> {
    if (!isValidObjectId(topicId)) {
      return false;
    }
    const result = await TopicModel.findByIdAndDelete(topicId);
    return result !== null;
  }

  async clearMessages(topicId: string): Promise<number> {
    if (!isValidObjectId(topicId)) {
      return 0;
    }
    const topic = await TopicModel.findById(topicId);
    if (!topic) return 0;

    const count = topic.messages.length;
    topic.messages = [];
    await topic.save();
    return count;
  }

  async searchTopics(keyword: string): Promise<TopicSearchResult[]> {
    const results = await TopicModel.find(
      { $text: { $search: keyword }, status: 'active' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    return results.map((topic) => ({
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
      relateScore: 0.0,
    }));
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

  async canModifyTopic(topicId: string, userId: string, userType: string): Promise<boolean> {
    if (!isValidObjectId(topicId)) {
      return false;
    }
    const topic = await TopicModel.findById(topicId);
    if (!topic) return false;

    if (topic.ownerId.toString() !== userId) {
      return false;
    }

    if (userType !== 'HUMAN') {
      return false;
    }

    return true;
  }
}

export const topicService = new TopicService();
