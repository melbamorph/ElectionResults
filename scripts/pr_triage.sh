#!/usr/bin/env bash
set -euo pipefail

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required." >&2
  exit 1
fi

usage() {
  cat <<USAGE
Usage: $0 --repo owner/name [--dry-run]

Lists open pull requests, recommends close/keep decisions based on signals,
and closes recommended PRs when not in --dry-run mode.

Environment:
  GITHUB_TOKEN  Required for authenticated API calls.
USAGE
}

REPO=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      REPO="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$REPO" ]]; then
  echo "Error: --repo owner/name is required." >&2
  usage
  exit 1
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: GITHUB_TOKEN is not set." >&2
  exit 1
fi

api() {
  local method="$1"
  local path="$2"
  local body="${3:-}"

  if [[ -n "$body" ]]; then
    curl -fsSL -X "$method" \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com$path" \
      -d "$body"
  else
    curl -fsSL -X "$method" \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com$path"
  fi
}

recommendation_for_pr() {
  local pr_json="$1"

  local draft mergeable_state labels commits changed_files additions deletions
  draft=$(jq -r '.draft' <<<"$pr_json")
  mergeable_state=$(jq -r '.mergeable_state // "unknown"' <<<"$pr_json")
  labels=$(jq -r '[.labels[].name] | join(",")' <<<"$pr_json")
  commits=$(jq -r '.commits // 0' <<<"$pr_json")
  changed_files=$(jq -r '.changed_files // 0' <<<"$pr_json")
  additions=$(jq -r '.additions // 0' <<<"$pr_json")
  deletions=$(jq -r '.deletions // 0' <<<"$pr_json")

  # Conservative default: keep unless there are stale/low-value signals.
  if [[ "$labels" == *"do-not-close"* ]] || [[ "$labels" == *"security"* ]]; then
    echo "KEEP (important label: $labels)"
    return
  fi

  if [[ "$draft" == "true" && "$mergeable_state" == "dirty" ]]; then
    echo "CLOSE (draft + merge conflicts)"
    return
  fi

  if [[ "$commits" -le 1 && "$changed_files" -le 1 && "$additions" -le 10 && "$deletions" -le 10 ]]; then
    echo "CLOSE (tiny/stale candidate)"
    return
  fi

  if [[ "$labels" == *"wip"* ]] || [[ "$labels" == *"stale"* ]] || [[ "$labels" == *"duplicate"* ]]; then
    echo "CLOSE (wip/stale/duplicate label: $labels)"
    return
  fi

  echo "KEEP (needs human review)"
}

open_prs=$(api GET "/repos/$REPO/pulls?state=open&per_page=100")
count=$(jq 'length' <<<"$open_prs")

if [[ "$count" -eq 0 ]]; then
  echo "No open pull requests found for $REPO."
  exit 0
fi

echo "Found $count open pull request(s) in $REPO"
echo

for number in $(jq -r '.[].number' <<<"$open_prs"); do
  pr=$(api GET "/repos/$REPO/pulls/$number")
  title=$(jq -r '.title' <<<"$pr")
  author=$(jq -r '.user.login' <<<"$pr")
  rec=$(recommendation_for_pr "$pr")

  echo "#${number} - ${title} (@${author})"
  echo "Recommendation: ${rec}"

  if [[ "$rec" == CLOSE* ]]; then
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "Action: DRY RUN - would close #$number"
    else
      api PATCH "/repos/$REPO/pulls/$number" '{"state":"closed"}' >/dev/null
      echo "Action: Closed #$number"
    fi
  else
    echo "Action: Left open"
  fi

  echo
 done
