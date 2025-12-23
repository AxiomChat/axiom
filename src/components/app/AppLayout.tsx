"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import auth from "@/lib/auth";
import { useIsMobile } from "@/hooks/is-mobile";
import App from "@/types/app";
import { Message } from "@/types/types";

import SidebarServers from "./SidebarServers";
import SidebarDMs from "./SidebarDMs";
import SidebarChannels from "./SidebarChannels";
import DMItem from "./DMItem";
import { useEffectOnceWhenReady } from "@/hooks/use-once";

export default function AppLayout({
  children,
  chatWith,
  onNewMessage,
  app,
}: {
  onNewMessage?: (msg: Message) => void;
  chatWith?: string;
  children?: React.ReactNode;
  app: App;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffectOnceWhenReady(
    () => {
      if (!app.profile?.node_address) return;

      auth({
        id: app.profile.node_address,
        wsRef: app.node,
        onNewMessage: (m) => {
          if (m.from !== chatWith && m.from !== app.profile?.id)
            toast(
              `New message from ${
                app.profiles[m.from]?.display_name || m.from
              }`,
              {
                description: m.contents.slice(0, 80),
                action: {
                  label: "View",
                  onClick: () => router.push(`/chat/${m.from}`),
                },
                position: "top-right",
              }
            );

          if (onNewMessage) onNewMessage(m);
        },
        messageStore: app.privateMessages,
      });

      app.setProfiles((prev) => {
        if (app.profile) prev[app.profile.id] = app.profile;
        return prev;
      });
    },
    [chatWith, app.profile],
    [undefined, undefined]
  );

  return (
    <div className="flex h-svh md:h-screen">
      <div
        className={cn(
          "border-r transition-all duration-300 ease-in-out overflow-hidden flex",
          app.sidebarOpen && isMobile ? "w-5xl md:w-md" : "w-0 md:w-md"
        )}
      >
        <div className="flex-shrink-0">
          <SidebarServers app={app} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col bg-sidebar">
          <div className="flex-1 min-h-0">
            {app.server ? (
              <SidebarChannels app={app} />
            ) : (
              <SidebarDMs app={app} />
            )}
          </div>

          <footer className="mt-auto pb-3 px-3">
            <DMItem
              name={app.profile?.display_name || "Loading.."}
              id={app.profile?.id || "me"}
              avatar={app.profile?.avatar_url || ""}
              status="online"
              app={app}
              settings
            />
          </footer>
        </div>
      </div>

      {app.sidebarOpen && isMobile ? (
        <div
          className="w-full h-full overflow-x-hidden"
          onClick={() => app.setSidebarOpen(false)}
        >
          <div className="overflow-x-hidden min-w-screen flex-shrink-0">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
