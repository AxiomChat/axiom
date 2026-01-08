"use client";

import Link from "next/link";
import ProfilePreview from "../ProfilePicture";
import SettingsDialog from "../settings/SettingsDialog";
import App from "@/types/app";
import { ProfileSettings } from "@/types/settings";
import { UserProfile } from "@/hooks/get-user";

export default function DMItem({
  status,
  settings,
  app,
  profile,
  id,
}: {
  profile?: UserProfile | null;
  settings?: boolean;
  id: string;
  status: string;
  app: App;
}) {
  return (
    <Link
      href={settings ? "" : `/chat/${id}`}
      className="p-2 flex items-center gap-2 cursor-pointer hover:bg-accent rounded-md"
    >
      {profile && (
        <>
          <ProfilePreview profile={profile} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{profile.display_name}</span>
            <span className="text-xs text-muted-foreground">{status}</span>
          </div>
        </>
      )}
      {settings && (
        <SettingsDialog
          className="ml-auto w-7 h-7 p-0 flex items-center justify-center"
          tab="profile"
          profile={app.profile as ProfileSettings}
        />
      )}
    </Link>
  );
}
