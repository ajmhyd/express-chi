import { Direction, TrafficLevel } from "../types.ts";
import getSigAlertData from "./sigalert.ts";
import getTravelMidwestData from "./travelmidwest.ts";

const TIMEOUT_MS = 3_000;

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
  const sigAlertData = await getSigAlertData(); // This has more accurate direction determination
  const travelMidwestData = await getTravelMidwestData(
    sigAlertData?.direction,
  ); // This has more data

  if (
    sigAlertData &&
    travelMidwestData &&
    sigAlertData.direction !== Direction.Unknown &&
    travelMidwestData.direction !== Direction.Unknown &&
    sigAlertData.direction === travelMidwestData.direction
  ) {
    // If both have the same result (not unknown), use the travel midwest since it has more complete data
    return travelMidwestData;
  } else if (sigAlertData && sigAlertData.direction !== Direction.Unknown) {
    // Prioritize sig alert since it has more accurate direction determination
    return sigAlertData;
  } else {
    // Fall back to travel midwest if available, otherwise return unknown
    return (
      travelMidwestData ?? {
        direction: Direction.Unknown,
      }
    );
  }
}

export interface ExpressData {
  direction: Direction;
  level?: TrafficLevel | null;
  travelTime?: number | null;
  averageTravelTime?: number | null;
  speed?: number | null;
  localSpd?: number | null;
}
