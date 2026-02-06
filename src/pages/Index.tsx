import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import HeroInput from "@/components/HeroInput";
import StudyResults, { StudyMaterials } from "@/components/StudyResults";
import LoadingState from "@/components/LoadingState";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState<StudyMaterials | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");

  const handleGenerate = async (topic: string) => {
    setIsLoading(true);
    setStudyData(null);
    setCurrentTopic(topic);

    try {
      const { data, error } = await supabase.functions.invoke("generate-study", {
        body: { topic },
      });

      if (error) {
        // Check for rate limiting or payment errors
        if (error.message?.includes("429")) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (error.message?.includes("402")) {
          toast.error("AI usage limit reached. Please try again later.");
        } else {
          toast.error(error.message || "Failed to generate study materials");
        }
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setStudyData(data);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-display font-semibold text-foreground">StudyBuddy</span>
          </div>
          {currentTopic && studyData && (
            <button
              onClick={() => {
                setStudyData(null);
                setCurrentTopic("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              New Topic
            </button>
          )}
        </div>
      </header>

      {/* Hero / Input */}
      {!studyData && !isLoading && (
        <HeroInput onGenerate={handleGenerate} isLoading={isLoading} />
      )}

      {/* Loading */}
      {isLoading && <LoadingState />}

      {/* Results */}
      {studyData && !isLoading && (
        <div className="pt-8">
          <StudyResults data={studyData} topic={currentTopic} />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-auto">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by AI · Built to help you learn better
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
