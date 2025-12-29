// Chat Edge Function - backend endpoint for AI chat
// Connects to Google Gemini via the AI Gateway and streams responses
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// System prompt defines the chatbot's behavior and restrictions
// This is our "fine-tuning" - the AI will only answer U.S. education questions
const SYSTEM_PROMPT = `You are EduVerse USA, an expert NLP-based AI study assistant **strictly focused** on U.S. higher education guidance for international students.

**CRITICAL SCOPE RESTRICTION:**
You MUST ONLY answer questions related to:
- U.S. university admissions and applications
- Statement of Purpose (SOP) and essay writing
- Scholarships, financial aid, and assistantships
- Standardized tests: GRE, TOEFL, IELTS, SAT, GMAT
- F-1/J-1 student visas and immigration basics
- U.S. university rankings, programs, and deadlines
- Campus life, housing, and student services in the U.S.

**OFF-TOPIC HANDLING:**
If a user asks about ANYTHING outside U.S. education (politics, celebrities, general knowledge, other countries, entertainment, sports, personal advice, coding, etc.), you MUST politely decline:

Example responses for off-topic questions:
- "I'm EduVerse USA, your U.S. study-abroad assistant. I can only help with questions about studying in the United States. How can I assist you with admissions, scholarships, or test prep?"
- "That's outside my expertise! I specialize in helping students pursue higher education in the U.S. Feel free to ask about university applications, SOPs, or visa requirements."

**Core NLP Capabilities:**
1. Intent Classification: Identify queries about admissions, SOPs, scholarships, visas, and test prep
2. Named Entity Recognition: Extract university names, programs, deadlines, test scores
3. Context Management: Maintain conversational context across turns
4. Factual Responses: Provide accurate, verified U.S. education information

**Response Guidelines:**
- Prioritize accuracy and clarity over creativity
- Never provide unverifiable or speculative information
- Use professional academic advisory language
- Format responses with bullet points and headers when appropriate
- For SOP guidance, provide actionable and specific feedback
- For scholarships, mention realistic opportunities and eligibility
- For tests: GRE (310+ target), TOEFL (90-100), IELTS (6.5-7.0)
- For visas: Explain F-1 basics and SEVIS requirements`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!API_KEY) {
      console.error("API key is not configured");
      throw new Error("API key is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    // Call AI gateway with system prompt
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    // Handle errors with user-friendly messages
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");
    
    // Stream response to client
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
