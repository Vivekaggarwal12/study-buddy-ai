import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizViewProps {
  questions: QuizQuestion[];
  topic?: string;
  onRequestNewQuestions?: () => void;
}

const QuizView = ({ questions, topic, onRequestNewQuestions }: QuizViewProps) => {
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [showResults, setShowResults] = useState(false);

  const question = questions[currentQ];
  const isAnswered = answered[currentQ];
  const isCorrect = selectedAnswer === question.correctIndex;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    const newAnswered = [...answered];
    newAnswered[currentQ] = true;
    setAnswered(newAnswered);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
      // Save quiz score
      if (user && topic) {
        const finalScore = score + (selectedAnswer === questions[currentQ].correctIndex && !answered[currentQ] ? 1 : 0);
        await supabase.from("quiz_scores").insert({
          user_id: user.id,
          topic,
          score: finalScore,
          total_questions: questions.length,
        });
        toast.success("Quiz score saved!");
      }
    }
  };

  const handleRestart = () => {
    if (onRequestNewQuestions) {
      onRequestNewQuestions();
    } else {
      setCurrentQ(0);
      setSelectedAnswer(null);
      setScore(0);
      setAnswered(new Array(questions.length).fill(false));
      setShowResults(false);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-border bg-card p-8 text-center shadow-card"
      >
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">Quiz Complete!</h3>
        <p className="text-4xl font-bold text-gradient-hero mb-1">{percentage}%</p>
        <p className="text-muted-foreground mb-6">
          You got {score} out of {questions.length} correct
        </p>
        <Button onClick={handleRestart} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/15">
          <HelpCircle className="h-5 w-5 text-info" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">Practice Quiz</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          Question {currentQ + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-hero"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card mb-4">
        <p className="text-lg font-medium text-foreground mb-5">{question.question}</p>

        <div className="space-y-3">
          {question.options.map((option, i) => {
            let optionStyle = "border-border bg-background hover:border-primary/40 hover:bg-primary/5";
            if (isAnswered) {
              if (i === question.correctIndex) {
                optionStyle = "border-success bg-success/10";
              } else if (i === selectedAnswer && !isCorrect) {
                optionStyle = "border-destructive bg-destructive/10";
              } else {
                optionStyle = "border-border bg-background opacity-50";
              }
            } else if (selectedAnswer === i) {
              optionStyle = "border-primary bg-primary/10";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={isAnswered}
                className={`w-full text-left rounded-lg border-2 p-4 transition-all ${optionStyle} disabled:cursor-default`}
              >
                <div className="flex items-center gap-3">
                  {isAnswered && i === question.correctIndex && (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  )}
                  {isAnswered && i === selectedAnswer && !isCorrect && i !== question.correctIndex && (
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <span className="text-foreground">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-lg bg-muted p-4"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Explanation:</span>{" "}
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button onClick={handleNext} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
            {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizView;
