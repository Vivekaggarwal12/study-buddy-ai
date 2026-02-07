import { Edit2, Trash2 } from "lucide-react";
import type { TopicNote } from "@/pages/TopicNotes";

interface Props {
  note: TopicNote;
  onEdit: (note: TopicNote) => void;
  onDelete: (id: string) => void;
}

const NoteCard = ({ note, onEdit, onDelete }: Props) => {
  return (
    <div className="group rounded-xl border border-border bg-card shadow-card p-4 hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-foreground text-sm leading-tight">
          {note.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
        {note.content}
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-3">
        {new Date(note.updated_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
};

export default NoteCard;
