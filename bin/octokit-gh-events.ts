#!/usr/bin/env ts-node-transpile-only

import yargs from "yargs";
import { checkOrUpdateEvents } from "../lib";

interface Options {
  cached: boolean;
}

const options: Record<string, yargs.Options> = {
  cached: {
    describe: "Load HTML from local cache",
    type: "boolean",
    default: false,
  },
};

const {
  cached,
  _: [command],
} = yargs
  .command("update", "Update events", (yargs) => {
    yargs.options(options).example("$0 update --cached", "");
  })
  .command("check", "Check if events are up-to-date", (yargs) => {
    yargs.options(options).example("$0 check --cached", "");
  })
  .help("h")
  .alias("h", ["help", "usage"])
  .demandCommand(1, "")
  .scriptName("bin/octokit-gh-events")
  .usage("$0 <command> [--cached]").argv as yargs.Arguments<Options>;

if (!["update", "check"].includes(command.toString())) {
  console.log(`"${command}" must be one of: update, check`);
  process.exit(1);
}

checkOrUpdateEvents({
  cached,
  checkOnly: command === "check",
}).catch((error: Error) => {
  console.log(error.stack);
  process.exit(1);
});
