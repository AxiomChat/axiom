import { Dispatch, RefObject, SetStateAction } from "react";
import { StringMap } from "./typeUtils";
import { UserProfile } from "@/hooks/get-user";
import { Channel, Message, Server } from "./types";
import { ClientSettings } from "./settings";
import { MessageStore } from "@/hooks/use-messages";

export type SetState<T> = Dispatch<SetStateAction<T>>;

export default interface App {
  node: RefObject<WebSocket | null>;
  profile: UserProfile | null;

  server: Server | undefined;
  setServer: SetState<Server | undefined>;

  clientSettings: ClientSettings;
  setClientSettings: SetState<ClientSettings>;

  servers: StringMap<Server>;
  setServers: SetState<StringMap<Server>>;

  profiles: StringMap<UserProfile | null>;
  setProfiles: SetState<StringMap<UserProfile | null>>;

  privateMessages: MessageStore;

  sidebarOpen: boolean;
  setSidebarOpen: SetState<boolean>;

  getUserById: (userId: string) => Promise<UserProfile | null>;

  dms: UserProfile[];
  setDms: SetState<UserProfile[]>;

  currentChannel: Channel | null;
  setCurrentChannel: SetState<Channel | null>;

  voiceConns: Record<string, Record<string, number>>;
  setVoiceConns: SetState<Record<string, Record<string, number>>>;

  speaking: Record<number, number>;
  setSpeaking: SetState<Record<number, number>>;
}
