// To run this file using node testSupabase.js, add "type": "module" to package.json and ensure you have the @supabase/supabase-js package installed.

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  const { data, error } = await supabase.from("users").select("*").limit(1);

  if (error) {
    console.log("❌ Error:", error.message);
  } else {
    console.log("✅ Supabase connection successful!");
    console.log(data);
  }
}

testConnection();