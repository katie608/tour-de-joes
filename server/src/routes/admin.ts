import { Router } from "express";
import { prisma } from "../db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAdmin);

router.delete("/stores/:id", async (req, res) => {
  const id = Number(req.params.id);
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return res.status(404).json({ error: "Store not found" });

  await prisma.store.delete({ where: { id } });
  res.json({ success: true });
});

router.delete("/teams/:id", async (req, res) => {
  const id = Number(req.params.id);
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return res.status(404).json({ error: "Team not found" });

  await prisma.team.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
