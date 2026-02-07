import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Trophy, Heart, Clock, ArrowRight, Trash2, CalendarDays, StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudyHistoryItem {
  id: string;
  topic: string;
  created_at: string;
}

interface QuizScoreItem {
  id: string;
  topic: string;
  score: number;
  total_questions: number;
  created_at: string;
}

interface FavoriteItem {
  id: string;
  topic: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<StudyHistoryItem[]>([]);
  const [scores, setScores] = useState<QuizScoreItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [profileRes, historyRes, scoresRes, favoritesRes] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("user_id", user!.id).single(),
      supabase.from("study_history").select("id, topic, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("quiz_scores").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("favorite_topics").select("*").order("created_at", { ascending: false }),
    ]);

    setDisplayName(profileRes.data?.display_name || "Student");
    setHistory(historyRes.data || []);
    setScores(scoresRes.data || []);
    setFavorites(favoritesRes.data || []);
    setLoading(false);
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase.from("favorite_topics").delete().eq("id", id);
    if (!error) {
      setFavorites((f) => f.filter((item) => item.id !== id));
      toast.success("Removed from favorites");
    }
  };

  const removeHistory = async (id: string) => {
    const { error } = await supabase.from("study_history").delete().eq("id", id);
    if (!error) {
      setHistory((h) => h.filter((item) => item.id !== id));
      toast.success("Removed from history");
    }
  };

  const goToStudy = (topic: string) => {
    navigate(`/?topic=${encodeURIComponent(topic)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + (s.score / s.total_questions) * 100, 0) / scores.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground">Here's your study progress overview.</p>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/planner")}
              className="gap-1.5"
            >
              <CalendarDays className="h-3.5 w-3.5" /> Study Planner
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/notes")}
              className="gap-1.5"
            >
              <StickyNote className="h-3.5 w-3.5" /> Study Notes
            </Button>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
            <div className="flex justify-center mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{history.length}</p>
            <p className="text-xs text-muted-foreground">Topics Studied</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
            <div className="flex justify-center mb-2">
              <Trophy className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
            <div className="flex justify-center mb-2">
              <Heart className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
            <p className="text-xs text-muted-foreground">Favorites</p>
          </div>
        </motion.div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" /> Favorite Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="group flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5"
                >
                  <button
                    onClick={() => goToStudy(fav.topic)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {fav.topic}
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="text-primary/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Quiz Scores */}
        {scores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-secondary" /> Recent Quiz Scores
            </h2>
            <div className="space-y-2">
              {scores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-card"
                >
                  <div>
                    <button
                      onClick={() => goToStudy(s.topic)}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {s.topic}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gradient-hero">
                      {Math.round((s.score / s.total_questions) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.score}/{s.total_questions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Study History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" /> Study History
            </h2>
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-card"
                >
                  <div>
                    <button
                      onClick={() => goToStudy(h.topic)}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {h.topic}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToStudy(h.topic)}
                      className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeHistory(h.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {history.length === 0 && scores.length === 0 && favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">No study history yet</h3>
            <p className="text-muted-foreground mb-4">Start learning something new!</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              Start Studying
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
