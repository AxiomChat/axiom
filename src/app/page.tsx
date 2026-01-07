"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Shine from "./Shine";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold"
        >
          <Logo />
        </motion.div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => router.push("/auth?t=login")}>
            Login
          </Button>
          <Button onClick={() => router.push("/auth?t=create")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-4xl font-extrabold tracking-tight mb-6"
        >
          Your Conversations, Your Privacy, Your Community.
        </motion.h2>
        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          A modern chat app for teams, communities and friends. Stay connected
          with real-time messaging, secure channels, and seamless collaboration.
        </p>
        <div className="flex gap-3">
          <Button size="lg" onClick={() => router.push("/auth?t=create")}>
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/docs/introduction")}
          >
            Learn More
          </Button>
        </div>
      </main>

      {/* Features */}
      {/* <section className="grid md:grid-cols-3 gap-6 px-6 py-16 max-w-6xl mx-auto">
        <FeatureCard
          icon={<MessageCircle className="h-10 w-10 text-primary" />}
          title="Real-Time Chat"
          description="Experience instant messaging with our self-hostable node / server system."
        />
        <FeatureCard
          icon={<Users className="h-10 w-10 text-primary" />}
          title="Group Channels"
          description="Organize conversations into channels for projects, teams, or friends by hosting your own server with plugins."
        />
        <FeatureCard
          icon={<Shield className="h-10 w-10 text-primary" />}
          title="Secure & Private"
          description="Your messages are managed by your chosen node server, including your own self hosted node."
        />
      </section> */}

      {/* Showcase */}
      <motion.section
        className="w-full lg:w-6xl mx-auto px-8 pb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Shine />

        <img
          src="/ss.png"
          alt="Showcase"
          className="w-full mx-auto relative border border-accent rounded-lg"
        />
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Axiom. All rights reserved.
      </footer>
    </div>
  );
}
