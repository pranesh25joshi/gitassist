'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import useChatStore from '@/lib/store';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubLogoIcon, CheckIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function UsernameInput() {
  const { username, setUsername } = useChatStore();
  const [inputValue, setInputValue] = useState(username);
  const [isValidating, setIsValidating] = useState(false);

  const validateAndSetUsername = async () => {
    if (!inputValue.trim()) return;
    
    setIsValidating(true);
    
    try {
      // Optional: Validate if the GitHub username exists
      const response = await fetch(`https://api.github.com/users/${inputValue}`);
      
      if (response.ok) {
        setUsername(inputValue.trim());
        toast.success("Username set!", {
          description: `Now chatting about ${inputValue}'s GitHub activity.`
        });
      } else {
        toast.error("Username not found", {
          description: "Please enter a valid GitHub username."
        });
      }
    } catch (error) {
      console.error("Error validating username:", error);
      toast.error("Connection error", {
        description: "Could not connect to GitHub API."
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndSetUsername();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg font-medium flex items-center">
          <GitHubLogoIcon className="w-5 h-5 mr-2 text-primary" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="github-username" className="text-base font-medium">GitHub Username</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Enter a valid GitHub username to explore
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Input
              id="github-username"
              type="text"
              placeholder="Enter a GitHub username (e.g. octocat)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
            
            <Button 
              onClick={validateAndSetUsername}
              disabled={!inputValue.trim() || isValidating}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <ReloadIcon className="h-4 w-4 animate-spin mr-2" />
                  Validating...
                </>
              ) : username === inputValue.trim() ? (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Username Set
                </>
              ) : (
                "Set Username"
              )}
            </Button>
          </div>
          
          {username && (
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-sm font-medium">Currently viewing:</p>
              <p className="text-primary font-semibold">{username}</p>
            </div>
          )}
          
          <div className="pt-4">
            <h3 className="font-medium mb-2">Usage Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Ask about repositories the user has created</li>
              <li>Inquire about recent commit activity</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}