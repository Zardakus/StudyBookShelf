"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Lock, ChevronDown, ChevronRight, Plus, Search, LayoutList, LayoutGrid, Wand2, X, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TopicStatus = "TO_LEARN" | "LEARNING" | "MASTERED";

type Topic = {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: TopicStatus;
  visibility: "PRIVATE" | "PUBLIC";
};

type Recommendation = {
  title: string;
  description: string;
};

const STATUS_CONFIG: Record<TopicStatus, { label: string; borderClass: string }> = {
  TO_LEARN: { label: "To Learn", borderClass: "border-t-[3px] border-t-slate-400 dark:border-t-slate-600" },
  LEARNING: { label: "Learning", borderClass: "border-t-[3px] border-t-amber-400 dark:border-t-amber-600" },
  MASTERED: { label: "Mastered", borderClass: "border-t-[3px] border-t-emerald-400 dark:border-t-emerald-600" },
};

export default function TopicBoard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [compactView, setCompactView] = useState(false);
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({});
  const [inlineDomain, setInlineDomain] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState("");

  // Recommendations State
  const [recDomain, setRecDomain] = useState<string | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

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
    setIsMounted(true);
    fetchTopics();
    const handleAdded = () => fetchTopics();
    window.addEventListener("topic-added", handleAdded);
    return () => window.removeEventListener("topic-added", handleAdded);
  }, []);

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    await fetch(`/api/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const [sourceDomain, sourceStatus] = source.droppableId.split("__");
    const [destDomain, destStatus] = destination.droppableId.split("__");

    if (sourceStatus !== destStatus || sourceDomain !== destDomain) {
      updateTopic(draggableId, { 
        status: destStatus as TopicStatus,
        domain: destDomain 
      });
    }
  };

  const handleInlineAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim() || !inlineDomain) return;

    const newTopic = {
      title: inlineTitle,
      domain: inlineDomain,
      description: "",
    };

    setInlineDomain(null);
    setInlineTitle("");

    const saveRes = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTopic),
    });

    if (saveRes.ok) fetchTopics();
  };

  const toggleDomain = (domain: string) => {
    setCollapsedDomains((prev) => ({ ...prev, [domain]: !prev[domain] }));
  };

  // RECOMMENDATIONS LOGIC
  const openRecommendations = async (domain: string) => {
    setRecDomain(domain);
    setRecsLoading(true);
    setRecommendations([]);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } finally {
      setRecsLoading(false);
    }
  };

  const handleAddRec = async (rec: Recommendation) => {
    // Optimistically remove from list
    setRecommendations(prev => prev.filter(r => r.title !== rec.title));

    const newTopic = {
      title: rec.title,
      domain: recDomain!,
      description: rec.description,
    };

    const saveRes = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTopic),
    });

    if (saveRes.ok) fetchTopics();
  };

  const handleIgnoreRec = async (title: string) => {
    // Optimistically remove from list
    setRecommendations(prev => prev.filter(r => r.title !== title));

    await fetch("/api/recommendations/ignore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: recDomain, topicTitle: title }),
    });
  };

  if (!isMounted || loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const filteredTopics = topics.filter((t) => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const domains = Array.from(new Set(topics.map((t) => t.domain)));

  if (topics.length === 0) {
    return (
      <div className="text-center p-12 text-zinc-500 border rounded-lg border-dashed">
        Your board is empty. Ask the AI to add a topic above!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-lg border shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search topics..." 
            className="pl-9 h-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => setCompactView(!compactView)} className="w-full sm:w-auto">
            {compactView ? <LayoutGrid className="h-4 w-4 mr-2" /> : <LayoutList className="h-4 w-4 mr-2" />}
            {compactView ? "Detailed View" : "Compact View"}
          </Button>
        </div>
      </div>

      {filteredTopics.length === 0 && searchQuery && (
        <div className="text-center p-8 text-zinc-500">No topics match your search.</div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        {domains.map((domain) => {
          const domainTopics = filteredTopics.filter((t) => t.domain === domain);
          if (domainTopics.length === 0 && searchQuery) return null;
          
          const isCollapsed = collapsedDomains[domain];

          return (
            <div key={domain} className="space-y-4 bg-white dark:bg-zinc-900 rounded-xl border p-4 shadow-sm">
              {/* Domain Header */}
              <div className="flex items-center justify-between group">
                <button 
                  onClick={() => toggleDomain(domain)} 
                  className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-md transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  <h2 className="text-xl font-bold tracking-tight">{domain}</h2>
                  <span className="text-xs font-medium bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400">
                    {domainTopics.length}
                  </span>
                </button>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                    onClick={() => openRecommendations(domain)}
                    title="Recommend Next Topics"
                  >
                    <Wand2 className="h-4 w-4 mr-1" /> Recommend
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setInlineDomain(inlineDomain === domain ? null : domain)}
                    title="Add Topic inline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Inline Add Input */}
              {inlineDomain === domain && (
                <form onSubmit={handleInlineAdd} className="flex items-center gap-2 mt-2 ml-8 max-w-md animate-in slide-in-from-top-2">
                  <Input 
                    autoFocus
                    placeholder={`Add new topic to ${domain}...`} 
                    value={inlineTitle}
                    onChange={(e) => setInlineTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button type="submit" size="sm" className="h-8">Add</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setInlineDomain(null)} className="h-8 text-zinc-500">Cancel</Button>
                </form>
              )}

              {/* Domain Board Columns */}
              {!isCollapsed && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
                  {(["TO_LEARN", "LEARNING", "MASTERED"] as TopicStatus[]).map((status) => {
                    const columnTopics = domainTopics.filter((t) => t.status === status);
                    const config = STATUS_CONFIG[status];
                    const droppableId = `${domain}__${status}`;

                    return (
                      <div key={status} className="flex flex-col bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            {config.label}
                            <span className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-medium">
                              {columnTopics.length}
                            </span>
                          </h3>
                        </div>

                        <Droppable droppableId={droppableId}>
                          {(provided, snapshot) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef}
                              className={`flex-1 min-h-[150px] space-y-3 transition-colors rounded-md p-1 ${snapshot.isDraggingOver ? 'bg-zinc-100 dark:bg-zinc-800/50' : ''}`}
                            >
                              {columnTopics.map((topic, index) => (
                                <Draggable key={topic.id} draggableId={topic.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/20 opacity-90' : ''}`}
                                    >
                                      <Card className={`overflow-hidden transition-all ${config.borderClass}`}>
                                        <CardHeader className={`p-3 ${compactView ? 'pb-3' : 'pb-2'}`}>
                                          <div className="flex justify-between items-start gap-2">
                                            <CardTitle className={`leading-tight ${compactView ? 'text-sm' : 'text-base'}`}>{topic.title}</CardTitle>
                                            <Badge 
                                              variant={topic.visibility === "PUBLIC" ? "default" : "secondary"} 
                                              className="text-[10px] cursor-pointer shrink-0" 
                                              onClick={() => updateTopic(topic.id, { visibility: topic.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE" })}
                                            >
                                              {topic.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                              {topic.visibility}
                                            </Badge>
                                          </div>
                                        </CardHeader>
                                        
                                        {!compactView && (
                                          <CardContent className="p-3 pt-0 space-y-3">
                                            {topic.description && (
                                              <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">{topic.description}</p>
                                            )}
                                            <div className="flex justify-end mt-2 opacity-30 hover:opacity-100 transition-opacity">
                                              <Select
                                                value={topic.status}
                                                onValueChange={(val: any) => updateTopic(topic.id, { status: val })}
                                              >
                                                <SelectTrigger className="h-7 w-28 text-[11px]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="TO_LEARN">To Learn</SelectItem>
                                                  <SelectItem value="LEARNING">Learning</SelectItem>
                                                  <SelectItem value="MASTERED">Mastered</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </CardContent>
                                        )}
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </DragDropContext>

      {/* Recommendations Modal */}
      <Dialog open={!!recDomain} onOpenChange={(open) => !open && setRecDomain(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Wand2 className="h-5 w-5 text-amber-500" />
              Recommendations for {recDomain}
            </DialogTitle>
          </DialogHeader>

          {recsLoading ? (
            <div className="space-y-4 py-6">
              {/* Top 3 Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl border border-amber-200/50 dark:border-amber-900/50" />
                ))}
              </div>
              {/* Compact Skeleton */}
              <div className="space-y-2 mt-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No new recommendations found right now.
            </div>
          ) : (
            <div className="space-y-8 py-4">
              {/* TOP 3 - Highly Recommended */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Highly Recommended</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.slice(0, 3).map((rec, i) => (
                    <Card key={i} className="flex flex-col border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base leading-tight">{rec.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex-1">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{rec.description}</p>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex gap-2">
                        <Button size="sm" className="w-full h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleAddRec(rec)}>
                          <PlusCircle className="w-3 h-3 mr-1" /> Add
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 border-amber-200 hover:bg-amber-100 dark:border-amber-900 dark:hover:bg-amber-900" onClick={() => handleIgnoreRec(rec.title)} title="Ignore">
                          <Trash2 className="w-3 h-3 text-zinc-500" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Remaining 4 to 10 - Compact List */}
              {recommendations.length > 3 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Also Consider</h3>
                  <div className="space-y-2">
                    {recommendations.slice(3).map((rec, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                        <div>
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-zinc-500 mt-1">{rec.description}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => handleAddRec(rec)}>
                            <PlusCircle className="w-3 h-3 mr-1" /> Add
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500" onClick={() => handleIgnoreRec(rec.title)} title="Ignore">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
