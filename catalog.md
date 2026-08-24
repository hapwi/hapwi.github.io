# Catalog

`hapwi.github.io` only lists repos you put in `catalog.json`. Syncing does not scrape every public repo.

## Add a tool

1. Open-source the repo.
2. Add an entry to `catalog.json`:

```json
{
  "repo": "hapwi/your-tool",
  "install": "install.sh",
  "tagline": "One line about what it does."
}
```

`install` is optional. If you set it, sync copies that file to:

`https://hapwi.github.io/install/your-tool.sh`

so people can run:

```bash
curl -fsSL https://hapwi.github.io/install/your-tool.sh | bash
```

3. Push this repo (or run `bun run sync` locally). Deploy fetches live GitHub descriptions, dates, and install scripts before it builds.

Optional fields: `slug`, `name`, `description`. Everything else comes from GitHub.
