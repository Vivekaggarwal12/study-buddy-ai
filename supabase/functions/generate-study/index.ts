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
    const { topic, requestId } = await req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid topic" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedTopic = topic.trim().slice(0, 200);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educational tutor who creates comprehensive study materials. Given a topic, you MUST return a valid JSON object with exactly this structure (no markdown, no code fences, just pure JSON):

{
  "explanation": "A clear, simple explanation of the topic as if explaining to a 10-year-old. Use analogies and everyday examples. 3-5 paragraphs.",
  "flashcards": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "quiz": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ],
  "studyTips": [
    "Tip 1...",
    "Tip 2..."
  ]
}

Rules:
- Generate exactly 8 flashcards
- Generate exactly 5 quiz questions with 4 options each
- correctIndex is 0-based (0 for A, 1 for B, 2 for C, 3 for D)
- Generate 4-5 study tips
- Keep language simple and accessible
- Make quiz options plausible but with one clearly correct answer
- IMPORTANT: Create DIFFERENT questions each time, focusing on various aspects of the topic
- Return ONLY the JSON object, no other text`;

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
            { role: "user", content: `Create comprehensive study materials for the topic: "${sanitizedTopic}"${requestId ? ` (Request ID: ${requestId} - generate unique variations)` : ''}` },
          ],
          temperature: requestId ? 1.0 : 0.7,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate study materials");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON response, handling possible markdown code fences
    let studyMaterials;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      studyMaterials = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse study materials");
    }

    return new Response(JSON.stringify(studyMaterials), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Study generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
