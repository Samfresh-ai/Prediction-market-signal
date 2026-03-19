import { SignalStatus } from "@prisma/client";

export type EvidenceSnapshot = {
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  trustScore: number;
  publishedAt?: Date;
  summary: string;
  relevanceScore: number;
  rawContent?: string;
  dedupeKey: string;
};

export type DetectorResult = {
  status: SignalStatus;
  currentProbability: number;
  fairProbability: number;
  edge: number;
  confidence: number;
  reasonCodes: string[];
  thesis: string;
};
