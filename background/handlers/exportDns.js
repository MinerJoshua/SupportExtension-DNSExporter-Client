import { fetchJson, withSessionCookie } from "../utils/fetchData.js";
import { getAllPackages, getZoneFiles } from "../utils/api-calls.js";

export async function handleExportDns(message, sender) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const allPackages = await getAllPackages(controller);
  clearTimeout(timeout);

  const jobStarted = await withSessionCookie(getZoneFiles, allPackages);

  return { status: "done" };
}
