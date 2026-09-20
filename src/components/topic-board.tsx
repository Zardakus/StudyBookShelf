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
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

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
    setSelectedRec(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      if (res.ok) {
        const data = await res.json();
        const recs = data.recommendations || [];
        setRecommendations(recs);
        if (recs.length > 0) {
          setSelectedRec(recs[0]);
        }
      }
    } finally {
      setRecsLoading(false);
    }
  };

  const handleAddRec = async (rec: Recommendation) => {
    // Optimistically remove from list
    setRecommendations(prev => {
      const next = prev.filter(r => r.title !== rec.title);
      if (selectedRec?.title === rec.title) {
        setSelectedRec(next[0] || null);
      }
      return next;
    });

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
    setRecommendations(prev => {
      const next = prev.filter(r => r.title !== title);
      if (selectedRec?.title === title) {
        setSelectedRec(next[0] || null);
      }
      return next;
    });

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
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] p-0 overflow-hidden flex flex-col sm:flex-row h-[600px] max-h-[85vh] gap-0">
          {recsLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
              <DialogTitle className="text-zinc-500 font-medium">Finding recommendations...</DialogTitle>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <DialogTitle className="text-xl mb-2">Recommendations for {recDomain}</DialogTitle>
              <p className="text-zinc-500">No new recommendations found right now.</p>
            </div>
          ) : (
            <>
              {/* Sidebar List */}
              <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
                <DialogHeader className="p-4 border-b text-left">
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Wand2 className="h-5 w-5 text-amber-500" />
                    {recDomain}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {recommendations.map((rec, i) => {
                    const isSelected = selectedRec?.title === rec.title;
                    const isHighlyRecommended = i < 3;
                    return (
                      <div key={i}>
                        {!isHighlyRecommended && i === 3 && (
                          <div className="px-2 pt-3 pb-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Also Consider
                          </div>
                        )}
                        <button 
                          onClick={() => setSelectedRec(rec)}
                          className={`w-full text-left p-3 rounded-lg transition-colors border relative ${
                            isSelected 
                              ? "bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-700/50 shadow-sm" 
                              : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          }`}
                        >
                          {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-md" />}
                          {isHighlyRecommended && (
                            <div className={`text-[10px] font-bold text-amber-600 dark:text-amber-500 mb-1 ${!isSelected ? "opacity-70" : ""}`}>
                              RECOMMENDED
                            </div>
                          )}
                          <div className="font-medium text-sm line-clamp-2">{rec.title}</div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail Pane */}
              <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto">
                {selectedRec ? (
                  <div className="p-8 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{selectedRec.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                      {selectedRec.description}
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleAddRec(selectedRec)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white gap-2"
                      >
                        <PlusCircle className="w-4 h-4" /> Add to Board
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleIgnoreRec(selectedRec.title)}
                        className="px-6"
                      >
                        Ignore
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500">
                    Select a topic to view details
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
