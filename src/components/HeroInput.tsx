import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroInputProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "Photosynthesis",
  "Newton's Laws",
  "World War II",
  "DNA & Genetics",
  "Solar System",
  "Algebra Basics",
];

const HeroInput = ({ onGenerate, isLoading }: HeroInputProps) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic.trim());
    }
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Study Assistant
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gradient-hero leading-tight mb-4">
            Study Smarter,
            <br />
            Not Harder
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Enter any topic and get instant explanations, flashcards, quizzes, and study tips — all tailored to help you learn effectively.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8"
        >
          <div className="relative flex-1">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter a topic (e.g., Photosynthesis)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={200}
              className="pl-10 h-12 bg-card shadow-card text-base border-border focus-visible:ring-primary"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="h-12 px-6 bg-gradient-hero text-primary-foreground hover:opacity-90 transition-opacity shadow-soft font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate
              </span>
            )}
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          <span className="text-sm text-muted-foreground mr-1">Try:</span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setTopic(suggestion);
                onGenerate(suggestion);
              }}
              disabled={isLoading}
              className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroInput;
