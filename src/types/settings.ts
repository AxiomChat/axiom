import {
  RegexSetting,
  SettingsSchema,
} from "@/components/settings/SettingSchema";

export interface ClientSettings {
  theme: "light" | "dark" | "black";
}

export interface ProfileSettings {
  username: string;
  display_name: string;
  avatar_url: string;
  node_address: string;
}

export const CLIENT_SCHEMA: SettingsSchema = {
  theme: ["light", "dark", "black"],
};

export const PROFILE_SCHEMA: SettingsSchema = {
  username: "string",
  display_name: "string",
  avatar_url: "string",
  node_address: new RegexSetting(
    "node2.axiom.org",
    /^(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})$/
  ),
};
