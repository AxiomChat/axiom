import { Message } from "@/types/types";
import App from "@/types/app";
import React, { useEffect, useRef } from "react";
import { useParentCommunication } from "react-iframes-bridge";

export default function PluginChannel({
  app,
  messages,
  ip,
  serverRef,
}: {
  app: App;
  messages: Message[];
  ip: string;
  serverRef: React.RefObject<WebSocket | null>;
}) {
  if (!app.currentChannel)
    return (
      <div className="h-svh w-full max-h-svh flex flex-col pb-5 pl-5 gap-5" />
    );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const parentComm = useParentCommunication(iframeRef, {
    allowedOrigins: [new URL(app.currentChannel.kind).origin],
    communication: { debug: false },
  });

  useEffect(() => {
    parentComm.onMessage("GET_MESSAGES", () => {
      parentComm.sendToChild("MESSAGES", messages);
    });

    parentComm.onMessage("SEND_MESSAGE", (msg: string) => {
      serverRef.current?.send(
        JSON.stringify({
          type: "send_message",
          params: {
            channel_id: app.currentChannel?.id,
            contents: msg,
          },
        })
      );
    });
  }, [parentComm]);

  return (
    <iframe src={app.currentChannel.kind} className="w-full" ref={iframeRef} />
  );
}
