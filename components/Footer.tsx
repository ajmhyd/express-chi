import { asset } from "fresh/runtime";

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p className="mt-3 text-center text-base text-gray-700 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl">
          Gateway traffic information courtesy of the Illinois Department of
          Transportation
        </p>
        <div className="mt-8 flex justify-center space-x-6">
          <img
            src={asset("/idotLogo.webp")}
            alt="IDOT Logo"
            width={665}
            height={170}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        </div>
        <p className="mt-8 text-center text-base text-gray-600 dark:text-gray-300">
          Made with ❤ by{" "}
          <a
            className="text-gray-700 dark:text-gray-400 underline"
            href="https://github.com/ajmhyd"
          >
            Tësh
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
