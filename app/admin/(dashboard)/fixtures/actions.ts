"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FixtureActionState =
  | { error?: string; success?: string }
  | undefined;

function refresh() {
  revalidatePath("/fixtures");
  revalidatePath("/admin/fixtures");
}

/** Inserts when `id` is empty, updates otherwise. */
export async function saveFixtureAction(
  _prev: FixtureActionState,
  formData: FormData,
): Promise<FixtureActionState> {
  const id = ((formData.get("id") as string) || "").trim();
  const matchday = Number(formData.get("matchday"));
  const matchDate = ((formData.get("match_date") as string) || "").trim();
  const opponent = ((formData.get("opponent") as string) || "").trim();
  const kickoff = ((formData.get("kickoff") as string) || "16:00").trim();
  const venue = ((formData.get("venue") as string) || "").trim() || "TBA";
  const isHome = formData.get("is_home") === "true";

  if (!opponent) return { error: "Opponent is required." };
  if (!matchDate) return { error: "Match date is required." };
  if (!Number.isInteger(matchday) || matchday < 1) {
    return { error: "Matchday must be a whole number of 1 or more." };
  }

  const row = {
    matchday,
    match_date: matchDate,
    kickoff,
    opponent,
    venue,
    is_home: isHome,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("fixtures").update(row).eq("id", id)
    : await supabase.from("fixtures").insert(row);

  if (error) {
    console.error("saveFixtureAction:", error.message);
    /* The table has a unique constraint on matchday. */
    if (error.code === "23505") {
      return { error: `Matchday ${matchday} already has a fixture.` };
    }
    return { error: "Could not save the fixture. Please try again." };
  }

  refresh();
  return {
    success: id
      ? `Matchday ${matchday} updated.`
      : `Matchday ${matchday} added.`,
  };
}

export async function deleteFixtureAction(
  id: string,
): Promise<FixtureActionState> {
  if (!id) return { error: "Missing fixture." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("fixtures").delete().eq("id", id);

  if (error) {
    console.error("deleteFixtureAction:", error.message);
    return { error: "Could not delete the fixture. Please try again." };
  }

  refresh();
  return { success: "Fixture deleted." };
}
