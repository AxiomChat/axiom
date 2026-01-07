import { ClientSettings } from "@/types/settings";
import Cookies from "js-cookie";

export const defaultSettings: ClientSettings = {
  theme: "dark",
};

export function parseClientSettings(s?: string): ClientSettings {
  let parsed: Partial<ClientSettings> = {};

  if (s) {
    try {
      parsed = JSON.parse(s);
    } catch {
      parsed = {};
    }
  }

  return {
    ...defaultSettings,
    ...parsed,
  };
}

export function getClientSettings(): ClientSettings {
  return parseClientSettings(Cookies.get("settings"));
}

export function setClientSettings(value?: ClientSettings) {
  Cookies.set("settings", JSON.stringify(value || defaultSettings));
}
