import { Dispatch, RefObject, SetStateAction } from "react";
import { StringMap } from "./typeUtils";
import { UserProfile } from "@/hooks/get-user";
import { Channel, Message, Server } from "./types";
import { ClientSettings } from "./settings";

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

  messages: Message[];
  addMessage: (v: Message) => void;
  deleteMessage: (id: number) => void;
  editMessage: (id: number, v: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: SetState<boolean>;

  getUserById: (userId: string) => Promise<UserProfile | null>;

  dms: UserProfile[];
  setDms: SetState<UserProfile[]>;

  currentChannel: Channel | null;
  setCurrentChannel: SetState<Channel | null>;
}
