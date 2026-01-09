import { Message, Server } from "@/types/types";
import { toast } from "sonner";
import { MessageStore } from "@/hooks/use-messages";
import { IndicatorContext, ServerMessage } from "@/types/protocol";
import { authRelay } from "@/actions/auth";
import { getServerById } from "@/actions/get-server";
import { playPCM16 } from "./audio";

export interface NodeCallbacks {
  setServer?: (s: Server) => void;
  onNewMessage?: (m: Message) => void;
  onIndicator?: (i: IndicatorContext) => void;
  onVoiceJoin?: (userId: string, channelId: string, voiceId: number) => void;
  onVoiceLeave?: (userId: string, channelId: string, voiceId: number) => void;
  onSpeaking?: (voiceId: number) => void;
}

export class NodeClient {
  private ws: WebSocket | null = null;
  private name: string;
  private readonly serverId: string;
  private readonly messageStore: MessageStore;
  private readonly callbacks: NodeCallbacks;

  constructor(
    serverId: string,
    messageStore: MessageStore,
    callbacks: NodeCallbacks = {}
  ) {
    this.serverId = serverId;
    this.messageStore = messageStore;
    this.callbacks = callbacks;
    this.name = serverId;
  }

  get socket() {
    return this.ws;
  }

  async connect() {
    if (!this.serverId) return;

    const server = await getServerById(this.serverId);
    const authToken = await authRelay(this.serverId);

    this.ws = new WebSocket(`wss://${server.address}`);

    this.ws.onopen = () => {
      console.log("WebSocket connected:", server.address);
    };

    this.ws.onmessage = (e) => this.handleMessage(e, authToken);
    this.ws.onerror = (e) => this.handleError(e);
    this.ws.onclose = () => {
      console.log("WebSocket closed:", server.address);
    };
  }

  disconnect() {
    console.log("Disconnecting");
    this.ws?.close();
    this.ws = null;
  }

  private async handleMessage(e: MessageEvent, authToken: string) {
    // Voice packet
    if (e.data instanceof Blob) {
      const buffer = await e.data.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      playPCM16(bytes);

      if (this.callbacks.onSpeaking) {
        const voiceId = new DataView(buffer).getUint16(0, true);
        this.callbacks.onSpeaking(voiceId);
      }
      return;
    }

    const data = JSON.parse(e.data);

    console.log("Message received:", data);

    if (data.error) {
      toast.error(`Error from ${this.name} (${data.error})`, {
        description: data.message,
      });
      return;
    }

    // Handshake
    if (data.version) {
      this.callbacks.setServer?.({ channels: [], ...data });

      this.ws?.send(
        JSON.stringify({
          version: "0.0.1",
          auth_token: authToken,
        })
      );

      this.name = data.name;
      return;
    }

    this.handleServerMessage(data as ServerMessage);
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case "authenticated":
        msg.params.indicators.forEach((i) => this.callbacks.onIndicator?.(i));

        Object.entries(msg.params.voice_chat).forEach(([channelId, users]) =>
          Object.entries(users).forEach(([userId, voiceId]) =>
            this.callbacks.onVoiceJoin?.(userId, channelId, voiceId)
          )
        );
        break;

      case "message_create":
        this.callbacks.onNewMessage?.(msg.params);
        this.messageStore.addMessage(msg.params);
        break;

      case "message_delete":
        this.messageStore.deleteMessage(msg.params.message_id);
        break;

      case "message_update":
        this.messageStore.editMessage(
          msg.params.message_id,
          msg.params.contents
        );
        break;

      case "chunk":
        this.messageStore.insertMessages(msg.params);
        break;

      case "indicator":
        this.callbacks.onIndicator?.(msg.params);
        break;

      case "voice_join":
        this.callbacks.onVoiceJoin?.(
          msg.params.user_id,
          msg.params.channel_id,
          msg.params.voice_id
        );
        break;

      case "voice_leave":
        this.callbacks.onVoiceLeave?.(
          msg.params.user_id,
          msg.params.channel_id,
          msg.params.voice_id
        );
        break;
    }
  }

  private handleError(err: Event) {
    console.error("WebSocket error:", err);

    let description = "WebSocket connection failed.";

    if (err instanceof ErrorEvent) {
      description = err.message || description;
    }

    toast.error(`WebSocket error (${this.name})`, { description });
  }
}
