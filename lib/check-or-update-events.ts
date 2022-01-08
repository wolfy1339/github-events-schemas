import { writeFileSync, readFileSync } from "fs";
import { diff, diffString } from "json-diff";
import prettier from "prettier";
import {
  State,
  getActionsAndExamplesFromPayloads,
  getHtml,
  getSections,
  toEvent,
} from ".";

const isNotNull = <T>(value: T | null): value is T => value !== null;

// https://stackoverflow.com/a/44280814/3411410
function toSnakeCase(str: string) {
  return str.split(/(?=[A-Z])/).join('_').toLowerCase();
}

export const checkOrUpdateEvents = async ({
  cached,
  checkOnly,
}: State): Promise<void> => {
  const [baseUrl, folderName] = [
    "https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/events/github-event-types",
    "api.github.com",
  ];

  const currentEvents = JSON.parse(
    readFileSync(`./payload-examples/${folderName}/index.json`).toString()
  );
  const html = await getHtml({ cached, baseUrl, folderName });
  const sections = getSections(html);
  const eventsFromScrapingDocs = sections.map(toEvent).filter(isNotNull);
  const eventsFromPayloadExamplesByName =
    getActionsAndExamplesFromPayloads(folderName);

  const events = eventsFromScrapingDocs.map((event) => {
    const name = event.name;
    const snakeCaseName = toSnakeCase(name.replace("Event", ""));

    if (!(snakeCaseName in eventsFromPayloadExamplesByName)) {
      console.warn(`[${folderName}] No payload examples for ${name}`);

      return event;
    }

    const eventFromPayloadExamples =
      eventsFromPayloadExamplesByName[snakeCaseName];

    return {
      name,
      description: event.description,
      actions: Array.from(
        new Set(event.actions.concat(eventFromPayloadExamples.actions))
      ),
      properties: event.properties,
      examples: event.examples.concat(eventFromPayloadExamples.examples),
    };
  });

  if (!diff(currentEvents, events)) {
    console.log(`✅  webhooks ${folderName} are up-to-date`);

    return;
  }

  console.log(`❌  webhooks ${folderName} are not up-to-date`);
  console.log(diffString(currentEvents, events));

  if (checkOnly) {
    process.exitCode = 1;

    return;
  }

  writeFileSync(
    `./payload-examples/${folderName}/index.json`,
    prettier.format(JSON.stringify(events), { parser: "json" })
  );
  console.log(`✏️  ${folderName}/index.json, written`);
};
