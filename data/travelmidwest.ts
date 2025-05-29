import { Direction, TrafficLevel } from "../types.ts";
import { ExpressData, request } from "./index.ts";

const URL =
  `https://www.travelmidwest.com/lmiga/travelTime.json?path=GATEWAY.IL.KENNEDY`;
const PATH_BASE = `GATEWAY.IL.KENNEDY.KENNEDY`;
const PATH_BASE_REV = `${PATH_BASE} REVERSIBLE`;

// The _MAIN IDs are for the full length of the express lanes,
// which can be used for travel time.
// The _ALL IDs are for the shorter sections of the express lanes,
// which cannot be used for travel time, but can be used for other data.

const PATH_INBOUND_LOCAL = `${PATH_BASE} EB`;
const PATH_INBOUND_REV = `${PATH_BASE_REV} EB`;
const ID_INBOUND_MAIN = "IL-TESTTSC-249";
const IDS_INBOUND_ALL = ["IL-TSCDMS-EB_I_90 Express_ADDISON_TO_OHIO_342"];
const ID_INBOUND_LOCAL = "IL-TSCDMS-EB_I_90_PULASKI_TO_OHIO_642";

const PATH_OUTBOUND_LOCAL = `${PATH_BASE} WB`;
const PATH_OUTBOUND_REV = `${PATH_BASE_REV} WB`;
const ID_OUTBOUND_MAIN = "IL-TESTTSC-250";
const IDS_OUTBOUND_ALL = ["IL-TSCDMS-WB_I_90 Express_ARMITAGE_TO_MONTROSE_341"];
const ID_OUTBOUND_LOCAL = "IL-TSCDMS-WB_I_90_DAMEN_TO_MONTROSE_343";

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

type APIResponse = Array<{
  tablePath: string;
  reportRows: ReportRow[];
  tableName: string;
}>;

function sortFn(a: ReportRow, b: ReportRow) {
  // Put ones with actual travel time first
  if (a.tt !== -1 && b.tt === -1) return -1;
  if (a.tt === -1 && b.tt !== -1) return 1;

  // Sort MAIN first
  if (a.id === ID_INBOUND_MAIN) return -1;
  if (b.id === ID_INBOUND_MAIN) return 1;

  return 0;
}

export default async function getData(
  knownDirection?: Direction,
): Promise<ExpressData | null> {
  const data = await request<APIResponse>(URL);

  const inboundDataRow = data?.find(
    (row) => row.tablePath === PATH_INBOUND_REV,
  );
  const inboundData = inboundDataRow?.reportRows
    .filter((row) => [ID_INBOUND_MAIN, ...IDS_INBOUND_ALL].includes(row.id))
    .sort(sortFn)[0];

  const outboundDataRow = data?.find(
    (row) => row.tablePath === PATH_OUTBOUND_REV,
  );
  const outboundData = outboundDataRow?.reportRows
    .filter((row) => [ID_OUTBOUND_MAIN, ...IDS_OUTBOUND_ALL].includes(row.id))
    .sort(sortFn)[0];

  const isInbound = inboundData?.level !== "Unknown" ||
    knownDirection === Direction.Inbound;
  const isOutbound = outboundData?.level !== "Unknown" ||
    knownDirection === Direction.Outbound;

  // If we are missing some data or are both inbound and outbound simultaneously, the data should be considered unreliable
  const isUnreliable = !inboundData || !outboundData ||
    (isInbound && isOutbound);

  if (isUnreliable) {
    return {
      direction: Direction.Unknown,
    };
  } else if (!isInbound && !isOutbound) {
    return {
      direction: Direction.Closed,
    };
  } else {
    const rowData = isInbound ? inboundData : outboundData;
    if (rowData) {
      const direction = isInbound ? Direction.Inbound : Direction.Outbound;
      let travelTime: number | null = null;
      let averageTravelTime: number | null = null;
      if (
        [
          ID_INBOUND_MAIN,
          ID_OUTBOUND_MAIN,
          ...IDS_OUTBOUND_ALL,
          ...IDS_INBOUND_ALL,
        ].includes(
          rowData.id,
        )
      ) {
        travelTime = rowData.tt === -1 ? null : Math.round(+rowData.tt);
        averageTravelTime = rowData.avg === -1
          ? null
          : Math.round(+rowData.avg);
      }
      const speed = rowData.spd === "N/A"
        ? null
        : Math.round(parseFloat(rowData.spd));
      const level = rowData.level;

      const localDataMap = DIRECTION_LOCAL_MAP[direction];
      const localData = data
        ?.find((row) => row.tablePath === localDataMap.path)
        ?.reportRows.find((row) => row.id === localDataMap.id);
      const localSpd = !localData || localData.spd === "N/A"
        ? null
        : Math.round(parseFloat(localData.spd));

      return {
        direction,
        travelTime,
        averageTravelTime,
        speed,
        level,
        localSpd,
      };
    }
  }

  return null;
}
