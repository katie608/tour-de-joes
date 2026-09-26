import { Router } from "express";
import { prisma } from "../db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAdmin);

// --- Stores ---

router.get("/stores", async (_req, res) => {
  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
  res.json(stores);
});

router.post("/stores", async (req, res) => {
  const { name, location } = req.body as { name?: string; location?: string };
  if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
  const store = await prisma.store.create({ data: { name: name.trim(), location: location?.trim() ?? "" } });
  res.status(201).json(store);
});

router.delete("/stores/:id", async (req, res) => {
  const id = Number(req.params.id);
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return res.status(404).json({ error: "Store not found" });
  await prisma.store.delete({ where: { id } });
  res.json({ success: true });
});

// --- Teams ---

router.get("/teams", async (_req, res) => {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  res.json(teams.map((t) => ({ id: t.id, name: t.name, unspentPoints: t.unspentPoints, phoneNumber: t.phoneNumber })));
});

router.delete("/teams/:id", async (req, res) => {
  const id = Number(req.params.id);
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return res.status(404).json({ error: "Team not found" });
  await prisma.team.delete({ where: { id } });
  res.json({ success: true });
});

router.post("/teams/:id/reset-points", async (req, res) => {
  const id = Number(req.params.id);
  const { points } = req.body as { points?: number };
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return res.status(404).json({ error: "Team not found" });
  const newPoints = points !== undefined ? Number(points) : 0;
  if (!Number.isInteger(newPoints) || newPoints < 0) {
    return res.status(400).json({ error: "Points must be a non-negative integer" });
  }
  await prisma.team.update({ where: { id }, data: { unspentPoints: newPoints } });
  res.json({ success: true });
});

router.post("/reset-game", async (_req, res) => {
  await prisma.$transaction([
    prisma.storeVisit.deleteMany(),
    prisma.storeDeposit.deleteMany(),
    prisma.completion.deleteMany(),
    prisma.sessionToken.deleteMany(),
    prisma.team.deleteMany(),
  ]);
  res.json({ success: true });
});

// --- Store deposits ---

router.delete("/stores/:storeId/deposits/:teamId", async (req, res) => {
  const storeId = Number(req.params.storeId);
  const teamId = Number(req.params.teamId);
  const deposit = await prisma.storeDeposit.findUnique({
    where: { storeId_teamId: { storeId, teamId } },
  });
  if (!deposit) return res.status(404).json({ error: "Deposit not found" });

  await prisma.$transaction([
    prisma.storeDeposit.delete({ where: { storeId_teamId: { storeId, teamId } } }),
    prisma.team.update({ where: { id: teamId }, data: { unspentPoints: { increment: deposit.points } } }),
  ]);

  res.json({ success: true, pointsRefunded: deposit.points });
});

// --- Completions ---

router.get("/completions", async (_req, res) => {
  const completions = await prisma.completion.findMany({
    include: { team: true, challenge: true },
    orderBy: { timestamp: "desc" },
  });
  res.json(
    completions.map((c) => ({
      id: c.id,
      teamId: c.teamId,
      teamName: c.team.name,
      challengeId: c.challengeId,
      challengeTitle: c.challenge.title,
      pointValue: c.challenge.pointValue,
      timestamp: c.timestamp,
      mediaUrl: c.mediaUrl,
    }))
  );
});

router.delete("/completions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const completion = await prisma.completion.findUnique({ where: { id }, include: { challenge: true } });
  if (!completion) return res.status(404).json({ error: "Completion not found" });

  await prisma.$transaction([
    prisma.completion.delete({ where: { id } }),
    prisma.team.update({
      where: { id: completion.teamId },
      data: { unspentPoints: { decrement: completion.challenge.pointValue } },
    }),
  ]);

  res.json({ success: true });
});

export default router;
