# SEO Audit & Fix Brief — www.baraelec.com.au

**Site:** Bara Electrical Servicing Pty Ltd
**Audited:** 6 September 2026 (live DOM, response headers, robots.txt, sitemap.xml, SERP checks)
**Stack observed:** static HTML/CSS/JS on nginx 1.24.0 (Ubuntu). Files: `index.html`, `style.css`, `script.js`, `robots.txt`, `sitemap.xml`, `/blog/emergency-electrician-west-melbourne/index.html`
**Business facts:** ABN 55 630 644 585 · REC 29064 · Est. 2018 · Ph +61 403 669 041 · Burnside VIC 3023 · 79 Google reviews @ 5.0

> **Instructions for the implementing agent:** Work through the phases in order. Phase 0 is not optional and must not be batched with the rest. Do not invent business facts (prices, response times, job histories, suburbs serviced) — where content requires them, insert a clearly marked `TODO(nick):` placeholder rather than fabricating. Verify each change against the live rendered page before moving on.

---

## Executive summary

The site is a well-built one-page brochure, not a search asset. Three findings dominate everything else:

1. **The quote form sends nothing.** `script.js` calls `preventDefault()`, fakes a 1-second "sending" state, shows "Quote Requested!", resets the form, and stops. No `fetch`, no `XMLHttpRequest`, no form service. Every enquiry submitted since launch has been silently discarded.
2. **The phone number is not a link.** Zero `tel:` or `mailto:` anchors exist in the document. For a 24/7 emergency trade, tap-to-call is the primary mobile conversion.
3. **There is nothing to rank.** The entire site is 2 URLs: one 711-word page (all nav items are `#` anchors) plus one orphaned blog post. `/blog/` returns 403. Competitors run dozens of per-service × per-suburb pages.

Plus: the Google Business Profile — 79 reviews at 5.0, the strongest asset the business owns — points its website field at a `business.site` placeholder rather than this domain.

### Measured

| Metric | Value | Benchmark |
|---|---|---|
| Homepage transfer weight | 35.9 MB | < 2 MB |
| Indexable pages | 2 | — |
| Working lead capture paths | 0 | — |
| Homepage word count | 711 | 700–1,200 per service page |
| Hostnames returning 200 | 2 (www + non-www, no redirect, no canonical) | 1 |
| Service headings containing a service keyword | 0 of 8 | 8 of 8 |
| TTFB / load (desktop fibre) | 727 ms / 4.6 s | server is fine; images are not |

---

## PHASE 0 — Stop losing leads (do first, ~4 hours)

### 0.1 — CRITICAL: Wire up the quote form

**File:** `script.js` (and `index.html` for the success state)

**Current code — the entire submission logic:**

```js
leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = leadForm.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    // Simulate sending
    if (btnText) btnText.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
        btnText.textContent = 'Quote Requested!';
        leadForm.reset();
        // ... reverts button after 3s
    }, 1000);
});
```

Verification that nothing is sent: `grep -E "fetch\(|XMLHttpRequest|emailjs|formspree|web3forms|netlify|getform|basin" script.js` → **0 matches**.

**Form fields present:** `name` (text, required), `phone` (tel, required), `service` (select: residential / commercial / new build / emergency-other, required), `message` (textarea). Form has `id="lead-form"`, no `action`, no `method`.

**Required fix:**

