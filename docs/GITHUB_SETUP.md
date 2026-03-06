# GitHub Setup Checklist

Use this checklist before election night.

## 1. Repository Variables (Actions -> Variables)

Add these repository variables from your local `.env`:

- `VITE_RESULTS_CSV_URL`
- `VITE_WARD_STATUS_CSV_URL`
- `VITE_ELECTION_STATUS_CSV_URL`
- `VITE_TURNOUT_CSV_URL`
- `VITE_RACE_CONFIG_CSV_URL`

## 2. GitHub Pages

- Settings -> Pages -> Source: `GitHub Actions`
- Confirm workflow `.github/workflows/deploy.yml` has run successfully.

## 3. Branch Protection (`main`)

Enable a branch protection rule for `main` with:

- Require a pull request before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict force pushes

Suggested required checks:

- `Security Checks / npm-audit`
- `CodeQL / Analyze (javascript-typescript)`
- `Deploy to GitHub Pages / build`

## 4. Security Features

Enable in repository settings:

- Dependabot alerts
- Dependabot security updates
- Secret scanning
- Private vulnerability reporting (if repo is public)

## 5. Actions Security

- Settings -> Actions -> General:
  - Default `GITHUB_TOKEN` permissions: `Read repository contents`
  - Allow actions from GitHub and verified creators only

## 6. Election-Night Dry Run

1. Update one test race row in Google Sheets.
2. Wait 20 seconds and confirm dashboard updates without reload.
3. Verify status transitions (`PENDING`, `COUNTING`, `REPORTED`, `FINAL`).
4. Verify winner highlighting appears only when election status is `REPORTED` or `FINAL`.
