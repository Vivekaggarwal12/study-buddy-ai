import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Layers, HelpCircle, Target, StickyNote, Check, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ExplanationCard from "@/components/ExplanationCard";
import FlashcardsView from "@/components/FlashcardsView";
import QuizView from "@/components/QuizView";
import StudyTipsView from "@/components/StudyTipsView";

export interface StudyMaterials {
  explanation: string;
  flashcards: { question: string; answer: string }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  studyTips: string[];
}

interface StudyResultsProps {
  data: StudyMaterials;
  topic: string;
}

function buildAutoNotes(data: StudyMaterials, topic: string) {
  const notes: { topic: string; title: string; content: string }[] = [];

  // 1. Key Concepts note from explanation
  notes.push({
    topic,
    title: "Key Concepts",
    content: data.explanation
      .split(/\n\n+/)
      .map((p) => `• ${p.trim()}`)
      .join("\n\n"),
  });

  // 2. Quick Definitions from flashcards
  const definitions = data.flashcards
    .map((fc) => `Q: ${fc.question}\nA: ${fc.answer}`)
    .join("\n\n");
  notes.push({
    topic,
    title: "Quick Definitions & Answers",
    content: definitions,
  });

  // 3. Study Tips summary
  const tipsContent = data.studyTips
    .map((tip, i) => `${i + 1}. ${tip}`)
    .join("\n");
  notes.push({
    topic,
    title: "Study Tips",
    content: tipsContent,
  });

  return notes;
}

const StudyResults = ({ data, topic }: StudyResultsProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAutoSaveNotes = async () => {
    if (!user) {
      toast.error("Please sign in to save notes");
      return;
    }

    setSaving(true);
    try {
      const notes = buildAutoNotes(data, topic);
      const payload = notes.map((n) => ({
        user_id: user.id,
        ...n,
      }));

      const { error } = await supabase.from("topic_notes").insert(payload);
      if (error) throw error;

      setSaved(true);
      toast.success(`${notes.length} notes saved for "${topic}"!`);
    } catch (err) {
      console.error("Failed to save notes:", err);
      toast.error("Failed to save notes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-3xl mx-auto px-4 pb-16"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
          Study Materials
        </h2>
        <p className="text-muted-foreground mb-4">
          for <span className="font-semibold text-primary">{topic}</span>
        </p>
        <Button
          onClick={handleAutoSaveNotes}
          disabled={saving || saved}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Notes...
            </>
          ) : saved ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" /> Notes Saved
            </>
          ) : (
            <>
              <StickyNote className="h-3.5 w-3.5" /> Auto-Save as Notes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/60 rounded-xl p-1 h-auto">
          <TabsTrigger
            value="explanation"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-primary"
          >
            <BookOpen className="h-3.5 w-3.5 hidden sm:block" />
            Explain
          </TabsTrigger>
          <TabsTrigger
            value="flashcards"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-primary"
          >
            <Layers className="h-3.5 w-3.5 hidden sm:block" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-primary"
          >
            <HelpCircle className="h-3.5 w-3.5 hidden sm:block" />
            Quiz
          </TabsTrigger>
          <TabsTrigger
            value="tips"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-primary"
          >
            <Target className="h-3.5 w-3.5 hidden sm:block" />
            Tips
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="explanation">
            <ExplanationCard explanation={data.explanation} />
          </TabsContent>
          <TabsContent value="flashcards">
            <FlashcardsView flashcards={data.flashcards} />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizView questions={data.quiz} topic={topic} />
          </TabsContent>
          <TabsContent value="tips">
            <StudyTipsView tips={data.studyTips} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default StudyResults;
