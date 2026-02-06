import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

const FlashcardsView = ({ flashcards }: FlashcardsViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const current = flashcards[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <Layers className="h-5 w-5 text-accent-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">Flashcards</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {currentIndex + 1} / {flashcards.length}
        </span>
      </div>

      {/* Flashcard */}
      <div
        className="perspective-1000 cursor-pointer mb-6"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full min-h-[240px] md:min-h-[280px] preserve-3d transition-transform duration-500 ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center shadow-card">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Question</span>
            <p className="text-lg md:text-xl text-center text-foreground font-medium leading-relaxed">
              {current.question}
            </p>
            <span className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <RotateCw className="h-3 w-3" /> Tap to reveal answer
            </span>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 border-primary/30 bg-primary/5 p-8 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-wider text-primary mb-3">Answer</span>
            <p className="text-lg md:text-xl text-center text-foreground font-medium leading-relaxed">
              {current.answer}
            </p>
            <span className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <RotateCw className="h-3 w-3" /> Tap to see question
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {flashcards.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(i);
              }}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-border hover:bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default FlashcardsView;
