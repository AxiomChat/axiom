export interface MessageType<T = string, P = object> {
  type: T;
  params: P;
}

export type ClientMessage =
  | MessageType<"send_message", { channel_id: string; contents: string }>
  | MessageType<"delete_message", { message_id: number }>
  | MessageType<"edit_message", { message_id: number; new_contents: string }>
  | MessageType<"load_chunk", { channel_id: string; chunk_id: number }>;
