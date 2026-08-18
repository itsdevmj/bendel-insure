import type { Metadata } from "next";
import { getAllFixtures } from "@/lib/fixtures-server";
import { FixturesClient } from "./fixtures-client";

export const metadata: Metadata = {
  title: "Fixtures",
};

export default async function AdminFixturesPage() {
  const fixtures = await getAllFixtures();

  return <FixturesClient fixtures={fixtures} seeded={fixtures.length > 0} />;
}
