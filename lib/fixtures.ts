/**
 * Pure types and formatting helpers for league fixtures.
 *
 * No server-only dependencies, so both Client and Server Components can import
 * it. Database access lives in `lib/fixtures-server.ts`.
 */

export type SeasonFixture = {
  id: string;
  matchday: number;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  /** 24h local kick-off, `HH:MM`. */
  kickoff: string;
  opponent: string;
  isHome: boolean;
  /** Published host city, or `"TBA"` where no ground is confirmed. */
  venue: string;
};

export const season = {
  label: "2026/27",
  competition: "Nigeria Premier Football League",
  shortCompetition: "NPFL",
};

/** Clubs in the 2026/27 NPFL, offered as suggestions in the admin editor. */
export const npflClubs = [
  "Abia Warriors",
  "Barau",
  "Doma United",
  "Enyimba Int'l",
  "Ikorodu City",
  "Inter Lagos",
  "Kano Pillars",
  "Katsina United",
  "Kun Khalifat",
  "Kwara United",
  "Nasarawa United",
  "Niger Tornadoes",
  "Plateau United",
  "Ranchers Bees",
  "Rangers Int'l",
  "Rivers United",
  "Shooting Stars",
  "Sporting Lagos",
  "Warri Wolves",
];

/**
 * Badge palette per club, so a side looks the same in every view. Derived from
 * the club name rather than stored, which keeps the admin form to the fields
 * that actually matter.
 */
