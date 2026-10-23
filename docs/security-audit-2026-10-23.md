# Security Audit and Remediation Report: Bara Electricals
**Date:** 2026-10-23  
**Auditor / Automation:** Antigravity Agentic Security Pipeline  
**Target Repository:** Agenor-Services/Bara_electricals  
**Scope:** Stack Detection, Dependency CVE Remediation, Secrets Hygiene, Server Exposure Audit, App-Level Code Review, Verification Gates, Rollback Protocol.

---

## 1. Executive Summary

| Metric | Before Audit | After Remediation |
| :--- | :--- | :--- |
| **Total Vulnerabilities** | **7 packages (19 advisories)** | **0 vulnerabilities** |
| **Critical Severity** | 0 | 0 |
| **High Severity** | 5 (`devalue`, `http-cache-semantics`, `sharp`, `source-map-js`, `vite`) | **0** |
| **Moderate Severity** | 2 (`astro`, `smol-toml`) | **0** |
| **Low Severity** | 0 | 0 |
| **Tracked Secrets / Key Leaks** | 0 found | 0 found |
| **Build & Test Gate Status** | Baseline Passed (642ms) | **Passed (559ms, 49 pages)** |
| **Runtime Server Status** | Nginx Active (`c607fb5`) | Rollback point confirmed |

---

## Step 0: Discover and Baseline

### 1. Stack Detection
- **Framework:** Astro (`astro` v7.3.1 -> updated to v7.4.2)
- **Integrations:** `@astrojs/sitemap` v3.7.4
- **Lockfile:** `package-lock.json` (npm)
- **Local Runtime:** Node `v24.19.0`, npm `11.17.0`
- **Output Mode:** Static (`output: 'static'` generating HTML to `dist/`)

### 2. Deploy Method Detection
- **Remote Host Alias:** `hostinger-vps` (IP: `72.61.117.132`, user: `hiddenpython`)
- **Remote App Directory:** `/var/www/bara_electricals`
- **Serving Architecture:** Nginx (`nginx/1.24.0 (Ubuntu)`), serving `/var/www/bara_electricals/dist` directly as static root with HTTP/2 and Let's Encrypt SSL
- **Process Manager:** Nginx static hosting (No background Node daemon or PM2 process required for Bara Electricals)
- **Target Branch:** `main`

### 3. Local Baseline
- **Commit:** `c607fb577b6bcbfde3ecc84175f0c5c3b65dd626`
- **Branch:** `main` (in sync with `origin/main`)
- **Baseline Build Command:** `npm run build`
  ```text
  > bara-electricals@1.0.0 build
  > astro build

  17:21:25 [build] output: "static"
  17:21:25 [build] 49 page(s) built in 642ms
  17:21:25 [build] Complete!
  Exit Code: 0
  ```

### 4. Server Rollback Point (Read-Only)
- **Server Deployed Commit:** `c607fb577b6bcbfde3ecc84175f0c5c3b65dd626`
- **Server Nginx Status:** `active`
- **Server Untracked files:** `AGENT.md`, `CLAUDE.md`, `.mcp.json`, `.windsurfrules` (local agent configs)

---

## Step 1: Stack and Server Runtime Check

### 1. Local Filesystem Scan
Command:
```bash
find . -not -path '*/.*' -not -path './node_modules*' -not -path './dist*' \( -name "*.php" -o -name "*.phtml" -o -name "*.cgi" -o -name ".htaccess" -o -name "*.pem" -o -name "*.key" -o -name "*.bak" -o -name "*.sql" -o -name "*.zip" \)
```
- **Exit Code:** 0
- **Output:** Empty (no legacy PHP, CGI, .htaccess, stray private keys, or backup files found).

### 2. Server Runtime Audit (`hostinger-vps`)
Command:
```bash
ssh -o BatchMode=yes hostinger-vps 'which php || true; node -v; npm -v; python3 -V; nginx -v 2>&1; cat /etc/os-release | grep -E "^(NAME|VERSION)="; uname -a'
```
- **PHP Status:** `php: command not found` (No PHP installed on server; attack surface minimized).
- **Node.js:** `v20.20.2`
- **npm:** `10.8.2`
- **Python:** `Python 3.12.3`
- **Nginx:** `nginx/1.24.0 (Ubuntu)`
- **OS:** `Ubuntu 24.04.5 LTS (Noble Numbat)`
- **Kernel:** `Linux srv1508995 6.8.0-90-generic #91-Ubuntu SMP x86_64`

### 3. Server Exposure Report
- **Listening Ports (`ss -tlnp`):**
  - Public ports: `22` (SSH), `80` (HTTP), `443` (HTTPS), `8080` (proxy/service).
  - Loopback / Tailscale internal: `127.0.0.1:4173`, `127.0.0.1:3008`, `100.85.141.33:49937`, `127.0.0.53:53`.
  - Node/Next apps for other domains on VPS: ports `3000-3006`.
