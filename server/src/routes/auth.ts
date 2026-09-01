import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { getControlledStoreIds } from "../lib/storeStatus";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, password, phoneNumber } = req.body as { name?: string; password?: string; phoneNumber?: string };
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Team name is required" });
  }

  const existing = await prisma.team.findFirst({ where: { name: { equals: name.trim(), mode: "insensitive" } } });
  if (existing) {
    return res.status(409).json({ error: "A team with that name already exists" });
  }

  // Normalize phone: strip non-digits then ensure E.164 (+1 prefix for US if no country code)
  let normalizedPhone: string | null = null;
  if (phoneNumber?.trim()) {
    const digits = phoneNumber.replace(/\D/g, "");
    normalizedPhone = digits.length === 10 ? `+1${digits}` : `+${digits}`;
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  const team = await prisma.team.create({
    data: { name: name.trim(), passwordHash, phoneNumber: normalizedPhone },
  });

  const session = await prisma.sessionToken.create({ data: { teamId: team.id } });
  res.status(201).json({ token: session.token, team: { id: team.id, name: team.name, unspentPoints: team.unspentPoints } });
});

router.post("/login", async (req, res) => {
  const { name, password } = req.body as { name?: string; password?: string };
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Team name is required" });
  }

  const team = await prisma.team.findFirst({ where: { name: { equals: name.trim(), mode: "insensitive" } } });
  if (!team) {
    return res.status(401).json({ error: "Team not found" });
  }

  if (team.passwordHash) {
    if (!password || !(await bcrypt.compare(password, team.passwordHash))) {
      return res.status(401).json({ error: "Incorrect password" });
    }
  }

  const session = await prisma.sessionToken.create({ data: { teamId: team.id } });
  res.json({ token: session.token, team: { id: team.id, name: team.name, unspentPoints: team.unspentPoints } });
});

router.post("/admin-login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  const session = await prisma.sessionToken.create({ data: { teamId: null } });
  res.json({ token: session.token, admin: true });
});

router.get("/me", requireAuth, async (req, res) => {
  if (req.isAdmin) {
    return res.json({ admin: true });
  }

  const team = req.team!;
  const controlledStoreIds = await getControlledStoreIds(team.id);
  res.json({
    team: {
      id: team.id,
      name: team.name,
      unspentPoints: team.unspentPoints,
      controlledStores: controlledStoreIds.length,
    },
  });
});

export default router;
