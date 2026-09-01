import { prisma } from "../db";

export interface StoreDepositInfo {
  teamId: number;
  teamName: string;
  points: number;
}

export interface StoreStatus {
  storeId: number;
  deposits: StoreDepositInfo[];
  controllingTeamId: number | null;
  controllingTeamName: string | null;
  topPoints: number;
  /** Points the second-place team would need to overtake (topPoints - secondPlacePoints + 1), or null if no leader. */
  gapToOvertake: number | null;
}

/**
 * Determines the controlling team for a store: the team with the highest deposit total.
 * Ties are broken in favor of whichever team deposited first (lowest deposit id).
 */
export function computeStoreStatus(
  storeId: number,
  deposits: { id: number; teamId: number; points: number; team: { name: string } }[]
): StoreStatus {
  const sorted = [...deposits]
    .filter((d) => d.points > 0)
    .sort((a, b) => (b.points !== a.points ? b.points - a.points : a.id - b.id));

  const depositInfo: StoreDepositInfo[] = sorted.map((d) => ({
    teamId: d.teamId,
    teamName: d.team.name,
    points: d.points,
  }));

  if (sorted.length === 0) {
    return {
      storeId,
      deposits: depositInfo,
      controllingTeamId: null,
      controllingTeamName: null,
      topPoints: 0,
      gapToOvertake: null,
    };
  }

  const leader = sorted[0];
  const runnerUpPoints = sorted.length > 1 ? sorted[1].points : 0;

  return {
    storeId,
    deposits: depositInfo,
    controllingTeamId: leader.teamId,
    controllingTeamName: leader.team.name,
    topPoints: leader.points,
    gapToOvertake: leader.points - runnerUpPoints + 1,
  };
}

/** Returns the ids of stores currently controlled by the given team. */
export async function getControlledStoreIds(teamId: number): Promise<number[]> {
  const stores = await prisma.store.findMany({
    include: { deposits: { include: { team: true } } },
  });

  return stores
    .map((store) => computeStoreStatus(store.id, store.deposits))
    .filter((status) => status.controllingTeamId === teamId)
    .map((status) => status.storeId);
}
