export interface Challenge {
  id: number;
  title: string;
  description: string;
  pointValue: number;
  mediaRequired: boolean;
  repeatable: boolean;
  repeatLimit: number | null;
  sortOrder: number;
  completedCount: number;
  isComplete: boolean;
}

export interface StoreSummary {
  id: number;
  name: string;
  location: string;
  controllingTeamName: string | null;
  controlledByMe: boolean;
  topPoints: number;
  gapToOvertake: number | null;
  visited: boolean;
}

export interface StoreDeposit {
  teamId: number;
  teamName: string;
  points: number;
  updatedAt?: string;
}

export interface StoreDetail extends StoreSummary {
  deposits: StoreDeposit[];
  visited: boolean;
  controllerSelfieUrl: string | null;
}

export interface FeedItem {
  id: string;
  mediaUrl: string;
  teamName: string;
  teamId: number;
  label: string;
  labelId: number;
  type: "challenge" | "visit";
  timestamp: string;
}

export interface ScoreEntry {
  teamId: number;
  teamName: string;
  storesControlled: number;
  unspentPoints: number;
  totalPointsEarned: number;
  rank: number;
  isLeader: boolean;
}
