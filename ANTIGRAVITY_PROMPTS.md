# Antigravity Prompt Sequence — Bara Electrical

Run these **in order**. Each is self-contained and copy-pasteable. Do not skip ahead: every prompt assumes the previous one is committed and verified.

**Companion docs in this repo:** `BUILD_PLAN.md` (architecture) · `baraelec-seo-audit-and-fixes.md` (findings)

---

## Standing rules — paste at the top of any session

```
STANDING RULES FOR THIS REPO

1. Never invent business facts. Prices, response times, job histories, suburbs
   serviced, warranty terms, staff names, certifications — if it isn't in
   src/data/business.json or given to you explicitly, write TODO(nick): <what
   you need> and move on. A fabricated price on an electrician's site is a
   liability, not a placeholder.
2. No page ships with a TODO(nick): marker in it. TODOs block publication.
3. Do not redesign. The visual design is approved. You are changing structure,
   content and performance, not appearance. Reuse existing CSS classes and
   design tokens.
4. Australian English and Australian terminology throughout: switchboard (not
   panel), safety switch / RCD (not GFCI), power point (not outlet), AS/NZS 3000
   (not NEC), earth (not ground), metres, $AUD. This is deliberate strategy, not
   preference.
5. Every claim about compliance or safety must be accurate for Victoria,
   Australia. When unsure, describe generally and say a licensed electrician
   must assess — do not guess at regulation.
6. Verify before reporting done: build the site, load the page, check the
   rendered DOM. Do not report success from having written the code.
7. Commit per logical unit with a conventional-commit message. Never force push.
```

---

## PROMPT 1 — Deploy what's already built

```
The working tree has uncommitted changes implementing the audit's Phase 0:
Web3Forms integration in script.js, tel:/mailto: links, canonical tags,
privacy-policy/ and terms/ pages, corrected robots.txt and sitemap.xml.

Before committing:

1. Verify the Web3Forms access_key is a real key, not a placeholder. If it is a
   placeholder, stop and tell me — do not commit a broken form.
2. Confirm the form has a honeypot field and a visible error fallback that shows
   the phone number if the POST fails.
3. Confirm every tel: link is href="tel:+61403669041" (E.164, no spaces).
4. Confirm a sticky mobile call bar exists and does not overlap the form or
   footer at 360px, 390px and 430px viewport widths.
5. Confirm privacy-policy/ and terms/ are linked from the footer on every page,
   and that no "#" placeholder hrefs remain anywhere in the repo.

Then commit in logical units and push. Report what you verified and how.
```

---

## PROMPT 2 — Hostname, analytics, headers

```
Three infrastructure fixes.

1. NON-WWW REDIRECT. Both https://baraelec.com.au/ and https://www.baraelec.com.au/
   currently return 200 with identical content and no redirect — duplicate site on
   two hostnames. Write the nginx server block that 301s the apex domain to www,
   preserving path and query string. Put it in a deploy/nginx.conf file in the repo
   with a comment explaining where it goes on the server. I will apply it manually
   — do not attempt to deploy.

2. CACHE HEADERS. No Cache-Control header is currently sent on any asset. Add to
   the same nginx config: 1 year immutable for images, css, js and fonts; no-cache
   for HTML.

3. GA4 CONVERSIONS. GA4 (G-022M98FM2Z) is installed but tracks nothing beyond
   pageviews. Add events: generate_lead on successful form submission, click_to_call
   on any tel: link click, click_to_email on any mailto: click. Use a single
   delegated listener, not per-element handlers. Fire generate_lead only on a
   confirmed 200 from Web3Forms, never on submit.

Verify event firing in the browser console before reporting done.
```

---

## PROMPT 3 — Kill the 35.9 MB

```
The homepage transfers 35.9 MB of images. Budget is under 500 KB per page.

Current offenders (bytes):
  Background.png          9,501,435
  CCTV.png                7,113,975
  Smart Home.png          7,026,203
  TV installations.png    2,783,860
  Renovations.png         2,710,216
  Lightning Upgrades.png  2,264,475   ← filename typo: the service is LIGHTING
  logo.png                2,068,279
  Nick.png                1,750,195
  Compliance.png          1,738,517
  logo1.png                 601,724   ← 2000x2000, displayed at 120x120

Do this:

1. Write a Node script (scripts/optimise-images.mjs, using sharp) that processes
   Images/ into Images/optimised/ — AVIF + WebP + a JPEG fallback, each at no more
   than 2x its rendered display width. Rendered widths: service cards 549px, Nick
   572px, logo 160px, background full-bleed.
2. Rename everything to lowercase-hyphenated, keyword-accurate filenames. Fix
   "Lightning Upgrades" to "led-lighting-upgrades". No spaces — they become %20
   in URLs.
3. Replace every <img> with <picture> carrying AVIF/WebP/fallback sources and
   explicit width and height attributes.
4. Keep loading="lazy" on below-fold images. The LCP image must NOT be lazy and
   must have a <link rel="preload"> in the head.
5. Drop the ?v=colored / ?v=fixed3 / ?v=3 cache-busting query strings once
   filenames change.
6. Delete the unused logo.png (2 MB) if nothing references it — check first.

Acceptance: homepage total transfer under 500 KB with cache disabled; Lighthouse
mobile performance >= 90; CLS < 0.05. Report the before/after numbers.
```

