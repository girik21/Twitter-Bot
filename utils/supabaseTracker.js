import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("../.env") });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const getPostedIds = async () => {
  const { data, error } = await supabase.from("tweets").select("content_id");
  if (error) {
    console.error("❌ Error fetching posted IDs:", error);
    return new Set();
  }
  return new Set(data.map((row) => row.content_id)); // using hnId stored in content_id
};

export const savePostedId = async (hnId) => {
  const { error } = await supabase.from("tweets").insert([{ content_id: hnId }]);
  if (error) {
    console.error("❌ Error saving posted ID:", error);
  }
};

// Optional: run once to test connection
const testConnection = async () => {
  const { data, error } = await supabase.from("tweets").select("*").limit(1);
  if (error) {
    console.error("❌ Supabase connection test failed:", error);
  } else {
    console.log("✅ Supabase connection test succeeded:", data);
  }
};

testConnection();
