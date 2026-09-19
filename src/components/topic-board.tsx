"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Lock } from "lucide-react";

type Topic = {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: "TO_LEARN" | "LEARNING" | "MASTERED";
  visibility: "PRIVATE" | "PUBLIC";
};

export default function TopicBoard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/topics");
      if (res.ok) {
        setTopics(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    const handleAdded = () => fetchTopics();
    window.addEventListener("topic-added", handleAdded);
    return () => window.removeEventListener("topic-added", handleAdded);
  }, []);

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    // Optimistic update
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    await fetch(`/api/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  // Group by Domain
  const domains = Array.from(new Set(topics.map((t) => t.domain)));

  if (topics.length === 0) {
    return (
      <div className="text-center p-12 text-zinc-500 border rounded-lg border-dashed">
        Your board is empty. Ask the AI to add a topic above!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {domains.map((domain) => {
        const domainTopics = topics.filter((t) => t.domain === domain);
        return (
          <div key={domain} className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">{domain}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["TO_LEARN", "LEARNING", "MASTERED"].map((status) => {
                const columnTopics = domainTopics.filter((t) => t.status === status);
                return (
                  <div key={status} className="space-y-3 bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                      {status.replace("_", " ")} ({columnTopics.length})
                    </h3>
                    {columnTopics.map((topic) => (
                      <Card key={topic.id} className="cursor-grab active:cursor-grabbing">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base leading-tight">{topic.title}</CardTitle>
                            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => updateTopic(topic.id, { visibility: topic.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE" })}>
                              {topic.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                              {topic.visibility}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                          <p className="text-sm text-zinc-500 line-clamp-3">{topic.description}</p>
                          <Select
                            value={topic.status}
                            onValueChange={(val: any) => updateTopic(topic.id, { status: val })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TO_LEARN">To Learn</SelectItem>
                              <SelectItem value="LEARNING">Learning</SelectItem>
                              <SelectItem value="MASTERED">Mastered</SelectItem>
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
