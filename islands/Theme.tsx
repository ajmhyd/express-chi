import Header from "../components/Header.tsx";
import { useEffect, useState } from "preact/hooks";

export default function Theme() {
  const [mode, setMode] = useState<"dark" | "light">("light");
  const toggleMode = (theme: "dark" | "light") => {
    setMode(theme);
    if (theme === "dark") {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
    } else {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
    }
  };
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        globalThis.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setMode("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setMode("light");
    }
  }, []);
  return <Header mode={mode} toggleMode={toggleMode} />;
}
