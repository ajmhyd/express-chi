import { getData } from "../../data/index.ts";

export default async function handler(_req: Request): Promise<Response> {
  const data = await getData();
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=240",
    },
  });
}
