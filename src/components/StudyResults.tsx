import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Layers, HelpCircle, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const StudyResults = ({ data, topic }: StudyResultsProps) => {
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
        <p className="text-muted-foreground">
          for <span className="font-semibold text-primary">{topic}</span>
        </p>
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
