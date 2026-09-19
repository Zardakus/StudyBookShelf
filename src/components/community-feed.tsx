"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

type CommunityTopic = {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
};

export default function CommunityFeed() {
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/topics?scope=community")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  if (topics.length === 0) {
    return (
      <div className="text-center p-12 text-zinc-500 border rounded-lg border-dashed">
        No public topics found in the community yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <Card key={topic.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              {topic.user?.image ? (
                <img src={topic.user.image} alt={topic.user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-zinc-200 rounded-full" />
              )}
              <span className="text-xs font-medium text-zinc-500">{topic.user?.name}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-lg">{topic.title}</CardTitle>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{topic.domain}</Badge>
              <Badge variant="secondary" className="text-[10px] uppercase">
                {topic.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{topic.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> Public</span>
              <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
