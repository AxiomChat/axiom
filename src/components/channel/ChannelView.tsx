import { Message } from "@/types/types";
import MessageBox from "./MessageBox";
import App from "@/types/app";
import React, { RefObject } from "react";
import PluginChannel from "./PluginChannel";
import { ClientMessage, IndicatorContext } from "@/types/protocol";
import VoiceBox from "./voice/VoiceBox";
import { sendVoice } from "@/lib/audio";
import { NodeClient } from "@/lib/node";

export default function ChannelView({
  app,
  messages,
  ip,
  node,
  indicators,
}: {
  app: App;
  messages: Message[];
  ip: string;
  indicators: IndicatorContext[];
  node: RefObject<NodeClient | null>;
}) {
  if (!app.currentChannel)
    return (
      <div className="h-svh w-full max-h-svh flex flex-col pb-5 pl-5 gap-5" />
    );

  const sendRequest = async (req: ClientMessage) => {
    await node.current?.waitUntilReady();
    node.current?.socket?.send(JSON.stringify(req));
    console.log(node.current?.socket);
  };

  switch (app.currentChannel.kind) {
    case "text":
      return (
        <MessageBox
          app={app}
          channelName={app.currentChannel.name}
          messages={messages}
          sendRequest={sendRequest}
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
          channelId={app.currentChannel.id}
          messages={messages}
          sendRequest={sendRequest}
          sendVoice={(data) => {
            if (!node.current?.socket) {
              return;
            }

            sendVoice(node.current?.socket, data);
          }}
          indicators={indicators.filter(
            (indicator) =>
              indicator.indicator.params.user_id !== app.profile?.id
          )}
        />
      );

    default:
      return (
        <PluginChannel app={app} messages={messages} ip={ip} node={node} />
      );
  }
}
