"use client";

import App from "@/types/app";
import { ClientMessage, IndicatorContext } from "@/types/protocol";
import { Message } from "@/types/types";
import { useEffect, useState } from "react";
import { startMic } from "@/lib/audio";

export default function VoiceBox({
  sendVoice,
}: {
  app: App;
  sendRequest: (req: ClientMessage) => void;
  channelName?: string;
  channelIcon?: string;
  messages: Message[];
  indicators: IndicatorContext[];
  sendVoice: (data: Int16Array) => void;
}) {
  useEffect(() => {
    const stop = startMic(sendVoice);

    return () => {
      stop.then((s) => s());
    };
  }, []);

  return (
    <div className="h-svh w-full max-h-svh flex flex-col pb-5 pl-5 gap-5" />
  );
}
