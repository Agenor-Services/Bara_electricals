# Bara Electrical — Solution Design & Build Plan
### From 2-page brochure to a search- and AI-visible service site

**Repo:** `Agenor-Services/Bara_electricals`
**Baseline:** static HTML/CSS/JS on nginx · 2 indexable pages · 35.9 MB homepage
**Benchmarks studied:** mistersparky.com, mrelectric.com (US franchise networks, ~200 and ~250 indexed pages respectively)
**Written:** 7 September 2026

---

## 0. Where the repo actually stands

Uncommitted work already in the working tree (not yet deployed — the live site still serves the old version):

| Done | Evidence |
|---|---|
| Quote form wired to Web3Forms | `script.js:105` — real `fetch()` to `api.web3forms.com/submit` |
| Tap-to-call and mailto links | 4 × `tel:`, 2 × `mailto:` in `index.html` |
| Canonical tags | Self-referencing on homepage and blog post |
| Privacy Policy + Terms | `privacy-policy/index.html`, `terms/index.html` |
| robots.txt + sitemap corrected to www | 4 URLs, correct host |

**Still outstanding from the audit:** 35.9 MB image payload, non-www 301, GBP website field, GA4 conversion events, service headings, expanded schema, and the entire page architecture below.

**Deploy the Phase 0 work before starting Phase 1.** It is worth more live and imperfect than perfect and uncommitted.

---

## 1. What the benchmarks actually do

Both sites are franchise networks with budgets Bara doesn't have. Copy the *shape*, not the scale.

### Mister Sparky — three silos, not one

```
/services/{category}/{sub-service}/          ~50 URLs, two levels deep
    e.g. /services/wiring/hot-tub-pool-rewiring/
         /services/circuit-breakers/circuit-breaker-installation/

/electrical-safety/common-electrical-issues/{symptom}/    ← the interesting one
    circuit-breaker-tripping · dead-outlet · gfci-tripping
    lights-flickering · power-outage · smoke-detector-chirping

/expert-tips/{category}/{article}/           categorised blog
/locations/                                  ZIP finder → location pages
/reviews/  /about-us/our-guarantee/  /about-us/our-electricians/
```

### Mr. Electric — residential/commercial split, granular matrixing, flat vanity URLs for head terms

```
/residential/{category}/{service-application}/
    e.g. /residential/circuit-installation-service/pool-circuits
         /residential/lighting/deck-lighting-installation-service

Flat URLs kept for highest-volume head terms:
    /outlet-installation  /surge-protection  /smarthome  /electrical-panel-upgrades

/glossary                        ← pure definitional content
/frequently-asked-questions      ← FAQ hub
/expert-tips/{symptom}           ← symptom pages again
```

Homepage displays `91,078 Customer Reviews · 4.6/5` as a hard number, runs an FAQ accordion with each answer linking deeper, and puts a booking form above the fold.

### The five transferable lessons

1. **Three silos, not one.** Services (commercial intent) · Problems/symptoms (informational + emergency intent) · Locations (local pack support). Bara currently has zero of the three.
2. **Symptom pages are the highest-leverage content type**, and both networks invest in them. "Why does my breaker keep tripping" is how people talk to search *and* to AI assistants. This is the GEO engine.
3. **Hub-and-spoke.** Category hub page → individual service pages. Hubs collect authority and rank for head terms; spokes rank for the long tail.
4. **Trust gets its own URLs** — guarantee, our electricians, reviews, credentials. These are E-E-A-T pages and they get cited.
5. **Aggregate rating shown as a number.** Mr Electric shows 4.6. **Bara has 5.0 across 79.** That is a better number than either benchmark and it's currently invisible.

### The asymmetry worth exploiting

Every page on both benchmark sites is written in American English against American standards: *panel, GFCI, outlet, breaker, NEC*. The Australian equivalents — *switchboard, RCD/safety switch, power point, circuit breaker, AS/NZS 3000, REC number, Victorian rebates* — have almost no well-written corpus behind them.

An AI assistant asked "why does my safety switch keep tripping in Melbourne" has thin, mostly directory-spam material to retrieve from. **That gap is Bara's opening**, and it is a content decision, not a budget decision.

---

## 2. Target architecture (~50 pages)

Built in stages. Nothing here requires a CMS; all of it benefits from a build step (§3).

