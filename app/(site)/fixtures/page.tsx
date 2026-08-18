import type { Metadata } from "next";
import { TeamBadge } from "@/components/brand";
import { Reveal } from "@/components/reveal";
import { SectionHeader } from "@/components/section-header";
import { club } from "@/lib/content";
import {
  formatFixtureDate,
  formatKickoff,
  groupFixturesByMonth,
  opponentTone,
  type SeasonFixture,
  season,
} from "@/lib/fixtures";
import { getFixtures } from "@/lib/fixtures-server";

const SHELL = "mx-auto w-full max-w-[1440px] px-4 md:px-8";

/* Fixtures are edited in the dashboard and the "next match" flag depends on
   today's date, so the page refreshes hourly rather than being frozen at build. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fixtures",
  description: `Every ${club.name} game of the ${season.label} ${season.shortCompetition} season, with dates, kick-off times and venues.`,
};

function venueLabel(fixture: SeasonFixture) {
  if (fixture.isHome) return `${club.stadium}, ${club.city}`;
  if (fixture.venue === "TBA") return "To be confirmed";
  return fixture.venue;
}

function TeamRow({ name, tone }: { name: string; tone: number }) {
  const isUs = name === club.name;

  return (
    <div className="flex items-center gap-3">
      <TeamBadge
        name={isUs ? club.name : name}
        tone={tone}
        className="h-9 w-9 shrink-0"
      />
      <span
        className={`text-[15px] leading-tight ${
          isUs ? "font-bold text-ink" : "font-medium text-ink/75"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

/**
 * One card per game. The home side is listed first, which is the convention
 * supporters already read fixtures by, and the Home/Away chip states it outright
 * so there is no guessing which ground the game is at.
 */
function FixtureCard({
  fixture,
  state,
}: {
  fixture: SeasonFixture;
  state: "played" | "next" | "upcoming";
}) {
  const opponentSide = {
    name: fixture.opponent,
    tone: opponentTone(fixture.opponent),
  };
  const ourSide = { name: club.name, tone: 0 };
  const [first, second] = fixture.isHome
    ? [ourSide, opponentSide]
    : [opponentSide, ourSide];

  const chip = fixture.isHome
    ? { text: "Home", className: "bg-brand/12 text-brand-dark" }
    : { text: "Away", className: "bg-ink/8 text-ink/70" };

  return (
    <li
      className={`flex flex-col rounded-card border bg-white p-5 transition-colors ${
        state === "next"
          ? "border-gold shadow-[0_0_0_3px_rgba(247,198,33,0.18)]"
          : "border-ink/8"
      } ${state === "played" ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow text-[10px] text-steel">
          Matchday {fixture.matchday}
        </span>
        <span className="flex items-center gap-2">
          {state === "next" ? (
            <span className="eyebrow rounded-pill bg-gold px-2 py-0.5 text-[9px] text-brand-deep">
              Next match
            </span>
          ) : null}
          {state === "played" ? (
            <span className="eyebrow rounded-pill bg-ink/8 px-2 py-0.5 text-[9px] text-steel">
              Played
            </span>
          ) : null}
          <span
            className={`eyebrow rounded-pill px-2 py-0.5 text-[9px] ${chip.className}`}
          >
            {chip.text}
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <TeamRow name={first.name} tone={first.tone} />
        <span
          aria-hidden="true"
          className="eyebrow pl-[0.9rem] text-[9px] text-steel/70"
        >
          v
        </span>
        <TeamRow name={second.name} tone={second.tone} />
      </div>

      <dl className="mt-5 grid grid-cols-[4.25rem_1fr] gap-x-3 gap-y-2 border-t border-ink/8 pt-4 text-xs">
        <dt className="eyebrow text-[9px] text-steel">Kick-off</dt>
        <dd className="font-semibold text-ink">
          {formatFixtureDate(fixture.date)}, {formatKickoff(fixture.kickoff)}
        </dd>
        <dt className="eyebrow text-[9px] text-steel">Venue</dt>
        <dd className="text-ink/75">{venueLabel(fixture)}</dd>
      </dl>
    </li>
  );
}

export default async function FixturesPage() {
  const fixtures = await getFixtures();
  const groups = groupFixturesByMonth(fixtures);

  /* Today in ISO form, so comparisons are plain string comparisons. */
  const today = new Date().toISOString().slice(0, 10);
  const nextFixture = fixtures.find((fixture) => fixture.date >= today);

  function stateOf(fixture: SeasonFixture) {
    if (fixture.id === nextFixture?.id) return "next" as const;
    return fixture.date < today ? ("played" as const) : ("upcoming" as const);
  }

  const homeCount = fixtures.filter((f) => f.isHome).length;
  const stats = [
    { label: "League games", value: fixtures.length },
    { label: "At the Ogbemudia", value: homeCount },
    { label: "On the road", value: fixtures.length - homeCount },
  ];

  return (
    <>
      {/* The site header is fixed, so the first band owns the clearance. */}
      <section className="relative overflow-hidden bg-brand-deep pt-24 pb-14 lg:pt-32">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(110% 80% at 15% 0%, rgba(247,198,33,0.14) 0%, transparent 58%)",
              "linear-gradient(180deg, transparent 40%, rgba(2,47,23,0.85) 100%)",
            ].join(", "),
          }}
        />
        <div className={`${SHELL} relative`}>
          <span className="eyebrow rounded-pill bg-gold px-3 py-1.5 text-[10px] text-brand-deep">
            {season.label} {season.shortCompetition}
          </span>
          <h1 className="headline mt-5 max-w-3xl text-4xl text-white uppercase sm:text-5xl lg:text-6xl">
            Fixtures
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Every {club.shortName} league game this season. Home games are at
            the {club.stadium} in {club.city}.
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="headline text-3xl text-gold tabular-nums sm:text-4xl">
                  {stat.value}
                </dd>
                <dt className="eyebrow mt-1.5 text-[10px] text-white/60">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {nextFixture ? (
        <section className="bg-smoke">
          <div className={`${SHELL} py-10`}>
            <SectionHeader
              title="Up next"
              subtitle={`Matchday ${nextFixture.matchday} · ${formatFixtureDate(nextFixture.date)}`}
            />
            <Reveal delay={0.05}>
              <ul className="grid gap-4 sm:max-w-sm">
                <FixtureCard fixture={nextFixture} state="next" />
              </ul>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className={`${SHELL} py-14 md:py-20`}>
        <SectionHeader
          title="Full season"
          subtitle={`${season.competition} · all kick-off times local`}
        />

        <Reveal delay={0.05}>
          <div className="flex flex-col gap-10">
            {groups.map((group) => (
              <div key={group.month}>
                <h2 className="eyebrow mb-4 text-[11px] text-brand">
                  {group.month}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.fixtures.map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      state={stateOf(fixture)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-steel">
          Fixtures as published by the {season.shortCompetition}. The league may
          adjust dates and kick-off times for broadcast, and any venue shown as
          to be confirmed will be updated once a ground is announced.
        </p>
      </section>
    </>
  );
}
