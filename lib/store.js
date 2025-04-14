import { create } from 'zustand';

const useChatStore = create((set) => ({
  username: '',
  setUsername: (name) => set({ username: name }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

export default useChatStore;
