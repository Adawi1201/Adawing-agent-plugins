#!/usr/bin/env python3
"""
scan_secrets.py — 密钥泄漏扫描器 (part of adawing-security)

Scan files, directories, or git-staged changes for common secret patterns.
Reports LOCATION and TYPE only — never prints the secret value itself
(the transcript is also a persistent store).

Usage:
    python3 scan_secrets.py <path> [<path> ...]   # scan files/dirs
    python3 scan_secrets.py --staged              # scan git staged changes
    python3 scan_secrets.py --staged --strict     # also flag high-entropy strings

Exit code: 0 = clean, 1 = findings, 2 = usage/environment error.
"""

import os
import re
import subprocess
import sys
import math

# ---------------------------------------------------------------------------
# Pattern library: (name, compiled regex)
# Keep patterns specific to avoid drowning the user in false positives.
# ---------------------------------------------------------------------------
PATTERNS = [
    ("AWS Access Key ID", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("AWS Secret Access Key", re.compile(r"(?i)aws.{0,20}secret.{0,10}['\"][0-9a-zA-Z/+]{40}['\"]")),
    ("GitHub Token", re.compile(r"\b(ghp|gho|ghu|ghs|ghr)_[0-9a-zA-Z]{36,}\b")),
    ("GitHub fine-grained PAT", re.compile(r"\bgithub_pat_[0-9a-zA-Z_]{82}\b")),
    ("GitLab PAT", re.compile(r"\bglpat-[0-9a-zA-Z\-_]{20,}\b")),
    ("OpenAI API Key", re.compile(r"\bsk-(proj-)?[0-9a-zA-Z\-_]{32,}\b")),
    ("Anthropic API Key", re.compile(r"\bsk-ant-[0-9a-zA-Z\-_]{32,}\b")),
    ("Moonshot API Key", re.compile(r"\bsk-[0-9a-zA-Z]{48}\b")),
    ("Slack Token", re.compile(r"\bxox[baprs]-[0-9a-zA-Z\-]{10,}\b")),
    ("Stripe Key", re.compile(r"\b[sr]k_(live|test)_[0-9a-zA-Z]{16,}\b")),
    ("Google API Key", re.compile(r"\bAIza[0-9A-Za-z\-_]{35}\b")),
    ("Private Key Block", re.compile(r"-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----")),
    ("JWT", re.compile(r"\beyJ[0-9A-Za-z\-_]{10,}\.[0-9A-Za-z\-_]{10,}\.[0-9A-Za-z\-_]{5,}\b")),
    ("Generic API Key Assignment", re.compile(
        r"(?i)\b(api[_-]?key|access[_-]?key|secret[_-]?key|auth[_-]?token|client[_-]?secret)\b"
        r"\s*[:=]\s*['\"][0-9a-zA-Z\-_/.+]{16,}['\"]")),
    ("Generic Password Assignment", re.compile(
        r"(?i)\b(password|passwd|pwd)\b\s*[:=]\s*['\"][^'\"]{8,}['\"]")),
    ("Connection String with Password", re.compile(
        r"(?i)\b(mysql|postgres(ql)?|mongodb(\+srv)?|redis|amqp)://[^:\s]+:[^@\s]+@")),
]

SENSITIVE_FILENAMES = re.compile(
    r"(^|/)(\.env(\..+)?|id_rsa|id_ed25519|.*\.pem|.*\.key|credentials|\.npmrc|\.pypirc|"
    r"\.netrc|kubeconfig|.*\.keystore|.*\.jks)$")

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", ".next"}
BINARY_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip", ".gz",
                     ".tar", ".whl", ".so", ".dll", ".exe", ".bin", ".class", ".jar",
                     ".mp3", ".mp4", ".woff", ".woff2", ".ttf", ".eot"}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MiB


def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    return -sum((c / len(s)) * math.log2(c / len(s)) for c in freq.values())


def looks_high_entropy(token: str) -> bool:
    """Heuristic for --strict mode: long, mixed-charset, high-entropy token."""
    if len(token) < 24 or len(token) > 128:
        return False
    classes = sum([
        any(c.islower() for c in token),
        any(c.isupper() for c in token),
        any(c.isdigit() for c in token),
        any(not c.isalnum() for c in token),
    ])
    return classes >= 3 and shannon_entropy(token) > 4.2


def is_probably_placeholder(text: str) -> bool:
    markers = ["your_", "your-", "xxx", "changeme", "change_me", "placeholder",
               "example", "sample", "dummy", "fake", "test-key", "<", "redacted",
               "****", "1234abcd", "0000"]
    low = text.lower()
    return any(m in low for m in markers)


def iter_files(paths):
    for p in paths:
        if os.path.isfile(p):
            yield p
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                for f in files:
                    yield os.path.join(root, f)
        else:
            print(f"[warn] path not found: {p}", file=sys.stderr)


def staged_files():
    try:
        out = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"],
            capture_output=True, text=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[error] not a git repo or git unavailable", file=sys.stderr)
        sys.exit(2)
    files = [f for f in out.stdout.splitlines() if f.strip()]
    # For staged content, read from the index, not the worktree
    contents = {}
    for f in files:
        try:
            blob = subprocess.run(["git", "show", f":{f}"],
                                  capture_output=True, text=True, check=False)
            contents[f] = blob.stdout
        except Exception:
            pass
    return contents


def scan_text(path, text, findings, strict=False):
    # sensitive filename check
    norm = path.replace("\\", "/")
    if SENSITIVE_FILENAMES.search(norm):
        findings.append((path, 0, "Sensitive file committed/present (check .gitignore)"))
    for lineno, line in enumerate(text.splitlines(), 1):
        for name, rx in PATTERNS:
            m = rx.search(line)
            if m and not is_probably_placeholder(m.group(0)):
                findings.append((path, lineno, name))
        if strict:
            for token in re.findall(r"[0-9a-zA-Z\-_/.+=]{24,128}", line):
                if looks_high_entropy(token) and not is_probably_placeholder(token):
                    findings.append((path, lineno, "High-entropy string (possible secret)"))
                    break  # one per line is enough


def scan_paths(paths, strict=False):
    findings = []
    for path in iter_files(paths):
        ext = os.path.splitext(path)[1].lower()
        if ext in BINARY_EXTENSIONS:
            continue
        try:
            if os.path.getsize(path) > MAX_FILE_SIZE:
                continue
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                scan_text(path, fh.read(), findings, strict)
        except OSError:
            continue
    return findings


def main():
    args = sys.argv[1:]
    strict = "--strict" in args
    args = [a for a in args if a != "--strict"]

    if "--staged" in args:
        contents = staged_files()
        findings = []
        for path, text in contents.items():
            scan_text(path, text, findings, strict)
    elif args:
        findings = scan_paths(args, strict)
    else:
        print(__doc__)
        sys.exit(2)

    if findings:
        print(f"SECRET SCAN: {len(findings)} potential finding(s) — values intentionally hidden:\n")
        for path, lineno, name in findings:
            loc = f"{path}:{lineno}" if lineno else path
            print(f"  ⚠️  {loc}  [{name}]")
        print("\nRecommended: rotate exposed credentials first, then purge. "
              "See references/production-playbook.md §3.")
        sys.exit(1)
    print("SECRET SCAN: clean — no secret patterns found.")
    sys.exit(0)


if __name__ == "__main__":
    main()
