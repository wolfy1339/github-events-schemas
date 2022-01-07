# GitHub Event Schemas

> machine-readable, always up-to-date GitHub Webhooks specifications

This code is based off of the [`octokit/webhooks`](https://github.com/octokit/webhooks) repository

## How it works

This package updates itself using a daily cronjob running on GitHub Actions. The
[`index.json`](index.json) file is generated by
[`bin/octokit-events.ts`](bin/octokit-events.ts). Run
`npm run octokit-events -- --usage` for instructions. After the update is
complete, run `npm run build:webhooks`.

The update script is scraping
[GitHub’s GitHub event types](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/github-event-types)
documentation page and extracts the meta information using
[cheerio](https://www.npmjs.com/package/cheerio).

For simpler local testing and tracking of changes all loaded pages are cached in
the [`cache/`](cache/) folder.

## License

[MIT](LICENSE.md)