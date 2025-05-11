import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path"; // <-- You forgot this import

dotenv.config({ path: path.resolve("../.env") });

const dbUrl = process.env.SUPABASE_URL
const anon =  process.env.SUPABASE_ANON_KEY

const supabase = createClient(
  dbUrl,
  anon
);

export const getPostedIds = async () => {
  const { data, error } = await supabase.from("tweets").select("content_id");
  if (error) {
    console.error("❌ Error fetching posted IDs:", error);
    return new Set();
  }
  return new Set(data?.map((row) => row.content_id));
};

export const savePostedId = async (contentId) => {
  const { error } = await supabase.from("tweets").insert([{ content_id: contentId }]);
  if (error) {
    console.error("❌ Error saving posted ID:", error);
  }
};

const testConnection = async () => {
  const { data, error } = await supabase.from("tweets").select("*").limit(1);
  if (error) {
    console.error("❌ Supabase connection test failed:", error);
  } else {
    console.log("✅ Supabase connection test succeeded:", data);
  }
};

testConnection();

