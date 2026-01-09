"use client";

import MessageBox from "@/components/channel/MessageBox";
import AppLayout from "@/components/app/AppLayout";
import { useParams, useRouter } from "next/navigation";
import useApp from "@/hooks/use-app";
import { useEffect } from "react";
import useAsync from "@/hooks/use-async";
import { Button } from "@/components/ui/button";
import useIndicators from "@/hooks/use-indicators";
import { ClientMessage } from "@/types/protocol";
import { getNode, useNullNode } from "@/hooks/use-node";
import { useEffectOnceWhenReady } from "@/hooks/use-once";

export default function DMs() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const { value: target, loading } = useAsync(() => app.getUserById(id));
  const router = useRouter();
  const { indicators, addIndicator } = useIndicators();

  const sendRequest = async (req: ClientMessage) => {
    console.log("Sending request:", req);

    await targetNode.current?.waitUntilReady();
    await app.node.current?.waitUntilReady();

    switch (req.type) {
      case "send_message":
        targetNode.current?.socket?.send(JSON.stringify(req));
        if (target?.node_address !== app.profile?.node_address)
          app.node.current?.socket?.send(JSON.stringify(req));
        break;
      case "load_chunk":
        targetNode.current?.socket?.send(JSON.stringify(req));
        if (target?.node_address !== app.profile?.node_address)
          app.node.current?.socket?.send(JSON.stringify(req));
        break;
      default:
        app.node.current?.socket?.send(JSON.stringify(req));
        break;
    }
  };

  const targetNode = useNullNode();

  useEffectOnceWhenReady(
    () => {
      if (!target) return;

      return getNode(
        target?.node_address,
        app.privateMessages,
        {
          onIndicator: addIndicator,
          setServer: () => targetNode.current?.loadInitialMessages(id),
        },
        targetNode
      );
    },
    [target],
    [(v) => v]
  );

  useEffect(() => {
    app.setCurrentChannel({
      id: id,
      name: target?.display_name || id,
      kind: "text",
    });
  }, [targetNode]);

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
        sendRequest={sendRequest}
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
