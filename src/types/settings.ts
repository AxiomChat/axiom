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
    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  ),
};
