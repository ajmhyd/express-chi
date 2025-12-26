import { PageProps } from "fresh";
import { asset, Head } from "fresh/runtime";

export default function App({ Component }: PageProps) {
  const code = `function global_dark() {
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove("dark");
  }
}
  global_dark();`;
  return (
    <html lang="en">
      <Head>
        <title>Express Chi | Chicago Express Lane Status</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Up-to-date traffic information for the Chicago Kennedy Express Lanes, including real-time congestion levels, travel times, and speeds."
        />
        <link rel="icon" href={asset("/favicon.ico")} />
        <link rel="stylesheet" href="/styles.css" />
        <script dangerouslySetInnerHTML={{ __html: code }}></script>
      </Head>
      <Component />
    </html>
  );
}
