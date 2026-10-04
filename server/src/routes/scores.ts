import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { computeStoreStatus } from "../lib/storeStatus";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  const teams = await prisma.team.findMany();
  const stores = await prisma.store.findMany({ include: { deposits: { include: { team: true } } } });

  const completionPoints = await prisma.completion.groupBy({
    by: ["teamId"],
    _sum: { challenge: false } as never,
  });

  // Sum points from completions per team
  const completionRows = await prisma.$queryRaw<{ teamId: number; total: bigint }[]>`
    SELECT c."teamId", SUM(ch."pointValue") as total
    FROM "Completion" c
    JOIN "Challenge" ch ON ch.id = c."challengeId"
    GROUP BY c."teamId"
  `;

  // Sum points from store visits (10 pts each)
  const visitRows = await prisma.$queryRaw<{ teamId: number; total: bigint }[]>`
    SELECT "teamId", COUNT(*) * 10 as total FROM "StoreVisit" GROUP BY "teamId"
  `;

  const totalEarned = new Map<number, number>();
  for (const r of completionRows) totalEarned.set(Number(r.teamId), Number(r.total));
  for (const r of visitRows) {
    totalEarned.set(Number(r.teamId), (totalEarned.get(Number(r.teamId)) ?? 0) + Number(r.total));
  }

  const storesControlled = new Map<number, number>(teams.map((t) => [t.id, 0]));
  for (const store of stores) {
    const status = computeStoreStatus(store.id, store.deposits);
    if (status.controllingTeamId != null) {
      storesControlled.set(status.controllingTeamId, (storesControlled.get(status.controllingTeamId) ?? 0) + 1);
    }
  }

  const ranked = teams
    .map((t) => ({
      teamId: t.id,
      teamName: t.name,
      storesControlled: storesControlled.get(t.id) ?? 0,
      unspentPoints: t.unspentPoints,
      totalPointsEarned: totalEarned.get(t.id) ?? 0,
    }))
    .sort((a, b) =>
      b.storesControlled !== a.storesControlled
        ? b.storesControlled - a.storesControlled
        : b.totalPointsEarned - a.totalPointsEarned
    );

  res.json(
    ranked.map((r, i) => ({
      ...r,
      rank: i + 1,
      isLeader: i === 0 && ranked.length > 0 && (r.storesControlled > 0 || r.totalPointsEarned > 0),
    }))
  );
});

router.get("/team/:id/events", async (req, res) => {
  const teamId = Number(req.params.id);
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return res.status(404).json({ error: "Team not found" });

  const [completions, visits, deposits] = await Promise.all([
    prisma.completion.findMany({
      where: { teamId },
      include: { challenge: true },
      orderBy: { timestamp: "asc" },
    }),
    prisma.storeVisit.findMany({
      where: { teamId },
      include: { store: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.storeDeposit.findMany({
      where: { teamId },
      include: { store: true },
      orderBy: { updatedAt: "asc" },
    }),
  ]);

  const events = [
    ...completions.map((c) => ({
      type: "challenge" as const,
      timestamp: c.timestamp,
      label: `Completed "${c.challenge.title}"`,
      points: c.challenge.pointValue,
    })),
    ...visits.map((v) => ({
      type: "visit" as const,
      timestamp: v.createdAt,
      label: `Checked in at ${v.store.name}`,
      points: 10,
    })),
    ...deposits.map((d) => ({
      type: "deposit" as const,
      timestamp: d.updatedAt,
      label: `Put down ${d.points} pts on ${d.store.name}`,
      points: -d.points,
    })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  res.json({ teamName: team.name, events });
});

export default router;
