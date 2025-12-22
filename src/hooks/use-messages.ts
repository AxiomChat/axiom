import { Message } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MessageStore {
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  deleteMessage: (id: number) => void;
  editMessage: (id: number, contents: string) => void;
  clearMessages: () => void;
}

type ServerMessageStore = {
  messages: Record<string, Message[]>; // server_id → messages
  setMessages: (serverId: string, msgs: Message[]) => void;
  addMessage: (serverId: string, msg: Message) => void;
  deleteMessage: (serverId: string, id: number) => void;
  editMessage: (serverId: string, id: number, contents: string) => void;
  clearMessages: (serverId?: string) => void;
};

export const useMessages = create<MessageStore>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (msgs) => set({ messages: msgs }),
      addMessage: (msg) =>
        set((state) =>
          state.messages.some((m) => m.id === msg.id)
            ? state
            : { messages: [...state.messages, msg] }
        ),
      deleteMessage: (id: number) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
      editMessage: (id: number, contents) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, contents } : m
          ),
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: "chat-messages" }
  )
);

export const useServerMessages = create<ServerMessageStore>()(
  persist(
    (set) => ({
      messages: {},

      setMessages: (serverId, msgs) =>
        set((state) => ({
          messages: { ...state.messages, [serverId]: msgs },
        })),

      addMessage: (serverId, msg) =>
        set((state) => {
          const serverMsgs = state.messages[serverId] || [];

          if (serverMsgs.some((m) => m.id === msg.id)) return state;

          return {
            messages: {
              ...state.messages,
              [serverId]: [...serverMsgs, msg],
            },
          };
        }),

      deleteMessage: (serverId, id) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [serverId]: (state.messages[serverId] || []).filter(
              (m) => m.id !== id
            ),
          },
        })),

      editMessage: (serverId, id, contents) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [serverId]: (state.messages[serverId] || []).map((m) =>
              m.id === id ? { ...m, contents } : m
            ),
          },
        })),

      clearMessages: (serverId) =>
        set((state) =>
          serverId
            ? {
                messages: {
                  ...state.messages,
                  [serverId]: [],
                },
              }
            : { messages: {} }
        ),
    }),
    { name: "server-messages" }
  )
);
