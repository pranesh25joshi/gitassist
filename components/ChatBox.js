"use client";

import { useChat } from "@ai-sdk/react";
import useChatStore from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { GitHubLogoIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const { username, setLoading } = useChatStore();
  const messagesEndRef = useRef(null);

  // Use the AI SDK's useChat hook for message management
  const {
    messages: aiMessages,
    append,
    isLoading,
    error,
  } = useChat({
    id: "github-gemini-chat",
    initialMessages: [],
    body: {
      username, // Send username with every request
    },
    onFinish: () => {
      setLoading(false);
    },
    onError: (err) => {
      console.error("🚨 Chat Error:", err);
      setLoading(false);
    },
  });

  // Update loading state to match AI SDK's isLoading
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !username) return;

    setLoading(true);

    try {
      await append({
        role: "user",
        content: input,
        data: { username }, // Include username in the message data
      });

      setInput(""); // Clear input after sending
    } catch (err) {
      console.error("🚨 Send Error:", err);
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader className="px-4 py-3 border-b shrink-0">
        <CardTitle className="flex items-center text-lg font-medium">
          <GitHubLogoIcon className="w-5 h-5 mr-2 text-primary" />
          GitAssist for{" "}
          {username ? (
            <span className="text-primary ml-1">{username}</span>
          ) : (
            "GitHub"
          )}
        </CardTitle>
      </CardHeader>

      {/* Fixed ScrollArea with proper containment */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {aiMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 py-8">
                <GitHubLogoIcon className="w-12 h-12 mb-2 opacity-50" />
                <h3 className="text-lg font-medium">Welcome to GitAssist</h3>
                <p className="max-w-sm text-sm">
                  Ask questions about {username || "a GitHub user's"}{" "}
                  repositories, commits, pull requests, and more.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-md">
                  {[
                    "What projects has this user worked on?",
                    "Show me recent commits",
                    "What languages do they use?",
                    "Any open pull requests?",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-3 justify-start text-left text-xs"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[75%] ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {message.role === "user" ? (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            U
                          </AvatarFallback>
                        ) : (
                          <AvatarImage
                            src="/gitassist-logo.png"
                            alt="GitAssist"
                          />
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 text-sm overflow-hidden ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        }`}
                      >
                        <div className="font-medium mb-1">
                          {message.role === "user" ? "You" : "GitAssist"}
                        </div>
                        <div className="whitespace-pre-wrap break-words prose prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[75%]">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src="/gitassist-logo.png"
                          alt="GitAssist"
                        />
                      </Avatar>
                      <div className="rounded-lg px-4 py-2 text-sm bg-muted rounded-tl-none">
                        <div className="font-medium mb-1">GitAssist</div>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2 px-4 py-2 text-sm bg-destructive/10 text-destructive rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span>Something went wrong. Please try again.</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator className="shrink-0" />

      <CardFooter className="p-4 shrink-0">
        <form onSubmit={handleSend} className="flex w-full gap-2">
          <Input
            placeholder={
              username
                ? `Ask about ${username}'s GitHub...`
                : "Enter a GitHub username above first..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !username}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim() || !username}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PaperPlaneIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>

      {!username && (
        <div className="px-4 pb-3 text-xs text-center text-destructive shrink-0">
          Please enter a GitHub username in the settings first
        </div>
      )}
    </Card>
  );
}