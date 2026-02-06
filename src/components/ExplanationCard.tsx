import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Lightbulb } from "lucide-react";

interface ExplanationCardProps {
  explanation: string;
}

const ExplanationCard = ({ explanation }: ExplanationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-card"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">Simple Explanation</h3>
      </div>
      <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed">
        <ReactMarkdown>{explanation}</ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default ExplanationCard;
