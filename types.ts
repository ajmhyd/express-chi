export const enum TrafficLevel {
  Uncongested = "Uncongested",
  Light = "Light",
  Medium = "Medium",
  Heavy = "Heavy",
  Unknown = "Unknown",
}

export const enum Direction {
  Unknown = "Unknown",
  Inbound = "Inbound",
  Outbound = "Outbound",
  Closed = "Closed",
}

export interface ExpressData {
  direction: Direction;
  level?: TrafficLevel | null;
  travelTime?: number | null;
  averageTravelTime?: number | null;
  speed?: number | null;
  localSpd?: number | null;
}
