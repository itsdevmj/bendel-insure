"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  deleteFixtureAction,
  type FixtureActionState,
  saveFixtureAction,
} from "@/app/admin/(dashboard)/fixtures/actions";
import { FIELD_CONTROL, Field } from "@/components/admin/field";
import { Check, ChevronDown, Pencil, Plus, Trash } from "@/components/icons";
import {
  formatFixtureDate,
  formatKickoff,
  npflClubs,
  type SeasonFixture,
} from "@/lib/fixtures";

/** Blank form values for "Add fixture". */
function emptyDraft(nextMatchday: number): SeasonFixture {
  return {
    id: "",
    matchday: nextMatchday,
    date: "",
    kickoff: "16:00",
    opponent: "",
    isHome: true,
    venue: "",
  };
}

function FixtureForm({
  draft,
  onDone,
}: {
  draft: SeasonFixture;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    FixtureActionState,
    FormData
  >(saveFixtureAction, undefined);
  const [isHome, setIsHome] = useState(draft.isHome);
  const isEdit = Boolean(draft.id);

  /* Close the form once the action reports success. */
  useEffect(() => {
    if (state?.success) onDone();
  }, [state?.success, onDone]);

  return (
    <form action={formAction} className="rounded-card bg-white p-5 md:p-6">
      <input type="hidden" name="id" value={draft.id} />
      <input type="hidden" name="is_home" value={String(isHome)} />

      <h2 className="headline text-lg text-ink uppercase">
        {isEdit ? `Edit matchday ${draft.matchday}` : "Add a fixture"}
      </h2>

      {state?.error ? (
        <p
          role="alert"
          className="mt-4 rounded-control bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Opponent" htmlFor="fixture-opponent">
          <input
            id="fixture-opponent"
            name="opponent"
            type="text"
            list="npfl-clubs"
            defaultValue={draft.opponent}
            placeholder="Who we are playing"
            className={FIELD_CONTROL}
          />
          <datalist id="npfl-clubs">
            {npflClubs.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>

        <Field
          label="Home or away"
          htmlFor="fixture-home"
          hint="Home games are listed at the Samuel Ogbemudia Stadium."
        >
          <div className="relative">
            <select
              id="fixture-home"
              value={String(isHome)}
              onChange={(event) => setIsHome(event.target.value === "true")}
              className={`${FIELD_CONTROL} appearance-none pr-11`}
            >
              <option value="true">Home</option>
              <option value="false">Away</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-steel" />
          </div>
        </Field>

        <Field label="Matchday" htmlFor="fixture-matchday">
          <input
            id="fixture-matchday"
            name="matchday"
            type="number"
            min={1}
            step={1}
            defaultValue={draft.matchday}
            className={`${FIELD_CONTROL} tabular-nums`}
          />
        </Field>

        <Field label="Date" htmlFor="fixture-date">
          <input
            id="fixture-date"
            name="match_date"
            type="date"
            defaultValue={draft.date}
            className={`${FIELD_CONTROL} tabular-nums`}
          />
        </Field>

        <Field label="Kick-off" htmlFor="fixture-kickoff">
          <input
            id="fixture-kickoff"
            name="kickoff"
            type="time"
            defaultValue={draft.kickoff}
            className={`${FIELD_CONTROL} tabular-nums`}
          />
        </Field>

        <Field
          label="Venue"
          htmlFor="fixture-venue"
          hint="Host city. Leave empty for a venue that is not confirmed."
        >
          <input
            id="fixture-venue"
            name="venue"
            type="text"
            defaultValue={draft.venue === "TBA" ? "" : draft.venue}
            placeholder="TBA"
            className={FIELD_CONTROL}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={pending}
          className="eyebrow inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-3 text-[10px] text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {isEdit ? "Save changes" : "Add fixture"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="eyebrow rounded-pill border border-ink/15 bg-white px-5 py-3 text-[10px] text-ink transition-colors hover:border-ink/30 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteFixtureDialog({ fixture }: { fixture: SeasonFixture }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteFixtureAction(fixture.id);
      ref.current?.close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={`Delete matchday ${fixture.matchday} against ${fixture.opponent}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/12 bg-white text-steel transition-colors hover:border-red-300 hover:text-red-600"
      >
        <Trash className="h-4 w-4" />
      </button>

      <dialog
        ref={ref}
        aria-labelledby={`delete-fixture-${fixture.id}`}
        className="m-auto w-[min(92vw,26rem)] rounded-card bg-white p-6 text-ink backdrop:bg-black/70"
      >
        <h2
          id={`delete-fixture-${fixture.id}`}
          className="headline text-xl text-ink uppercase"
        >
          Delete this fixture?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-steel">
          Matchday {fixture.matchday} against {fixture.opponent} will be removed
          from the fixtures page. This cannot be undone.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="eyebrow flex-1 rounded-pill bg-red-600 px-5 py-3 text-[10px] text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "Deleting…" : "Delete fixture"}
          </button>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            disabled={isPending}
            className="eyebrow flex-1 rounded-pill border border-ink/15 bg-white px-5 py-3 text-[10px] text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </dialog>
    </>
  );
}

export function FixturesClient({
  fixtures,
  seeded,
}: {
  fixtures: SeasonFixture[];
  seeded: boolean;
}) {
  const [draft, setDraft] = useState<SeasonFixture | null>(null);
  const nextMatchday =
    fixtures.reduce((max, f) => Math.max(max, f.matchday), 0) + 1;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="headline text-2xl text-ink uppercase sm:text-3xl">
            Fixtures
          </h1>
          <p className="mt-2 text-sm text-steel">
            {fixtures.length} fixture{fixtures.length === 1 ? "" : "s"} on the
            public fixtures page.
          </p>
        </div>

        {draft ? null : (
          <button
            type="button"
            onClick={() => setDraft(emptyDraft(nextMatchday))}
            className="eyebrow inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-3 text-[10px] text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Add fixture
          </button>
        )}
      </div>

      {draft ? (
        <div className="mt-6">
          <FixtureForm
            key={draft.id || "new"}
            draft={draft}
            onDone={() => setDraft(null)}
          />
        </div>
      ) : null}

      {!seeded ? (
        <p className="mt-6 rounded-card bg-white px-5 py-4 text-sm leading-relaxed text-steel">
          No fixtures in the database yet, so the public page is showing the
          published NPFL list as a fallback. Run{" "}
          <code className="font-mono text-[13px] text-ink">
            supabase/migrations/003_fixtures.sql
          </code>{" "}
          to import the season, or add fixtures by hand above.
        </p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-2.5">
        {fixtures.map((fixture) => (
          <li
            key={fixture.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card bg-white px-5 py-4"
          >
            <span className="eyebrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-smoke text-[10px] text-steel tabular-nums">
              <span className="sr-only">Matchday </span>
              {fixture.matchday}
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold text-ink">
                  {fixture.opponent}
                </span>
                <span
                  className={`eyebrow rounded-pill px-2 py-0.5 text-[9px] ${
                    fixture.isHome
                      ? "bg-brand/12 text-brand-dark"
                      : "bg-ink/8 text-ink/70"
                  }`}
                >
                  {fixture.isHome ? "Home" : "Away"}
                </span>
              </p>
              <p className="mt-1 text-xs text-steel">
                {formatFixtureDate(fixture.date)} ·{" "}
                {formatKickoff(fixture.kickoff)} ·{" "}
                {fixture.venue === "TBA" ? "Venue TBA" : fixture.venue}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDraft(fixture)}
                aria-label={`Edit matchday ${fixture.matchday} against ${fixture.opponent}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/12 bg-white text-steel transition-colors hover:border-brand/40 hover:text-brand"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <DeleteFixtureDialog fixture={fixture} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
