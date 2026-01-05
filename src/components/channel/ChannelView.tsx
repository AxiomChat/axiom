import { Message } from "@/types/types";
import MessageBox from "./MessageBox";
import App from "@/types/app";
import React from "react";
import PluginChannel from "./PluginChannel";
import { IndicatorContext } from "@/types/protocol";
import VoiceBox from "./VoiceBox";
import { sendVoice } from "@/lib/audio";

export default function ChannelView({
  app,
  messages,
  ip,
  serverRef,
  indicators,
}: {
  app: App;
  messages: Message[];
  ip: string;
  serverRef: React.RefObject<WebSocket | null>;
  indicators: IndicatorContext[];
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
          sendRequest={(req) => {
            while (serverRef.current?.CONNECTING) {}
            serverRef.current?.send(JSON.stringify(req));
          }}
          indicators={indicators.filter(
            (indicator) =>
              indicator.indicator.params.user_id !== app.profile?.id
          )}
        />
      );

    case "voice":
      return (
        <VoiceBox
          app={app}
          channelName={app.currentChannel.name}
          messages={messages}
          sendRequest={(req) => {
            while (serverRef.current?.CONNECTING) {}
            serverRef.current?.send(JSON.stringify(req));
          }}
          sendVoice={(data) => {
            while (!serverRef.current || serverRef.current?.CONNECTING) {}
            sendVoice(serverRef.current, 0, data);
          }}
          indicators={indicators.filter(
            (indicator) =>
              indicator.indicator.params.user_id !== app.profile?.id
          )}
        />
      );

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
