import { AppProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";

export default function App({ Component }: AppProps) {
  const code = `function global_dark() {
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove("dark");
  }
}
  global_dark();`;
  return (
    <html>
      <Head>
        <title>Express Chi | Chicago Express Lane Status</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href={asset("/favicon.ico")} />
        <script dangerouslySetInnerHTML={{ __html: code }}></script>
      </Head>
      <Component />
    </html>
  );
}
