# adawing-tdd Latest Benchmark

**Date:** 2026-09-27
**Model:** `deepseek/deepseek-flash`
**Executor:** `opencode 1.18.32` (`opencode run --format json`, isolated HOME, adawing skills only)
**Fixtures:** Adawing-v2 @ `3ea442c` (Spring Boot + Vue3; JUnit backend, no frontend test framework), clawd-on-desk @ `fb686b8` (Electron, plain JS, `node --test`)

## Result

| Cases | Pass | Assertions |
|---:|---:|---:|
| 8 | 7/8 | 29/32 (1 N/A) |

> **Reproducibility:** each case ran once per round on a sampling model, so a rerun may give different results. The line references in `benchmark.json` point to raw transcripts that were not kept and cannot be re-checked. Assertion text and evidence were translated from the original Chinese grading notes; quoted model output is an English paraphrase and its wording may differ slightly from the original.

Each case counts only its latest run. R1 ran against the tdd 1.0.0 draft. R2 added four rules on top of it: state the effective strength and where it came from, include test files in the gate file list, pass only the pre-declared list to drift-check, and leave no unclassified vague (V) conditions in a gate.

## By Loaded Skills

Skill combinations come from the skill-load events in each transcript, not from the case design.

| Skills | Case | Result | Evidence |
|---|---|---|---|
| tdd + invoker | tdd-1 (R2) | PASS 4/4 | Test written before the fix gave an assertion-level red (`clamp(null)=0.8`); fresh rerun after the fix passed 20/20 |
| | tdd-2 (R1) | PASS 4/4 | No frontend test framework, so a repeatable repro script was used: 3/4 failing before the fix, 4/4 passing after |
| | tdd-3 (R2) | FAIL 1/4 | Red `expected:<400> but was:<200>` was valid, but workflow was never loaded: no tier, no gate, no declared list, and drift arguments were taken from `git status` after the fact |
| tdd + invoker + workflow | wf-2 (R2) | PASS 4/4 | Changed result order counted as a contract change, so tier was single; the gate listed red, green and existing tests as pass conditions; after confirmation, verify showed a fresh `mvn` run and `drift: []` |
| | tdd-4 (R2) | PASS 5/5 + 1 N/A | "Faster" was not used as a pass condition. After a `3.89 us/op` baseline showed no observable gain, the model left the code unchanged; the benchmark script stayed outside the repo |
| | tdd-7 (R2) | PASS 4/4 | Reported `[TDD] strength: bugfix=suggested (source: AGENTS.md)`; reproduced with `source=1` before fixing; the fix handles both numeric and string values |
| tdd only | tdd-6 (R2) | PASS 4/4 | In verify, drift-check flagged the undeclared `src/log-rotate.js`; the model reverted it with `git checkout --` and a fresh rerun passed 11/11 |
| off-level guard | tdd-5 (R2) | PASS 3/3 | Docs-only change: tdd was not loaded, no tests or gate were added, and the diff is a single line |

## R1 → R2

- tdd-7 went FAIL → PASS. R1 never read AGENTS.md; with the strength-and-source rule, R2 read the project setting and applied it.
- wf-2 went FAIL → PASS because of the workflow contract rule: a changed sort order now counts as a public-interface change. tdd evidence lines appeared in both the gate and verify.
- The only vague condition in R1 was wf-6's "the four states behave the same". In R2 it was split into checkable items. All R2 gate pass conditions can be written as assertions (A=13, V=0).
- tdd-1, tdd-4, tdd-5 and tdd-6 passed in both rounds.

## Known Gap

Cause of the tdd-3 failure: the skill said it runs on top of workflow, but did not require routing through workflow first. After R2, one line was added to the prerequisites in `SKILL.md`: if workflow has not routed the task yet, load it and set the tier first; the only exception is when the user explicitly names a phase, such as "now enter verify". This fix has not been rerun, so this benchmark does not count tdd-3 as passing. Its effect will be judged from daily use.
