import App from "@/types/app";
import { useEffect, useRef, useState } from "react";
import useMessages from "./use-messages";
import { StringMap } from "@/types/typeUtils";
import useUser, { UserProfile } from "./get-user";
import { useClientSettings } from "./use-settings";
import { Channel, Server } from "@/types/types";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { getProfileById } from "@/actions/get-profile";
import { getServerById } from "@/actions/get-server";
import { NodeClient } from "@/lib/node";

export default function useApp(): App {
  const node = useRef<NodeClient | null>(null);
  const [profiles, setProfiles] = useState<StringMap<UserProfile | null>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = useUser();
  const [clientSettings, setClientSettings] = useClientSettings();
  const [dms, setDms] = useState<UserProfile[]>([]);
  const [servers, setServers] = useState<StringMap<Server>>({});
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [server, setServer] = useState<Server>();
  const privateMessages = useMessages();
  const [voiceConns, setVoiceConns] = useState<
    Record<string, Record<string, number>>
  >({});

  const [speaking, setSpeaking] = useState<Record<number, number>>({});
  const [pmsLoaded, setPmsLoaded] = useState(false);

  useEffect(() => {
    const stored = Cookies.get("servers");
    if (!stored) return;
    Promise.all(
      stored
        .split(",")
        .map((x) => x.trim())
        .filter((id) => id)
        .map((id) => getServerById(id))
    )
      .then((o) => setServers(Object.fromEntries(o.map((i) => [i.id, i]))))
      .catch(toast.error);
  }, []);

  useEffect(() => {
    const json = localStorage.getItem("privateMessages");
    if (json) {
      privateMessages.setMessages(JSON.parse(json));
    }
    setPmsLoaded(true);
  }, []);

  useEffect(() => {
    if (!pmsLoaded) return;
    localStorage.setItem(
      "privateMessages",
      JSON.stringify(privateMessages.messages)
    );
  }, [privateMessages.messages, pmsLoaded]);

  return {
    speaking,
    setSpeaking,
    voiceConns,
    setVoiceConns,
    privateMessages,
    currentChannel,
    setCurrentChannel,
    server,
    setServer,
    servers,
    setServers,
    dms,
    setDms,
    node,
    clientSettings,
    setClientSettings,
    profile,
    profiles,
    setProfiles,
    sidebarOpen,
    setSidebarOpen,
    getUserById: async (id: string) => {
      if (profiles[id] !== undefined) return profiles[id];

      try {
        const user = await getProfileById(id);
        setProfiles((prev) => {
          prev[id] = user;
          return prev;
        });
        return user;
      } catch {
        return null;
      }
    },
  };
}
