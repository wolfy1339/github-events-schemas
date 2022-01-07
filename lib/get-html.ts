import got from "got";
import cheerio from "cheerio";
import prettier from "prettier";
import { State, cache } from ".";

export const getHtml = async (
  state: State & { baseUrl: string; folderName: string }
): Promise<string> => {
  const EVENTS_DOCS_URL = state.baseUrl;
  const cacheFilePath = `${state.folderName}/github-event-types.html`;

  try {
    if (state.cached) {
      return cache.read(cacheFilePath);
    }
  } catch {
    // if we can't read from the cache, continue and fetch from the source
  }

  console.log(`⌛  fetching ${EVENTS_DOCS_URL}`);

  const { body } = await got(EVENTS_DOCS_URL, {
    retry: {
      limit: 10,
      statusCodes: [503],
    },
  });
  const $ = cheerio.load(body);

  // get only the HTML we care about to avoid unnecessary cache updates
  $('[data-testid="callout"]').remove();
  const html = $("#article-contents").parent().parent().html() ?? "";

  await cache.write(cacheFilePath, prettier.format(html, { parser: "html" }));

  return html;
};