---

## PROMPT 4 — Headings, metadata, schema

```
Three content-layer fixes on the existing pages.

1. SERVICE HEADINGS. All eight H3s are abstract benefit copy containing zero
   search terms. Restructure each so the heading leads with the service and the
   existing poetry becomes a tagline beneath it:

     Effortless Morning Departures  -> EV Charger Installation
     Unwavering Power Safety        -> Switchboard Upgrades
     Your Dream Space, Realized     -> Renovation Wiring & Rewiring
     Seamless Intuitive Control     -> Smart Home Automation
     24/7 Unblinking Peace of Mind  -> CCTV & Security Installation
     Cinematic Viewing Perfection   -> TV Wall Mounting
     Atmosphere on Demand           -> LED Lighting Upgrades
     Absolute Legal Confidence      -> Electrical Safety & Compliance Testing

   Keep the visual design identical.

2. METADATA. The homepage title and meta description both sell solar panel
   installation. The page contains zero solar content. STOP and ask me whether
   Bara offers solar before changing this — the answer determines whether we
   remove the claim or build a solar service cluster.

3. SCHEMA. Replace the thin Electrician JSON-LD with a full node: streetAddress,
   postalCode, geo, openingHoursSpecification, sameAs (the three social profiles),
   hasOfferCatalog listing all services, and granular areaServed by suburb. Use
   TODO(nick): for the address and coordinates — I need to confirm whether Nick
   publishes a street address or runs as a service-area business.

   Also add Review and AggregateRating markup to the 12 testimonial cards — ONLY
   using the real reviewer names and review text already rendered on the page.
   Do not invent reviews. Current verified figures: 79 reviews, 5.0 average.
   The page currently hard-codes "76+" — make the count a single variable.

Validate all JSON-LD against Google's Rich Results Test before reporting done.
```

---

## PROMPT 5 — Migrate to Astro

```
We're going from 4 pages to ~50. Hand-written HTML won't survive that — a nav or
schema change would mean editing 50 files. Migrate to Astro, keeping the output
static so nginx hosting is unchanged.

Read BUILD_PLAN.md section 3 for the target structure.

1. Scaffold Astro in the repo root. Static output. No client-side framework.
2. Create src/data/business.json as the single source of truth: legal name, ABN
   55 630 644 585, REC 29064, phone +61403669041, email, hours (Mon-Fri 07:00-17:00
   plus 24/7 emergency), founded 2018, social URLs, review count and rating,
   service areas. Every schema block, footer and contact section must read from
   this file. NAP must be impossible to drift.
3. Build content collections with typed schemas (zod) for: services, help, areas,
   guides. Front matter fields per BUILD_PLAN.md section 3.
4. Build layouts: ServiceLayout, HelpLayout, AreaLayout, GuideLayout, PageLayout.
   Each emits its own JSON-LD per BUILD_PLAN.md section 5. Breadcrumbs generated
   from the collection, never hand-written.
5. Build components: AnswerFirst, FaqBlock (emits FAQPage schema from front
   matter), CallBar, QuoteForm, ReviewStrip, AuthorCredit, RelatedLinks.
6. Generate sitemap.xml from the collections. Delete the hand-maintained one.
7. Port the existing 4 pages (home, blog post, privacy, terms) with NO content or
   visual change.

Acceptance: the built site renders visually identically to current production;
all existing URLs still resolve; no page loses its canonical, schema or metadata.
Diff the rendered HTML of the homepage before and after and show me anything that
changed other than whitespace.
```

---

## PROMPT 6 — Services silo

