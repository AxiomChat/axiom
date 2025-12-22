"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import MessageBox from "@/components/channel/MessageBox";
import AppLayout from "@/components/app/AppLayout";
import { Server as ServerType } from "@/types/types";
import auth from "@/lib/auth";
import { useServerMessages } from "@/hooks/use-messages";
import useApp from "@/hooks/use-app";
import { useEffectOnceWhenReady } from "@/hooks/use-once";
import ChannelView from "@/components/channel/ChannelView";

export default function Server() {
  const { ip } = useParams<{ ip: string }>();
  const searchParams = useSearchParams();
  const serverRef = useRef<WebSocket | null>(null);
  const app = useApp();
  const { messages, addMessage, editMessage, deleteMessage } =
    useServerMessages();

  useEffectOnceWhenReady(
    () => {
      if (!ip) return;
      const msgs = messages[ip];
      auth({
        id: ip,
        wsRef: serverRef,
        setServer: app.setServer,
        lastMessage: msgs ? msgs[msgs.length - 1]?.id : undefined,

        addMessage: (m) => addMessage(ip, m),
        editMessage: (msg_id, contents) => editMessage(ip, msg_id, contents),
        deleteMessage: (msg_id) => deleteMessage(ip, msg_id),
      });
    },
    [ip, messages],
    [undefined, (v) => v]
  );

  useEffect(() => {
    const channelId = searchParams.get("ch");
    if (channelId) {
      app.setCurrentChannel(
        app.server?.channels.find((v) => v.id === channelId) ||
          app.server?.channels[0] ||
          null
      );
    } else {
      app.setCurrentChannel(app.server?.channels[0] || null);
    }
  }, [app.server]);

  return (
    <AppLayout app={app}>
      <ChannelView
        app={app}
        messages={messages}
        ip={ip}
        serverRef={serverRef}
      />
    </AppLayout>
  );
}
