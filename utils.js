export const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = "d5804ff3eb568dad8ef11e333889838c";

export const IMG = "https://image.tmdb.org";
export const POSTER_BASE = `${IMG}/t/p/w300_and_h450_bestv2`;
export const BANNER_BASE = `${IMG}/t/p/w1920_and_h800_multi_faces`;

const BASE_QUERY_PARAMS = {
  api_key: API_KEY,
  language: "pt-BR",
};

export async function load(path, queryParams) {
  const url = new URL(catUri(BASE_URL, path));

  const qp = { ...BASE_QUERY_PARAMS, ...queryParams };
  for (const [key, value] of Object.entries(qp)) {
    url.searchParams.append(key, value);
  }

  const resp = await fetch(url, {
    method: "GET",
  });
  return resp.json();
}

/**
 * @template {T}
 * @param {(page: number) => Promise<T[]>} loaderFn
 */
export function createCountedLoader(loaderFn) {
  let currentPage = 0;
  const storedEntries = [];

  async function load() {
    const entries = await loaderFn(++currentPage);
    storedEntries.push(...entries);
  }

  /**
   * @param {number} count
   * @return {Promise<T[]>}
   */
  return async function (count) {
    /** @type {T[]} */
    const final = [];
    while (final.length !== count) {
      const popped = storedEntries.pop();
      if (!popped) {
        await load();
        continue;
      }
      final.push(popped);
    }
    return final;
  };
}

export function catUri(...segments) {
  return segments.map((segment) => segment.replace(/^\/+/g, "")).join("/");
}
