import { Direction, TrafficLevel } from "../types.ts";
import { ExpressData, request } from "./index.ts";

const URL =
  `https://travelmidwest.com/lmiga/travelTime.json?path=GATEWAY.IL.KENNEDY`;
const PATH_BASE = `GATEWAY.IL.KENNEDY.KENNEDY`;
const PATH_BASE_REV = `${PATH_BASE} REVERSIBLE`;

// The MAIN IDs are the full express lanes (Montrose ↔ Ohio). Their travel
// time and historical average are the numbers we show. Shorter DMS segments
// can fill in speed or congestion, but not travel time.
// Segments that continue past the express lanes (O'Hare, Tower Rd, US-12)
// are ignored: their length is mostly I-94/I-90 local lanes.

const PATH_INBOUND_LOCAL = `${PATH_BASE} EB`;
const PATH_INBOUND_REV = `${PATH_BASE_REV} EB`;
const ID_INBOUND_MAIN = "IL-TESTTSC-249";
const ID_INBOUND_LOCAL = "IL-TSCDMS-EB_I_90_PULASKI_TO_OHIO_642";

const PATH_OUTBOUND_LOCAL = `${PATH_BASE} WB`;
const PATH_OUTBOUND_REV = `${PATH_BASE_REV} WB`;
const ID_OUTBOUND_MAIN = "IL-TESTTSC-250";
const ID_OUTBOUND_LOCAL = "IL-TSCDMS-WB_I_90_DAMEN_TO_MONTROSE_343";

const MAIN_IDS = new Set([ID_INBOUND_MAIN, ID_OUTBOUND_MAIN]);
// Express lanes are about 5–7 miles. Longer "Express" rows leave the reversibles.
const EXPRESS_MAX_MILES = 8;

const DIRECTION_LOCAL_MAP = {
  [Direction.Inbound]: {
    path: PATH_INBOUND_LOCAL,
    id: ID_INBOUND_LOCAL,
  },
  [Direction.Outbound]: {
    path: PATH_OUTBOUND_LOCAL,
    id: ID_OUTBOUND_LOCAL,
  },
} as const satisfies Partial<
  Record<
    Direction,
    {
      path: string;
      id: string;
    }
  >
>;

const LEVEL_RANK: Record<TrafficLevel, number> = {
  [TrafficLevel.Unknown]: 0,
  [TrafficLevel.Uncongested]: 1,
  [TrafficLevel.Light]: 2,
  [TrafficLevel.Medium]: 3,
  [TrafficLevel.Heavy]: 4,
};

interface ReportRow {
  avg: number;
  from: string;
  id: string;
  len: number;
  level: TrafficLevel;
  on: string;
  ovrAvg: boolean;
  spd: `${number}` | "N/A";
  to: string;
  tt: number;
}

export type APIResponse = Array<{
  tablePath: string;
  reportRows: ReportRow[];
  tableName: string;
}>;

