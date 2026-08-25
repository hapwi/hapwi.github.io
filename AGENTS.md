# Agent instructions

This project uses [Vite+](https://viteplus.dev) (`vp`) with Bun as the package manager.

- Install: `vp install` (delegates to Bun)
- Dev server: `vp dev` (port 3000)
- Check: `vp check` / `vp check --fix` (Oxfmt + Oxlint + type-check)
- Test: `vp test`
- Production build: `vp run build` (includes GitHub Pages `404.html`)
- Preview: `vp preview`

`vp dev`, `vp test`, `vp check`, `vp lint`, `vp fmt`, `vp build`, and `vp preview` are builtins. Use `vp run <script>` for `package.json` scripts such as `sync`.

Do not add ESLint or Prettier. Formatting and linting live in the `fmt` and `lint` blocks in `vite.config.ts`. Import Vite config helpers from `vite-plus` and test APIs from `vite-plus/test`.

See `CLAUDE.md` for project architecture.