export function opponentTone(name: string): number {
  const index = npflClubs.indexOf(name);
  return index === -1 ? 0 : (index % 5) + 1;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** `2026-08-30` to `Sun 30 Aug`. Computed in UTC so it never shifts a day. */
export function formatFixtureDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const weekday =
    WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday} ${day} ${SHORT_MONTHS[month - 1]}`;
}

/** `2026-08-30` to `Sun 30 Aug 2026`, for standalone cards that need the year. */
export function formatFixtureDateFull(iso: string): string {
  const [year] = iso.split("-");
  const short = formatFixtureDate(iso);
  return short === iso ? iso : `${short} ${year}`;
}

/** `2026-08-30` to `August 2026`, used for the month headings. */
export function formatFixtureMonth(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  if (!year || !month) return iso;
  return `${LONG_MONTHS[month - 1]} ${year}`;
}

/** `16:00` to `4:00pm`, which is how kick-offs are read locally. */
export function formatKickoff(kickoff: string): string {
  const [hour, minute] = kickoff.split(":").map(Number);
  if (Number.isNaN(hour)) return kickoff;
  const suffix = hour < 12 ? "am" : "pm";
  const twelve = hour % 12 || 12;
  return `${twelve}:${String(minute ?? 0).padStart(2, "0")}${suffix}`;
}

/** Groups fixtures into calendar months, preserving the order given. */
export function groupFixturesByMonth(fixtures: SeasonFixture[]) {
  const groups: { month: string; fixtures: SeasonFixture[] }[] = [];

  for (const fixture of fixtures) {
    const month = formatFixtureMonth(fixture.date);
    const current = groups.at(-1);

    if (current?.month === month) {
      current.fixtures.push(fixture);
    } else {
      groups.push({ month, fixtures: [fixture] });
    }
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

/**
 * The 38 league games as published in the NPFL's official 2026/2027 fixture
 * release. Used to seed the database and as the fallback if the table is empty
 * or unreachable, so the page is never blank.
 *
 * Every game in the release kicks off at 4:00PM. `venue` is the host city
 * exactly as published, including the "TBA" entries. The NPFL reserves the
 * right to move dates and times for broadcast.
 */
type SeedRow = [
  matchday: number,
  date: string,
  opponent: string,
  isHome: boolean,
  venue: string,
];

const SEED: SeedRow[] = [
  [1, "2026-08-30", "Warri Wolves", true, "Benin"],
  [2, "2026-09-06", "Nasarawa United", false, "TBA"],
  [3, "2026-09-13", "Kun Khalifat", true, "Benin"],
  [4, "2026-09-20", "Ranchers Bees", false, "Kaduna"],
  [5, "2026-09-23", "Ikorodu City", true, "Benin"],
  [6, "2026-09-27", "Abia Warriors", false, "Aba"],
  [7, "2026-10-04", "Barau", true, "Benin"],
  [8, "2026-10-11", "Sporting Lagos", false, "Lagos"],
  [9, "2026-10-18", "Rangers Int'l", false, "Enugu"],
  [10, "2026-10-25", "Rivers United", true, "Benin"],
  [11, "2026-11-01", "Kwara United", false, "Ilorin"],
  [12, "2026-11-08", "Niger Tornadoes", true, "Benin"],
  [13, "2026-11-15", "Shooting Stars", false, "Ibadan"],
  [14, "2026-11-22", "Doma United", true, "Benin"],
  [15, "2026-11-29", "Inter Lagos", false, "Lagos"],
  [16, "2026-12-06", "Enyimba Int'l", true, "Benin"],
  [17, "2026-12-13", "Kano Pillars", false, "Kano"],
  [18, "2026-12-20", "Plateau United", true, "Benin"],
  [19, "2026-12-30", "Katsina United", false, "Katsina"],
  [20, "2027-01-10", "Katsina United", true, "Benin"],
  [21, "2027-01-17", "Warri Wolves", false, "Ozoro"],
  [22, "2027-01-20", "Nasarawa United", true, "Benin"],
  [23, "2027-01-24", "Kun Khalifat", false, "Owerri"],
  [24, "2027-01-31", "Ranchers Bees", true, "Benin"],
  [25, "2027-02-10", "Ikorodu City", false, "Lagos"],
  [26, "2027-02-14", "Abia Warriors", true, "Benin"],
  [27, "2027-02-21", "Barau", false, "Kano"],
  [28, "2027-02-28", "Sporting Lagos", true, "Benin"],
  [29, "2027-03-07", "Rangers Int'l", true, "Benin"],
  [30, "2027-03-14", "Rivers United", false, "Port Harcourt"],
  [31, "2027-03-21", "Kwara United", true, "Benin"],
  [32, "2027-03-28", "Niger Tornadoes", false, "TBA"],
  [33, "2027-04-04", "Shooting Stars", true, "Benin"],
  [34, "2027-04-10", "Doma United", false, "TBA"],
  [35, "2027-04-18", "Inter Lagos", true, "Benin"],
  [36, "2027-05-09", "Enyimba Int'l", false, "Aba"],
  [37, "2027-05-16", "Kano Pillars", true, "Benin"],
  [38, "2027-05-30", "Plateau United", false, "Jos"],
];

export const defaultFixtures: SeasonFixture[] = SEED.map(
  ([matchday, date, opponent, isHome, venue]) => ({
    id: `seed-${matchday}`,
    matchday,
    date,
    kickoff: "16:00",
    opponent,
    isHome,
    venue,
  }),
);

/**
 * The three games the homepage strip shows: the most recent result if the
 * season is under way, then whatever is coming up. Before the opening day this
 * is simply the first three fixtures.
 *
 * `today` is passed in rather than read from the clock so the caller decides
 * where "now" comes from, which keeps this deterministic and testable.
 */
export function selectFixtureStrip(
  fixtures: SeasonFixture[],
  today: string,
): { label: string; fixture: SeasonFixture }[] {
  const played = fixtures.filter((fixture) => fixture.date < today);
  const upcoming = fixtures.filter((fixture) => fixture.date >= today);
  const last = played.at(-1);

  const chosen = last ? [last, ...upcoming.slice(0, 2)] : upcoming.slice(0, 3);
  const upcomingLabels = ["Next match", "Then", "Later"];

  return chosen.map((fixture, index) => {
    if (last && index === 0) return { label: "Last match", fixture };
    return {
      label: upcomingLabels[last ? index - 1 : index] ?? "Later",
      fixture,
    };
  });
}
