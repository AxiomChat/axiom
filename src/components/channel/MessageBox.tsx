"use client";

import { Message } from "@/types/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import * as emoji from "emoji-picker-react";
import EmojiPicker from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronLeftIcon, SendIcon, SmilePlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { UserProfile } from "@/hooks/get-user";
import ProfilePicture from "../ProfilePicture";
import App, { SetState } from "@/types/app";
import { Textarea } from "../ui/textarea";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ClientMessage } from "@/types/protocol";
import { AnimatePresence, motion } from "framer-motion";

function MessageContainer({
  message,
  app,
  sendRequest,
}: {
  message: Message;
  app: App;
  sendRequest: (content: ClientMessage) => void;
}) {
  const [profile, setProfile] = useState<UserProfile | null>();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.contents);

  useEffect(() => {
    let mounted = true;

    app.getUserById(message.from).then((p) => {
      if (mounted) setProfile(p);
    });

    return () => {
      mounted = false;
    };
  }, [app, message.from]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex flex-col gap-3 rounded-lg p-4 hover:bg-accent">
          <div className="flex gap-2">
            {/* <div className="w-8 h-8 rounded-full bg-gray-400" /> */}
            <ProfilePicture
              url={profile?.avatar_url}
              name={profile?.display_name || message.from}
            />
            <div className="flex flex-col flex-1">
              <span className="font-bold flex gap-1 items-center select-none">
                {profile?.display_name || message.from}

                <p className="text-neutral-500 text-xs">
                  {isToday(message.timestamp * 1000)
                    ? format(message.timestamp * 1000, "p")
                    : isYesterday(message.timestamp * 1000)
                    ? "Yesterday, " + format(message.timestamp * 1000, "p")
                    : format(message.timestamp * 1000, "PP, p")}
                </p>
              </span>

              <div
                className="text-foreground/85 flex flex-col break-words whitespace-pre-wrap"
                onKeyDown={(e) => {
                  if (e.key === "Escape" && isEditing) {
                    setIsEditing(false);
                    setEditText(message.contents);
                  }
                }}
              >
                {isEditing ? (
                  <MessageInput
                    text={editText}
                    setText={setEditText}
                    onEnter={() => {
                      sendRequest({
                        type: "edit_message",
                        params: {
                          message_id: message.id,
                          new_contents: editText,
                        },
                      });

                      setIsEditing(false);
                    }}
                  />
                ) : (
                  message.contents.split("\n\n").map((line, index) => (
                    <div key={index} className="h-max break-words select-none">
                      {index > 0 && <br />}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-3xl font-bold my-2 break-words"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-2xl font-bold my-2 break-words"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-xl font-bold my-2 break-words"
                              {...props}
                            />
                          ),
                          h4: ({ node, ...props }) => (
                            <h4
                              className="text-lg font-bold my-2 break-words"
                              {...props}
                            />
                          ),
                          h5: ({ node, ...props }) => (
                            <h5
                              className="text-base font-bold my-2 break-words"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc list-inside my-2 break-words"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal list-inside my-2 break-words"
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className="text-accent-foreground underline underline-offset-2 break-all"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {line}
                      </ReactMarkdown>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem inset>Copy message</ContextMenuItem>
        <ContextMenuItem
          inset
          onClick={() => {
            setEditText(message.contents);
            setIsEditing(true);
          }}
          disabled={message.from !== app.profile?.id}
        >
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          inset
          variant="destructive"
          onClick={() => {
            sendRequest({
              type: "delete_message",
              params: {
                message_id: message.id,
              },
            });
          }}
          disabled={message.from !== app.profile?.id}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function MessageInput({
  text,
  setText,
  onEnter,
  onTyping,
}: {
  text: string;
  setText: SetState<string>;
  onEnter: () => void;
  onTyping?: () => void;
}) {
  const TYPING_INTERVAL = 2000;
  const inputRef = useRef<any>(null);
  const lastTypingSent = useRef(0);
  const stopTypingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    if (!onTyping || !text) return;

    const now = Date.now();

    if (now - lastTypingSent.current > TYPING_INTERVAL) {
      lastTypingSent.current = now;
      onTyping();
    }

    if (stopTypingTimeout.current) {
      clearTimeout(stopTypingTimeout.current);
    }

    stopTypingTimeout.current = setTimeout(() => {
      lastTypingSent.current = 0;
    }, TYPING_INTERVAL);
  }, [text]);

  return text.includes("\n") ? (
    <Textarea
      ref={inputRef}
      className="resize-none"
      placeholder="Type a message..."
      value={text}
      onChange={(e) => {
        if (!e.target.value.includes("\n") && text.includes("\n")) {
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = text.length + 1;
              inputRef.current.selectionEnd = text.length + 1;
              inputRef.current.focus();
            }
          }, 10);
        }

        setText(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!e.shiftKey) {
            e.preventDefault();
            onEnter();
          }
        }
      }}
    />
  ) : (
    <Input
      placeholder="Type a message..."
      ref={inputRef}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (e.shiftKey) {
            setText((p) => p + "\n");
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.selectionStart = text.length + 1;
                inputRef.current.selectionEnd = text.length + 1;
                inputRef.current.focus();
              }
            }, 10);
          } else {
            onEnter();
          }
        }
      }}
    />
  );
}

