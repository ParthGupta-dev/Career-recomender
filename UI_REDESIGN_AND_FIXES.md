# Career Recommender — UI Redesign & Pre-Launch Fix List

> Current UI is generic "AI SaaS template #4,792": indigo/violet gradient, blurred floating globes, glass cards. It's not bad — it's *invisible*. This doc fixes that, and lists the functional bugs that need fixing regardless of how it looks.

---

## PART 1 — Visual Identity Overhaul

### 1.1 Kill the generic indigo glassmorphism
`#6366f1` + `#8b5cf6` + blurred floating circles is the default output of every "make me a SaaS landing page" AI prompt since 2023. If a judge, recruiter, or user has seen *any* AI-generated demo this year, they've seen this exact palette. Replace it.

**New direction: "Signal" — a focused, editorial dark theme.**

```css
:root {
  /* Base */
  --bg: #0b0d12;              /* near-black, not navy */
  --surface: #14161d;         /* card backgrounds */
  --surface-raised: #1c1f29;  /* hovered/active cards */
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Accent — one confident color, not two competing gradients */
  --accent: #00d4a0;          /* signal green — distinct, not another purple */
  --accent-dim: #00d4a022;
  --accent-text: #00f5ba;

  /* Text */
  --text-primary: #f4f5f7;
  --text-secondary: #9296a3;
  --text-muted: #5c6070;

  /* Status (for demand/trend tags) */
  --status-high: #00d4a0;
  --status-medium: #f5a623;
  --status-low: #ff5c5c;
}
```

Why this works: one accent color used deliberately (not a gradient soup) reads as *designed*, not generated. Green-on-near-black has strong contrast and isn't claimed by every competitor demo at a hackathon.

### 1.2 Typography — stop using only weight to create hierarchy
Currently every heading and body text is the same font (`Outfit`) at different weights. Add a second typeface for contrast:

```html
<!-- Add alongside existing Outfit import -->
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
```

- **Headings (`h1`, `h2`, card titles):** `Space Grotesk`, weight 700 — gives the product a distinct "tech" voice instead of generic-friendly rounded type.
- **Body, labels, buttons:** keep `Outfit` — it's fine, the problem was never the font, it was using it for everything.

### 1.3 Replace the floating-blur-globes background
Decorative blurred circles are the single most overused AI-generated-UI tell. Replace with a subtle, purposeful background:

- A faint grid or dot-matrix pattern (`background-image: radial-gradient(...)` repeated at low opacity) — reads as "engineered," not "Canva template"
- OR a single static, very low-opacity glow positioned behind the hero only (not 3 animated blobs chasing each other forever)

```css
body {
  background-color: var(--bg);
  background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

Remove `.background-globes`, `.globe`, `.globe-1/2/3`, and the `@keyframes float` entirely.

### 1.4 Glass container → structured layout
Right now everything lives in one floating glass card centered on a black void. Replace with a real app shell:
- Fixed left sidebar (logo, nav between the 5 features as a vertical list, logout at bottom) on desktop ≥768px
- Top bar only on mobile, sidebar collapses into a hamburger/bottom-nav
- Main content area is NOT glass-blurred — flat `var(--surface)` background. Glassmorphism on a content-heavy app (markdown results, forms) reduces text legibility; save translucency for modals only.

### 1.5 Cards (landing page feature selector)
Current: identical card, icon, title, one-line description. Fine layout, weak differentiation.
- Give each of the 5 feature cards a distinct **accent edge color** (top 3px border) so users build a mental map by color, not just by reading: Discover=green, Roadmap=blue, Skill Check=amber, Resume=violet, Mock Interview=red
- On hover: lift (`translateY(-4px)`) + the accent border glows — currently hover just lightens background, which is the weakest possible feedback signal

### 1.6 Result displays (AI output)
Currently `.result-display` is a plain box with a colored left border and raw `<br>`-joined text via a hand-rolled markdown replacer (`parseMarkdown()` in script.js only handles `**bold**` and `\n` — no real lists, headers, or code blocks).

- Swap the hand-rolled parser for **Marked.js** (it's literally already listed as a dependency in your README, just never imported in `index.html` — add the script tag and use `marked.parse()` instead of the regex function)
- Style rendered markdown output: proper `<ul>`/`<li>` spacing, `<h3>` for stage headers in roadmaps, `<code>` inline styling for skill names

### 1.7 Mock Interview chat
Functionally fine, visually generic chat bubble pattern. Small but high-impact changes:
- Add a typing indicator (3 animated dots) instead of a static spinner icon during "Thinking..."
- Auto-scroll on new message (currently does this — keep it) but add a subtle fade-in per message, not just instant `appendChild`

### 1.8 Responsive design — currently **zero** `@media` queries exist in the entire stylesheet
This isn't a polish item, it's a blocker. On any phone, the `.interests-grid`, `.cards-container`, and `.chat-interface` (fixed `height: 500px`) will overflow or look broken. Minimum required breakpoints:

```css
@media (max-width: 768px) {
  .glass-container { width: 100%; border-radius: 0; padding: 1rem; }
  .cards-container { grid-template-columns: 1fr; }
  .interests-grid { grid-template-columns: repeat(2, 1fr); }
  .chat-interface { height: 70vh; }
}
```

---

## PART 2 — Functional Fixes (must-fix before the redesign matters at all)

These were found in the current `main` branch. Fix in this order — UI polish on top of a broken app is lipstick on a 404.

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | Frontend never calls your own `/api/gemini` or `/api/roadmap` serverless functions. All 5 features route through a client-side `callGemini()` that checks `state.apiKey`, which is **never set anywhere** — every feature permanently returns `"Error: No API Key Configured"` | `script.js` | Rewrite `callGemini()` to `fetch('/api/gemini', { method: 'POST', body: JSON.stringify({interests}) })` (and equivalent for roadmap). Delete the direct-to-Google-from-browser branch entirely. |
| 2 | `config.js` is gitignored with no committed fallback or build-time generation. On the deployed site, `<script src="config.js">` 404s → `CONFIG` is undefined → `auth.js` and `login.js` throw `ReferenceError` on their first line | `auth.js`, `login.js`, `index.html`, `login.html` | Firebase **web** client config is not a secret (it's protected by Firebase Security Rules, not obscurity). Either commit a real `config.js` with your actual Firebase web config, or generate it from env vars at build time. |
| 3 | `api/gemini.js` / `api/roadmap.js` are correctly written (CORS, env var, error handling) but currently dead code since nothing calls them | `api/*.js` | No code changes needed here — they'll start working the moment fix #1 is done. |
| 4 | `parseMarkdown()` is a 3-line regex hack, not real markdown rendering | `script.js` | Swap for `marked.parse()` — Marked.js is already referenced in your README's tech stack but never actually loaded in `index.html`. |
| 5 | `git.sh` shebang is `#!bin/bash` (missing leading slash) — script won't execute | `git.sh` | Change to `#!/bin/bash` |
| 6 | README has unfilled placeholders: `[Your Name]`, `your-repo-url` in the Deploy-with-Vercel badge | `README.md` | Fill in or remove |

---

## Priority order
1. Fix #1 and #2 (app is completely non-functional without these)
2. Apply Part 1 visual changes
3. Fix #4, #5, #6 (polish/cleanup)
