import { Message, Server } from "@/types/types";
import axios from "axios";
import { Dispatch, RefObject, SetStateAction } from "react";
import { get } from "./request";
import { toast } from "sonner";

export default async function auth(
  id: string,
  wsRef: RefObject<WebSocket | null>,
  setServer: Dispatch<SetStateAction<Server | undefined>>,
  addMessage: (m: Message) => void,
  onNewMessage?: (m: Message) => void,
  lastMessage?: number
) {
  console.log("Authenticating with server id:", id);

  if (!id) return;

  const ip = ((await get(`/api/server/${id}`)).data as any).address as string;

  console.log("Authenticating with server at:", ip);
  const server_auth = (
    (await axios.post("/api/auth", { server_id: id })).data as any
  ).token;

  var name = id;

  // Open the WebSocket connection
  const ws = new WebSocket(`wss://${ip}`);
  wsRef.current = ws;

  ws.onopen = () => {
    console.log("Connected to WebSocket:", ip);
  };

  ws.onmessage = (m) => {
    const data = JSON.parse(m.data);
    console.log("Message received:", data);

    if (data.error) {
      toast.error(`Error from ${name} (${data.error})`, {
        description: data.message,
      });
      return;
    }

    if (data.version) {
      setServer({ channels: [], ...data });
      ws.send(
        JSON.stringify({
          version: "0.0.1",
          auth_token: server_auth,
          last_message: lastMessage || 0,
        })
      );
      name = data.name;
      return;
    }

    switch (data.type) {
      case "authenticated":
        data.params.messages.forEach(addMessage);
        break;

      case "message_create":
        if (onNewMessage) onNewMessage(data.params as Message);
        addMessage(data.params as Message);
        break;
      case "message_delete":
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
