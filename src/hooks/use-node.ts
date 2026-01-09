import { useEffect } from "react";
import { MessageStore } from "./use-messages";
import { NodeCallbacks, NodeClient } from "@/lib/node";

export default function useNode(
  nodeId: string,
  messageStore: MessageStore,
  callbacks: NodeCallbacks
) {
  useEffect(() => {
    const client = new NodeClient(nodeId, messageStore, callbacks);

    client.connect();

    return () => client.disconnect();
  }, [nodeId]);
}
