import { motion } from "framer-motion";
import { Clock, Edit2, Trash2 } from "lucide-react";
import type { StudyPlan } from "@/pages/StudyPlanner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COLOR_MAP: Record<string, string> = {
  primary: "bg-primary/10 border-primary/30 text-primary",
  secondary: "bg-secondary/10 border-secondary/30 text-secondary-foreground",
  info: "bg-info/10 border-info/30 text-info",
  warning: "bg-warning/10 border-warning/30 text-warning",
  destructive: "bg-destructive/10 border-destructive/30 text-destructive",
  success: "bg-success/10 border-success/30 text-foreground",
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

interface Props {
  plans: StudyPlan[];
  onEdit: (plan: StudyPlan) => void;
  onDelete: (id: string) => void;
}

const WeeklyTimetable = ({ plans, onEdit, onDelete }: Props) => {
  const plansByDay = DAYS.map((_, idx) =>
    plans.filter((p) => p.day_of_week === idx)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {DAYS.map((day, idx) => {
        const dayPlans = plansByDay[idx];
        if (dayPlans.length === 0) return null;

        return (
          <div key={day} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
              <h3 className="font-display font-semibold text-foreground text-sm">
                {day}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {dayPlans.map((plan) => {
                const colors = COLOR_MAP[plan.color] || COLOR_MAP.primary;
                return (
                  <div
                    key={plan.id}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${colors}`}
                    >
                      <Clock className="h-3 w-3 inline mr-1 -mt-0.5" />
                      {formatTime(plan.start_time)} – {formatTime(plan.end_time)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {plan.topic}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(plan)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(plan.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

export default WeeklyTimetable;
