import Footer from "../components/Footer.tsx";
import Header from "../islands/Theme.tsx";
import DataDisplay from "../islands/DataDisplay.tsx";
import { getData } from "../data/index.ts";

export default async function Home() {
  const initialData = await getData();

  return (
    <>
      <div class="flex flex-col h-screen bg-gray-200 dark:bg-gray-800">
        <Header />
        <main class="mt-10 mx-auto mb-auto max-w-7xl px-4">
          <div class="text-center">
            <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span class="block xl:inline">
                {" "}
                Chicago Express Lane Status
              </span>
            </h1>
            <p class="mt-3 max-w-md mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Up to date information on the Chicago Kennedy Express lanes
            </p>
          </div>
          <DataDisplay initialData={initialData} />
        </main>
        <Footer />
      </div>
    </>
  );
}
