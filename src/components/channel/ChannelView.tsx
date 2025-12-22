import { Channel, Message, Server } from "@/types/types";
import MessageBox from "./MessageBox";
import App from "@/types/app";
import React, { Ref, useEffect, useRef } from "react";
import PluginChannel from "./PluginChannel";

export default function ChannelView({
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
  switch (app.currentChannel.kind) {
    case "text":
      return (
        <MessageBox
          app={app}
          channelName={app.currentChannel.name}
          messages={messages}
          sendRequest={(req) => serverRef.current?.send(JSON.stringify(req))}
        />
      );

    case "voice":
      return null;

    default:
      return (
        <PluginChannel
          app={app}
          messages={messages}
          ip={ip}
          serverRef={serverRef}
        />
      );
  }
}
