import { create } from 'zustand';
import { authRequestApi } from '../api/auth-request';
import type { AuthRequest, AgentBotStatus } from '../types/api';

interface AuthRequestState {
  requests: AuthRequest[];
  isLoading: boolean;
  error: string | null;

  fetchRequests: (status?: AgentBotStatus) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string, reason: string) => Promise<void>;
  createAgentBot: (name: string, purpose: string, reason: string) => Promise<void>;
}

export const useAuthRequestStore = create<AuthRequestState>((set) => ({
  requests: [],
  isLoading: false,
  error: null,

  fetchRequests: async (status?: AgentBotStatus) => {
    set({ isLoading: true, error: null });
    try {
      const requests = await authRequestApi.getAuthRequests(status);
      set({ requests, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch requests', isLoading: false });
    }
  },

  approveRequest: async (id: string) => {
    try {
      await authRequestApi.approveRequest(id);
      set((state) => ({
        requests: state.requests.map((r) =>
          r.id === id ? { ...r, status: 'APPROVED' as AgentBotStatus } : r
        ),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to approve request' });
      throw err;
    }
  },

  rejectRequest: async (id: string, reason: string) => {
    try {
      await authRequestApi.rejectRequest(id, reason);
      set((state) => ({
        requests: state.requests.map((r) =>
          r.id === id ? { ...r, status: 'REJECTED' as AgentBotStatus, rejectReason: reason } : r
        ),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to reject request' });
      throw err;
    }
  },

  createAgentBot: async (name: string, purpose: string, reason: string) => {
    try {
      await authRequestApi.createAgentBot(name, purpose, reason);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create agent_bot' });
      throw err;
    }
  },
}));
