import { ExpressData, request } from "./index.ts";
import { Direction } from "../types.ts";

export interface APIData {
  speeds: Array<Array<Array<number[]> | number | null>>;
  incidents: Array<
    [
      number, // ?
      number, // ?
      string, // Local Time (HH:MM AA)
      string, // Message
      string, // Title
      number, // ?
      number, // ?
      number, // ?
      string, // Initially Posted ISO Date
      string, // Last Updated ISO Date
    ]
  >;
  cameras: Array<Array<number | string>>;
}

const MSG_BASE = "Kennedy (I-90/94) Express Lanes";
const DIRECTION_MSG_MAP = [
  {
    direction: Direction.Inbound,
    startsWith: `${MSG_BASE} West`,
  },
  {
    direction: Direction.Outbound,
    startsWith: `${MSG_BASE} East`,
  },
];

export default async function getData(): Promise<ExpressData | null> {
  const pathData = await request<{ path: string; cacheBuster: string }>(
    "https://www.sigalert.com/Data/Chicago/path.json",
  );
  if (!pathData) return null;
  const fullUrl =
    `https://www.sigalert.com/Data/${pathData.path}/ChicagoData.json?cb=${pathData.cacheBuster}`;
  const data = await request<APIData>(fullUrl);
  if (!data) return null;

  const activeDirections = DIRECTION_MSG_MAP.filter((direction) =>
    data.incidents.some(
      (data) =>
        data[3].startsWith(direction.startsWith) &&
        data[4] === "Closed",
    )
  );

  if (activeDirections.length === 0) {
    return {
      direction: Direction.Unknown,
    };
  } else if (activeDirections.length === 2) {
    return {
      direction: Direction.Closed,
    };
  } else {
    return {
      direction: activeDirections[0].direction,
    };
  }
}
