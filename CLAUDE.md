# Claude Code

Read and follow **[`AGENTS.md`](./AGENTS.md)** — it is the canonical project guide for all agents.

Claude-specific notes:

- Prefer editing focused files under `src/`; keep schedule dosing in `src/data/schedule.ts` at 2560 seconds
- After non-trivial logic changes, run `npm test && npm run build`
- Specs/plans live in `docs/superpowers/` for multi-session resume
