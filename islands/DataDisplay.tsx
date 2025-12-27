import { useEffect, useRef, useState } from "preact/hooks";
import TravelTimeDifference from "../components/TravelTimeDifference.tsx";
import { Congestion, LocalComparison } from "../components/Congestion.tsx";
import { Direction, ExpressData } from "../types.ts";

interface DataDisplayProps {
  initialData: ExpressData;
}

export default function DataDisplay({ initialData }: DataDisplayProps) {
  const [data, setData] = useState<ExpressData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Start polling for updates (initial data already rendered server-side)
    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => fetchData(), 5 * 60 * 1000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Handle page visibility changes to pause/resume polling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Fetch fresh data when tab becomes visible again
        fetchData();
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  async function fetchData(isRetry = false) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/data", {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }
      const d: ExpressData = await res.json();
      setData(d);
      setLastUpdate(new Date());
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Data fetch error:", e);
      setError("Failed to load traffic data");

      // Retry logic with exponential backoff
      if (!isRetry) {
        const retryDelay = 2000; // 2 seconds
        retryTimeoutRef.current = setTimeout(() => fetchData(true), retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }

  const { direction, travelTime, averageTravelTime, speed, level, localSpd } =
    data;

  return (
    <>
      <div className="text-center mb-2 min-h-[2.5rem]">
        {loading && (
          <span className="text-sm text-gray-500">
            Updating traffic data...
          </span>
        )}
        {error && !loading && (
          <span className="text-sm text-red-500">
            {error} - showing cached data
          </span>
        )}
        {lastUpdate && !loading && !error && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
      {[Direction.Unknown, Direction.Closed].includes(direction)
        ? (
          <h1 className="text-4xl mt-4 text-center tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Status:</span>
            <span className="block text-blue-600 dark:text-blue-300 xl:inline">
              {direction}
            </span>
          </h1>
        )
        : (
          <>
            <div className="mt-5 grid grid-cols-1 rounded-lg bg-white dark:bg-gray-900 overflow-hidden shadow divide-y divide-gray-300 md:grid-cols-3 md:divide-y-0 md:divide-x">
              <dl className="px-4 py-5 sm:p-6">
                <dt className="text-base font-normal  text-gray-900 dark:text-white">
                  Direction
                </dt>
                <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                  <div className="flex items-baseline text-2xl font-semibold text-blue-600 dark:text-blue-300">
                    {direction}
                  </div>
                </dd>
              </dl>

              <dl className="px-4 py-5 sm:p-6">
                <dt className="text-base font-normal text-gray-900 dark:text-white">
                  Travel Time
                </dt>
                <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                  <div className="flex items-baseline text-2xl mr-2 font-semibold">
                    {travelTime !== null && travelTime !== undefined
                      ? (
                        <span className="text-blue-600 dark:text-blue-300">
                          {travelTime.toLocaleString()} minutes
                        </span>
                      )
                      : (
                        <span className="text-gray-500 dark:text-gray-400 italic text-lg">
                          Data unavailable
                        </span>
                      )}
                    {travelTime !== null && travelTime !== undefined && (
                      <span className="ml-2 text-sm font-medium text-gray-500">
                        {averageTravelTime !== null &&
                            averageTravelTime !== undefined
                          ? (
                            `${averageTravelTime.toLocaleString()} min avg`
                          )
                          : (
                            <span className="text-gray-700 italic text-lg">
                              Data unavailable
                            </span>
                          )}
                      </span>
                    )}
                  </div>

                  <TravelTimeDifference
                    travelTime={travelTime ?? null}
                    averageTravelTime={averageTravelTime ?? null}
                  />
                </dd>
              </dl>

              <dl className="px-4 py-5 sm:p-6">
                <dt className="text-base font-normal text-gray-900 dark:text-white">
                  Speed
                </dt>
                <dd className="mt-1 flex flex-col items-baseline lg:flex-row gap-2">
                  <div className="flex text-2xl font-semibold">
                    {speed !== null && speed !== undefined
                      ? (
                        <span className="text-blue-600 dark:text-blue-300">
                          {speed.toLocaleString()} MPH
                        </span>
                      )
                      : (
                        <span className="text-gray-500 dark:text-gray-400 italic text-lg">
                          Data unavailable
                        </span>
                      )}
                  </div>
                  <div className="flex flex-row flex-wrap items-center lg:justify-end gap-2">
                    <Congestion level={level ?? null} />
                    <LocalComparison
                      express={speed ?? null}
                      local={localSpd ?? null}
                    />
                  </div>
                </dd>
              </dl>
            </div>
            {(travelTime == null || speed == null) && (
              <div className="mt-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <span className="font-semibold">Note:</span>{" "}
                  Express lanes may be closed or data is temporarily
                  unavailable. Please check back later.
                </p>
              </div>
            )}
          </>
        )}
    </>
  );
}
