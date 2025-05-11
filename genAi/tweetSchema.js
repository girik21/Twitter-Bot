import { z } from "zod";

export const zodTweetSchema = z
  .object({
    title: z
      .string()
      .max(80)
      .describe(
        "A bold, emotional, and attention-grabbing headline using emojis (≤50 characters). Think influencer-style clickbait — inspired by voices like Andrew Tate, Elon Musk, Kendall Jenner, MrBeast, Joe Rogan, Gary Vee. The goal is to make people stop scrolling instantly."
      ),
    description: z
      .string()
      .max(120)
      .describe(
        "A punchy one-liner (≤120 characters) giving context or emotional impact. Write like you're narrating a viral moment or teasing something shocking. Think 'What happens next will blow your mind'-energy."
      ),
    link: z
      .string()
      .url()
      .describe(
        "Direct URL to the full news article. Must be valid and click-safe."
      ),
    hashtags: z
      .array(z.string().startsWith("#"))
      .min(1)
      .max(4)
      .describe(
        "Add 1–3 relevant hashtags (e.g. #OpenAI, #TechNews, #Startup). Avoid general tags like #AI. Pick trending or niche-relevant tags only."
      ),
  })
  .describe(
    "A structured tweet object representing viral-style AI/tech news content."
  );
