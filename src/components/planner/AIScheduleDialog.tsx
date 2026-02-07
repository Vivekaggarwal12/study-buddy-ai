import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AIScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleGenerated: () => void;
}

const AIScheduleDialog = ({ open, onOpenChange, onScheduleGenerated }: AIScheduleDialogProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        toast.error("Please add your Gemini API key to .env file");
        setLoading(false);
        return;
      }

      console.log("Sending request to Gemini API...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a daily schedule planner. Create a single day schedule based ONLY on what the user explicitly mentions.

User Request: "${prompt.trim()}"

Instructions:
1. Create schedule for ONE day (use day_of_week: 1)
2. ONLY include activities/tasks the user explicitly mentioned
3. DO NOT add sleep, meals, breaks unless user mentions them
4. Keep study sessions as continuous blocks (don't split)
5. Respect time constraints mentioned

Return ONLY valid JSON:
{
  "schedule": [
    {
      "topic": "Activity Name",
      "day_of_week": 1,
      "start_time": "06:00",
      "end_time": "08:30",
      "color": "#3b82f6"
    }
  ]
}

Colors: #3b82f6 (blue), #10b981 (green), #f59e0b (orange), #ef4444 (red), #8b5cf6 (purple)
Format: 24-hour time (HH:MM), day_of_week: 1`
              }]
            }],
            generationConfig: {
              temperature: 0.7
            }
          })
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full API Response:", data);
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Extracted content:", content);

      if (!content) {
        throw new Error("No response from AI");
      }

      // Clean and parse JSON
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log("Cleaned content:", cleanContent);
      
      const scheduleData = JSON.parse(cleanContent);
      console.log("Parsed schedule data:", scheduleData);
      
      if (!scheduleData.schedule || !Array.isArray(scheduleData.schedule)) {
        console.error("Invalid format:", scheduleData);
        throw new Error("Invalid schedule format");
      }

      console.log("Schedule array:", scheduleData.schedule);

      const scheduleName = `Schedule ${new Date().toLocaleString()}`;
      
      const plans = scheduleData.schedule.map((plan: any) => ({
        user_id: user.id,
        topic: `${scheduleName}|${plan.topic}`,
        day_of_week: plan.day_of_week,
        start_time: plan.start_time,
        end_time: plan.end_time,
        color: plan.color || '#3b82f6',
      }));

      console.log("Plans to insert:", plans);

      const { error: insertError } = await supabase.from("study_plans").insert(plans);
      
      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Failed to save: ${insertError.message}`);
      }
      
      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Failed to save: ${insertError.message}`);
      }

      console.log("Successfully inserted plans");
      toast.success(`${plans.length} study sessions created!`);
      setPrompt("");
      onOpenChange(false);
      onScheduleGenerated();
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(err?.message || "Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Schedule Generator
          </DialogTitle>
          <DialogDescription>
            Create a personalized daily schedule. Describe your activities and time constraints.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Example: I need to study Physics for 3 hours, do LeetCode practice, attend college from 9 to 6, and have dinner at 7 PM."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIScheduleDialog;
