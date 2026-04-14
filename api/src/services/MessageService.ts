import { TopicModel, TopicDocument, UserModel } from '../models';
import mongoose from 'mongoose';

export interface SendMessageInput {
  topicId: string;
  senderId: string;
  senderType: 'user' | 'agentbot';
  type: 'TEXT' | 'FORM';
  content: Record<string, unknown>;
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class MessageService {
  async sendMessage(input: SendMessageInput): Promise<TopicDocument> {
    if (!isValidObjectId(input.topicId) || !isValidObjectId(input.senderId)) {
      throw new Error('Topic not found');
    }
    const topic = await TopicModel.findById(input.topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    const canSend = await this.canSendMessage(input.senderId, topic);
    if (!canSend) {
      throw new Error('Not authorized to send message to this topic');
    }

    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      senderId: new mongoose.Types.ObjectId(input.senderId),
      senderType: input.senderType,
      type: input.type,
      content: input.content,
      readBy: [new mongoose.Types.ObjectId(input.senderId)],
      createdAt: new Date(),
    };

    topic.messages.push(newMessage as any);
    topic.updatedAt = new Date();
    await topic.save();

    return topic;
  }

  async canSendMessage(senderId: string, topic: TopicDocument): Promise<boolean> {
    const isMember = topic.members.some((m) => m.toString() === senderId);
    if (!isMember) return false;

    if (topic.type === 'auth') {
      return topic.ownerId.toString() === senderId;
    }

    return true;
  }

  async canCommunicate(senderId: string, recipientId: string): Promise<boolean> {
    if (!isValidObjectId(senderId) || !isValidObjectId(recipientId)) {
      return false;
    }
    const sender = await UserModel.findById(senderId);
    const recipient = await UserModel.findById(recipientId);

    if (!sender || !recipient) return false;

    if (sender.type === 'human') return true;

    if (sender.type === 'agent') {
      return recipient.type === 'human' || recipient.type === 'agent';
    }

    return false;
  }

  async markAsRead(topicId: string, userId: string): Promise<TopicDocument | null> {
    if (!isValidObjectId(topicId)) {
      return null;
    }
    const topic = await TopicModel.findById(topicId);
    if (!topic) return null;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    topic.messages.forEach((msg) => {
      if (!msg.readBy.some((r) => r.toString() === userId)) {
        msg.readBy.push(userObjectId);
      }
    });

    await topic.save();
    return topic;
  }

  async getUnreadCount(topicId: string, userId: string): Promise<number> {
    if (!isValidObjectId(topicId)) {
      return 0;
    }
    const topic = await TopicModel.findById(topicId);
    if (!topic) return 0;

    return topic.messages.filter(
      (msg) => !msg.readBy.some((r) => r.toString() === userId)
    ).length;
  }

  async getMessagesByTopic(topicId: string, userId: string): Promise<TopicDocument | null> {
    if (!isValidObjectId(topicId)) {
      return null;
    }
    const topic = await TopicModel.findById(topicId);
    if (!topic) return null;

    const isMember = topic.members.some((m) => m.toString() === userId);
    if (!isMember) return null;

    return topic;
  }
}

export const messageService = new MessageService();
