"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { registerUser } from "@/actions/user";

export default function CreateAccount() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<
    undefined | { kind: "error" | "info"; message: string }
  >();
  const router = useRouter();

  const validateInput = ():
    | { kind: "error" | "info"; message: string }
    | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!emailRegex.test(email)) {
      return { kind: "error", message: "Invalid email format." };
    }
    if (!usernameRegex.test(username)) {
      return {
        kind: "error",
        message:
          "Username must be 3-20 characters and only letters, numbers, or underscores.",
      };
    }
    if (password.length < 6) {
      return {
        kind: "error",
        message: "Password must be at least 6 characters long.",
      };
    }
    if (password !== confirmPassword) {
      return { kind: "error", message: "Passwords do not match." };
    }
    if (!acceptTerms) {
      return {
        kind: "error",
        message: "You must accept the terms to sign up.",
      };
    }
    return;
  };

  const signup = async () => {
    setFeedback(undefined);
    const validationError = validateInput();
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser(username, email, password);

      if (response.email_sent) {
        toast.info(
          "We sent you a verification email. Please verify to continue."
        );
        setFeedback({
          message:
            "We sent you a verification email. Please verify to continue.",
          kind: "info",
        });
        Cookies.set("verify_temp_email", email);
        Cookies.set("verify_temp_password", password);
        router.push(`/verify`);
        Cookies.set("servers", "");
        localStorage.clear();
      } else {
        setFeedback({ message: response.message, kind: "error" });
      }
    } catch (err: any) {
      setFeedback({
        kind: "error",
        message:
          err.response?.data?.message ||
          "Signup failed. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-3xl mx-auto">Create an Account</CardTitle>
      </CardHeader>
      <CardContent className="gap-3 flex flex-col">
        <span>
          Email
          <Input
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            type="email"
          />
        </span>
        <span>
          Username
          <Input
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="john_doe"
          />
        </span>
        <span>
          Password
          <Input
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </span>
        <span>
          Confirm Password
          <Input
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") signup();
            }}
            type="password"
          />
        </span>

        <Label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          I agree to the{" "}
          <Link className="underline" href="/terms">
            terms & conditions
          </Link>
        </Label>

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

        <Button onClick={signup} disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
      </CardContent>
    </>
  );
}
