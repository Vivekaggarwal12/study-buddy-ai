import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  StickyNote,
  Plus,
  ArrowLeft,
  Trash2,
  Edit2,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import NoteEditor from "@/components/notes/NoteEditor";
import NoteCard from "@/components/notes/NoteCard";

export interface TopicNote {
  id: string;
  user_id: string;
  topic: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const TopicNotes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<TopicNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<TopicNote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("topic_notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) setNotes(data as TopicNote[]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("topic_notes").delete().eq("id", id);
    if (!error) {
      setNotes((n) => n.filter((note) => note.id !== id));
      toast.success("Note deleted");
    }
  };

  const handleEdit = (note: TopicNote) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSaved = () => {
    setEditorOpen(false);
    setEditingNote(null);
    fetchNotes();
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group notes by topic
  const grouped = filteredNotes.reduce<Record<string, TopicNote[]>>((acc, note) => {
    const key = note.topic;
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-warm flex items-center justify-center">
                <StickyNote className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">
                Study Notes
              </span>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingNote(null);
              setEditorOpen(true);
            }}
            size="sm"
            className="bg-gradient-hero text-primary-foreground hover:opacity-90 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> New Note
          </Button>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
            Your Study Notes
          </h1>
          <p className="text-muted-foreground text-sm">
            Create short notes for every topic. Keep key concepts at your fingertips.
          </p>
        </motion.div>

        {/* Search */}
        {notes.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes by topic, title, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <StickyNote className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              No notes yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start creating short notes for your study topics.
            </p>
            <Button
              onClick={() => setEditorOpen(true)}
              className="bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create First Note
            </Button>
          </motion.div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No notes match your search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([topic, topicNotes]) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-sm font-display font-semibold text-primary mb-2 uppercase tracking-wide">
                  {topic}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topicNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <NoteEditor
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditingNote(null);
        }}
        editingNote={editingNote}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default TopicNotes;
