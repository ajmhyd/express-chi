import { DOMParser } from "https://esm.sh/linkedom";
import Congestion from "../components/Congestion.tsx";
import Footer from "../components/Footer.tsx";
import TravelTimeDifference from "../components/TravelTimeDifference.tsx";
import Header from "../islands/Theme.tsx";
import { getTextContent, getUpdatedAt } from "../utils/queries.tsx";

const URL =
  "https://www.travelmidwest.com/lmiga/traveltimes.jsp?location=GATEWAY.IL.KENNEDY";

const getData = async () => {
  try {
    const response = await fetch(URL);
    return response.text();
  } catch (error) {
    console.error(error);
  }
};

export default async function Home() {
  const dataString = await getData();
  const data = new DOMParser().parseFromString(dataString);

  let direction = "Unknown";
  let travelTime = "";
  let averageTravelTime = "";
  let speed = "";
  const updatedAt = getUpdatedAt(data);
  const travelTimeIn = getTextContent(data, "[headers=travelTime2]");
  const averageTravelTimeIn = getTextContent(data, "[headers=avgTravelTime2]");
  const speedIn = getTextContent(data, "[headers=speed2]");
  const travelTimeOut = getTextContent(data, "[headers=travelTime3]");
  const averageTravelTimeOut = getTextContent(data, "[headers=avgTravelTime3]");
  const speedOut = getTextContent(data, "[headers=speed3]");

  if (travelTimeIn !== "N/A") {
    direction = "Inbound";
    travelTime = travelTimeIn;
    averageTravelTime = averageTravelTimeIn;
    speed = speedIn;
  } else if (travelTimeOut !== "N/A") {
    direction = "Outbound";
    travelTime = travelTimeOut;
    averageTravelTime = averageTravelTimeOut;
    speed = speedOut;
  }

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
          <div class="mt-8">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
              {updatedAt}
            </h3>
          </div>
          {direction === "Unknown"
            ? (
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Status:</span>
                <span className="block text-blue-300 xl:inline">Unknown</span>
              </h1>
            )
            : (
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
                      <div className="flex items-baseline text-2xl mr-2 font-semibold text-blue-300">
                        {travelTime} minutes
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          {averageTravelTime} min avg
                        </span>
                      </div>

                      <TravelTimeDifference
                        travelTime={+travelTime}
                        averageTravelTime={+averageTravelTime}
                      />
                    </dd>
                  </div>
                </div>

                <div>
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-base font-normal text-gray-900 dark:text-white">
                      Speed
                    </dt>
                    <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                      <div className="flex items-baseline text-2xl font-semibold text-blue-300">
                        {speed} mph
                      </div>
                      <Congestion speed={+speed} />
                    </dd>
                  </div>
                </div>
              </dl>
            )}
          <div class="mt-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
              *Due to recent construction it is possible for direction to be inaccurate. Please click <a class="font-extrabold" href="https://www.travelmidwest.com/lmiga/cameraReport.jsp?location=GATEWAY.IL.KENNEDY">HERE</a> to view live cameras and confirm direction.
            </h3>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
