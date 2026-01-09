"use client";

import ProfilePreview, { ProfileImage } from "@/components/ProfilePicture";
import SettingsDialog from "@/components/settings/SettingsDialog";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useApp from "@/hooks/use-app";
import { ProfileSettings } from "@/types/settings";
import { Server } from "@/types/types";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  TrendingUp,
  NetworkIcon,
  MessagesSquare,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import StartNewDM from "./StartNewDM";
import AsyncValue from "@/components/AsyncValue";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function ChatHub() {
  const router = useRouter();

  const app = useApp();
  const recentPeople = app.dms.slice(0, 3);
  const trendingServers: Server[] = [
    {
      id: "7de3138f-e0b6-4d96-8158-8c7e866ba0ff",
      name: "ORUS",
      icon_url: "https://github.com/orus-dev.png",
      channels: [],
    },
    {
      id: "cee6b20f-7e6a-4071-8df1-aab37f52bbb9",
      name: "Saturn Client",
      icon_url: "https://github.com/saturnclientmc.png",
      channels: [],
    },
    {
      id: "osui",
      name: "OSUI Rust Hub",
      icon_url: "https://github.com/osui-rs.png",
      channels: [],
    },
  ];
  const recentActivity = app.privateMessages.messages.slice(0, 3);

  return (
    <AppLayout app={app}>
      <div className="h-svh w-full max-h-svh flex flex-col py-6 px-5 md:px-10 gap-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-10"
        >
          {/* Greeting */}
          <div onClick={() => app.setSidebarOpen(true)}>
            <h1 className="text-3xl font-bold flex cursor-pointer gap-2">
              <ChevronLeft className="my-auto w-5 md:hidden" />
              Hey {app.profile?.display_name || "there"}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening in your network today.
            </p>
          </div>

          {/* Recent DMs + Active Servers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent DMs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recently chatted with
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentPeople.length ? (
                  recentPeople.map((dm) => (
                    <Link
                      href={`/chat/${dm.id}`}
                      key={dm.id}
                      className="flex justify-between items-center hover:bg-accent hover:text-accent-foreground rounded p-2 transition"
                    >
                      <span className="flex gap-2">
                        <ProfilePreview profile={dm} />
                        <span className="truncate my-auto">
                          {dm.display_name || dm.id}
                        </span>
                      </span>
                      <ChevronRight />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent DMs yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active Servers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Activity ⋅ 150 XP
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <div>
                  <span className="flex gap-1 items-center">
                    <p>ORUS community</p>
                    <Link href={"#"}>
                      <ExternalLink className="w-4 text-muted-foreground" />
                    </Link>
                  </span>
                  <div className="flex justify-between items-center">
                    <Progress value={(150 / 150) * 100} />
                    <span className="text-sm text-muted-foreground w-16 flex justify-end">
                      <p>150</p>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessagesSquare className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length ? (
                recentActivity.map((msg) => (
                  <AsyncValue
                    key={msg.id + msg.channel_id}
                    func={() => app.getUserById(msg.from)}
                    render={({ value: user }) => (
                      <Link
                        href={`/chat/${msg.from}`}
                        className="flex items-center justify-between hover:bg-accent rounded p-2 transition"
                      >
                        <div className="flex items-center gap-3">
                          <ProfilePreview profile={user || undefined} />
                          <div>
                            <p className="font-medium">
                              {user?.display_name || ""}
                            </p>
                            <p className="text-sm text-muted-foreground truncate w-[200px]">
                              {msg.contents}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="opacity-70 w-4 h-4" />
                      </Link>
                    )}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent messages yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Server Discovery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingServers.map((srv) => (
                  <motion.div
                    key={srv.id}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className="hover:bg-accent transition"
                      onClick={async () => {
                        try {
                          Cookies.set(
                            "servers",
                            Object.keys({
                              ...app.servers,
                              [srv.id]: srv,
                            }).join(",")
                          );

                          app.setServers((prev) => ({
                            ...prev,
                            [srv.id]: srv,
                          }));
                          router.push(`/server/${srv.id}`);
                        } catch (e: any) {
                          toast.error(e);
                        }
                      }}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <ProfileImage name={srv.name} url={srv.icon_url} />
                        <h3 className="font-medium truncate">{srv.name}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Quick Actions */}
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-wrap gap-3">
              <StartNewDM />
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Create Server
              </Button>
              <SettingsDialog profile={app.profile as ProfileSettings}>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </SettingsDialog>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
