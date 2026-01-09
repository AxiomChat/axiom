"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginUser } from "@/actions/user";
import Cookies from "js-cookie";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type Feedback = { kind: "error" | "info"; message: string };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback>();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter();

  const login = async () => {
    setFeedback(undefined);
    try {
      await loginUser(email, password);

      setFeedback({
        kind: "info",
        message: "Login successful! Redirecting...",
      });

      Cookies.set("servers", "");
      localStorage.clear();
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
          <div className="relative flex">
            <Input
              className="relative"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
              type={passwordVisible ? "text" : "password"}
            />
            <div className="absolute w-full h-full flex items-center justify-end pr-3 pointer-events-none">
              <div
                className="pointer-events-auto cursor-pointer hover:text-primary transition-colors duration-500"
                onClick={() => setPasswordVisible((prev) => !prev)}
              >
                {passwordVisible ? (
                  <EyeOffIcon className="w-4.5 left-full" />
                ) : (
                  <EyeIcon className="w-4.5 left-full" />
                )}
              </div>
            </div>
          </div>
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

        <Button className="mt-2 select-none" onClick={login}>
          Login
        </Button>
      </CardContent>
    </>
  );
}
