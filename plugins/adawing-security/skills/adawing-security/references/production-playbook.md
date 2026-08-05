# Production Environment Playbook 生产环境行动准则

Operational rules for working on (or near) production systems: how to recognize the
environment, back up before touching anything, handle secrets end-to-end, and keep private
data isolated.

> 总原则：在生产环境，每一次变更都是一次小型发布——先识别环境、先备份、小步快走、
> 每步验证、随时可回滚。

---

## 1. Environment detection 环境识别

Never assume. Before any non-read-only action, determine the environment from evidence:

- **Config files**: `config/*.yml`, `.env*`, `settings.py`, `application.properties` —
  look for `prod`/`production` hostnames, domains, DB names.
- **Connection strings**: production DB hosts, ports, cluster names, cloud endpoints
  (e.g., `*.rds.amazonaws.com`, managed Redis/Kafka URLs).
- **CI/CD context**: `CI=true`, branch name (`main`/`release/*`), deployment targets in
  pipeline files (`.github/workflows`, `.gitlab-ci.yml`).
- **Hostname/cloud metadata**: machine hostnames like `prod-*`, `*-db-01`.
- **Ambiguity rule**: if evidence is absent or conflicting, ask the user — and until
  answered, treat the environment as production.
  > 中文注：判断不了就当生产环境处理。宁可被嫌啰嗦，不可心存侥幸。

Read-only diagnostics (`status`, `SELECT` counts, log tailing) are GREEN even in
production and should always be the first step.

---

## 2. Backup protocol 备份协议

Mandatory before: overwriting files not in git, DB migrations/deletes, config changes in
production, batch edits, dependency upgrades with lockfile rewrites.

- **Files**: `cp -a target target.bak-$(date +%Y%m%d-%H%M%S)` — timestamped, same
  directory, so restoration is one `mv` away.
- **Databases**: take a dump scoped to what you will touch:
  - PostgreSQL: `pg_dump -Fc -t <table> dbname > backup-$(date +%F).dump`
  - MySQL: `mysqldump --single-transaction dbname table > backup-$(date +%F).sql`
  - SQLite: `cp db.sqlite db.sqlite.bak-<timestamp>` (it's just a file)
- **Directories**: `tar czf backup-<ts>.tgz <dir>` before bulk changes.
- **Always report**: backup location + restore command in the same message where you
  announce the change. A backup the user can't find is not a backup.
- **Verify non-trivial backups** (file exists, size > 0, dump header readable) before
  proceeding to the destructive step.
  > 中文注：备份和恢复命令要一起给出。只备份不验证等于没备份。

---

## 3. Secret leak response runbook 密钥泄漏处置流程

Triggered when you find a credential in code, config, git history, logs, or chat —
whether by scan (`scripts/scan_secrets.py`) or by accident.

1. **Report without quoting**: file:line and secret type only. Never echo the value.
2. **Assess exposure**: is it committed? pushed to a remote? in a public repo? in logs or
   CI artifacts? Each wider ring raises urgency.
3. **Rotate first, then remove**: a live key deleted before rotation breaks the running
   system. Guide the user: revoke/regenerate at the provider → deploy the new secret via
   proper channels (env vars, secret manager) → then purge.
4. **Purge from code**: replace with env-var reads or secret-manager references; add the
   file to `.gitignore`.
5. **Purge from history (only after rotation)**: `git filter-repo` / BFG. Warn that this
   rewrites history and requires force-push (itself a RED action requiring confirmation).
6. **Check blast radius**: CI logs, artifacts, container images, chat transcripts, docs.
7. **Prevent recurrence**: recommend `scan_secrets.py` as a pre-commit hook and a
   `.gitignore` review.
  > 中文注：顺序是"先轮换，后清除"。直接删 key 而服务还在用，等于自己制造故障。

### Prevention checklist 预防清单
- `.env` and credential files in `.gitignore` before first commit.
- Provide `.env.example` with placeholder values, never real ones.
- Secrets via environment variables / secret managers (Vault, SSM, Doppler) — never in
  source, tests, fixtures, or comments.
- Run `scripts/scan_secrets.py --staged` before every commit/push; wire it into
  `pre-commit` where the project allows.

---

## 4. Privacy & PII isolation 隐私参数隔离

- **Keep PII out of artifacts**: generated reports, logs, screenshots, test fixtures, and
  error messages must not contain names, ID numbers, phone numbers, addresses, emails of
  real users unless the user explicitly requires real data (and then, prefer masked).
- **Synthetic data by default**: fixtures and demos use fabricated values
  (`user1@example.com`, `138****0000`-style masks).
- **No unapproved egress**: sending local files, DB rows, or user records to external
  endpoints — including "helpful" telemetry, webhook debugging, or third-party APIs — is
  RED and needs explicit approval naming destination and data scope.
- **Prompt hygiene**: when calling external model/API services, minimize included PII and
  secrets; prefer identifiers over raw records.
- **Log redaction**: when configuring logging, exclude authorization headers, cookies,
  request bodies, and connection strings.
  > 中文注：隐私数据的原则是"最小化流转"——能不离开本地就不离开，能脱敏就脱敏，
  > 能用假数据就不用真数据。

---

## 5. Production change discipline 生产变更纪律

1. Announce the plan and expected effect before acting (YELLOW protocol, escalated).
2. One change at a time; verify after each step before the next.
3. Keep the rollback path open until verification passes (backup intact, old version
   restorable, feature flag off-switch ready).
4. Prefer reversible mechanisms: feature flags, blue-green/canary deploys, config changes
   over code changes.
5. Record what was done, when, and how to undo it — in the transcript, plainly.
6. If something goes wrong mid-change: stop, report state honestly (what succeeded, what
   failed, what's half-applied), and propose rollback vs. roll-forward. Never silently
   retry destructive steps.
  > 中文注：出问题时最忌讳"静默重试"。如实报告现场状态，是回滚决策的前提。
