import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeThoughts = async (thoughtText) => {
  try {
    console.log("Starting analysis...");
    
    // ✅ USE THIS - gemini-2.5-flash (available in your account)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    });

    const prompt = `You are a cognitive clarity assistant. Analyze the following thought dump.

USER'S THOUGHTS:
"${thoughtText}"

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "categories": [
    {"text": "sentence from input", "type": "FEAR", "explanation": "why this is a fear"},
    {"text": "sentence from input", "type": "FACT", "explanation": "why this is a fact"},
    {"text": "sentence from input", "type": "ASSUMPTION", "explanation": "why this is an assumption"}
  ],
  "irrationalPatterns": [
    {"pattern": "Catastrophizing", "example": "quote from text", "explanation": "why this is irrational"}
  ],
  "logicalOutput": {
    "whatMatters": ["priority 1", "priority 2"],
    "whatDoesntMatter": ["dismiss this"],
    "nextSteps": ["concrete action 1", "concrete action 2"]
  }
}

DEFINITIONS:
- FEAR: Emotional worries about uncertain futures
- FACT: Objective, verifiable information
- ASSUMPTION: Unverified beliefs treated as truth

PATTERNS: Catastrophizing, Black-and-white thinking, Overgeneralization, Mind reading, Rumination`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    console.log("Raw response:", text.substring(0, 100));
    
    // Clean JSON
    text = text.trim();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const analysis = JSON.parse(text);
    console.log("Analysis successful!");
    
    return analysis;
    
  } catch (error) {
    console.error("Detailed error:", error);
    throw new Error(error.message || "Failed to analyze thoughts");
  }
};
