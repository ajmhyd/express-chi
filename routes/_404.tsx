import { Head } from "fresh/runtime";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="px-4 py-8 mx-auto bg-gray-200 dark:bg-gray-800">
        <div class="max-w-(--breakpoint-md) mx-auto flex flex-col items-center justify-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
            404 - Page not found
          </h1>
          <p class="my-4 text-gray-700 dark:text-gray-300">
            The page you were looking for doesn't exist.
          </p>
          <a href="/" class="underline text-blue-600 dark:text-blue-400">
            Go back home
          </a>
        </div>
      </div>
    </>
  );
}
