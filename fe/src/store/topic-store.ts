import { create } from 'zustand';
import { topicApi } from '../api/topic';
import type { ClearTopicMessagesPayload, CreateTopicPayload, TopicSearchResult } from '../types/api';

interface TopicState {
  searchResults: TopicSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  createError: string | null;
  clearError: string | null;

  searchTopics: (keyword: string) => Promise<void>;
  createTopic: (
    slug: string,
    name: string,
    description: string,
    wait?: boolean
  ) => Promise<CreateTopicPayload>;
  clearTopicMessages: (topicId: string) => Promise<ClearTopicMessagesPayload>;
  clearSearchResults: () => void;
}

export const useTopicStore = create<TopicState>((set) => ({
  searchResults: [],
  isSearching: false,
  searchError: null,
  createError: null,
  clearError: null,

  searchTopics: async (keyword: string) => {
    set({ isSearching: true, searchError: null });
    try {
      const results = await topicApi.searchTopics(keyword);
      set({ searchResults: results, isSearching: false });
    } catch (err) {
      set({
        searchError: err instanceof Error ? err.message : 'Failed to search topics',
        isSearching: false,
      });
    }
  },

  createTopic: async (slug: string, name: string, description: string, wait?: boolean) => {
    set({ createError: null });
    try {
      const payload = await topicApi.createTopic(slug, name, description, wait);
      return payload;
    } catch (err) {
      set({
        createError: err instanceof Error ? err.message : 'Failed to create topic',
      });
      throw err;
    }
  },

  clearTopicMessages: async (topicId: string) => {
    set({ clearError: null });
    try {
      const payload = await topicApi.clearTopicMessages(topicId);
      return payload;
    } catch (err) {
      set({
        clearError: err instanceof Error ? err.message : 'Failed to clear messages',
      });
      throw err;
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [], searchError: null });
  },
}));