- **SSH Hardening:**
  - `PasswordAuthentication no` (Enforced via `/etc/ssh/sshd_config` and `/etc/ssh/sshd_config.d/60-cloudimg-settings.conf`).
  - `PermitRootLogin no` (Enforced).
- **Intrusion Prevention:** `fail2ban` service is `active`.
- **Pending OS Security Updates:** 10 upgradable packages reported (`apt list --upgradable` includes kernel updates).
- **Reboot Flag:** `/var/run/reboot-required` is present on the VPS. *(Reported for user scheduling; no automatic action taken).*

---

## Step 2: Secrets and Repository Hygiene

### 1. `.env*` Tracking Check
```bash
git ls-files | grep -i -E '\.env|secret|credential|\.pem|\.key'
```
- **Result:** No environment or credential files are tracked in git.
- **Hygiene Action:** Added `.env`, `.env.*`, and `*.log` explicitly to `.gitignore`.

### 2. High-Entropy Secret & Token Pattern Scan
Scanned git working tree and commit history:
```bash
git grep -E 'AKIA|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|xox[baprs]-[0-9a-zA-Z]{10,}|-----BEGIN|password=|secret=' -- ':!node_modules' ':!dist'
git log -p -E -i -G'sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{20,}|xox[baprs]-[0-9a-zA-Z]{10,}|-----BEGIN (RSA|EC|OPENSSH|DSA|PRIVATE) KEY' --oneline
```
- **Result:** 0 leaks found. No secret keys or authentication tokens committed in history.
- **Web3Forms Key:** `a5824cbf-706f-45b6-9bb8-ffba5e56d7fb` in `QuoteForm.astro` and `index.astro` is a public client-side submission endpoint access key (intended for static site form forwarding).

### 3. Data File Scan
```bash
git ls-files | grep -i -E '\.(db|sqlite|log|sql|dump|bak|tar|gz|zip)$'
```
- **Result:** 0 private data or database dump files tracked.

---

## Step 3: Dependency Audit and Remediation

### 1. Before vs After Vulnerability Matrix

| Package | Initial Version | Severity | Advisories / GHSA IDs | Patched Version | Remediated Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **astro** | `7.3.1` | Moderate | GHSA-98hj-9722-w3j8, GHSA-mpr7-6m5w-76rw | `7.4.2` | **Resolved (0 vulns)** |
| **devalue** | `5.9.2` | High | GHSA-j22f-vq7h-c4qm, GHSA-hx4r-w6wj-j8fg, GHSA-mcm9-63f2-9j32, GHSA-wf3x-273g-mvxv, GHSA-x5rw-q4pp-hg5g, GHSA-4q55-j62x-fr9h, GHSA-r9w8-h9r3-54w4 | `6.0.3` | **Resolved (0 vulns)** |
| **http-cache-semantics** | `4.2.0` | High | GHSA-ch52-4w7c-c8xp | `4.3.0` | **Resolved (0 vulns)** |
| **sharp** | `0.35.4` | High | GHSA-wq5f-xc86-pv6w (librsvg CVE-2026-96889) | `0.35.5` | **Resolved (0 vulns)** |
| **smol-toml** | `1.8.0` | Moderate | GHSA-r4xh-jqrq-34v2 | `1.9.1` | **Resolved (0 vulns)** |
| **source-map-js** | `1.2.1` | High | GHSA-68fv-2mgg-jv7q | `1.2.2` | **Resolved (0 vulns)** |
| **vite** | `8.2.2` | High | GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm, GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22, GHSA-vfpm-58rq-9qcg | `8.3.5` | **Resolved (0 vulns)** |

### 2. Lockfile Reproducibility Proof
Clean installation test performed:
```bash
rm -rf node_modules && npm ci
```
- **Exit Code:** 0
- **Output:** `added 192 packages, and audited 193 packages in 896ms. found 0 vulnerabilities`.

---

## Step 4: App-Level Security Review

### 1. Security Headers Analysis
- **Nginx Server Template (`deploy/nginx.conf`):**
  - Updated with standard security headers:
    - `X-Frame-Options "SAMEORIGIN"` (Clickjacking protection)
    - `X-Content-Type-Options "nosniff"` (MIME sniffing prevention)
    - `X-XSS-Protection "1; mode=block"`
    - `Referrer-Policy "strict-origin-when-cross-origin"`
    - `Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"` (HSTS)
    - `Permissions-Policy "camera=(), microphone=(), geolocation=()"`
  - **Nginx Architecture Insight:** In Nginx, location blocks specifying `add_header Cache-Control` hide parent `add_header` directives. The updated `deploy/nginx.conf` configures headers across location blocks to ensure consistent header delivery.

### 2. Endpoint Authentication & API Surface
- **API Endpoints:** None present in the codebase. Astro operates with `output: 'static'` producing pure static HTML/CSS/JS artifacts.
- **Form Submissions:** Client-side POST to Web3Forms API (`https://api.web3forms.com/submit`) with honeypot bot prevention (`input[name="botcheck"]`).

