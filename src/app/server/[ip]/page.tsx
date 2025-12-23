"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AppLayout from "@/components/app/AppLayout";
import auth from "@/lib/auth";
import useMessages from "@/hooks/use-messages";
import useApp from "@/hooks/use-app";
import { useEffectOnceWhenReady } from "@/hooks/use-once";
import ChannelView from "@/components/channel/ChannelView";
import { IndicatorContext } from "@/types/protocol";

export default function Server() {
  const { ip } = useParams<{ ip: string }>();
  const searchParams = useSearchParams();
  const serverRef = useRef<WebSocket | null>(null);
  const app = useApp();
  const messageStore = useMessages();
  const [indicators, setIndicators] = useState<IndicatorContext[]>([]);

  useEffectOnceWhenReady(
    () => {
      if (!ip) return;
      auth({
        id: ip,
        wsRef: serverRef,
        setServer: app.setServer,
        messageStore: messageStore,
        onIndicator: (i) => {
          setIndicators((prev) => {
            const combined = [...prev, { ...i }];
            const uniqueByUser = combined.reduce<Record<string, typeof i>>(
              (acc, curr) => {
                const userId = curr.indicator.params.user_id;
                if (!acc[userId] || curr.expires > acc[userId].expires) {
                  acc[userId] = curr;
                }
                return acc;
              },
              {}
            );

            return Object.values(uniqueByUser);
          });
        },
      });
    },
    [ip, messageStore.messages],
    [undefined, (v) => v]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndicators((prev) =>
        prev
          .map((item) => ({
            ...item,
            expires: item.expires - 1,
          }))
          .filter((item) => item.expires > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
        indicators={indicators}
      />
    </AppLayout>
  );
}
