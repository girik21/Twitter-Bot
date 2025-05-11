import { GoogleGenAI } from "@google/genai";
import { zodTweetSchema } from "./tweetSchema.js";
import { toGeminiSchema } from "gemini-zod";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const geminiIntegration = async (stories, limit = 3) => {

  const storiesList = stories.map((s, i) => `${i + 1}. ${s.title} (${s.url})`).join("\n")

  const prompt = `
  
  From the following Hacker News stories, identify the top ${limit} that are most relevant to:
  - Artificial Intelligence, Machine Learning, LLMs, or major AI companies like OpenAI, Anthropic, Meta, Google, etc.
  - Make sure it is the pretty good and we would like to get as much likes as possible

  Each tweet MUST be under 280 characters total (title + description + hashtags + link).
  
  Format each tweet using this schema:
  
  ${JSON.stringify(toGeminiSchema(zodTweetSchema), null, 2)}

  Try to gain as much attention as you can for the stories list below:
  ${storiesList}
  
  `
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: toGeminiSchema(zodTweetSchema.array()),
    },

  })

  const jsonText = response.text.trim();

  try {
    const parsed = JSON.parse(jsonText);
    return parsed; // ✅ this is what tweetsResponse will get
  } catch (err) {
    console.error("❌ Failed to parse Gemini JSON output:", jsonText);
    throw err;
  }

};
