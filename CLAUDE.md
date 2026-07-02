# wqo-components — Project Notes

## What this repo is

Preact component library that provides UI components for `quartz-site` (the deployed WQO ontology browser). Built with `tsup`.

## Build

```bash
npm run build    # compiles src/ → dist/ via tsup
```

Output: `dist/index.js` + `dist/index.d.ts`

## Critical: CI lock dependency

`quartz-site` resolves this library from `github:ghoulmann/wqo-components` pinned at a specific commit in `quartz-site/quartz.lock.json`. Current pin: `a0b3b25`.

**Local changes here are invisible to CI until:**
1. Changes are pushed to `ghoulmann/wqo-components` on GitHub
2. `quartz-site/quartz.lock.json` is updated to reference the new commit hash
3. The lock update is committed and pushed to `quartz-site`

Do not assume a local `npm run build` is enough — CI will still use the pinned commit.

## Ecosystem position

This is a dependency of `quartz-site` only. It has no upstream schema relationship to `wqo/` directly — components are display logic, not schema logic.

Full ecosystem context: `~/Documents/github/wqo/.notes/ecosystem.md`
