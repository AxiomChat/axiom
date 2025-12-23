import App from "@/types/app";
import { useEffect, useRef, useState } from "react";
import useMessages from "./use-messages";
import { StringMap } from "@/types/typeUtils";
import useUser, { UserProfile } from "./get-user";
import { useClientSettings } from "./use-settings";
import { get, Response } from "@/lib/request";
import { Channel, Server } from "@/types/types";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { getProfileById } from "@/actions/get-profile";

export default function useApp(): App {
  const node = useRef<WebSocket | null>(null);
  const [profiles, setProfiles] = useState<StringMap<UserProfile | null>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = useUser();
  const [clientSettings, setClientSettings] = useClientSettings();
  const [dms, setDms] = useState<UserProfile[]>([]);
  const [servers, setServers] = useState<StringMap<Server>>({});
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [server, setServer] = useState<Server>();
  const privateMessages = useMessages();

  useEffect(() => {
    const stored = Cookies.get("servers");
    if (!stored) return;
    Promise.all(
      stored
        .split(",")
        .map((x) => x.trim())
        .filter((id) => id)
        .map((id) => get(`/api/server/${id}`))
    )
      .then((o) =>
        setServers(Object.fromEntries(o.map((i) => [i.data.id, i.data])))
      )
      .catch(toast.error);
  }, []);

  return {
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
