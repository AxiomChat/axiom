import { RefObject, useEffect, useRef } from "react";
import { MessageStore } from "./use-messages";
import { NodeCallbacks, NodeClient } from "@/lib/node";
import { asyncWrapProviders } from "async_hooks";

export default function useNode(
  nodeId: string,
  messageStore: MessageStore,
  callbacks: NodeCallbacks
) {
  const wsClientRef = useRef<NodeClient | null>(null);
  useEffect(() => getNode(nodeId, messageStore, callbacks, wsClientRef), []);
  return wsClientRef;
}

export function useDynNode(
  nodeId: string | undefined | null,
  messageStore: MessageStore,
  callbacks: NodeCallbacks
) {
  const wsClientRef = useRef<NodeClient | null>(null);

  useEffect(() => {
    if (!nodeId) return;
    return getNode(nodeId, messageStore, callbacks, wsClientRef);
  }, [nodeId]);

  return wsClientRef;
}

export function getNode(
  nodeId: string,
  messageStore: MessageStore,
  callbacks: NodeCallbacks,
  ref: RefObject<NodeClient | null>
) {
  const client = new NodeClient(nodeId, messageStore, callbacks);

  ref.current = client;
  client.connect();

  return () => client.disconnect();
}

export function useNullNode() {
  return useRef<NodeClient | null>(null);
}
