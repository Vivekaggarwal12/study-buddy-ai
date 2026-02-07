import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Heart, LayoutDashboard, LogOut, CalendarDays, StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import HeroInput from "@/components/HeroInput";
import StudyResults, { StudyMaterials } from "@/components/StudyResults";
import LoadingState from "@/components/LoadingState";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState<StudyMaterials | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);

  // Auto-generate if topic param exists
  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam && !studyData && !isLoading) {
      handleGenerate(topicParam);
      setSearchParams({});
    }
  }, [searchParams]);

  // Check if current topic is favorited
  useEffect(() => {
    if (!currentTopic || !user) return;
    supabase
      .from("favorite_topics")
      .select("id")
      .eq("user_id", user.id)
      .eq("topic", currentTopic)
      .maybeSingle()
      .then(({ data }) => setIsFavorited(!!data));
  }, [currentTopic, user]);

  const handleGenerate = async (topic: string) => {
    setIsLoading(true);
    setStudyData(null);
    setCurrentTopic(topic);

    try {
      const { data, error } = await supabase.functions.invoke("generate-study", {
        body: { topic },
      });

      if (error) {
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

      // Save to study history
      if (user) {
        await supabase.from("study_history").insert({
          user_id: user.id,
          topic,
          study_data: data,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !currentTopic) return;

    if (isFavorited) {
      await supabase
        .from("favorite_topics")
        .delete()
        .eq("user_id", user.id)
        .eq("topic", currentTopic);
      setIsFavorited(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorite_topics").insert({
        user_id: user.id,
        topic: currentTopic,
      });
      setIsFavorited(true);
      toast.success("Added to favorites!");
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
          <div className="flex items-center gap-3">
            {currentTopic && studyData && (
              <>
                <button
                  onClick={toggleFavorite}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-destructive text-destructive" : ""}`} />
                </button>
                <button
                  onClick={() => {
                    setStudyData(null);
                    setCurrentTopic("");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  New Topic
                </button>
              </>
            )}
            <button
              onClick={() => navigate("/planner")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Study Planner"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/notes")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Study Notes"
            >
              <StickyNote className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
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
