import { asset } from "$fresh/runtime.ts";

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Gateway traffic information courtesy of the Illinois Department of
          Transportation
        </p>
        <div className="mt-8 flex justify-center space-x-6">
          <img src={asset("/idotLogo.png")} alt="IDOT Logo" width={400} />
        </div>
        <p className="mt-8 text-center text-base text-gray-400 dark:text-gray-300">
          Made with ❤ by{" "}
          <a
            className="text-gray-500 dark:text-gray-400"
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
