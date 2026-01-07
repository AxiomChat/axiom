"use client";

import App from "@/types/app";
import { ClientMessage, IndicatorContext } from "@/types/protocol";
import { Message } from "@/types/types";
import { useEffect, useState } from "react";
import { rms, startMic } from "@/lib/audio";
import { Button } from "../../ui/button";
import { ChevronLeftIcon, Phone, Volume2Icon } from "lucide-react";
import VoiceGrid from "./VoiceGrid";

export default function VoiceBox({
  sendVoice,
  app,
  channelName,
  sendRequest,
  channelId,
}: {
  channelName?: string;
  app: App;
  sendRequest: (req: ClientMessage) => void;
  channelId: string;
  messages: Message[];
  indicators: IndicatorContext[];
  sendVoice: (data: Int16Array) => void;
}) {
  const [voiceConn, setVoiceConn] = useState(false);

  useEffect(() => {
    if (!voiceConn) return;
    if (!app.profile) return;

    const stop = startMic((data) => {
      if (rms(data) > 0.005) {
        sendVoice(data);

        if (!app.profile) return;

        const voiceId = app.voiceConns[channelId]?.[app.profile.id];
        if (!voiceId) return;

        app.setSpeaking((prev) => ({
          ...prev,
          [voiceId]: Date.now(),
        }));
      }
    });

    return () => {
      stop.then((s) => s());
    };
  }, [voiceConn, channelId, app.profile?.id, app.voiceConns]);

  useEffect(() => {
    const inv = setInterval(() => {
      const now = Date.now();
      const TIMEOUT = 800;

      app.setSpeaking((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([_, ts]) => now - ts < TIMEOUT)
        )
      );
    }, 200);

    return () => clearInterval(inv);
  }, []);

  return (
    <div className="h-svh w-full max-h-svh flex flex-col pb-5 pl-5 pr-5 gap-5">
      {channelName && (
        <header className="h-12 py-4 flex items-center border-b text-sm font-semibold w-full">
          <span
            onClick={() => app.setSidebarOpen(true)}
            className="cursor-pointer flex gap-2"
          >
            <ChevronLeftIcon className="w-5 h-5 my-auto md:hidden" />
            <Volume2Icon className="w-4 h-4 my-auto" />
            {channelName}
          </span>
        </header>
      )}
      {app.voiceConns[channelId] && (
        <VoiceGrid
          users={Object.entries(app.voiceConns[channelId]).map(
            ([userId, voiceId]) => ({
              id: userId,
              speaking: Boolean(app.speaking[voiceId]),
            })
          )}
          app={app}
        />
      )}
      <footer className="mt-auto h-max w-max mx-auto">
        {voiceConn ? (
          <Button
            className="mx-auto my-auto h-max bg-transparent text-destructive border border-destructive hover:bg-destructive/20 rounded-full aspect-square w-12"
            onClick={() => {
              setVoiceConn(false);
              sendRequest({
                type: "leave_voice",
                params: { channel_id: channelId },
              });
            }}
          >
            <Phone className="rotate-135" />
          </Button>
        ) : (
          <Button
            className="mx-auto my-auto h-max bg-transparent text-chart-2 border border-chart-2 hover:bg-chart-2/20 rounded-full aspect-square w-12"
            onClick={() => {
              setVoiceConn(true);
              sendRequest({
                type: "join_voice",
                params: { channel_id: channelId },
              });
            }}
          >
            <Phone />
          </Button>
        )}
      </footer>
    </div>
  );
}