export default function MessageBox({
  app,
  sendRequest,
  channelName,
  channelIcon,
  messages,
}: {
  app: App;
  sendRequest: (req: ClientMessage) => void;
  channelName?: string;
  channelIcon?: string;
  messages: Message[];
}) {
  const [text, setText] = useState("");

  const ref = useRef<HTMLDivElement | null>(null);
  const chunkRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log("Element is in view!");
          if (!app.currentChannel) return;
          sendRequest({
            type: "load_chunk",
            params: {
              channel_id: app.currentChannel.id,
              chunk_id: chunkRef.current,
            },
          });
          chunkRef.current += 1;
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const sendMessage = () => {
    if (!app.currentChannel) {
      return;
    }

    sendRequest({
      type: "send_message",
      params: {
        channel_id: app.currentChannel?.id,
        contents: text.trim(),
      },
    });
    setText("");
  };

  return (
    <div className="h-svh w-full max-h-svh flex flex-col pb-5 pl-5 gap-5">
      {channelName && (
        <header className="h-12 py-4 flex items-center border-b text-sm font-semibold">
          <span
            onClick={() => app.setSidebarOpen(true)}
            className="cursor-pointer flex gap-2"
          >
            <ChevronLeftIcon className="w-5 h-5 my-auto md:hidden" />
            <span className="flex items-center gap-1.5">
              {channelIcon && (
                <ProfilePicture
                  name={channelName}
                  url={channelIcon}
                  className="size-7"
                />
              )}
              {channelName}
            </span>
          </span>
        </header>
      )}
      <div className="mt-auto flex flex-col-reverse overflow-y-scroll">
        <AnimatePresence>
          {messages.toReversed().map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                height: 0,
                margin: 0,
                padding: 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <MessageContainer
                message={msg}
                app={app}
                sendRequest={sendRequest}
              />
            </motion.div>
          ))}
          <div ref={ref} />
        </AnimatePresence>
      </div>
      <footer className="flex gap-3 pr-5 w-full h-max">
        <MessageInput
          text={text}
          setText={setText}
          onEnter={sendMessage}
          onTyping={() => {
            console.log("Typing..");
            if (!app.currentChannel) return;
            sendRequest({
              type: "typing",
              params: {
                channel_id: app.currentChannel.id,
              },
            });
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="hidden md:block">
              <SmilePlusIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="">
            <EmojiPicker
              onEmojiClick={(e) => setText(text + e.emoji)}
              theme={
                app.clientSettings.theme === "dark"
                  ? emoji.Theme.DARK
                  : emoji.Theme.LIGHT
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="secondary" onClick={sendMessage}>
          <SendIcon />
        </Button>
      </footer>
    </div>
  );
}
