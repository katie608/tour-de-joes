import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { computeStoreStatus } from "../lib/storeStatus";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  const teams = await prisma.team.findMany();
  const stores = await prisma.store.findMany({ include: { deposits: { include: { team: true } } } });

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
    }))
    .sort((a, b) =>
      b.storesControlled !== a.storesControlled
        ? b.storesControlled - a.storesControlled
        : b.unspentPoints - a.unspentPoints
    );

  res.json(
    ranked.map((r, i) => ({
      ...r,
      rank: i + 1,
      isLeader: i === 0 && ranked.length > 0 && (r.storesControlled > 0 || r.unspentPoints > 0),
    }))
  );
});

export default router;
