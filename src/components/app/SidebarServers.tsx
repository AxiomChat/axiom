"use client";

import { Plus, MessageCircle } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useState } from "react";
import App from "@/types/app";
import ProfilePicture from "../ProfilePicture";
import SettingsDialog from "../settings/SettingsDialog";
import { useRouter } from "next/navigation";
import { getServerById } from "@/actions/get-server";

export default function SidebarServers({ app }: { app: App }) {
  const [newServer, setNewServer] = useState("");
  const router = useRouter();

  const handleAddServer = async () => {
    if (!newServer || Object.hasOwn(app.servers, newServer)) return;
    try {
      const server = await getServerById(newServer);
      app.setServers((prev) => ({ ...prev, [server.id]: server }));
      Cookies.set("servers", Object.keys(app.servers).join(","));
      setNewServer("");
    } catch (e: any) {
      toast.error(e);
    }
  };

  return (
    <div className="w-16 flex flex-col items-center gap-4 py-4 border-r h-full overflow-y-scroll no-scrollbar">
      <Button
        onClick={() => router.push(`/chat`)}
        className="bg-transparent text-foreground"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {Object.values(app.servers).map(
        (srv, i) =>
          srv && (
            <Link href={`/server/${srv.id}`} key={i}>
              <ProfilePicture name={srv.name} url={srv.icon_url} />
            </Link>
          )
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a server</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <Label htmlFor="server-id">Server ID</Label>
            <Input
              id="server-id"
              value={newServer}
              onChange={(e) => setNewServer(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleAddServer}>Join server</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="mt-auto">
        <SettingsDialog profile={app.profile!} />
      </footer>
    </div>
  );
}
