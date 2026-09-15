# Deploying demoLand to agenticdid.io

The demo is a single self-contained file: `public/index.html` (no backend, no
build step; its only external call is Google Fonts). `server.js` exists ONLY
for running it locally on port 3014 (`npm run dev`).

## Hosting: Vercel (static)

- Vercel project: `agenticdid` (team "EnterpriseZK Labs")
- Linked to GitHub `bytewizard42i/AgenticDID_io_me`, **Root Directory = `frontend-demoland`**
- Every push to `main` auto-deploys production.

`vercel.json` explained (JSON can't hold comments, so the notes live here):

| key                | value      | why                                                        |
|--------------------|------------|------------------------------------------------------------|
| `framework`        | `null`     | Don't auto-detect (it's plain HTML, not Next/Vite)        |
| `buildCommand`     | `""`       | Nothing to build                                           |
| `installCommand`   | `""`       | Skip `npm install` (express is only for local server.js)   |
| `outputDirectory`  | `public`   | Serve this folder as the site root                         |
| `cleanUrls`        | `true`     | `/foo.html` also reachable as `/foo`                       |
| `headers`          | ...        | Basic browser hardening (no MIME sniffing, no iframing)    |

## Domain: agenticdid.io

- Registrar: GoDaddy. Nameservers were moved to Vercel (`ns1.vercel-dns.com`,
  `ns2.vercel-dns.com`) so Vercel manages DNS + TLS certs automatically.
- Domain added to the `agenticdid` project as `agenticdid.io` (apex) with
  `www.agenticdid.io` redirecting to it.

## When we outgrow this (RealDeal)

The moment the demo needs a persistent backend (proof server, Midnight gateway),
the static site stays on Vercel and the API moves to the Hostinger VM behind
something like `api.agenticdid.io`.

## Status log

### 2026-09-03 — Vercel side complete, DNS switch pending (Penny session)

Done:
- [x] Vercel project `agenticdid` created (team "EnterpriseZK Labs",
      id `prj_OXdDVzFwsTpjs78AZC3WJ0Kxydts`), linked to this repo, root dir
      `frontend-demoland`. Auto-deploys on every push to `main`.
- [x] First production deploy READY; demo HTML verified serving.
- [x] `agenticdid.io` and `www.agenticdid.io` attached to the project.
- [x] Checked GoDaddy DNS for records that would be lost in the move: no MX
      (email) records; only a `google-site-verification` TXT on the apex
      (value recorded below — re-add it in Vercel DNS after the NS move).
- [x] Deployment protection: team default is SSO on `*.vercel.app` URLs but
      `all_except_custom_domains` — the demo URL requires a Vercel login,
      agenticdid.io itself will be fully public. No change needed.

Pending (the ONE manual step left — GoDaddy):
- [ ] John: GoDaddy → agenticdid.io → DNS → Nameservers → "I'll use my own" →
      `ns1.vercel-dns.com` + `ns2.vercel-dns.com` → Save.
      Then Vercel auto-provisions the TLS cert and the domain goes live.

After the NS move completes:
- [ ] Re-add TXT `google-site-verification=ZL6JXlaMch188F6lKdJUE1L-TdGBnhlRJY8x_XQ6-Sc`
      on the apex in Vercel DNS (keeps Google Search Console verified).
- [ ] Verify `curl -I https://agenticdid.io` returns 200 with a valid cert.

### 2026-09-15 — rechecked: still waiting on the GoDaddy NS change

`dig +short NS agenticdid.io` still shows `ns63/ns64.domaincontrol.com` and the
site still serves GoDaddy's parking redirect. Nothing else is blocked — once
the nameservers move, the domain is live within minutes.

Useful one-liners:
```bash
dig +short NS agenticdid.io        # nameservers (want: *.vercel-dns.com)
curl -sI https://agenticdid.io     # first line should be "HTTP/2 200"
vercel domains inspect agenticdid.io --scope enterpisezk-labs-projects
```