function positive(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function isFullLength(row: ReportRow): boolean {
  if (MAIN_IDS.has(row.id)) return true;
  const ends = `${row.from} ${row.to}`.toLowerCase();
  return ends.includes("montrose") && ends.includes("ohio");
}

function isBeyondExpressLanes(row: ReportRow): boolean {
  const ends = `${row.from} ${row.to}`.toLowerCase();
  return ends.includes("tower") ||
    ends.includes("ohare") ||
    ends.includes("o'hare") ||
    ends.includes("us-12");
}

// Rows that describe the reversible lanes themselves, not a continuation
// onto the Edens or out to O'Hare.
function isExpressLaneRow(row: ReportRow): boolean {
  if (isBeyondExpressLanes(row)) return false;
  if (row.len > EXPRESS_MAX_MILES) return false;
  return true;
}

function rowSpeed(row: ReportRow): number | null {
  if (row.spd !== "N/A") {
    const parsed = Math.round(parseFloat(row.spd));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  // Speed is often "N/A" even when travel time and length are present.
  const tt = positive(row.tt);
  if (tt != null && row.len > 0) {
    return Math.round(row.len / (tt / 60));
  }
  return null;
}

function rowsFor(
  data: APIResponse,
  tablePath: string,
): ReportRow[] | null {
  const table = data.find((row) => row.tablePath === tablePath);
  if (!table) return null;
  return table.reportRows.filter(isExpressLaneRow);
}

function directionIsOpen(rows: ReportRow[]): boolean {
  return rows.some((row) => row.level !== TrafficLevel.Unknown);
}

function metricsFrom(rows: ReportRow[]): Pick<
  ExpressData,
  "travelTime" | "averageTravelTime" | "speed" | "level"
> {
  let travelTime: number | null = null;
  let averageTravelTime: number | null = null;
  let speed: number | null = null;
  let speedLen = -1;
  let speedIsReported = false;
  let level: TrafficLevel | null = null;

  for (const row of rows) {
    if (isFullLength(row)) {
      const tt = positive(row.tt);
      if (tt != null) {
        const rounded = Math.round(tt);
        if (travelTime == null || MAIN_IDS.has(row.id)) {
          travelTime = rounded;
        }
      }
      const avg = positive(row.avg);
      if (avg != null) {
        const rounded = Math.round(avg);
        if (averageTravelTime == null || MAIN_IDS.has(row.id)) {
          averageTravelTime = rounded;
        }
      }
    }

    const reported = row.spd !== "N/A";
    const spd = rowSpeed(row);
    const betterSpeed = spd != null && (
      (reported && !speedIsReported) ||
      (reported === speedIsReported && row.len >= speedLen)
    );
    if (betterSpeed) {
      speed = spd;
      speedLen = row.len;
      speedIsReported = reported;
    }

    if (
      row.level !== TrafficLevel.Unknown &&
      (level == null || LEVEL_RANK[row.level] > LEVEL_RANK[level])
    ) {
      level = row.level;
    }
  }

  return { travelTime, averageTravelTime, speed, level };
}

function localSpeed(
  data: APIResponse,
  direction: Direction.Inbound | Direction.Outbound,
): number | null {
  const localDataMap = DIRECTION_LOCAL_MAP[direction];
  const localData = data
    .find((row) => row.tablePath === localDataMap.path)
    ?.reportRows.find((row) => row.id === localDataMap.id);
  if (!localData || localData.spd === "N/A") return null;
  const parsed = Math.round(parseFloat(localData.spd));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function buildResult(
  data: APIResponse,
  direction: Direction.Inbound | Direction.Outbound,
): ExpressData {
  const tablePath = direction === Direction.Inbound
    ? PATH_INBOUND_REV
    : PATH_OUTBOUND_REV;
  const rows = rowsFor(data, tablePath) ?? [];
  return {
    direction,
    ...metricsFrom(rows),
    localSpd: localSpeed(data, direction),
  };
}

export async function fetchTravelMidwest(): Promise<APIResponse | null> {
  return await request<APIResponse>(URL);
}

export function parseTravelMidwest(
  data: APIResponse | null,
  knownDirection?: Direction,
): ExpressData | null {
  if (!data) return null;

  const useKnown = knownDirection === Direction.Inbound ||
    knownDirection === Direction.Outbound;
  if (useKnown) {
    // SigAlert is the direction source. Still return whatever this direction
    // has, including a historical average, when live sensors are silent.
    return buildResult(data, knownDirection);
  }

  const inboundRows = rowsFor(data, PATH_INBOUND_REV);
  const outboundRows = rowsFor(data, PATH_OUTBOUND_REV);
  if (!inboundRows || !outboundRows) {
    return { direction: Direction.Unknown };
  }

  const isInbound = directionIsOpen(inboundRows);
  const isOutbound = directionIsOpen(outboundRows);
  // Both directions reporting congestion at once means the feed is unreliable.
  if (isInbound && isOutbound) {
    return { direction: Direction.Unknown };
  }
  if (!isInbound && !isOutbound) {
    return { direction: Direction.Closed };
  }

  return buildResult(
    data,
    isInbound ? Direction.Inbound : Direction.Outbound,
  );
}

export default async function getData(
  knownDirection?: Direction,
): Promise<ExpressData | null> {
  const data = await fetchTravelMidwest();
  return parseTravelMidwest(data, knownDirection);
}
