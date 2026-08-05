# Network Safety & Environment Isolation 网络安全提醒与环境隔离

Rules for outbound network activity, executing untrusted code, dependency supply chain,
and service exposure. The theme: **everything inbound is untrusted data; everything
outbound is a potential leak; every open port is an attack surface.**

> 总原则：入站的内容都不可信，出站的请求都可能泄密，监听的端口都是攻击面。

---

## 1. Outbound requests 出向网络请求

- **Default posture**: read-only GETs to known, task-relevant endpoints are GREEN.
- **RED triggers**: POST/PUT with local file contents or user data; requests to hosts
  unrelated to the task; calls with credentials in URLs; anything resembling telemetry,
  webhooks, or "log upload" (see `dangerous-patterns.md` §10).
- **URL hygiene**: verify domains character-by-character for lookalikes
  (`goggle.com`, `pypi.org` vs `pypi-mirror.example.ru`); prefer HTTPS; never
  `--insecure`/`-k`.
- **Metadata endpoints**: never query cloud metadata (`169.254.169.254`) unless the task
  is explicitly cloud-instance configuration.
  > 中文注：发出去的每个 POST 都要问自己三个问题：发给谁？带了什么？用户知道吗？

## 2. Executing untrusted code 不可信代码的沙箱执行

When the task requires running code from the internet, an issue, a package's install
scripts, or another agent's output:

1. **Read before run** — download, review, then execute. Never `curl | bash`.
2. **Isolate execution**: prefer, in order —
   - a container (`docker run --rm -v <only-needed-dir> --network none|restricted ...`),
   - a VM or remote sandbox,
   - a Python/Node virtual environment with no inherited credentials
     (`env -i` style minimal environment).
3. **Strip credentials from the sandbox**: no `.env`, SSH keys, cloud credentials, or
   browser profiles mounted into the isolation boundary.
4. **Network policy**: deny or whitelist egress for untrusted code; a package installer
   rarely needs to talk to anything but its registry.
5. **Resource limits**: timeouts and memory/CPU caps for unknown binaries — fork bombs
   and miners are real.
  > 中文注：沙箱三要素——只挂载必要目录、不带任何凭证、网络默认拒绝。

## 3. Dependency & supply chain 依赖与供应链安全

- **Pin versions**; avoid `latest` tags and floating ranges for production.
- **Official sources only**: verify package names against typosquatting
  (`requests` vs `reqeusts`, `python-dateutil` vs `python-dateuti1`); when a package is
  new/obscure, check publisher, age, and download counts before installing.
- **Inspect install scripts**: `npm` `pre/postinstall`, `setup.py` execution, native
  binary downloads — these run code at install time. Use `--ignore-scripts` when the
  scripts aren't needed (and note that doing so is a deliberate, stated choice).
- **Lockfiles**: commit and respect them (`package-lock.json`, `poetry.lock`,
  `requirements.txt` with hashes via `--require-hashes` where feasible).
- **Audit**: run `npm audit` / `pip-audit` / `govulncheck` when adding dependencies to
  projects that will ship.
  > 中文注：供应链攻击最常见的入口不是漏洞，而是"名字很像的包"和"安装脚本里藏的代码"。

## 4. Service exposure 服务暴露控制

- **Bind to localhost by default**: dev servers, databases, Redis, dashboards bind
  `127.0.0.1` unless the task requires otherwise.
- **`0.0.0.0` / public exposure is YELLOW→RED**: requires auth (password, token, SSO)
  and explicit user approval. State clearly: what is exposed, on which port, protected
  by what.
- **Never expose without auth**: database ports, admin panels (`/admin`, phpMyAdmin,
  Grafana), unauthenticated APIs, debug endpoints (`/debug`, `--inspect` for Node).
- **Inbound tunnels** (`ngrok`, `frp`, `cloudflared`): RED — they bypass NAT/firewall and
  publish local services to the internet. Confirm scope and auto-close when done.
- **Firewall awareness**: don't modify firewall rules or open security-group ports
  without explicit instruction (see bypass patterns).
- **CORS**: wildcard `Access-Control-Allow-Origin: *` combined with credentials is a
  finding worth flagging in review.
  > 中文注：开发服务默认只绑 127.0.0.1。任何"让外网能访问"的操作都要过确认门。

## 5. Environment separation 网络环境隔离

- **Keep environments apart**: never point dev/test tooling at production endpoints;
  never reuse production credentials in dev; never copy production data into dev without
  masking (see `production-playbook.md` §4).
- **Config over code**: environment selection via explicit config/env vars that are easy
  to audit — not hardcoded hostnames buried in source.
- **Segment when testing integrations**: use staging, mocks, or local emulators
  (LocalStack, in-memory DBs, mailhog) instead of live third-party accounts.
- **VPN/internal resources**: accessing internal networks requires the user's context —
  do not probe internal IP ranges or scan networks on your own initiative.
  > 中文注：环境之间要有"硬边界"——凭证不共用、数据不裸拷、端点不混指。
