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
