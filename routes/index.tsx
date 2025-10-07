import { Congestion, LocalComparison } from "../components/Congestion.tsx";
import Footer from "../components/Footer.tsx";
import TravelTimeDifference from "../components/TravelTimeDifference.tsx";
import Header from "../islands/Theme.tsx";
import { Direction } from "../types.ts";
import { getData } from "../data/index.ts";

export default async function Home() {
  const { direction, travelTime, averageTravelTime, speed, level, localSpd } =
    await getData();

  return (
    <>
      <div class="flex flex-col h-screen bg-gray-200 dark:bg-gray-800">
        <Header />
        <main class="mt-10 mx-auto mb-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block xl:inline">
                {" "}
                Chicago Express Lane Status
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Up to date information on the Chicago Kennedy Express lanes
            </p>
          </div>
          {[Direction.Unknown, Direction.Closed].includes(direction) ? (
            <h1 className="text-4xl mt-4 text-center tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Status:</span>
              <span className="block text-blue-300 xl:inline">{direction}</span>
            </h1>
          ) : (
            <>
              <dl className="mt-5 grid grid-cols-1 rounded-lg bg-white dark:bg-gray-900 overflow-hidden shadow divide-y divide-gray-200 md:grid-cols-3 md:divide-y-0 md:divide-x">
                <div>
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-base font-normal  text-gray-900 dark:text-white">
                      Direction
                    </dt>
                    <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                      <div className="flex items-baseline text-2xl font-semibold text-blue-300">
                        {direction}
                      </div>
                    </dd>
                  </div>
                </div>

                <div>
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-base font-normal text-gray-900 dark:text-white">
                      Travel Time
                    </dt>
                    <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                      <div className="flex items-baseline text-2xl mr-2 font-semibold">
                        {travelTime !== null && travelTime !== undefined ? (
                          <span className="text-blue-300">
                            {travelTime.toLocaleString()} minutes
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-lg">
                            Data unavailable
                          </span>
                        )}
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          {averageTravelTime !== null &&
                          averageTravelTime !== undefined ? (
                            `${averageTravelTime.toLocaleString()} min avg`
                          ) : (
                            <span className="italic">Data unavailable</span>
                          )}
                        </span>
                      </div>

                      <TravelTimeDifference
                        travelTime={travelTime ?? null}
                        averageTravelTime={averageTravelTime ?? null}
                      />
                    </dd>
                  </div>
                </div>

                <div>
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-base font-normal text-gray-900 dark:text-white">
                      Speed
                    </dt>
                    <dd className="mt-1 flex flex-col items-baseline lg:flex-row gap-2">
                      <div className="flex text-2xl font-semibold">
                        {speed !== null && speed !== undefined ? (
                          <span className="text-blue-300">
                            {speed.toLocaleString()} MPH
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-lg">
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
                  </div>
                </div>
              </dl>
              {(travelTime === null || speed === null) && (
                <div className="mt-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <span className="font-semibold">Note:</span> Express lanes
                    may be closed or data is temporarily unavailable. Please
                    check back later.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
