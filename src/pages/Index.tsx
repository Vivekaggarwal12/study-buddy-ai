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
  const [studyData, setStudyData] = useState<StudyMaterials | null>(() => {
    const saved = sessionStorage.getItem('studyData');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentTopic, setCurrentTopic] = useState(() => {
    return sessionStorage.getItem('currentTopic') || '';
  });
  const [isFavorited, setIsFavorited] = useState(false);

  // Save to sessionStorage whenever data changes
  useEffect(() => {
    if (studyData) {
      sessionStorage.setItem('studyData', JSON.stringify(studyData));
    } else {
      sessionStorage.removeItem('studyData');
    }
  }, [studyData]);

  useEffect(() => {
    if (currentTopic) {
      sessionStorage.setItem('currentTopic', currentTopic);
    } else {
      sessionStorage.removeItem('currentTopic');
    }
  }, [currentTopic]);

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
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              {user && (
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-foreground">Hi, {user.email?.split('@')[0] || 'Student'}! 👋</span>
                  <span className="text-xs text-muted-foreground">Ready to learn something new?</span>
                </div>
              )}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
          
          {currentTopic && studyData && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
                <span className="text-sm font-semibold text-foreground truncate">📚 {currentTopic}</span>
                <button
                  onClick={toggleFavorite}
                  className="ml-auto p-1.5 rounded-lg hover:bg-background/80 transition-colors"
                  title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
                </button>
              </div>
              <button
                onClick={() => {
                  setStudyData(null);
                  setCurrentTopic("");
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-hero text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
              >
                + New
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-br from-background to-muted/30 hover:from-muted/50 hover:to-muted/40 border border-border hover:border-primary/30 transition-all group"
            >
              <LayoutDashboard className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/planner")}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-br from-background to-muted/30 hover:from-muted/50 hover:to-muted/40 border border-border hover:border-primary/30 transition-all group"
            >
              <CalendarDays className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Planner</span>
            </button>
            <button
              onClick={() => navigate("/notes")}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-br from-background to-muted/30 hover:from-muted/50 hover:to-muted/40 border border-border hover:border-primary/30 transition-all group"
            >
              <StickyNote className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Notes</span>
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
