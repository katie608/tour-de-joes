import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { computeStoreStatus } from "../lib/storeStatus";
import { sendSms } from "../lib/sms";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const teamId = req.team?.id;
  const stores = await prisma.store.findMany({
    include: {
      deposits: { include: { team: true } },
      visits: teamId ? { where: { teamId } } : false,
    },
    orderBy: { createdAt: "asc" },
  });

  const result = stores.map((store) => {
    const status = computeStoreStatus(store.id, store.deposits);
    return {
      id: store.id,
      name: store.name,
      location: store.location,
      controllingTeamName: status.controllingTeamName,
      topPoints: status.topPoints,
      gapToOvertake: status.gapToOvertake,
      visited: teamId ? (store.visits as { teamId: number }[]).length > 0 : false,
    };
  });

  res.json(result);
});

router.get("/:id", async (req, res) => {
  const teamId = req.team?.id;
  const storeId = Number(req.params.id);
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      deposits: { include: { team: true } },
      visits: teamId ? { where: { teamId } } : false,
    },
  });
  if (!store) return res.status(404).json({ error: "Store not found" });

  const status = computeStoreStatus(store.id, store.deposits);
  res.json({
    id: store.id,
    name: store.name,
    location: store.location,
    deposits: status.deposits,
    controllingTeamName: status.controllingTeamName,
    topPoints: status.topPoints,
    gapToOvertake: status.gapToOvertake,
    visited: teamId ? (store.visits as { teamId: number }[]).length > 0 : false,
  });
});

router.post("/:id/visit", async (req, res) => {
  if (!req.team) {
    return res.status(403).json({ error: "Only teams can check in" });
  }

  const storeId = Number(req.params.id);
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return res.status(404).json({ error: "Store not found" });

  const existing = await prisma.storeVisit.findUnique({
    where: { storeId_teamId: { storeId, teamId: req.team.id } },
  });
  if (existing) {
    return res.status(409).json({ error: "Already checked in to this store" });
  }

  await prisma.$transaction([
    prisma.storeVisit.create({ data: { storeId, teamId: req.team.id } }),
    prisma.team.update({ where: { id: req.team.id }, data: { unspentPoints: { increment: 10 } } }),
  ]);

  res.status(201).json({ visited: true, pointsAwarded: 10 });
});

router.post("/", async (req, res) => {
  const { name, location } = req.body as { name?: string; location?: string };
  if (!name?.trim() || !location?.trim()) {
    return res.status(400).json({ error: "Store name and location are required" });
  }
  if (!req.team) {
    return res.status(403).json({ error: "Only teams can add stores" });
  }

  const store = await prisma.store.create({
    data: { name: name.trim(), location: location.trim(), addedByTeamId: req.team.id },
  });

  res.status(201).json(store);
});

router.post("/:id/deposit", async (req, res) => {
  if (!req.team) {
    return res.status(403).json({ error: "Only teams can deposit points" });
  }

  const { points } = req.body as { points?: number };
  const amount = Number(points);
  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ error: "points must be a positive integer" });
  }

  const storeId = Number(req.params.id);
  const storeWithDeposits = await prisma.store.findUnique({
    where: { id: storeId },
    include: { deposits: { include: { team: true } } },
  });
  if (!storeWithDeposits) return res.status(404).json({ error: "Store not found" });

  const team = await prisma.team.findUnique({ where: { id: req.team.id } });
  if (!team || team.unspentPoints < amount) {
    return res.status(400).json({ error: "Not enough unspent points" });
  }

  // Snapshot controller before deposit
  const prevStatus = computeStoreStatus(storeId, storeWithDeposits.deposits);
  const prevControllerId = prevStatus.controllingTeamId;

  await prisma.$transaction([
    prisma.team.update({
      where: { id: team.id },
      data: { unspentPoints: { decrement: amount } },
    }),
    prisma.storeDeposit.upsert({
      where: { storeId_teamId: { storeId, teamId: team.id } },
      create: { storeId, teamId: team.id, points: amount },
      update: { points: { increment: amount } },
    }),
  ]);

  const updatedStore = await prisma.store.findUnique({
    where: { id: storeId },
    include: { deposits: { include: { team: true } } },
  });
  const status = computeStoreStatus(storeId, updatedStore!.deposits);

  // Notify the displaced team if control changed hands
  if (
    prevControllerId !== null &&
    prevControllerId !== team.id &&
    status.controllingTeamId === team.id
  ) {
    const displaced = await prisma.team.findUnique({ where: { id: prevControllerId } });
    if (displaced?.phoneNumber) {
      sendSms(
        displaced.phoneNumber,
        `Your team "${displaced.name}" just lost control of ${storeWithDeposits.name} to "${team.name}"! Get back in the game 🛒`
      );
    }
  }

  res.json({
    deposits: status.deposits,
    controllingTeamName: status.controllingTeamName,
    topPoints: status.topPoints,
    gapToOvertake: status.gapToOvertake,
    unspentPoints: team.unspentPoints - amount,
  });
});

export default router;
