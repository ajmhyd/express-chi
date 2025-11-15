import { getData } from "../../data/index.ts";

export default async function handler(_req: Request) {
  const data = await getData();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
