"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<
    undefined | { kind: "error" | "info"; message: string }
  >();

  const router = useRouter();

  const login = async () => {
    localStorage.removeItem("chat-messages");
    localStorage.removeItem("server-messages");
    setFeedback(undefined);
    try {
      const res = await axios.get("/api/user", {
        params: { email, password },
      });

      Cookies.set("token", (res.data as any).token);
      Cookies.set("refresh_token", (res.data as any).refresh_token);
      setFeedback({
        kind: "info",
        message: "Login successful! Redirecting...",
      });

      router.push("/chat");
    } catch (err: any) {
      setFeedback({
        kind: "error",
        message:
          err.response?.data?.message || "Login failed. Please try again.",
      });
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-3xl mx-auto">Login</CardTitle>
      </CardHeader>
      <CardContent className="gap-3 flex flex-col">
        <span>
          Email
          <Input
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </span>
        <span>
          Password
          <Input
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") login();
            }}
            type="password"
          />
        </span>

        {feedback && (
          <div
            className={`text-sm rounded-md p-2 ${
              feedback.kind === "error"
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <Button className="mt-2" onClick={login}>
          Login
        </Button>
      </CardContent>
    </>
  );
}
