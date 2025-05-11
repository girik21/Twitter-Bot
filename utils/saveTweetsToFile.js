import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const hash = (str) =>
  crypto.createHash("md5").update(str).digest("hex").slice(0, 8);

export const saveTweetsToFile = async (tweets) => {
  const today = new Date().toISOString().split("T")[0];
  const filename = path.resolve("output", `${today}.json`);

  const tweetsWithIds = tweets.map((tweet) => ({
    ...tweet,
    id: hash(tweet.link),
    contentId: hash(`${tweet.title} ${tweet.description}`),
  }));

  const validTweets = tweetsWithIds.filter((tweet) => {
    const hashtags = tweet.hashtags.join(" ");
    const text = `${tweet.title}\n\n${tweet.description}\n\n${hashtags}\n\n${tweet.link}`;
    return text.length <= 280;
  });

  try {
    await fs.writeFile(
      filename,
      JSON.stringify(validTweets, null, 2),
      "utf-8"
    );
    console.log(`✅ ${validTweets.length} valid tweets saved to ${filename}`);
  } catch (err) {
    console.error("❌ Error saving tweets:", err);
  }
};

