import App from "@/types/app";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "./use-messages";
import { StringMap } from "@/types/typeUtils";
import useUser, { UserProfile } from "./get-user";
import { useClientSettings } from "./use-settings";
import { get, Response } from "@/lib/request";
import { Channel, Server } from "@/types/types";
import Cookies from "js-cookie";
import { toast } from "sonner";

export default function useApp(): App {
  const node = useRef<WebSocket | null>(null);
  const [profiles, setProfiles] = useState<StringMap<UserProfile | null>>({});
  const { messages, addMessage, deleteMessage, editMessage } = useMessages();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = useUser();
  const [clientSettings, setClientSettings] = useClientSettings();
  const [dms, setDms] = useState<UserProfile[]>([]);
  const [servers, setServers] = useState<StringMap<Server>>({});
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [server, setServer] = useState<Server>();

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
    editMessage,
    deleteMessage,
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
    messages,
    addMessage,
    sidebarOpen,
    setSidebarOpen,
    getUserById: async (id: string) => {
      if (profiles[id] !== undefined) return profiles[id];

      const onResponse = (res: Response<UserProfile>) => {
        setProfiles((prev) => {
          console.log("test");
          prev[id] = res.data as UserProfile;
          return prev;
        });
      };

      try {
        const user = await get(`/api/profile/?id=${id}`, onResponse);
        onResponse(user);
        return user.data;
      } catch {
        return null;
      }
    },
  };
}
