"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

export default function AddTopicInput() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // 1. AI Categorization
      const aiRes = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!aiRes.ok) throw new Error("Failed to categorize topic");
      const categorized = await aiRes.json();

      // 2. Save Topic
      const saveRes = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categorized),
      });

      if (!saveRes.ok) throw new Error("Failed to save topic");
      
      setPrompt("");
      // Trigger a refresh event or rely on SWR/React Query if we had it.
      // For simplicity, we can dispatch a custom event.
      window.dispatchEvent(new Event("topic-added"));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Sparkles className="h-5 w-5 text-zinc-400" />
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you want to learn? (e.g., 'I need to study React Server Components')"
            className="flex-1 border-0 focus-visible:ring-0 px-2 shadow-none"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !prompt.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Board"}
          </Button>
        </form>
        {error && <p className="text-sm text-red-500 mt-2 px-8">{error}</p>}
      </CardContent>
    </Card>
  );
}