1. Choose an endpoint. Recommended: [Web3Forms](https://web3forms.com) (free, no backend, no account server-side) or Formspree. EmailJS also acceptable.
2. Replace the fake handler with a real async submit:

```js
const leadForm = document.getElementById('lead-form');
if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = leadForm.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    const original = btnText ? btnText.textContent : btn.textContent;
    const setLabel = (t) => { if (btnText) btnText.textContent = t; else btn.textContent = t; };

    setLabel('Sending…');
    btn.disabled = true;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'TODO(nick): WEB3FORMS_ACCESS_KEY',
          subject: 'New quote request — baraelec.com.au',
          from_name: 'Bara Electrical website',
          name: leadForm.name.value,
          phone: leadForm.phone.value,
          service: leadForm.service.value,
          message: leadForm.message.value,
          botcheck: leadForm.botcheck ? leadForm.botcheck.value : ''
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      setLabel('Request sent ✓');
      leadForm.reset();
      if (window.gtag) gtag('event', 'generate_lead', { method: 'quote_form' });
    } catch (err) {
      setLabel('Could not send — call us');
      // Surface a real fallback rather than silently failing
      document.getElementById('form-fallback').hidden = false;
    } finally {
      setTimeout(() => { setLabel(original); btn.disabled = false; }, 4000);
    }
  });
}
```

3. Add a honeypot field inside the form in `index.html` (Web3Forms convention):

```html
<input type="checkbox" name="botcheck" class="hidden" style="display:none" tabindex="-1" autocomplete="off">
```

4. Add the visible error fallback near the form:

```html
<p id="form-fallback" hidden>
  Something went wrong sending your request. Please call
  <a href="tel:+61403669041">+61 403 669 041</a> or email
  <a href="mailto:nick@baraelec.com.au">nick@baraelec.com.au</a>.
</p>
```

5. Configure the endpoint to deliver to Nick's email **and** an SMS forward. Test end to end from a real phone before closing this task.

**Acceptance:** submitting the form results in a received email; a network tab shows a POST returning 200; failure path shows the fallback.

---

### 0.2 — CRITICAL: Make phone and email tappable

**File:** `index.html`, `style.css`, and the blog post template

**Current:** `document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').length` → **0**. The contact block renders the number and email as plain text inside the `#contact` section.

**Fix:**

1. Wrap every occurrence of the number:

```html
<a href="tel:+61403669041" class="tel-link" data-gtag="call">+61 403 669 041</a>
```

2. Wrap the email in `mailto:`.
3. Add a call link in the mobile header, and a sticky bottom call bar on small viewports:

```html
<a href="tel:+61403669041" class="sticky-call" aria-label="Call Bara Electrical now">
  Call now — 24/7 emergency
</a>
```

```css
.sticky-call { display: none; }
@media (max-width: 768px) {
  .sticky-call {
    display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 999;
    align-items: center; justify-content: center; gap: .5rem;
    padding: 14px 16px; font-weight: 700; text-decoration: none;
    /* use the existing brand accent token from style.css */
  }
  body { padding-bottom: 56px; }
}
```

4. Fire a GA4 event on tap:

```js
document.querySelectorAll('a[href^="tel:"]').forEach(a =>
  a.addEventListener('click', () => window.gtag && gtag('event', 'click_to_call'))
);
```

**Acceptance:** tapping the number on a phone opens the dialler; `a[href^="tel:"]` count > 0 on every page.

---

### 0.3 — CRITICAL: Repoint the Google Business Profile (manual, not a code change)

Directory records show the GBP website field set to `https://bara-electrical-servicing.business.site/` — Google's auto-generated placeholder — instead of this domain. Every local-pack click currently lands on a page nobody controls.

**Manual actions for Nick:**

- Change the GBP website field to `https://www.baraelec.com.au/`
- Grab the direct review link from the profile

**Code change:** the homepage "Read all 76+ Google Reviews" button currently links to
`https://www.google.com/search?q=bara+electricals+reviews` — a generic search query. Replace with the direct GBP review URL. Also stop hard-coding the count (page says "76+", actual is 79) — either drop the number or use "5.0 from 79+ Google reviews" and treat it as a value to update.

---

### 0.4 — Set up GA4 conversion tracking

GA4 (`G-022M98FM2Z`) is installed but has **zero events configured** beyond automatic pageviews.

Add and mark as conversions in the GA4 UI: `generate_lead` (form submit, wired in 0.1), `click_to_call` (wired in 0.2), `click_to_email`.

---

### 0.5 — Publish real legal pages

Privacy Policy and Terms of Service both link to `href="#"`. Create `/privacy-policy/` and `/terms/` with real content and link them from the footer. Required for Google Ads eligibility and a basic trust signal.

---

## PHASE 1 — Repair the foundations (~1 day)

### 1.1 — Canonicalise the hostname

**Observed:**

```
https://www.baraelec.com.au/   → 200, no redirect
https://baraelec.com.au/       → 200, no redirect, identical content
link[rel=canonical]            → absent on both pages
```

Signals disagree with each other:

| Signal | Current value | Host |
|---|---|---|
| `robots.txt` sitemap directive | `https://baraelec.com.au/sitemap.xml` | non-www |
| `og:url` | `https://baraelec.com.au` | non-www |
| JSON-LD `@id` and `url` | `https://baraelec.com.au/` | non-www |
| Brand / search listing | `www.baraelec.com.au` | www |

**Fix — pick `www` as canonical:**

nginx server block:

```nginx
server {
    listen 443 ssl;
    server_name baraelec.com.au;
    return 301 https://www.baraelec.com.au$request_uri;
}
```

Add a self-referencing canonical to every page:

```html
<link rel="canonical" href="https://www.baraelec.com.au/">
```

Then update `robots.txt`, `sitemap.xml`, `og:url` and the JSON-LD `@id`/`url`/`image` to all use `https://www.baraelec.com.au/`.

**Also:** verify **both** hostnames in Google Search Console (plus a Domain property) so it's visible which version has been indexed, and resubmit the sitemap.

---

### 1.2 — Fix the 35.9 MB image payload

**Measured transfer sizes:**

| File | Bytes | Note |
|---|---:|---|
| `Background.png` | 9,501,735 | |
| `CCTV.png` | 7,114,275 | |
| `Smart Home.png` | 7,026,503 | |
| `TV installations.png` | 2,784,160 | |
| `Renovations.png?v=fixed3` | 2,710,516 | |
| `Lightning Upgrades.png` | 2,264,775 | **filename typo — service is _lighting_** |
| `Nick.png?v=colored` | 1,750,495 | |
| `Compliance.png?v=3` | 1,738,817 | |
| `logo1.png` | 602,024 | served 2000×2000, displayed 120×120 |
| **Total** | **35,867,614** | |

**Fix:**

1. Resize each image to at most 2× its rendered display width (service cards render at 549 px → export at ~1100 px; logo renders at 120/160 px → export at 320 px).
2. Convert to WebP at quality 80, keeping a JPEG/PNG fallback via `<picture>` if needed.
3. Add explicit `width` and `height` attributes to every `<img>` to eliminate CLS.
4. Keep `loading="lazy"` on below-fold images; ensure the LCP image is **not** lazy-loaded and is preloaded.
5. Rename `Lightning Upgrades.png` → `led-lighting-upgrades.webp`. Rename all files to lowercase, hyphenated, keyword-accurate names (no spaces, no `%20` in URLs).
6. Drop the cache-busting query strings (`?v=colored`, `?v=fixed3`, `?v=3`) once filenames change.

**Target:** homepage under 1 MB total transfer. Expected reduction ≈ 45×.

Add caching headers (currently `Cache-Control` is absent on all assets):

```nginx
location ~* \.(webp|png|jpe?g|svg|css|js|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

### 1.3 — Fix the title/description mismatch

**Current homepage:**

- `<title>` → `Expert Solar Panel Installation & Electricians across Victoria` (62 chars)
- `meta description` → `Trusted local experts across Melbourne and Victoria for flawless electrical integration, custom lighting, smart home installations, and solar panel rebates.` (156 chars)
- Occurrences of "solar" in the page body → **0**

The page promises solar and delivers none. Either add a genuine solar/battery service page (strong Victorian market) or rewrite the metadata.

**Suggested replacement (pending Nick's confirmation on whether solar is offered):**

```html
<title>Electrician Melbourne West | EV Chargers, Switchboards & Safety | Bara Electrical</title>
<meta name="description" content="Licensed electricians (REC 29064) serving Melbourne's west since 2018. EV charger installation, switchboard upgrades, smart home, CCTV and 24/7 emergency call-outs. 5.0 from 79 Google reviews.">
```

Keep titles ≤ 60 chars where possible; keep descriptions 150–160 chars.

---

### 1.4 — Rewrite the eight service headings

All eight `<h3>` service headings are abstract benefit copy containing **zero** search terms. Actual service names appear only in the body sentence beneath.

| Current heading | Should lead with |
|---|---|
| Effortless Morning Departures | EV Charger Installation |
| Unwavering Power Safety | Switchboard Upgrades |
| Your Dream Space, Realized | Renovation Wiring & Rewiring |
| Seamless Intuitive Control | Smart Home Automation |
| 24/7 Unblinking Peace of Mind | CCTV & Security Installation |
| Cinematic Viewing Perfection | TV Wall Mounting |
| Atmosphere on Demand | LED Lighting Upgrades |
| Absolute Legal Confidence | Electrical Safety & Compliance Testing |

Keep the personality as a subheading, e.g.:

```html
<h3>EV Charger Installation</h3>
<p class="card-tagline">Effortless morning departures — wake up to a full battery every day.</p>
```

---

### 1.5 — Expand the structured data

**Current JSON-LD (identical on both pages, hard-coded):**

```json
{
  "@context": "https://schema.org",
  "@type": "Electrician",
  "name": "Bara Electrical Servicing",
  "image": "https://baraelec.com.au/logo1.png",
  "@id": "https://baraelec.com.au/",
  "url": "https://baraelec.com.au/",
  "telephone": "0403669041",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Melbourne",
    "addressRegion": "VIC",
    "addressCountry": "AU"
  },
  "areaServed": ["Melbourne", "Victoria"],
  "priceRange": "$$"
}
```

**Missing:** `streetAddress`, `postalCode`, `geo`, `openingHoursSpecification`, `aggregateRating`, `sameAs`, `hasOfferCatalog`, granular `areaServed`.

**Replacement:**

```json
{
  "@context": "https://schema.org",
  "@type": "Electrician",
  "@id": "https://www.baraelec.com.au/#business",
  "name": "Bara Electrical Servicing Pty Ltd",
  "alternateName": "Bara Electrical Servicing",
  "url": "https://www.baraelec.com.au/",
  "image": "https://www.baraelec.com.au/logo1.webp",
  "logo": "https://www.baraelec.com.au/logo1.webp",
  "telephone": "+61403669041",
  "email": "nick@baraelec.com.au",
  "foundingDate": "2018",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "TODO(nick): confirm — publish or run as service-area business",
    "addressLocality": "Burnside",
    "addressRegion": "VIC",
    "postalCode": "3023",
    "addressCountry": "AU"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "TODO", "longitude": "TODO" },
  "areaServed": [
    { "@type": "City", "name": "Caroline Springs" },
    { "@type": "City", "name": "Burnside" },
    { "@type": "City", "name": "Taylors Hill" },
    { "@type": "City", "name": "Deer Park" },
    { "@type": "City", "name": "Hillside" },
    { "@type": "City", "name": "Sydenham" },
    { "@type": "City", "name": "Melton" },
    { "@type": "City", "name": "Point Cook" },
    { "@type": "City", "name": "Werribee" },
    { "@type": "City", "name": "Sunshine" }
  ],
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "07:00", "closes": "17:00"
  }],
  "sameAs": [
    "https://www.facebook.com/baraelectricalservicing/",
    "https://www.instagram.com/bara_electrical/",
    "https://www.tiktok.com/@bara.electrical",
    "TODO(nick): Google Business Profile URL"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Electrical Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "EV Charger Installation" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Switchboard Upgrades" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Renovation Wiring & Rewiring" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Smart Home Automation" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "CCTV & Security Installation" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "TV Wall Mounting" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "LED Lighting Upgrades" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Electrical Safety & Compliance Testing" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "24/7 Emergency Electrician" } }
    ]
  }
}
```

Add `Review` / `AggregateRating` markup to the 12 existing testimonial cards — only for reviews genuinely displayed on the page, and only using real reviewer names and text already present.

Also add visible suburb + service-area text to the footer of every page. The site currently never states its suburb in visible copy, which is the single strongest local relevance signal a trade has.

---

### 1.6 — Add Open Graph / social completeness

Current OG tags are non-www, and `og:image` points at the 9.5 MB `Background.png`. Fix the host, point at a purpose-made 1200×630 image, and add `og:type`, `og:site_name`, `og:locale` (`en_AU`) and Twitter card tags.

---

## PHASE 2 — Build pages worth ranking (weeks 2–6, the real work)

### 2.1 — The structural problem

```
nav hrefs → #home  #services  #projects  #testimonials  #contact
sitemap.xml → 2 URLs
/blog/ → HTTP 403 (no index exists)
```

Every nav item is a same-page anchor. Eight services share one URL, so none can rank for its own query. There are no location pages at all.

Competitors ranking for "electrician Caroline Springs" all run per-service × per-suburb pages: WP Electrical, Plum Electrical, LCK Electrical, Everyday Sparky, The Local Electrician, Mr Emergency, Electrx, Johnstone Electrics.

### 2.2 — Service pages (8, one per service)

Create real URLs:

```
/ev-charger-installation-melbourne/
/switchboard-upgrades-melbourne/
/rewiring-renovation-electrician-melbourne/
/smart-home-automation-melbourne/
/cctv-security-installation-melbourne/
/tv-wall-mounting-melbourne/
/led-lighting-upgrades-melbourne/
/electrical-safety-compliance-testing-melbourne/
```

Each page needs: unique `<title>` (≤ 60 chars) and description (150–160), one `<h1>` naming the service and location, 700–1,000 words, real job photos with descriptive alt text and filenames, indicative pricing ranges, an FAQ block with `FAQPage` schema, `Service` schema, and a clear CTA to the form plus tap-to-call.

Content requiring real business input gets `TODO(nick):` placeholders — do not invent prices, timeframes or job histories.

### 2.3 — A dedicated emergency page

```
/emergency-electrician-melbourne/
```

Highest-intent, highest-value query set for a trade. Should cover: what counts as an emergency, response times, after-hours call-out fee structure, suburbs covered, and a tap-to-call above the fold.

### 2.4 — Suburb pages (10)

```
/electrician-caroline-springs/
/electrician-burnside/
/electrician-taylors-hill/
/electrician-deer-park/
/electrician-hillside/
/electrician-sydenham/
/electrician-melton/
/electrician-point-cook/
/electrician-werribee/
/electrician-sunshine/
```

**Critical:** these must be genuinely different from each other — local landmarks, typical housing stock and switchboard age for the area, realistic response times, and named jobs actually completed there. Templated near-duplicate suburb pages get filtered out and are the fastest route to being ignored. Ten real pages beat forty spun ones. Confirm the actual service radius with Nick before building.

### 2.5 — Fix the blog

**Current single post:** `/blog/emergency-electrician-west-melbourne/`

| Issue | Current | Fix |
|---|---|---|
| Title length | 101 chars (`Emergency Electrician West Melbourne: 24/7 Rapid Response for Your Home & Business \| Bara Electricals`) | Trim to ≤ 60 |
| Meta description | Opening body sentence truncated mid-thought with `...` | Purpose-written, 155 chars |
| Schema | `Electrician` copied verbatim from homepage | Add `BlogPosting` with `author`, `datePublished`, `dateModified` |
| Breadcrumbs | none | Add visible + `BreadcrumbList` schema |
| Word count | 569 | Expand to 900+ with local specifics |
| Canonical | absent | Self-referencing canonical |
| Blog index | `/blog/` returns 403 | Build a real index page |
| Internal links | 2 site-wide | Link from `/emergency-electrician-melbourne/` |

### 2.6 — Internal linking

Currently 2 internal links exist across the entire site. Once pages exist: service pages link to relevant suburb pages, suburb pages link back to service pages, blog posts link to the service they support, everything links to the quote form. Add breadcrumbs site-wide.

### 2.7 — Regenerate the sitemap

Once pages exist, `sitemap.xml` must list every URL on the `www` host with accurate `lastmod`. Current content:

```xml
https://baraelec.com.au/                                    lastmod 2026-06-22  priority 1.0
https://baraelec.com.au/blog/emergency-electrician-west-melbourne/  lastmod 2026-06-22  priority 0.8
```

---

## PHASE 3 — Local authority (months 2–3, mostly non-code)

Hand these to Nick / whoever manages the profile:

1. **Google Business Profile:** every service listed, real job photos monthly, weekly posts, Q&A seeded, service area defined by suburb, hours accurate including the 24/7 emergency note.
2. **Citations** with one consistent Name / Address / Phone: Yellow Pages, True Local, Hipages, ServiceSeeking, Word of Mouth, Localsearch, Bing Places, Apple Business Connect.
3. **Audit existing listings.** Several currently carry different details from the site (Birdeye lists 24 Freeman Ave, Burnside VIC 3023; the site states no address at all).
4. **Systematise reviews:** SMS with the direct review link after every completed job, asking customers to mention the suburb and the work done.
5. **Consolidate email onto the primary domain.** The site currently publishes `Nick@baraelecservicing.com` — a different domain from `baraelec.com.au`. Splits the brand, breaks NAP consistency checks, and hurts deliverability.
6. **Brand disambiguation:** `baraelectrical.com` is a different "Bara Electrical" in Carlisle WA competing for the same brand searches. Use the full "Bara Electrical Servicing" consistently everywhere.

---

## PHASE 4 — Ongoing cadence (month 3+)

- Two posts a month answering real customer questions: cost of a switchboard upgrade in Victoria, whether a home needs three-phase for an EV charger, what a safety check covers, current Victorian rebates.
- One completed job written up monthly as a project page with location and equipment detail.
- Track rankings for each service × suburb pair; expand into suburbs showing early movement.
- Review Search Console quarterly for queries earning impressions but no clicks — those are the next pages.

---

## Lower-priority backlog

| Issue | Found | Impact |
|---|---|---|
| Dead legal links | Privacy Policy and Terms both `href="#"` | Trust; Google Ads eligibility |
| Review count hard-coded | Page says "76+", actual is 79 | Goes stale, understates the asset |
| No `Cache-Control` headers | Absent on HTML and all assets | Repeat visitors re-download everything |
| No breadcrumbs | Site-wide | Navigation + SERP display |
| Testimonials unmarked | 12 review cards, no `Review` schema | Star ratings in SERP are a major CTR lever |
| Image filenames | Spaces → `%20` in URLs; `Lightning` typo | Minor ranking signal, ugly URLs |

---

## What is already correct — do not "fix" these

- REC 29064 and ABN 55 630 644 585 displayed on the page — real E-E-A-T signals many competitors omit.
- 79 Google reviews at 5.0 — the hardest asset to build, already there.
- All 11 images carry alt text; below-fold images use `loading="lazy"`.
- HTTPS throughout, `lang="en"` set, correct mobile viewport, clean 404 handling, nginx TTFB 727 ms.
- LocalBusiness JSON-LD exists — the instinct is right, it just needs filling out.
- Genuine on-page testimonials with named customers.
- **The visual design is good.** This brief is about plumbing, not appearance. Do not redesign the site.

---

## Expectations

With 2 indexable pages the site has essentially no non-brand organic surface. That is not a ranking problem to tune — it is an absence of pages.

- **Phase 0** pays back immediately and independently of search: it recovers enquiries the site is already receiving and discarding.
- **Phases 1–2** typically show movement in Search Console 4–8 weeks after publishing, with meaningful suburb-level positions around 3–6 months.
- A 5.0 rating across 79 reviews is an unusually strong base — the local pack is realistically winnable in the home suburbs once the profile points at the site and the site has pages to land on.

**Do not** buy links or spin out fifty near-identical suburb pages. In this market that is the fastest route to being filtered, and the business has enough real substance to rank without it.

---

## Verification checklist

Run after implementation:

- [ ] Form submission delivers a real email; network POST returns 200
- [ ] `document.querySelectorAll('a[href^="tel:"]').length > 0` on every page
- [ ] `https://baraelec.com.au/` 301-redirects to `https://www.baraelec.com.au/`
- [ ] Every page has a self-referencing `<link rel="canonical">`
- [ ] Homepage total transfer < 1 MB (DevTools Network, disable cache)
- [ ] Lighthouse mobile Performance ≥ 85, CLS < 0.1, LCP < 2.5 s
- [ ] All JSON-LD passes the Rich Results Test with no errors
- [ ] `robots.txt`, `sitemap.xml`, `og:url` and JSON-LD all use the `www` host
- [ ] `/blog/` returns 200 and lists all posts
- [ ] Every page in the sitemap returns 200 and is reachable by internal link
- [ ] GA4 shows `generate_lead` and `click_to_call` events firing
- [ ] No `TODO(nick):` placeholders remain in published pages
