"use client";

import App from "@/types/app";
import { ClientMessage, IndicatorContext } from "@/types/protocol";
import { Message } from "@/types/types";
import { useEffect, useState } from "react";
import { startMic } from "@/lib/audio";
import { Button } from "../ui/button";
import {
  ChevronLeftIcon,
  PhoneCall,
  PhoneOff,
  Volume2Icon,
} from "lucide-react";

export default function VoiceBox({
  sendVoice,
  app,
  channelName,
}: {
  app: App;
  sendRequest: (req: ClientMessage) => void;
  channelName?: string;
  messages: Message[];
  indicators: IndicatorContext[];
  sendVoice: (data: Int16Array) => void;
}) {
  const [voiceConn, setVoiceConn] = useState(false);

  useEffect(() => {
    if (!voiceConn) return;

    const stop = startMic(sendVoice);

    return () => {
      stop.then((s) => s());
    };
  }, [voiceConn]);

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
      {voiceConn ? (
        <div className="h-full w-full">
          <footer className="mt-auto h-max">
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/20 hover:text-destructive"
              onClick={() => setVoiceConn(false)}
            >
              <PhoneOff />
            </Button>
          </footer>
        </div>
      ) : (
        <Button
          className="w-max mx-auto my-auto h-max bg-transparent text-chart-2 border border-chart-2 hover:bg-chart-2/20"
          onClick={() => setVoiceConn(true)}
        >
          Join <PhoneCall />
        </Button>
      )}
    </div>
  );
}
