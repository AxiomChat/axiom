"use client";

import { ProfileSettings } from "@/types/settings";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/request";
import { toast } from "sonner";
import axios from "axios";
import getSession from "@/actions/get-session";
import { getProfileById } from "@/actions/get-profile";

export interface UserProfile extends ProfileSettings {
  id: string;
}

export default function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const user_id = await getSession();
        if (!user_id) {
          throw new Error("Session user id is not valid");
        }

        setUser(await getProfileById(user_id));
      } catch (e: any) {
        router.push("/auth?t=login");
        toast.error(`Error: ${e}`);
      }
    }

    fetchUser();
  }, []);

  return user;
}