```
/                                       Home
/contact/                               Contact + quote form

── SERVICES SILO ─────────────────────────────────────────
/services/                              Hub
/services/emergency-electrician/        ← highest commercial intent
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

── HELP SILO (symptom pages) ─────────────────────────────  ← GEO engine
/help/                                  Hub
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

── AREAS SILO ────────────────────────────────────────────
/areas/                                 Hub
/areas/caroline-springs/  /areas/burnside/  /areas/taylors-hill/
/areas/deer-park/  /areas/hillside/  /areas/sydenham/
/areas/melton/  /areas/point-cook/  /areas/werribee/  /areas/sunshine/
        ↑ CONFIRM the real service radius with Nick before building these

── GUIDES ────────────────────────────────────────────────
/guides/                                Hub
/guides/switchboard-upgrade-cost-melbourne/
/guides/ev-charger-installation-cost-australia/
/guides/victorian-electrical-and-solar-rebates/
/guides/as-nzs-3000-for-homeowners/

── TRUST & UTILITY ───────────────────────────────────────
/about/          /about/nick/  ← author/E-E-A-T page
/reviews/        /guarantee/   /faq/   /glossary/
/blog/           /privacy-policy/   /terms/
```

**Solar is deliberately absent.** The homepage currently sells it and the site has none. Either confirm Bara offers it and add `/services/solar-and-battery/` plus `/guides/victorian-solar-rebates/` as a full cluster, or strip it from the metadata. **Do not leave this half-true — decide before Phase 2.**

### Why `/help/` matters more than it looks

Ten symptom pages will out-earn twenty service pages in AI citations, because:

- They match natural-language question phrasing directly
- They carry genuine informational value, which is what retrieval favours
- They have almost no Australian-English competition
- They convert: someone searching "burning smell from power point" is a call within the hour
- Each one funnels to a service page and to the emergency page

---

## 3. Platform decision

The site is hand-written static HTML. At 50 pages, a nav change or schema fix means editing 50 files, and drift is guaranteed.

**Recommendation: migrate to Astro** before Phase 2 begins.

| | Keep raw HTML | **Astro** | WordPress |
|---|---|---|---|
| Build step | none | `npm run build` → static | server + PHP |
| 50-page maintenance | edit 50 files by hand | one layout, 50 markdown files | admin UI |
| Schema consistency | manual, drifts | generated from front matter | plugin |
| Performance ceiling | good | best (zero JS by default) | poor without work |
| Suits an AI agent building 50 pages | poor | **excellent** | moderate |
| Nick can edit content | no | markdown only | yes |

Astro wins because the content becomes data (`src/content/services/*.md` with typed front matter) and the schema, breadcrumbs, internal links and sitemap are all *generated*. It also keeps hosting exactly as it is — nginx serving a static `dist/`.

**If Astro is rejected**, cap the build at ~20 pages and accept the maintenance cost. Do not attempt 50 hand-written pages.

### Proposed structure

```
src/
  content/
    services/{slug}.md      front matter: title, h1, metaDescription, answerFirst,
    help/{slug}.md                       faqs[], relatedServices[], relatedAreas[],
    areas/{slug}.md                      lastReviewed, author
    guides/{slug}.md
  layouts/
    ServiceLayout.astro     ← emits Service + FAQPage + BreadcrumbList schema
    HelpLayout.astro        ← emits Article + FAQPage + BreadcrumbList
    AreaLayout.astro        ← emits Electrician(areaServed) + FAQPage + Breadcrumb
    GuideLayout.astro       ← emits Article + author Person + Breadcrumb
  components/
    AnswerFirst.astro  FaqBlock.astro  CallBar.astro  QuoteForm.astro
    ReviewStrip.astro  AuthorCredit.astro  RelatedLinks.astro
  data/
    business.json           ← single source of truth for NAP, licence, hours, rating
```

`business.json` is the important one: every schema block, footer, and contact section reads from it, so NAP can never drift.

---

## 4. Page templates

### Service page

```
Breadcrumb: Home › Services › {Service}
H1: {Service} in Melbourne's West
[Answer-first block]      40–60 words. Direct answer, no preamble. What it is,
                          what it costs, how long it takes.
[Key facts strip]         Price range · Typical duration · Licence · Warranty
[Trust bar]               REC 29064 · 5.0 from 79 reviews · Est. 2018 · 24/7
H2: What's involved
H2: When you need this (symptom bullets → /help/ pages)
H2: What it costs in Melbourne          ← real ranges; TODO(nick) if unknown
H2: How long it takes
H2: Recent jobs                          ← 2–3 real jobs with suburb + photo
H2: Frequently asked questions           ← 5–8 Q&As, FAQPage schema
[Areas served strip]      → /areas/ pages
[Author credit]           Reviewed by Nick, REC 29064 · Last updated {date}
[CTA]                     Quote form + tap-to-call
Word target: 900–1,300
```

### Help / symptom page — the GEO template

