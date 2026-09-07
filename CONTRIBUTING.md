# Content Standards & Editorial Guidelines

This document outlines the strict content standards for **Bara Electrical Servicing**. All contributors, AI models, and developers modifying or creating content in this repository must strictly adhere to these rules.

---

## 1. Core Principles

### Rule 1: Zero Hallucination & No Fabricated Facts
- **Never fabricate business facts**, staff names, unverified certifications, or false claims.
- The company founder and lead electrician is **Nick** (Registered Electrical Contractor **REC 29064**, ABN **55 630 644 585**).
- Reviews must be verified real Google reviews (current rating: **5.0 ★ across 79+ reviews**).
- If a technical detail or historical fact about a suburb or circuit is unverified, describe it conservatively and require professional on-site assessment.

### Rule 2: Strict Australian English & Trade Terminology
Use standard Australian electrical terminology at all times. Never use Americanisms or non-standard British terms:
- ✅ **Switchboard** (NEVER breaker box, fuse panel, electrical panel)
- ✅ **Safety Switch / RCD / RCBO** (NEVER GFCI, ground fault interrupter)
- ✅ **Power Point / GPO** (NEVER electrical outlet, wall socket, plug receptacle)
- ✅ **Circuit Breaker** (NEVER breaker)
- ✅ **Earth / Earth Stake / MEN** (NEVER ground wire, grounding rod)
- ✅ **AS/NZS 3000:2018 (Wiring Rules)** (NEVER NEC, National Electrical Code)
- ✅ **Energy Safe Victoria (ESV)** (NEVER state board, licensing bureau)
- ✅ **Certificate of Electrical Safety (COES)** (NEVER inspection permit)

### Rule 3: The Answer-First GEO Rule
- Every service, help diagnostic, and area page must start with an **Answer-First passage (40–60 words)**.
- It must directly answer the core user query in plain, authoritative English without preamble or filler words.
- This passage is engineered for Generative Engine Optimization (GEO) extraction by Google AI Overviews, Perplexity, and Claude.

---

## 2. Content Collections & Frontmatter Contracts

### `src/content/services/`
```yaml
title: "Service Name | Bara Electrical Servicing"
h1: "Service Name in Melbourne's West"
metaDescription: "140-155 characters describing the service, REC 29064, and call to action."
answerFirst: "40-60 word authoritative answer to the service's primary problem."
priceRange: "$X – $Y"
typicalDuration: "X to Y hours"
faqs:
  - question: "Common client question?"
    answer: "Clear, helpful answer."
relatedServices:
  - "/services/other-service/"
relatedAreas:
  - "/areas/burnside/"
lastReviewed: "7 September 2026"
author: "Nick"
authorRec: "REC 29064"
```

### `src/content/help/`
```yaml
title: "Symptom Name | Why It Happens & What to Do | Bara Electrical"
h1: "Symptom Name: Causes & What to Do"
metaDescription: "140-155 characters diagnosing the symptom and safety advice."
answerFirst: "40-60 word definitive diagnostic explanation."
safetyWarning: "Clear emergency warning if fire/shock risk exists."
causes:
  - title: "Cause 1"
    description: "Detailed description of why this causes the symptom."
diyChecks:
  - "Safe check 1 (e.g. unplugging appliances)"
licensedRequirements:
  - "Mandatory licensed task (e.g. megger testing, switchboard isolation)"
faqs:
  - question: "Diagnostic question?"
    answer: "Technical answer."
relatedService: "/services/relevant-service/"
lastReviewed: "7 September 2026"
author: "Nick"
authorRec: "REC 29064"
```

### `src/content/areas/`
```yaml
title: "Electrician Suburb Name | Licensed Local Sparky | Bara Electrical"
h1: "Licensed Electrician in Suburb Name"
metaDescription: "Fast local electrical services in Suburb Name. REC 29064."
suburb: "Suburb Name"
postcode: "30XX"
answerFirst: "40-60 word summary of service response and typical housing electrical needs in this suburb."
housingEra: "Estate details, construction era (e.g. 1990s-2010s brick veneer)"
typicalIssues:
  - "Specific local issue (e.g. ceramic fuses, high AC loads, EV charger readiness)"
faqs:
  - question: "Suburb specific question?"
    answer: "Answer addressing local context."
lastReviewed: "7 September 2026"
```

### `src/content/guides/`
```yaml
title: "Guide Title | Bara Electrical"
h1: "Guide Title"
metaDescription: "140-155 characters."
publishedDate: "YYYY-MM-DD"
lastReviewed: "DD Month YYYY"
author: "Nick"
authorRec: "REC 29064"
```

---

## 3. Monthly Content Cadence Checklist

To maintain domain freshness, technical authority, and crawl frequency, execute the following monthly workflow:

- [ ] **Publish 2 New Technical Guides** (`src/content/guides/`):
  - Choose topics addressing emerging questions (e.g., induction cooktop conversions, battery storage wiring, smart switch compatibility).
  - Ensure Answer-First passage, AS/NZS 3000 citations, and FAQ schema.
- [ ] **Publish 1 Real Job Write-Up / Case Study** (`src/content/_templates/job-writeup.md`):
  - Document a genuine recent installation in Melbourne West (e.g. 22kW EV charger install in Point Cook or complete rewiring in Sunshine).
- [ ] **Update `lastReviewed` Dates**:
  - Refresh technical review timestamps on core safety pages when standards or regulations are updated.
- [ ] **Run Build & Performance Validation**:
  - Run `npm run build`
  - Ensure 0 build warnings, 0 broken links, and fast static generation.
