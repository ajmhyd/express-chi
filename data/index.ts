import { Direction, TrafficLevel } from "../types.ts";
import getSigAlertData from "./sigalert.ts";
import getTravelMidwestData from "./travelmidwest.ts";

const TIMEOUT_MS = 3_000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const dataCache = new Map<string, { data: ExpressData; timestamp: number }>();

export async function request<T>(args: RequestInfo): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(args, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    clearTimeout(timeout);
    console.error(error);
    return null;
  }
}

export async function getData(): Promise<ExpressData> {
  const now = Date.now();
  const cached = dataCache.get("main");
  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return cached.data;
  }

  const [sigAlertData, travelMidwestData] = await Promise.all([
    getSigAlertData(), // This has more accurate direction determination
    getTravelMidwestData(), // This has more data
  ]);

  let result: ExpressData;
  if (
    sigAlertData &&
    travelMidwestData &&
    sigAlertData.direction !== Direction.Unknown &&
    travelMidwestData.direction !== Direction.Unknown &&
    sigAlertData.direction === travelMidwestData.direction
  ) {
    // If both have the same result (not unknown), use the travel midwest since it has more complete data
    result = travelMidwestData;
  } else if (sigAlertData && sigAlertData.direction !== Direction.Unknown) {
    // Prioritize sig alert since it has more accurate direction determination
    // If travelMidwest has additional data, merge it with sigAlert direction
    if (
      travelMidwestData && travelMidwestData.direction !== Direction.Unknown
    ) {
      result = {
        ...travelMidwestData,
        direction: sigAlertData.direction,
      };
    } else {
      result = sigAlertData;
    }
  } else {
    // Fall back to travel midwest if available, otherwise return unknown
    result = travelMidwestData ?? {
      direction: Direction.Unknown,
    };
  }

  dataCache.set("main", { data: result, timestamp: now });
  return result;
}

export interface ExpressData {
  direction: Direction;
  level?: TrafficLevel | null;
  travelTime?: number | null;
  averageTravelTime?: number | null;
  speed?: number | null;
  localSpd?: number | null;
}
