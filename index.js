import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fetchTopstories } from "./news/newsFetcher.js";
import { geminiIntegration } from "./genAi/geminiIntegration.js";
import { saveTweetsToFile } from "./utils/saveTweetsToFile.js";
import { TwitterApi } from "twitter-api-v2";
import { getPostedIds, savePostedId } from "./utils/supabaseTracker.js"; // Supabase tracker

dotenv.config();

const today = new Date().toISOString().split("T")[0];
const outputDir = path.resolve("output");
const tweetsFile = path.join(outputDir, `${today}.json`);

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const ensureTweetsExist = async () => {
  try {
    await fs.access(tweetsFile);
    console.log("✅ Tweet file already exists.");
  } catch {
    console.log("🆕 No tweets yet. Generating...");
    const stories = await fetchTopstories(50);
    const tweets = await geminiIntegration(stories, 12);

    if (tweets?.length > 0) {
      await saveTweetsToFile(tweets);
      console.log("✅ Tweets generated and saved.");
    } else {
      throw new Error("Gemini returned no tweets.");
    }
  }
};

const run = async () => {
  try {
    console.log("🕐 Running tweet cron at", new Date().toLocaleString());

    await ensureTweetsExist();

    const raw = await fs.readFile(tweetsFile, "utf-8");
    const tweets = JSON.parse(raw);
    const posted = await getPostedIds();

    const unpostedTweets = tweets.filter((t) => !posted.has(t.contentId));

    for (const tweet of unpostedTweets) {
      const hashtags = tweet.hashtags.join(" ");
      const text = `${tweet.title}\n\n${tweet.description}\n\n${hashtags}\n\n${tweet.link}`;

      if (text.length > 280) {
        console.warn("⚠️ Tweet too long. Skipping:", tweet.title);
        continue;
      }

      try {
        console.log("✉️ Posting tweet:\n", text);
        const res = await twitterClient.v2.tweet({ text });
        console.log("✅ Tweet posted:", res.data.id);

        await savePostedId(tweet.contentId);
        break; // ✅ Successfully posted one tweet
      } catch (err) {
        if (
          err?.data?.status === 403 &&
          err?.data?.title === "Forbidden" &&
          err?.data?.detail?.includes("duplicate")
        ) {
          console.warn("⚠️ Duplicate tweet detected. Trying next one...");
          continue;
        }

        console.error("❌ Failed to post tweet:", err?.data || err.message);
        break; // Stop on unexpected error
      }
    }

    if (unpostedTweets.length === 0) {
      console.log("✅ All tweets already posted for today.");
    }
  } catch (err) {
    console.error("❌ Failed:", err?.message || err);
  }
};

run();
