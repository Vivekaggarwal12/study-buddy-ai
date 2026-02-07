import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  ArrowLeft,
  Trash2,
  Clock,
  Edit2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddPlanDialog from "@/components/planner/AddPlanDialog";
import WeeklyTimetable from "@/components/planner/WeeklyTimetable";

export interface StudyPlan {
  id: string;
  user_id: string;
  topic: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const StudyPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("study_plans")
      .select("*")
      .order("day_of_week")
      .order("start_time");
    if (!error && data) setPlans(data as StudyPlan[]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("study_plans").delete().eq("id", id);
    if (!error) {
      setPlans((p) => p.filter((plan) => plan.id !== id));
      toast.success("Session removed");
    }
  };

  const handleEdit = (plan: StudyPlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingPlan(null);
    fetchPlans();
  };

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
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">
                Study Planner
              </span>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingPlan(null);
              setDialogOpen(true);
            }}
            size="sm"
            className="bg-gradient-hero text-primary-foreground hover:opacity-90 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Session
          </Button>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
            Weekly Study Schedule
          </h1>
          <p className="text-muted-foreground text-sm">
            Plan your study sessions across the week. Stay organized and consistent.
          </p>
        </motion.div>

        {plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <CalendarDays className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              No study sessions yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Add your first session to start building your weekly routine.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create First Session
            </Button>
          </motion.div>
        ) : (
          <WeeklyTimetable
            plans={plans}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <AddPlanDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingPlan(null);
        }}
        editingPlan={editingPlan}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default StudyPlanner;
