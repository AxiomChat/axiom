import { Message } from "./types";

export interface EnumType<T = string, P = object> {
  type: T;
  params: P;
}

export type Indicator = EnumType<
  "typing",
  { user_id: string; channel_id: string }
>;

export interface IndicatorContext {
  indicator: Indicator;
  expires: number;
}

export type ClientMessage =
  | EnumType<"send_message", { channel_id: string; contents: string }>
  | EnumType<"delete_message", { message_id: number }>
  | EnumType<"edit_message", { message_id: number; new_contents: string }>
  | EnumType<"load_chunk", { channel_id: string; chunk_id: number }>
  | EnumType<"typing", { channel_id: string }>;

export type ServerMessage =
  | EnumType<"authenticated", { uuid: string; indicators: IndicatorContext[] }>
  | EnumType<"temp_message", { message: string }>
  | EnumType<"message_create", Message>
  | EnumType<"message_update", { message_id: number; contents: string }>
  | EnumType<"message_delete", { message_id: number }>
  | EnumType<"presence_update", { user_id: String; status: String }>
  | EnumType<"indicator", IndicatorContext>
  | EnumType<"shutdown", { message: string }>
  | EnumType<"chunk", Message[]>;
