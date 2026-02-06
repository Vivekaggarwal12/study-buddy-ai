import { motion } from "framer-motion";
import { Target, CheckCircle2 } from "lucide-react";

interface StudyTipsViewProps {
  tips: string[];
}

const StudyTipsView = ({ tips }: StudyTipsViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
          <Target className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">Study Tips</h3>
      </div>

      <div className="space-y-3">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-foreground/85 leading-relaxed">{tip}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StudyTipsView;
