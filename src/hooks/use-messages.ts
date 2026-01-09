import { Message } from "@/types/types";
import { useState } from "react";

export interface MessageStore {
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  deleteMessage: (id: number) => void;
  editMessage: (id: number, contents: string) => void;
  clearMessages: () => void;
  insertMessages: (msgs: Message[]) => void;
}

export default function useMessages(): MessageStore {
  const [messages, setMessagesState] = useState<Message[]>([]);

  // Helper to ensure unique messages by id
  const uniqueMessages = (msgs: Message[]) => {
    const map = new Map<number, Message>();
    msgs.forEach((m) => map.set(m.id, m)); // duplicates overwrite
    return Array.from(map.values());
  };

  const setMessages = (msgs: Message[]) =>
    setMessagesState(uniqueMessages(msgs));

  const addMessage = (msg: Message) =>
    setMessagesState((messages) =>
      messages.some((m) => m.id === msg.id) ? messages : [...messages, msg]
    );

  const insertMessages = (msgs: Message[]) =>
    setMessagesState((messages) => uniqueMessages([...msgs, ...messages]));

  const deleteMessage = (id: number) =>
    setMessagesState((messages) => messages.filter((m) => m.id !== id));

  const editMessage = (id: number, contents: string) =>
    setMessagesState((messages) =>
      messages.map((m) => (m.id === id ? { ...m, contents } : m))
    );

  const clearMessages = () => setMessagesState([]);

  return {
    messages,
    setMessages,
    addMessage,
    deleteMessage,
    editMessage,
    clearMessages,
    insertMessages,
  };
}
