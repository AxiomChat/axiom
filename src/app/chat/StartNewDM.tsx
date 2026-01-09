"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { UserProfile } from "@/hooks/get-user";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getProfileByUsername } from "@/actions/get-profile";
import { toast } from "sonner";

export default function StartNewDM() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleStartDM = async () => {
    const user = await getProfileByUsername(username);
    if (!user) {
      toast.error("User not found");
      return;
    }

    router.push(`/chat/${user.id}`);
    setUsername("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Start New DM
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-3 space-y-2">
        <Input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
        />

        <Button onClick={handleStartDM} className="w-full">
          Start
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
