# Security Policy

## Supported Versions

This project tracks the latest `main` branch.

## Reporting a Vulnerability

If you discover a security issue:

1. Do not open a public issue with exploit details.
2. Contact the project maintainer privately.
3. Include reproduction steps, affected files, and impact.

## Security Notes for This Project

- The dashboard is static and has no backend or authentication surface.
- Election data endpoints are public CSV feeds by design.
- `.env` files are excluded from version control.
- CI runs dependency and code scanning workflows.
