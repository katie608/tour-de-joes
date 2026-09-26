import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const { team } = req.query as { team?: string };

  const completionWhere: Record<string, unknown> = { mediaUrl: { not: null } };
  const visitWhere: Record<string, unknown> = { mediaUrl: { not: null } };
  if (team) {
    completionWhere.teamId = Number(team);
    visitWhere.teamId = Number(team);
  }

  const [completions, visits] = await Promise.all([
    prisma.completion.findMany({
      where: completionWhere,
      include: { team: true, challenge: true },
      orderBy: { timestamp: "desc" },
      take: 100,
    }),
    prisma.storeVisit.findMany({
      where: visitWhere,
      include: { team: true, store: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const items = [
    ...completions.map((c) => ({
      id: `c-${c.id}`,
      mediaUrl: c.mediaUrl!,
      teamName: c.team.name,
      teamId: c.teamId,
      label: c.challenge.title,
      labelId: c.challengeId,
      type: "challenge" as const,
      timestamp: c.timestamp,
    })),
    ...visits.map((v) => ({
      id: `v-${v.id}`,
      mediaUrl: v.mediaUrl!,
      teamName: v.team.name,
      teamId: v.teamId,
      label: v.store.name,
      labelId: v.storeId,
      type: "visit" as const,
      timestamp: v.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(items);
});

export default router;
