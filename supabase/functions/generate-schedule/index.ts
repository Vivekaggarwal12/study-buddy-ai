import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received prompt:", prompt);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Fallback: Generate schedule locally if API key is missing or AI fails
    const generateFallbackSchedule = (userPrompt: string) => {
      console.log("Generating fallback schedule");
      const schedule = [];
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
      
      // Parse user requirements
      const hasGATE = userPrompt.toLowerCase().includes("gate");
      const hasLeetCode = userPrompt.toLowerCase().includes("leet") || userPrompt.toLowerCase().includes("leetcode");
      const hasCollege = userPrompt.toLowerCase().includes("college");
      
      // Morning slots (6-9 AM) - before college
      for (let day = 1; day <= 5; day++) {
        schedule.push({
          topic: hasGATE ? "GATE Preparation" : "Morning Study",
          day_of_week: day,
          start_time: "06:00",
          end_time: "08:30",
          color: colors[0]
        });
      }
      
      // Evening slots (8-11 PM) - after dinner
      for (let day = 1; day <= 5; day++) {
        schedule.push({
          topic: hasGATE ? "GATE Study" : "Evening Study",
          day_of_week: day,
          start_time: "20:00",
          end_time: "22:30",
          color: colors[0]
        });
      }
      
      // LeetCode practice
      if (hasLeetCode) {
        schedule.push({
          topic: "LeetCode Practice",
          day_of_week: 6,
          start_time: "10:00",
          end_time: "13:00",
          color: colors[1]
        });
        schedule.push({
          topic: "LeetCode Practice",
          day_of_week: 0,
          start_time: "10:00",
          end_time: "13:00",
          color: colors[1]
        });
      }
      
      // Weekend GATE sessions
      if (hasGATE) {
        schedule.push({
          topic: "GATE Mock Test",
          day_of_week: 6,
          start_time: "14:00",
          end_time: "17:00",
          color: colors[2]
        });
        schedule.push({
          topic: "GATE Revision",
          day_of_week: 0,
          start_time: "14:00",
          end_time: "17:00",
          color: colors[2]
        });
      }
      
      return { schedule };
    };
    
    if (!LOVABLE_API_KEY) {
      console.log("No API key, using fallback schedule generation");
      const fallbackSchedule = generateFallbackSchedule(prompt);
      return new Response(JSON.stringify(fallbackSchedule), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an AI study planner assistant. Based on the user's requirements, create a weekly study schedule. Return ONLY a valid JSON object (no markdown, no code fences) with this structure:

{
  "schedule": [
    {
      "topic": "Subject name",
      "day_of_week": 0-6 (0=Sunday, 6=Saturday),
      "start_time": "HH:MM" (24-hour format),
      "end_time": "HH:MM" (24-hour format),
      "color": "#hexcolor"
    }
  ]
}

Rules:
- Create 5-10 study sessions based on user requirements
- Distribute sessions across different days
- Use realistic time slots (avoid late night unless requested)
- Assign different colors to different subjects
- Ensure no time conflicts on the same day
- Keep sessions between 1-3 hours typically`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      console.log("AI API failed, using fallback");
      const fallbackSchedule = generateFallbackSchedule(prompt);
      return new Response(JSON.stringify(fallbackSchedule), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    let scheduleData;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      scheduleData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response, using fallback:", content);
      const fallbackSchedule = generateFallbackSchedule(prompt);
      return new Response(JSON.stringify(fallbackSchedule), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(scheduleData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Schedule generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
