export interface MessageType<T = string, P = object> {
  type: T;
  params: P;
}

export type ClientMessage = MessageType<
  "send_message",
  { channel_id: string; contents: string }
>;
