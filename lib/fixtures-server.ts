import "server-only";
import { defaultFixtures, type SeasonFixture } from "@/lib/fixtures";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// biome-ignore lint/suspicious/noExplicitAny: Supabase row shape
function rowToFixture(row: any): SeasonFixture {
  return {
    id: row.id,
    matchday: row.matchday ?? 0,
    date: (row.match_date ?? "").slice(0, 10),
    kickoff: (row.kickoff ?? "16:00").slice(0, 5),
    opponent: row.opponent ?? "",
    isHome: row.is_home ?? true,
    venue: row.venue ?? "TBA",
  };
}

/**
 * The season in league order. Falls back to the published NPFL list when the
 * table is empty or unreachable, so the fixtures page is never blank.
 */
export async function getFixtures(): Promise<SeasonFixture[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .order("match_date", { ascending: true })
      .order("matchday", { ascending: true });

    if (error || !data || data.length === 0) return defaultFixtures;
    return data.map(rowToFixture);
  } catch {
    return defaultFixtures;
  }
}

/**
 * Admin view. No fallback: seed rows are not editable, so showing them here
 * would offer edit and delete buttons that cannot work.
 */
export async function getAllFixtures(): Promise<SeasonFixture[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .order("match_date", { ascending: true })
      .order("matchday", { ascending: true });

    if (error || !data) return [];
    return data.map(rowToFixture);
  } catch {
    return [];
  }
}
