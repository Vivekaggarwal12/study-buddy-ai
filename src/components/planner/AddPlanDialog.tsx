import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { StudyPlan } from "@/pages/StudyPlanner";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const COLORS = [
  { value: "primary", label: "Green" },
  { value: "secondary", label: "Amber" },
  { value: "info", label: "Blue" },
  { value: "warning", label: "Orange" },
  { value: "destructive", label: "Red" },
  { value: "success", label: "Teal" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan: StudyPlan | null;
  onSaved: () => void;
}

const AddPlanDialog = ({ open, onOpenChange, editingPlan, onSaved }: Props) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState("primary");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingPlan) {
      setTopic(editingPlan.topic);
      setDayOfWeek(String(editingPlan.day_of_week));
      setStartTime(editingPlan.start_time.slice(0, 5));
      setEndTime(editingPlan.end_time.slice(0, 5));
      setColor(editingPlan.color || "primary");
    } else {
      setTopic("");
      setDayOfWeek("1");
      setStartTime("09:00");
      setEndTime("10:00");
      setColor("primary");
    }
  }, [editingPlan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic.trim()) return;

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setSaving(true);

    const payload = {
      user_id: user.id,
      topic: topic.trim(),
      day_of_week: parseInt(dayOfWeek, 10),
      start_time: startTime,
      end_time: endTime,
      color,
    };

    let error;
    if (editingPlan) {
      ({ error } = await supabase
        .from("study_plans")
        .update(payload)
        .eq("id", editingPlan.id));
    } else {
      ({ error } = await supabase.from("study_plans").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast.error("Failed to save session");
      return;
    }

    toast.success(editingPlan ? "Session updated" : "Session added!");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingPlan ? "Edit Study Session" : "Add Study Session"}
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
              placeholder="e.g. Mathematics, Physics..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Day
            </label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Start Time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                End Time
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Color Label
            </label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={saving || !topic.trim()}
              className="bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {saving ? "Saving..." : editingPlan ? "Update" : "Add Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlanDialog;