```
Build the services hub and 11 service pages per the ServiceLayout template in
BUILD_PLAN.md section 4.

URLs:
  /services/  (hub)
  /services/emergency-electrician/
  /services/switchboard-upgrades/
  /services/safety-switch-rcd-installation/
  /services/ev-charger-installation/
  /services/rewiring-and-renovations/
  /services/led-lighting/
  /services/smart-home-automation/
  /services/cctv-and-security-cameras/
  /services/tv-wall-mounting/
  /services/electrical-safety-inspections/
  /services/commercial-electrical/

Per page:
- Answer-first block: 40-60 words, self-contained, directly answers "what is this
  service and what does it involve". This block is what gets lifted into AI
  Overviews — it must make complete sense read alone, with no preceding context.
- Question-shaped H2s.
- 900-1,300 words of genuinely useful content.
- 5-8 FAQs in front matter, rendered via FaqBlock with FAQPage schema.
- Author credit: Nick, REC 29064, with last-reviewed date.
- Internal links to related help pages and the emergency page.

Prices, durations, warranty terms and job examples: TODO(nick): — do not invent
them. Build the page structure complete and correct with the TODOs visible, and
give me a single consolidated list of every TODO at the end so I can collect
answers from Nick in one pass.

Update the main nav from anchor links to real service links.

Start with /services/emergency-electrician/ only. Show me that one page before
building the rest, so we can agree the template before it's replicated 11 times.
```

---

## PROMPT 7 — Help silo (the GEO engine)

```
Build the help hub and 10 symptom pages per the HelpLayout template in
BUILD_PLAN.md section 4. This is the highest-value content on the site — read
BUILD_PLAN.md section 6 before starting.

URLs:
  /help/  (hub)
  /help/safety-switch-keeps-tripping/
  /help/circuit-breaker-keeps-tripping/
  /help/burning-smell-from-power-point/
  /help/lights-flickering/
  /help/power-point-not-working/
  /help/no-power-to-part-of-the-house/
  /help/smoke-alarm-beeping/
  /help/switchboard-buzzing-or-hot/
  /help/old-ceramic-fuse-switchboard/
  /help/do-i-need-three-phase-for-an-ev-charger/

Why these matter: they match how people phrase questions to both search engines
and AI assistants, and the Australian-English versions of these topics have very
little good content behind them. Every equivalent page ranking today is American
and uses the wrong vocabulary for this market. That gap is the entire point.

Requirements per page:
- H1 phrased exactly as a person would ask it.
- Answer-first block, 40-60 words, the single most important text on the page.
  It must stand alone as a complete answer.
- A safety callout that is genuinely useful about when to stop and call
  immediately — not legal boilerplate.
- H2 "What causes it" with 3-5 causes as H3s, each independently comprehensible.
- H2 on what a homeowner can safely check themselves — be accurate and
  conservative. Nothing that involves opening a switchboard or touching wiring.
- H2 on what legally requires a licensed electrician in Victoria, referencing
  AS/NZS 3000 accurately. If you are not certain of a regulatory detail, describe
  it generally and say a licensed electrician must assess — do not guess.
- FAQs with FAQPage schema.
- Links to the relevant service page and the emergency page.
- 700-1,000 words.

Build /help/safety-switch-keeps-tripping/ first and show it to me before
proceeding. I want to check the safety content specifically.
```

---

## PROMPT 8 — GEO technical layer

```
Implement the machine-readability layer from BUILD_PLAN.md section 6.

1. robots.txt: add explicit named permissions for GPTBot, OAI-SearchBot,
   ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended and Bingbot.
   Allow: / already covers them; this documents intent and prevents a future
   accidental block.

2. llms.txt at the site root: a markdown index of the site's main sections with
   one-line descriptions. Generate it from the content collections so it can't go
   stale. Timebox this to 20 minutes — current evidence shows it is barely
   consumed by any crawler and Google has declined to support it. It is a cheap
   hedge, not a strategy. Do not spend longer.

3. Every page must carry a visible "Last updated {date}" and a matching
   dateModified in its JSON-LD, both sourced from front matter.

4. Build /about/nick/ as an author page with Person schema including
   hasCredential for REC 29064 and worksFor pointing at the business @id. Every
   service, help and guide page's AuthorCredit component should link to it.

5. Build /glossary/ with DefinedTermSet and DefinedTerm schema, covering
   Australian electrical terms: switchboard, safety switch, RCD, RCBO, circuit
   breaker, ceramic fuse, three-phase, single-phase, power point, earth stake,
   AS/NZS 3000, REC, Certificate of Electrical Safety. Definitions must be
   accurate; keep each to 40-80 words so they are individually quotable.

6. Build /faq/ as a hub aggregating the most common questions across the site,
   each linking to its detailed page.

Validate all schema in the Rich Results Test.
```

