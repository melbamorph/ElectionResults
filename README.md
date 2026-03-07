# Election Results Dashboard

Static municipal election-night dashboard with fictional default branding for demo and template use.

- Frontend only: React + Vite + Tailwind CSS
- Data source: published Google Sheets CSV tabs
- Hosting target: GitHub Pages
- Refresh model: automatic polling every 20 seconds (no page reload)

## 1. Local Setup

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Copy environment file:

```bash
cp .env.example .env
```

4. Set your dashboard location theme in `.env` (optional):

```bash
VITE_THEME_LOCATION=City of Mos Eisley, Tatooine
```

5. Start local dev server:

```bash
npm run dev
```

By default, `.env.example` points to `public/mock/*.csv` for offline/local testing.

## 2. Google Sheet Integration

Publish each tab to CSV from Google Sheets and set these env vars:

- `VITE_RESULTS_CSV_URL`
- `VITE_WARD_STATUS_CSV_URL`
- `VITE_ELECTION_STATUS_CSV_URL`
- `VITE_TURNOUT_CSV_URL`
- `VITE_RACE_CONFIG_CSV_URL`

Optional security env vars:

- `VITE_ALLOWED_CSV_HOSTS` (default: `docs.google.com,googleusercontent.com`)
- `VITE_ALLOW_ANY_CSV_HOST` (default: `false`; set to `true` only for trusted non-Google hosts)

### Required CSV Schemas

`results.csv`

```csv
election,race,ward,candidate,votes
```

Optional `results.csv` column (office races only):

```csv
write_in_winner_name
```

- Keep the `candidate` value as `Write-Ins` (or `Write In`) and enter the total in `votes`.
- If that write-in line is a called winner, set `write_in_winner_name` to display the winner's name.
- Office races always render a `Write-Ins` line (defaulting to `0` when no row is provided).

`ward_status.csv`

```csv
ward,status
```

`election_status.csv`

```csv
election,status
```

`turnout.csv`

```csv
election,ward,ballots_counted,registered_voters
```

`race_config.csv`

```csv
election,race,race_type,race_group,scope,ward,seats,sort_order,show_in_key_races,enabled
```

### Status Values

- `PENDING`
- `COUNTING`
- `REPORTED`
- `FINAL`

### Notes

- `race_config.csv` is authoritative for race order, race type, seat count, and key-race flags.
- `race_group` is optional. Use it to create sub-groups inside the two main containers (`Elected Positions` and `Ballot Questions`), such as `Democratic Ballot` and `Republican Ballot`.
- CITY turnout summary uses ward rows (`1`, `2`, `3`) and ignores CITY `ALL` when ward rows are present.
- School races are citywide only and do not display ward breakdowns.

## 3. Build and Preview

```bash
npm run build
npm run preview
```

## 4. GitHub Pages Deployment

This repo includes `.github/workflows/deploy.yml` for Pages deployment.

1. In GitHub repo settings, enable **Pages** with **GitHub Actions** source.
2. Add repository variables for CSV URLs:
   - `VITE_RESULTS_CSV_URL`
   - `VITE_WARD_STATUS_CSV_URL`
   - `VITE_ELECTION_STATUS_CSV_URL`
   - `VITE_TURNOUT_CSV_URL`
   - `VITE_RACE_CONFIG_CSV_URL`
3. Push to `main`. The workflow validates required URLs, builds, and publishes `dist/`.

The workflow automatically sets:

- `VITE_BASE_URL=/<repo-name>/`

For custom domain root deployment, set `VITE_BASE_URL=/`.

## 5. Security Baseline

### In-app hardening

- CSV endpoints are validated at startup:
  - Relative local paths are allowed.
  - Absolute URLs must be HTTPS.
  - Host allowlist enforced by `VITE_ALLOWED_CSV_HOSTS` (unless `VITE_ALLOW_ANY_CSV_HOST=true`).
- Browser fetches use:
  - `credentials: 'omit'`
  - `referrerPolicy: 'no-referrer'`
- `index.html` includes a restrictive CSP and referrer policy.
- `.env` is ignored by git.

### CI security automation

- `.github/workflows/security.yml`:
  - PR dependency review
  - Scheduled and push `npm audit --audit-level=high`
- `.github/workflows/codeql.yml`:
  - CodeQL scanning for JavaScript/TypeScript
- `.github/dependabot.yml`:
  - Weekly npm + GitHub Actions dependency updates

### Recommended GitHub repository settings

1. Enable **Branch protection** on `main`:
   - Require pull request before merge
   - Require status checks to pass (`Security Checks`, `CodeQL`, deploy build)
2. Enable **Secret scanning** and **Dependabot alerts**.
3. Enable **Dependabot security updates**.
4. Restrict **Actions permissions** to read repository contents by default.
5. Keep Pages deployment environment protection enabled (`github-pages`).

## 6. Testing

Run unit/component tests:

```bash
npm test
```

Current test coverage includes:

- CSV validation/parsing
- Endpoint security validation
- Winner logic for multi-seat races
- Turnout/reporting aggregation
- Ward tracker and ward-breakdown UI behavior
- Auto-refresh polling behavior and stale-data fallback

## 7. Sample CSV Templates

Local/offline sample CSV files are in:

- `public/mock/`

## 8. GitHub Hardening Checklist

See `docs/GITHUB_SETUP.md` for the exact repository settings and election-night validation checklist.