```
Breadcrumb: Home › Help › {Symptom}
H1: {Symptom phrased exactly as people ask it}
[Answer-first block]      THE most important 60 words on the site. This is what
                          gets lifted verbatim into an AI Overview.
[Safety callout]          When to stop and call immediately — real, not boilerplate
H2: What causes it        ← 3–5 causes, each its own H3, each independently liftable
H2: What you can safely check yourself
H2: What needs a licensed electrician (and why — cite AS/NZS 3000)
H2: What the fix usually costs
H2: Frequently asked questions           ← FAQPage schema
[Related]                 → relevant service page + /services/emergency-electrician/
[Author credit + last updated]
Word target: 700–1,000
```

### Area page

```
Breadcrumb: Home › Areas › {Suburb}
H1: Electrician in {Suburb}, VIC {postcode}
[Answer-first]            Who Bara is, response time to this suburb, what they do here
H2: Services we provide in {Suburb}      → service pages
H2: Common electrical issues in {Suburb} ← REAL local specifics: housing stock era,
                                            typical switchboard age, estate names,
                                            three-phase availability
H2: Recent jobs in {Suburb}              ← real jobs or omit the section entirely
H2: Response times
H2: FAQs specific to this suburb
Word target: 700–900 — ALL GENUINELY DIFFERENT
```

> **Hard rule:** if there isn't enough real, distinct material for a suburb, don't publish that page. Six real area pages beat sixteen templated ones. Templated suburb pages are the single fastest way to get the whole site filtered.

---

## 5. Schema strategy

`business.json` feeds everything. One `Electrician` node with `@id`, referenced everywhere else.

| Page type | Schema emitted |
|---|---|
| Home | `Organization` + `Electrician` (full: address, geo, hours, `sameAs`, `aggregateRating`, `hasOfferCatalog`) + `WebSite` |
| Service | `Service` (`provider` → `@id`) + `FAQPage` + `BreadcrumbList` |
| Help | `Article` + `FAQPage` + `BreadcrumbList` |
| Area | `Electrician` with suburb `areaServed` + `FAQPage` + `BreadcrumbList` |
| Guide | `Article` + `author` → `Person` (Nick) + `BreadcrumbList` |
| Reviews | `AggregateRating` + `Review` — **only for reviews actually rendered on the page** |
| /about/nick/ | `Person` with `hasCredential` (REC 29064) + `worksFor` |
| Glossary | `DefinedTermSet` + `DefinedTerm` |

The `Person` node for Nick matters more than it looks: AI systems weight identifiable, credentialed authorship, and a licensed electrician with a registration number is exactly the kind of authority signal that survives retrieval.

---

## 6. The GEO layer

Grounded in what the 2026 evidence actually supports — and honest about what it doesn't.

### What works

**Answer-first structure.** Every page opens with a self-contained 40–60 word answer before any context. AI systems retrieve *passages*, not pages. A passage that answers the question standing alone is the unit of citation.

**Question-shaped H2s.** Headings phrased as the query, so each section is independently liftable.

**FAQ blocks everywhere**, with `FAQPage` schema. Question-and-answer pairs are disproportionately used in generated answers.

**Visible authorship and dates.** `Reviewed by Nick — REC 29064` and `Last updated 7 September 2026` on every page, matched by `dateModified` in schema.

**Australian terminology, deliberately.** Switchboard not panel. RCD / safety switch not GFCI. Power point not outlet. AS/NZS 3000 not NEC. Cite the Victorian regulator and rebate schemes by name. This is the moat.

**Original data — the strongest single lever.** The consistent finding across GEO research is that AI systems cite sources offering something unavailable elsewhere. For a trade, the proprietary dataset is *job data*:

> "Across 200+ switchboard upgrades in Melbourne's west, the median cost was $X and 60% of homes built before 1990 still had ceramic fuses."

Nobody else can publish that. Nothing else on this list comes close to it for citation value. It requires Nick to actually pull the numbers — worth pushing for.

**Explicit AI crawler permissions in robots.txt.** `Allow: /` already covers them, but naming them documents intent and prevents a future accident:

```
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: PerplexityBot
User-agent: Google-Extended
Allow: /
```

**Off-site is where local GEO is actually won.** When someone asks an assistant "best electrician in Caroline Springs", the retrieval pulls from directories, review platforms and the Business Profile — *not* primarily from Bara's own site. Complete, consistent profiles on hipages, Yellow Pages, TrueLocal, ServiceSeeking, Word of Mouth and Bing Places are GEO work, not just citation hygiene. This is Phase 5 and it is not optional.

### What doesn't — don't waste time here

