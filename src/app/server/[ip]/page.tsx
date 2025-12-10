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
  const [server, setServer] = useState<undefined | ServerType>();
  const app = useApp();
  const { messages, addMessage } = useServerMessages();

  useEffectOnceWhenReady(
    () => {
      if (!ip) return;
      const msgs = messages[ip];
      auth(
        ip,
        serverRef,
        setServer,
        (m) => addMessage(ip, m),
        () => {},
        msgs ? msgs[msgs.length - 1]?.id : undefined
      );
    },
    [ip, messages],
    [undefined, (v) => v]
  );

  useEffect(() => {
    const channelId = searchParams.get("ch");
    if (channelId) {
      app.setCurrentChannel(
        server?.channels.find((v) => v.id === channelId) ||
          server?.channels[0] ||
          null
      );
    } else {
      app.setCurrentChannel(server?.channels[0] || null);
    }
  }, [server]);

  return (
    <AppLayout app={app} server={server}>
      <ChannelView
        app={app}
        messages={messages}
        ip={ip}
        serverRef={serverRef}
      />
    </AppLayout>
  );
}
