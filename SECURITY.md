# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

Only the latest `1.0.x` release line receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in the Metro Appliances ERP frontend,
please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Email the security team at **security@metroappliances.example** with:
   - A description of the vulnerability
   - Steps to reproduce
   - The potential impact
   - Any suggested remediation
3. You will receive an acknowledgement within **3 business days**.
4. We aim to provide a remediation timeline within **10 business days** of triage.

Please allow us reasonable time to investigate and patch before any public
disclosure.

## Security Measures in This Release

The frontend SPA applies the following controls (see `vercel.json`):

| Control | Implementation |
|---------|----------------|
| Content Security Policy | Restrictive `default-src 'self'` with explicit allowlists |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| Clickjacking protection | `X-Frame-Options: SAMEORIGIN` |
| MIME sniffing protection | `X-Content-Type-Options: nosniff` |
| Referrer policy | `strict-origin-when-cross-origin` |
| Permissions policy | Camera, microphone, geolocation disabled |
| Auth token handling | JWT stored per-portal; sent as `Authorization: Bearer` |
| Secrets | Injected at build time via `VITE_*` env vars — never committed |
| API transport | HTTPS-only to the Render backend |

## Notes

- The frontend holds **no** server-side secrets. Only public `VITE_*`
  variables (API base URL, publishable payment keys) are embedded in the build.
- All sensitive operations are authorized server-side by the backend API.

See [CHANGELOG.md](CHANGELOG.md) for version history.
