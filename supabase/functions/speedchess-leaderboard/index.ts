/**
 * SpeedChess - Leaderboard Function
 *
 * Returns leaderboard entries with username, total_pnl, wins, losses, win_rate.
 *
 * Flow:
 * 1. Fetch all completed matches (winner and loser)
 * 2. Aggregate wins, losses and PnL per user
 * 3. Fetch usernames for user ids
 * 4. Sort by total_pnl desc and honor optional limit
 * 5. Return an array of entries (not wrapped)
 */

// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client with service role for database operations
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // Parse optional limit from JSON body (service invokes with a body)
    let limit = 50;
    try {
      const body = await req.json();
      if (typeof body?.limit === "number" && body.limit > 0 && body.limit <= 100) {
        limit = body.limit;
      }
    } catch {}

    // Step 1: Fetch all completed SpeedChess matches from the database
    const { data: matches, error: mErr } = await supabase
      .from("speedchess_matches")
      .select("winner_id, loser_id, wager_cents")
      .eq("status", "completed");
    if (mErr) throw mErr;

    type Agg = { wins: number; losses: number; pnlCents: number };
    const perUser: Record<string, Agg> = {};

    for (const row of matches ?? []) {
      if (!row) continue;
      const winId = row.winner_id as string;
      const loseId = row.loser_id as string;
      const wager = Number(row.wager_cents || 0);

      if (winId) {
        perUser[winId] = perUser[winId] || { wins: 0, losses: 0, pnlCents: 0 };
        perUser[winId].wins += 1;
        perUser[winId].pnlCents += wager;
      }
      if (loseId) {
        perUser[loseId] = perUser[loseId] || { wins: 0, losses: 0, pnlCents: 0 };
        perUser[loseId].losses += 1;
        perUser[loseId].pnlCents -= wager;
      }
    }

    const userIds = Object.keys(perUser);

    // Step 3: Fetch usernames in batch
    let idToUsername: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: users, error: uErr } = await supabase
        .from("users")
        .select("id, username")
        .in("id", userIds);
      if (uErr) throw uErr;
      for (const u of users ?? []) {
        idToUsername[u.id as string] = String(u.username || "");
      }
    }

    // Step 4: Build, sort and limit entries
    const entries = userIds.map((id) => {
      const agg = perUser[id];
      const totalGames = agg.wins + agg.losses;
      const winRate = totalGames > 0 ? Math.round((agg.wins / totalGames) * 100) : 0;
      return {
        user_id: id,
        username: idToUsername[id] || id,
        total_pnl: Number((agg.pnlCents || 0) / 100),
        wins: agg.wins,
        losses: agg.losses,
        win_rate: winRate,
      };
    })
      .sort((a, b) => b.total_pnl - a.total_pnl)
      .slice(0, limit);

    return new Response(JSON.stringify(entries), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error('Leaderboard generation error:', e);
    return new Response(JSON.stringify({ error: (e as any)?.message || String(e) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});