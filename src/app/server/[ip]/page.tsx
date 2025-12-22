"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import MessageBox from "@/components/channel/MessageBox";
import AppLayout from "@/components/app/AppLayout";
import { Server as ServerType } from "@/types/types";
import auth from "@/lib/auth";
import useMessages from "@/hooks/use-messages";
import useApp from "@/hooks/use-app";
import { useEffectOnceWhenReady } from "@/hooks/use-once";
import ChannelView from "@/components/channel/ChannelView";

export default function Server() {
  const { ip } = useParams<{ ip: string }>();
  const searchParams = useSearchParams();
  const serverRef = useRef<WebSocket | null>(null);
  const app = useApp();
  const messageStore = useMessages();

  useEffectOnceWhenReady(
    () => {
      if (!ip) return;
      auth({
        id: ip,
        wsRef: serverRef,
        setServer: app.setServer,
        messageStore: messageStore,
      });
    },
    [ip, messageStore.messages],
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
        messages={messageStore.messages.filter(
          (m) => m.channel_id === app.currentChannel?.id
        )}
        ip={ip}
        serverRef={serverRef}
      />
    </AppLayout>
  );
}
