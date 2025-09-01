// supabase/functions/_shared/auth.ts
// ----------------------------------
// Centralised JWT extraction + verification.
// Throws “Unauthorized” if the token is missing or invalid.

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-ignore 
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Service-role client so we can verify any user’s JWT.
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export async function getUserFromRequest(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data, error } = await sb.auth.getUser(token);

  if (error || !data?.user) {
    throw new Error("Unauthorized");
  }
  return data.user; // { id, email, ... }
}