import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { TopicNote } from "@/pages/TopicNotes";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote: TopicNote | null;
  onSaved: () => void;
}

const NoteEditor = ({ open, onOpenChange, editingNote, onSaved }: Props) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTopic(editingNote.topic);
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTopic("");
      setTitle("");
      setContent("");
    }
  }, [editingNote, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic.trim() || !title.trim()) return;

    setSaving(true);

    const payload = {
      user_id: user.id,
      topic: topic.trim(),
      title: title.trim(),
      content: content.trim(),
    };

    let error;
    if (editingNote) {
      ({ error } = await supabase
        .from("topic_notes")
        .update(payload)
        .eq("id", editingNote.id));
    } else {
      ({ error } = await supabase.from("topic_notes").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast.error("Failed to save note");
      return;
    }

    toast.success(editingNote ? "Note updated" : "Note created!");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingNote ? "Edit Note" : "New Study Note"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Topic / Subject
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, World War II..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Note Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Key Definitions, Important Dates..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your short notes here... key points, formulas, definitions, etc."
              rows={8}
              className="resize-y"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !topic.trim() || !title.trim()}
              className="bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {saving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditor;
