import { Message, Server } from "@/types/types";
import { Dispatch, RefObject, SetStateAction } from "react";
import { toast } from "sonner";
import { MessageStore } from "@/hooks/use-messages";
import { IndicatorContext, ServerMessage } from "@/types/protocol";
import { authRelay } from "@/actions/auth";
import { getServerById } from "@/actions/get-server";
import { playPCM16 } from "./audio";

type AuthParams = {
  id: string;
  wsRef: RefObject<WebSocket | null>;
  setServer?: Dispatch<SetStateAction<Server | undefined>>;
  onNewMessage?: (m: Message) => void;
  messageStore: MessageStore;
  onIndicator?: (i: IndicatorContext) => void;
  onVoice?: (userId: string, bytes: number[]) => void;
  onVoiceJoin?: (userId: string, channelId: string, voiceId: number) => void;
  onVoiceLeave?: (userId: string, channelId: string, voiceId: number) => void;
  onSpeaking?: (voiceId: number) => void;
};

export default async function auth({
  id,
  wsRef,
  setServer,
  onNewMessage,
  messageStore,
  onIndicator,
  onVoiceJoin,
  onVoiceLeave,
  onSpeaking,
}: AuthParams) {
  console.log("Authenticating with server id:", id);

  if (!id) return;

  const ip = (await getServerById(id)).address;

  console.log("Authenticating with server at:", ip);
  const server_auth = await authRelay(id);

  var name = id;

  // Open the WebSocket connection
  const ws = new WebSocket(`wss://${ip}`);
  wsRef.current = ws;

  ws.onopen = () => {
    console.log("Connected to WebSocket:", ip);
  };

  ws.onmessage = async (m) => {
    if (m.data instanceof Blob) {
      const buffer = await m.data.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      playPCM16(bytes);
      if (onSpeaking) onSpeaking(new DataView(buffer).getUint16(0, true));
      return;
    }

    var data = JSON.parse(m.data);
    console.log("Message received:", data);

    if (data.error) {
      toast.error(`Error from ${name} (${data.error})`, {
        description: data.message,
      });
      return;
    }

    if (data.version) {
      if (setServer) setServer({ channels: [], ...data });
      ws.send(
        JSON.stringify({
          version: "0.0.1",
          auth_token: server_auth,
        })
      );
      name = data.name;
      return;
    }

    const msg = data as ServerMessage;

    switch (msg.type) {
      case "authenticated":
        if (onIndicator) msg.params.indicators.forEach(onIndicator);
        if (onVoiceJoin)
          Object.entries(msg.params.voice_chat).forEach(([channelId, users]) =>
            Object.entries(users).forEach(([userId, voiceId]) =>
              onVoiceJoin(userId, channelId, voiceId)
            )
          );
        break;

      case "message_create":
        if (onNewMessage) onNewMessage(msg.params as Message);
        messageStore.addMessage(msg.params as Message);
        break;

      case "message_delete":
        messageStore.deleteMessage(msg.params.message_id);
        break;

      case "message_update":
        messageStore.editMessage(msg.params.message_id, msg.params.contents);
        break;
      case "chunk":
        messageStore.insertMessages(msg.params);
        break;
      case "indicator":
        if (!onIndicator) break;
        onIndicator(msg.params);
        break;
      case "voice_join":
        if (!onVoiceJoin) break;
        onVoiceJoin(
          msg.params.user_id,
          msg.params.channel_id,
          msg.params.voice_id
        );
        break;
      case "voice_leave":
        if (!onVoiceLeave) break;
        onVoiceLeave(
          msg.params.user_id,
          msg.params.channel_id,
          msg.params.voice_id
        );
        break;
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);

    let description = "An unknown WebSocket error occurred.";

    if (err instanceof ErrorEvent) {
      // Browser WebSocket errors show up here
      description =
        err.message || err.error?.message || "WebSocket connection failed.";
    } else if (err instanceof Event) {
      // Generic Event (no info)
      description = "WebSocket encountered a network issue.";
    } else if (err && typeof err === "object") {
      // Custom data if something special got passed
      description = JSON.stringify(err, null, 2);
    } else {
      description = String(err);
    }

    toast.error(`WebSocket error (${name})`, { description });
  };

  ws.onclose = () => {
    console.log("WebSocket closed: ", ip);
  };

  // Cleanup on unmount or id change
  return () => {
    ws.close();
  };
}
