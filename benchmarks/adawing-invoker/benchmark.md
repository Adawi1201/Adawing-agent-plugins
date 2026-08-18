# adawing-invoker Latest Benchmark

**Date:** 2026-08-19
**Executor:** Codex primary + `multi_agent_v1`
**Host:** `codex-cli 0.147.0`
**Plugin source:** current project working tree, not installed Claude plugins

## Result

| Cases | Core pass | Assertions |
|---:|---:|---:|
| 8 | 7/8 | 24/27 |

Eval 3 is the only observed failure. After finding conflicting 3000/3001 port candidates, the agent edited one README instead of pausing with evidence.

## Eval 3 Correction

After the run, the invoker ambiguity boundary was tightened: when the user indicates one target or leaves scope unclear, multiple equivalent candidates have conflicting values or behavior, and acceptance cannot identify one target, the path must be `PAUSE`. The single-file reversible exemption no longer permits choosing among those candidates. Eval 3 gained a matching regression assertion.

This is a pre-fix benchmark observation. The correction was not rerun, so this file makes no post-fix pass claim.
