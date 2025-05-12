# 🐦 Gemini Twitter Bot

An **AI-powered automated Twitter bot** that:

- Fetches daily top stories from Hacker News.
- Uses **Google Gemini** to generate tweet-worthy, clickbait-style content about AI/ML-related stories.
- Saves and posts one tweet per hour using the Twitter API.
- Tracks posted tweets in a **Supabase** database.
- Is deployed on **Render.com** with a **cron job** to run every hour.

---

## 🔧 Requirements

### Runtime
- Node.js `>=18`

### APIs & Credentials
Create a `.env` file in your root directory with the following:

```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Twitter API (v2 App in a Project)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
