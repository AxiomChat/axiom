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
  const [messages, setMessages] = useState<Message[]>([]);

  return {
    messages: messages,
    setMessages: (msgs) => setMessages(msgs),
    addMessage: (msg) =>
      setMessages((messages) =>
        messages.some((m) => m.id === msg.id) ? messages : [...messages, msg]
      ),
    deleteMessage: (id: number) =>
      setMessages((messages) => messages.filter((m) => m.id !== id)),
    editMessage: (id: number, contents) =>
      setMessages((messages) =>
        messages.map((m) => (m.id === id ? { ...m, contents } : m))
      ),
    clearMessages: () => setMessages([]),
    insertMessages: (msgs) => setMessages((m) => [...msgs, ...m]),
  };
}
