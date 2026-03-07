# Pull Request Triage Guide

Use `scripts/pr_triage.sh` to review open PRs and optionally close low-priority ones.

## Safety-first approach

The script is intentionally conservative:

- It **keeps** PRs marked `security` or `do-not-close`.
- It recommends **close** for likely low-value items (draft + conflicted, tiny/stale, `wip`/`stale`/`duplicate` labels).
- Anything else is marked **keep** for manual review.

## Usage

```bash
export GITHUB_TOKEN=... # token with repo scope
scripts/pr_triage.sh --repo OWNER/REPO --dry-run
scripts/pr_triage.sh --repo OWNER/REPO
```

Start with `--dry-run` to verify recommendations before closing PRs.
