# hapwi.github.io

Personal hub for the apps and tools I open source.

Live at [hapwi.github.io](https://hapwi.github.io/). A repo shows up here only if it is listed in `catalog.json` or curated as a hosted file on this site.

## Install a tool

If a project ships an installer, the hub mirrors it:

```bash
curl -fsSL https://hapwi.github.io/install/period-space.sh | bash
```

That file is copied from the source repo on each deploy, so it stays in sync with `main`.

## Add a project

1. Make the repo public.
2. Add it to `catalog.json`:

```json
{
  "repo": "hapwi/your-tool",
  "install": "install.sh",
  "tagline": "What it does in one line."
}
```

`install` is optional. When it is set, deploy copies that script to `/install/<name>.sh`.

3. If it should also appear in a homepage group with extra routing, add it to `src/data/projects.ts`.
4. Push this repo (or run `bun run sync` locally). GitHub Pages rebuilds on push, on a daily schedule, and when another repo dispatches `hub-sync`.

See [catalog.md](catalog.md) for the full notes.

## Local

```bash
bun install
bun run sync
bun run dev
```

`sync` needs network access to GitHub. Deploy runs it automatically.
