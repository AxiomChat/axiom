"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AppLayout from "@/components/app/AppLayout";
import useMessages from "@/hooks/use-messages";
import useApp from "@/hooks/use-app";
import ChannelView from "@/components/channel/ChannelView";
import useIndicators from "@/hooks/use-indicators";
import useNode from "@/hooks/use-node";

export default function Server() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const app = useApp();
  const messageStore = useMessages();
  const { indicators, addIndicator } = useIndicators();

  const serverNode = useNode(id, messageStore, {
    setServer: app.setServer,
    onIndicator: addIndicator,
    onVoiceJoin: (userId, channelId, voiceId) =>
      app.setVoiceConns((prev) => ({
        ...prev,
        [channelId]: { ...prev[channelId], [userId]: voiceId },
      })),
    onVoiceLeave: (userId, channelId) =>
      app.setVoiceConns((prev) => {
        const { [userId]: _, ...remainingUsers } = prev[channelId] || {};
        return {
          ...prev,
          [channelId]: remainingUsers,
        };
      }),
    onSpeaking: (voiceId) =>
      app.setSpeaking((speaking) => ({
        ...speaking,
        [voiceId]: Date.now(),
      })),
  });

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
        node={serverNode}
        messages={messageStore.messages.filter(
          (m) => m.channel_id === app.currentChannel?.id
        )}
        ip={id}
        indicators={indicators}
      />
    </AppLayout>
  );
}
