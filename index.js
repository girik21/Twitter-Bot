import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fetchTopstories } from "./news/newsFetcher.js";
import { geminiIntegration } from "./genAi/geminiIntegration.js";
import { saveTweetsToFile } from "./utils/saveTweetsToFile.js";
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

const today = new Date().toISOString().split("T")[0];
const outputDir = path.resolve("output");
const tweetsFile = path.join(outputDir, `${today}.json`);
const postedFile = path.join(outputDir, "posted.json");

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const getPostedIds = async () => {
  try {
    const raw = await fs.readFile(postedFile, "utf-8");
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};

const savePostedId = async (contentId) => {
  const posted = await getPostedIds();
  posted.add(contentId);
  await fs.writeFile(postedFile, JSON.stringify([...posted], null, 2), "utf-8");
};

const postTweet = async (tweet) => {
  const hashtags = tweet.hashtags.join(" ");
  const text = `${tweet.title}\n\n${tweet.description}\n\n${hashtags}\n\n${tweet.link}`;

  if (text.length > 280) {
    console.warn("⚠️ Tweet too long. Skipping:", tweet.title);
    return;
  }

  try {
    console.log("✉️ Posting tweet:\n", text);
    const res = await twitterClient.v2.tweet({ text });
    console.log("✅ Tweet posted:", res.data.id);
  } catch (err) {
    console.error("❌ Failed to post tweet:", err?.data || err.message);
    throw err;
  }
};

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
    await ensureTweetsExist();

    const raw = await fs.readFile(tweetsFile, "utf-8");
    const tweets = JSON.parse(raw);
    const posted = await getPostedIds();

    const nextTweet = tweets.find((t) => !posted.has(t.contentId));
    if (!nextTweet) {
      console.log("✅ All tweets already posted for today.");
      return;
    }

    await postTweet(nextTweet);
    await savePostedId(nextTweet.contentId);
  } catch (err) {
    console.error("❌ Failed:", err?.message || err);
  }
};

console.log("🕐 Running tweet cron at", new Date().toLocaleString());
run();
