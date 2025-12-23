"use client";

import MessageBox from "@/components/channel/MessageBox";
import AppLayout from "@/components/app/AppLayout";
import { useParams, useRouter } from "next/navigation";
import useApp from "@/hooks/use-app";
import { useEffect, useRef, useState } from "react";
import auth from "@/lib/auth";
import useAsync from "@/hooks/use-async";
import { Button } from "@/components/ui/button";
import useIndicators from "@/hooks/use-indicators";

export default function DMs() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const targetNode = useRef<WebSocket | null>(null);
  const { value: target, loading } = useAsync(() => app.getUserById(id));
  const router = useRouter();
  const { indicators, addIndicator } = useIndicators();

  useEffect(() => {
    async function connectTargetNode() {
      if (!target) return;
      auth({
        id: target.node_address,
        wsRef: targetNode,
        messageStore: app.privateMessages,
        onIndicator: addIndicator,
      });
    }

    connectTargetNode();

    app.setCurrentChannel({
      id: id,
      name: target?.display_name || id,
      kind: "text",
    });
  }, [target]);

  return loading || target ? (
    <AppLayout app={app}>
      <MessageBox
        app={app}
        channelName={target?.display_name || id}
        channelIcon={target?.avatar_url || "_"}
        messages={app.privateMessages.messages.filter(
          (m) =>
            (m.channel_id === id && m.from === app.profile?.id) ||
            (m.from === id && m.channel_id === app.profile?.id)
        )}
        sendRequest={(req) => {
          console.log("Sending request: ", req);
          while (
            targetNode.current?.CONNECTING ||
            app.node.current?.CONNECTING
          ) {}
          switch (req.type) {
            case "send_message":
              targetNode.current?.send(JSON.stringify(req));
              break;
            case "load_chunk":
              targetNode.current?.send(JSON.stringify(req));
              app.node.current?.send(JSON.stringify(req));
              break;
            default:
              app.node.current?.send(JSON.stringify(req));
              break;
          }
        }}
        indicators={indicators.filter(
          (indicator) => indicator.indicator.params.user_id !== app.profile?.id
        )}
      />
    </AppLayout>
  ) : (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-9xl font-extrabold text-gray-500 tracking-widest">
        404
      </h1>
      <div className="border border-border text-white px-2 text-sm rounded rotate-12 absolute backdrop-blur-sm">
        User Not Found
      </div>
      <p className="mt-5 text-gray-600">
        Sorry, we couldn't find the user you're looking for.
      </p>
      <Button className="mt-4" onClick={() => router.push("/chat")}>
        Go home
      </Button>
    </div>
  );
}
