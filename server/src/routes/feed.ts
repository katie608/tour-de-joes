import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const { team, challenge } = req.query as { team?: string; challenge?: string };

  const where: Record<string, unknown> = { mediaUrl: { not: null } };
  if (team) where.teamId = Number(team);
  if (challenge) where.challengeId = Number(challenge);

  const completions = await prisma.completion.findMany({
    where,
    include: { team: true, challenge: true },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  res.json(
    completions.map((c) => ({
      id: c.id,
      mediaUrl: c.mediaUrl,
      teamName: c.team.name,
      teamId: c.teamId,
      challengeName: c.challenge.title,
      challengeId: c.challengeId,
      timestamp: c.timestamp,
    }))
  );
});

export default router;
