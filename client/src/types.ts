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
  topPoints: number;
  gapToOvertake: number | null;
  visited: boolean;
}

export interface StoreDeposit {
  teamId: number;
  teamName: string;
  points: number;
}

export interface StoreDetail extends StoreSummary {
  deposits: StoreDeposit[];
  visited: boolean;
}

export interface FeedItem {
  id: number;
  mediaUrl: string;
  teamName: string;
  teamId: number;
  challengeName: string;
  challengeId: number;
  timestamp: string;
}

export interface ScoreEntry {
  teamId: number;
  teamName: string;
  storesControlled: number;
  unspentPoints: number;
  rank: number;
  isLeader: boolean;
}
