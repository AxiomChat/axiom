"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import loginServer from "@/actions/login-server";

type Feedback = { kind: "error" | "info"; message: string };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback>();

  const router = useRouter();

  const login = async () => {
    setFeedback(undefined);
    try {
      const res = await loginServer(email, password);

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