**`llms.txt`.** Roughly 10% of domains have one, but only one of the fifty most AI-cited sites does; analysis of 500M+ AI bot events found only a few hundred requests to `/llms.txt` at all, and crawlers overwhelmingly fetch normal HTML instead. Google has explicitly declined to support it, comparing it to the keywords meta tag. **Ship one as a 20-minute hedge; build nothing on it.**

**Schema as a guarantee.** Structured data makes content machine-readable. It does not make anything get cited. It's hygiene, not leverage.

**Keyword density, AI-content volume, link buying.** All actively harmful here.

---

## 7. Performance budget — enforced, not aspirational

Current homepage: **35.9 MB**. Non-negotiable ceilings for every page:

| Metric | Budget |
|---|---|
| Total transfer | **< 500 KB** |
| Largest image | < 150 KB |
| LCP (mobile, 4G) | < 2.0 s |
| CLS | < 0.05 |
| Lighthouse mobile performance | ≥ 95 |
| JS shipped | < 30 KB |

Enforcement: all images WebP/AVIF at ≤ 2× display width with explicit `width`/`height`; the LCP image preloaded and never lazy; fonts self-hosted and subset with `font-display: swap`; `Cache-Control: public, immutable` on static assets; Lighthouse CI in the build so a regression fails the build rather than being noticed months later.

---

## 8. Build phases

| Phase | Scope | Output | Gate |
|---|---|---|---|
| **0 — deploy what's built** | Commit and ship the existing working tree. Non-www 301. GBP website field. GA4 conversions. | Live, lead-capturing site | Test form end-to-end from a phone |
| **1 — images + foundations** | Kill the 35.9 MB. Rewrite headings and metadata. Expand schema. Review schema on testimonials. | < 1 MB homepage, Lighthouse ≥ 90 | Rich Results Test clean |
| **2 — migrate to Astro** | Layouts, `business.json`, content collections, generated sitemap. Port the 4 existing pages. | Identical output, now templated | Byte-identical rendering, no rank movement |
| **3 — services silo** | Hub + 11 service pages | 12 pages | Every page passes the template checklist |
| **4 — help silo** | Hub + 10 symptom pages | 11 pages | Answer-first block reads correctly standalone |
| **5 — off-site** | GBP buildout, directory citations, review flow. *Runs in parallel from Phase 1 — it's Nick's work, not the agent's.* | Consistent NAP everywhere | Manual NAP audit |
| **6 — areas silo** | Hub + 6–10 suburb pages, only where real material exists | 7–11 pages | Reject any page without genuine local detail |
| **7 — trust & glossary** | About, Nick, reviews, guarantee, FAQ hub, glossary | 7 pages | — |
| **8 — cadence** | 2 guides/month, one job write-up/month, quarterly GSC review | ongoing | — |

Phases 3, 4, 6 and 7 all depend on Nick supplying real material. **That interview is the critical path**, not the code.

---

## 9. What has to come from Nick

The build stalls without these. Collect before Phase 3.

- [ ] Confirmed service radius — which suburbs, honestly
- [ ] Solar: offered, not offered, or planned?
- [ ] Price ranges per service (ranges are fine; "from $X" is fine)
- [ ] Typical job duration per service
- [ ] Emergency response time and after-hours call-out fee
- [ ] 15–20 recent jobs: suburb, what was done, any photo
- [ ] Warranty / guarantee terms as actually offered
- [ ] Public address, or service-area-business without one — decide
- [ ] Direct GBP review link + Place ID
- [ ] Whether `Nick@baraelecservicing.com` moves to the primary domain
- [ ] **Aggregate job data if it exists** — switchboard counts, common faults by suburb, anything countable

Anything not supplied becomes a `TODO(nick):` marker in the source. **No page ships with a TODO in it.**

---

## 10. Honest expectations

Two indexable pages means effectively no non-brand organic surface today. That's an absence of pages, not a tuning problem — which is good news, because absence is fixable.

- **Phase 0** pays back immediately and independently of search: it recovers enquiries the site is already discarding.
- **Phases 1–4** typically show Search Console movement 4–8 weeks after publishing; meaningful positions on suburb and symptom terms around 3–6 months.
- **5.0 across 79 reviews is a stronger rating than either benchmark network holds.** Once the Business Profile points at the site and the site has pages to land on, the local pack is realistically winnable in the home suburbs.
- **AI citations** follow the same content that earns rankings, with a lag. The Australian-terminology symptom pages are the most likely first wins because the competition there is genuinely weak.

The trap to avoid is mistaking the benchmarks' *page count* for their strategy. Mister Sparky has 200 pages because it has hundreds of franchises and a content team. Bara copying that shape at Bara's scale produces 200 thin pages and gets filtered. **50 pages that are genuinely useful, genuinely local, and genuinely Australian will beat it in this market.**
