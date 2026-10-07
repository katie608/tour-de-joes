import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  const [completions, visits] = await Promise.all([
    prisma.completion.findMany({
      where: { archivedAt: { not: null }, mediaUrl: { not: null } },
      include: { team: true, challenge: true },
      orderBy: { timestamp: "desc" },
    }),
    prisma.storeVisit.findMany({
      where: { archivedAt: { not: null }, mediaUrl: { not: null } },
      include: { team: true, store: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const items = [
    ...completions.map((c) => ({
      id: `c-${c.id}`,
      mediaUrl: c.mediaUrl!,
      teamName: c.team.name,
      label: c.challenge.title,
      type: "challenge" as const,
      timestamp: c.timestamp,
      gameLabel: c.gameLabel,
    })),
    ...visits.map((v) => ({
      id: `v-${v.id}`,
      mediaUrl: v.mediaUrl!,
      teamName: v.team.name,
      label: v.store.name,
      type: "visit" as const,
      timestamp: v.createdAt,
      gameLabel: v.gameLabel,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Group by gameLabel
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const key = item.gameLabel ?? "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  res.json(grouped);
});

export default router;