### 3. Dangerous Sinks Scan
```bash
grep -rn -E 'dangerouslySetInnerHTML|eval\(|new Function|child_process|exec\(|innerHTML|unserialize|shell_exec' src script.js
```
- The only `innerHTML` usages are located in `script.js` (lines 112, 115, 140, 156, 161) setting static strings: `'<span>Sending…</span>'`, `'<span>Enquiry Sent ✓</span>'`, `'<span>Please Call Directly</span>'`.
- No untrusted or dynamic user input is evaluated or injected into sinks.

### 4. CORS, Cookies, & Storage
- No server cookies are issued or stored by the application.
- No open cross-origin resources or unsafe redirects.

---

## Step 5: Verification Gates

### 1. Build Verification
Command:
```bash
npm run build
```
- **Exit Code:** 0
- **Duration:** 559ms
- **Pages Built:** 49 static pages (home, about, areas, blog, guides, help, services, terms, privacy).
- **Sitemap:** `@astrojs/sitemap` successfully created `sitemap-index.xml`.

### 2. Local Production Preview Smoke Test
Preview server launched via `npx astro preview`:
- `GET /` -> **HTTP 200**
- `GET /services/emergency-electrician/` -> **HTTP 200**
- `GET /non-existent-page-test-404` -> **HTTP 404**
- `GET /sitemap-index.xml` -> **HTTP 200**
- `GET /robots.txt` -> **HTTP 200**
- `GET /api/test` (Unregistered API Route) -> **HTTP 404**

### 3. Live Server Baseline Smoke Test
- `GET https://www.baraelec.com.au/` -> **HTTP 200**
- `GET https://www.baraelec.com.au/services/emergency-electrician/` -> **HTTP 200**
- `GET https://www.baraelec.com.au/non-existent-404` -> **HTTP 404** (Security headers returned: `x-frame-options: SAMEORIGIN`, `x-content-type-options: nosniff`)
- `GET http://baraelec.com.au` -> **HTTP 301** -> `https://www.baraelec.com.au/`
- `GET https://baraelec.com.au` -> **HTTP 301** -> `https://www.baraelec.com.au/`

---

## Step 6: Scoped Commit

Staged files by explicit path only:
- `package.json`
- `package-lock.json`
- `.gitignore`
- `deploy/nginx.conf`
- `docs/security-audit-2026-10-23.md`
- `docs/security-audit-evidence/audit-before.json`
- `docs/security-audit-evidence/audit-after.json`

Commit Message:
```text
fix(security): patch astro and transitive CVEs in devalue, sharp, vite

Resolves 19 advisories across 7 packages (0 remaining vulnerabilities):
- astro: GHSA-98hj-9722-w3j8, GHSA-mpr7-6m5w-76rw
- devalue: GHSA-j22f-vq7h-c4qm, GHSA-hx4r-w6wj-j8fg, GHSA-mcm9-63f2-9j32, GHSA-wf3x-273g-mvxv, GHSA-x5rw-q4pp-hg5g, GHSA-4q55-j62x-fr9h, GHSA-r9w8-h9r3-54w4
- http-cache-semantics: GHSA-ch52-4w7c-c8xp
- sharp: GHSA-wq5f-xc86-pv6w (CVE-2026-96889)
- smol-toml: GHSA-r4xh-jqrq-34v2
- source-map-js: GHSA-68fv-2mgg-jv7q
- vite: GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm, GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22, GHSA-vfpm-58rq-9qcg
- Hardened .gitignore and deploy/nginx.conf security headers
```

---

## Step 7 & 9: Deployment & Rollback Plan

### Deployment Steps (Execution paused for explicit confirmation)
1. `git push origin main`
2. Remote server sync:
   ```bash
   ssh -o BatchMode=yes hostinger-vps 'cd /var/www/bara_electricals && git pull origin main && npm ci && npm run build'
   ```
3. Test live site and verify zero vulnerabilities on server:
   ```bash
   ssh -o BatchMode=yes hostinger-vps 'cd /var/www/bara_electricals && npm audit --omit=dev'
   ```

### Rollback Plan
- **Server Rollback Commit:** `c607fb577b6bcbfde3ecc84175f0c5c3b65dd626`
- **Rollback Procedure:**
  ```bash
  ssh -o BatchMode=yes hostinger-vps 'cd /var/www/bara_electricals && git checkout c607fb577b6bcbfde3ecc84175f0c5c3b65dd626 && npm ci && npm run build'
  ```

---

## Step 10: Proposed Long-Term Maintenance
1. **Automated Dependabot:** Configure `.github/dependabot.yml` targeting weekly security updates for npm.
2. **CI Security Check:** Add GitHub Actions workflow step `npm audit --omit=dev --audit-level=high` to block regressions.
3. **VPS Patching & Maintenance:** Schedule server update and system reboot to apply pending Noble updates (`linux-image-virtual`).
