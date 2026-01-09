"use client";

import { Input } from "../ui/input";
import { Search, Plus } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import DMItem from "./DMItem";
import App from "@/types/app";
import { UserProfile } from "@/hooks/get-user";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProfileByUsername } from "@/actions/get-profile";

export default function SidebarDMs({ app }: { app: App }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dms, setDms] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!app.profile) return;

    const load = async () => {
      const users = (
        await Promise.all(
          [
            ...new Set(
              app.privateMessages.messages
                .sort((a, b) => a.timestamp - b.timestamp)
                .flatMap((m) => [m.from, m.channel_id])
                .filter((id) => id !== app.profile?.id)
            ),
          ].map((id) => app.getUserById(id))
        )
      ).filter((v) => !!v);

      app.setDms(users);

      setDms(
        users.filter(
          (user) =>
            user?.username.toLowerCase().includes(query.toLowerCase()) ||
            user?.display_name.toLowerCase().includes(query.toLowerCase())
        )
      );
    };
    load();
  }, [query, app.privateMessages.messages, app.profile]);

  return (
    <div className="w-full flex flex-col bg-sidebar">
      <div className="p-3 border-b flex items-center">
        <div className="relative w-full">
          <Input
            placeholder="Find or start a conversation"
            className="pr-8 h-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 flex flex-col gap-2">
          {dms.map((user) => (
            <DMItem
              key={user.id}
              profile={user}
              id={user.id}
              status="online"
              app={app}
            />
          ))}

          {dms.length === 0 && query.trim() !== "" && (
            <div className="px-3 py-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sm truncate"
                onClick={async () => {
                  const user = await getProfileByUsername(query);
                  if (!user) {
                    toast.error("User not found");
                    return;
                  }

                  router.push(`/chat/${user.id}`);
                  setQuery("");
                }}
              >
                <Plus className="h-4 w-4" />
                Start new DM with “{query}”
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
