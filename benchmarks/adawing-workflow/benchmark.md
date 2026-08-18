# adawing-workflow Latest Benchmark

**Date:** 2026-08-19
**Executor:** Codex primary + `multi_agent_v1`
**Host:** `codex-cli 0.147.0`
**Plugin source:** current project working tree, not installed Claude plugins

## Result

| Cases | Core pass | Phase note |
|---:|---:|---|
| 7 | 7/7 | Eval 2 review/verify deferred because no gate confirmation turn was supplied |

Workflow routing, preview selection, single-gate behavior, verification-state honesty, and dependency blocking were observed as intended. Eval 2's deferred post-gate phases are expected behavior, not a failure.