---

## PROMPT 9 — Areas silo (gated)

```
STOP AND CHECK FIRST: do not build this until I confirm Bara's actual service
radius and supply real local material. Ask me for it now if I haven't provided it.

Once confirmed, build /areas/ plus one page per confirmed suburb per the
AreaLayout template in BUILD_PLAN.md section 4.

The hard rule: these pages must be genuinely different from each other. Not
spun, not templated with the suburb name swapped. Each needs real local
substance — housing stock era, typical switchboard age and type in that area,
estate names, whether three-phase is common, real response times, real jobs done
there.

If I have not given you enough distinct material for a suburb, DO NOT PUBLISH
THAT PAGE. Tell me which suburbs lack material. Six real area pages will
outperform sixteen templated ones, and templated suburb pages are the fastest
way to get the entire site filtered out of local results.

Build one suburb page first and show me before replicating.
```

---

## PROMPT 10 — Trust pages

```
Build the remaining trust and utility pages:

  /about/          Company story, REC 29064, ABN, since 2018, service area
  /reviews/        AggregateRating + Review schema. Pull live from Google Places
                   API if a key is available (see implementation_plan.md), else
                   render the verified reviews already on the homepage. Never
                   fabricate a review.
  /guarantee/      TODO(nick): actual warranty terms — do not invent these
  /contact/        Full contact page with the quote form, hours, service area,
                   and ContactPage schema

Then run a full internal linking pass across the whole site:
- Every service page links to relevant help pages and area pages
- Every help page links to its service page and the emergency page
- Every area page links to the services offered there
- Every page links to the quote form and has tap-to-call
- Breadcrumbs on every page, generated not hand-written

Report the internal link graph: which pages have fewest inbound internal links,
so I can see orphans.
```

---

## PROMPT 11 — Performance and pre-launch audit

```
Full audit before we call this done. Enforce BUILD_PLAN.md section 7 budgets:

  Total transfer per page   < 500 KB
  Largest image             < 150 KB
  LCP mobile 4G             < 2.0 s
  CLS                       < 0.05
  Lighthouse mobile perf    >= 95
  JS shipped                < 30 KB

1. Self-host and subset the fonts — currently loading from Google Fonts, which
   is a render-blocking third-party request.
2. Add Lighthouse CI to the build so a performance regression fails the build.
3. Crawl the built site and report: any page missing a canonical, title, meta
   description, H1, or schema; any broken internal link; any orphan page; any
   4xx or 5xx; any page over budget; any remaining TODO(nick) marker.
4. Validate every page's JSON-LD.
5. Confirm sitemap.xml lists every page and that every listed URL returns 200.
6. Test the quote form end to end one more time.

Give me a table of every page with its transfer size, LCP, word count and schema
types. Flag anything failing.
```

---

## PROMPT 12 — Ongoing cadence

```
Set up the content cadence infrastructure:

1. A content template (src/content/_templates/) for guides and job write-ups so
   new content follows the established structure automatically.
2. A CONTRIBUTING.md documenting the front matter contract for each collection,
   the answer-first rule, the Australian-terminology rule, and the no-fabricated-
   facts rule — so future sessions and future humans don't drift.
3. A monthly checklist in the repo: publish 2 guides, publish 1 job write-up,
   update lastReviewed dates on touched pages, check GSC for queries earning
   impressions but no clicks.

Then build the first two guides:
  /guides/switchboard-upgrade-cost-melbourne/
  /guides/ev-charger-installation-cost-australia/

Both need real cost data. TODO(nick): every figure — these pages are worthless
and actively harmful if the numbers are invented.
```

---

## Things Antigravity cannot do

Hand these to Nick directly — no prompt will accomplish them:

- Change the Google Business Profile website field to `https://www.baraelec.com.au/` **(highest-leverage single action available — 79 five-star reviews currently point at a `business.site` placeholder)**
- Complete the GBP: all services listed, weekly photos, posts, Q&A, suburb-level service area
- Build directory citations with consistent NAP: Yellow Pages, TrueLocal, hipages, ServiceSeeking, Word of Mouth, Localsearch, Bing Places, Apple Business Connect
- Audit and correct existing listings that disagree with the site
- Set up the post-job review request SMS with the direct review link
- Move `Nick@baraelecservicing.com` onto the primary domain
- Apply the nginx config from Prompt 2
- Answer every `TODO(nick):` the build surfaces

Per the research, for a local trade the off-site work matters at least as much as everything on this page — AI assistants answering "best electrician in Caroline Springs" retrieve from directories and the Business Profile more than from the business's own site.
