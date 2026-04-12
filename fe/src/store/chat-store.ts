import { create } from 'zustand';
import { chatApi } from '../api/chat';
import type { Message, MessageType, Topic } from '../types/api';

interface ChatState {
  topics: Topic[];
  currentTopicId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;

  fetchTopics: () => Promise<void>;
  fetchMessages: (topicId: string) => Promise<void>;
  sendMessage: (topicId: string, type: MessageType, content: Record<string, unknown>) => Promise<void>;
  setCurrentTopic: (topicId: string | null) => void;
  markAsRead: (topicId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  topics: [],
  currentTopicId: null,
  messages: {},
  isLoading: false,
  error: null,

  fetchTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      const topics = await chatApi.getTopics();
      set({ topics, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch topics', isLoading: false });
    }
  },

  fetchMessages: async (topicId: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await chatApi.getMessages(topicId);
      set((state) => ({
        messages: { ...state.messages, [topicId]: messages },
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch messages', isLoading: false });
    }
  },

  sendMessage: async (topicId: string, type: MessageType, content: Record<string, unknown>) => {
    try {
      const message = await chatApi.sendMessage(topicId, type, content);
      set((state) => ({
        messages: {
          ...state.messages,
          [topicId]: [...(state.messages[topicId] || []), message],
        },
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to send message' });
      throw err;
    }
  },

  setCurrentTopic: (topicId: string | null) => {
    set({ currentTopicId: topicId });
  },

  markAsRead: async (topicId: string) => {
    try {
      await chatApi.markAsRead(topicId);
      set((state) => ({
        topics: state.topics.map((t) =>
          t.id === topicId ? { ...t, unreadCount: 0 } : t
        ),
      }));
    } catch {
      // Silently fail
    }
  },
}));
