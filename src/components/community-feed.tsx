"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Heart, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  favoritedBy: any[];
};

export default function CommunityFeed() {
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("community"); // "community", "following", "favorites"

  const fetchTopics = async (scope: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/topics?scope=${scope}`);
      if (res.ok) {
        setTopics(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(activeTab);
  }, [activeTab]);

  const toggleFavorite = async (topicId: string, isFavorited: boolean) => {
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            favoritedBy: isFavorited ? [] : [{ userId: "optimistic" }],
          };
        }
        return t;
      })
    );

    const method = isFavorited ? "DELETE" : "POST";
    await fetch(`/api/topics/${topicId}/favorite`, { method });
    
    if (activeTab === "favorites" && isFavorited) {
      setTopics((prev) => prev.filter((t) => t.id !== topicId));
    }
  };

  const followUser = async (userId: string) => {
    await fetch(`/api/users/${userId}/follow`, { method: "POST" });
    alert("User followed!"); // Simplified feedback for MVP
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="community">Global</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="favorites">Bookmarks</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
      ) : topics.length === 0 ? (
        <div className="text-center p-12 text-zinc-500 border rounded-lg border-dashed">
          No topics found here yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const isFavorited = topic.favoritedBy?.length > 0;
            return (
              <Card key={topic.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {topic.user?.image ? (
                        <img src={topic.user.image} alt={topic.user.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 bg-zinc-200 rounded-full" />
                      )}
                      <span className="text-xs font-medium text-zinc-500">{topic.user?.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-900" onClick={() => followUser(topic.user.id)} title="Follow User">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 shrink-0 ${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                      onClick={() => toggleFavorite(topic.id, isFavorited)}
                    >
                      <Heart className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} />
                    </Button>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
