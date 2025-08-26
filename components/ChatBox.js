"use client";

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
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { username, setLoading } = useChatStore();
  const messagesEndRef = useRef(null);

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !username) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Detect intents
      console.log("🔍 Detecting intents...");
      const intentResponse = await fetch("/api/detect-intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          username: username,
        }),
      });

      const intentData = await intentResponse.json();
      
      if (!intentResponse.ok) {
        throw new Error(intentData.message || "Failed to detect intents");
      }

      console.log("🎯 Detected intents:", intentData.intents);

      // Step 2: Generate response using detected intents
      console.log("🚀 Generating response...");
      const responseResponse = await fetch("/api/generate-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          username: username,
          intents: intentData.intents,
        }),
      });

      const responseData = await responseResponse.json();

      if (!responseResponse.ok) {
        throw new Error(responseData.message || "Failed to generate response");
      }

      // Add assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant", 
        content: responseData.message,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      console.log("✅ Response generated successfully");

    } catch (err) {
      console.error("🚨 Send Error:", err);
      setError(err.message);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
            {messages.length === 0 ? (
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
                    "Show me their coding activity",
                    "What languages do they use most?",
                    "Who follows this developer?",
                    "Show me their best repositories",
                    "Any recent contributions?",
                    "What organizations are they in?",
                    "Show me their gists",
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
                {messages.map((message) => (
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