# VAT-131 — Production Manga/Webtoon UX Audit (2026-03-15)

- Scope: production UX audit for manga/webtoon creation flow
- Environment: `https://videoai.linkto.com.vn`
- Audit perspective: first-time user / non-expert creator
- Auditor intent: determine whether a user who does **not** understand the internal system model can successfully create manga/webtoon output
- Branch context: `work/vat-manga-webtoon-lane-20260312`

---

## 1. Executive summary

### Short answer
A first-time user can now discover that the product has a manga/webtoon lane, and the production system can reach real manga panel output. However, the current UX is **not yet beginner-friendly enough** to say the flow is easy, natural, or low-friction for a user who does not already understand the system.

### Core conclusion
The current production manga/webtoon flow is:
- **functionally real**
- **feature-rich**
- **usable for internal/power users**
- but **too cognitively heavy for beginners**

### Main reasons
1. Too many controls are shown too early.
2. The UI still exposes the **system model** more than the **user’s task model**.
3. The page mixes English and Vietnamese in the same flow.
4. Primary CTA wording does not match the beginner expectation of “create manga now”.
5. Internal/demo/business framing still leaks into the manga beginner journey.

---

## 2. Audit method

This audit was performed on the live production web using real runtime access after restoring origin availability behind Cloudflare.

### Live path used
1. Open production site: `https://videoai.linkto.com.vn`
2. Confirm production origin was reachable after fixing Cloudflare tunnel/origin network mismatch
3. Sign in with production user account
4. Enter workspace
5. Review manga/webtoon entry path and open a real manga project page
6. Inspect the live page structure and evaluate the flow from a first-time user perspective

### Important note
This audit focuses on **UX clarity, cognitive load, trust, discoverability, and beginner success likelihood**.
It is not limited to whether the backend works; it asks whether a new user can understand what to do and successfully move forward without already knowing internal terminology.

---

## 3. Live production observations

## 3.1 Production availability
Production was initially unreachable behind Cloudflare because the tunnel container and app container were not attached to the same Docker network. After reconnecting `cloudflared-vat` to `vat-live-net`, the domain recovered and could be audited again.

### UX significance
This matters because availability is the first UX gate. If the service is down, UX is effectively zero for end users regardless of interface quality.

---

## 3.2 Workspace entry page
On the production workspace page, the user can clearly see two creation lanes:
- **Story Studio**
- **Manga / Webtoon Studio**

### Positive observation
This is a meaningful improvement in discoverability. A new user can now recognize that manga/webtoon is a first-class creation path, instead of assuming the product is only for film/video workflows.

### Current card copy observed
- Heading: `Manga / Webtoon Studio`
- Description: `Build manga/webtoon scenes with chapter continuity and panel-first controls`
- CTA text near the card: `New Project`

### UX read from a beginner perspective
A beginner can identify that manga exists as a lane, but may still struggle to answer:
- What exactly happens if I click this?
- Can I start from a short idea?
- Do I need a script first?
- Is this for real creation or for advanced technical users?

### Assessment
- Discoverability: **good**
- Beginner clarity: **medium / not strong enough**

---

## 3.3 Workspace project list quality
The workspace project list still shows several internal/test-style project names, including benchmark/test artifacts and rough project labels.

Examples observed in production:
- `UX Manga Flow Test 20260311-0051`
- `VAT132 Story Text Run 20260314-2305`
- `fasda`
- `1231`

### UX impact
For a real beginner or customer-facing production environment, this creates several problems:
1. lowers trust
2. makes the product feel internally noisy
3. makes it unclear which projects are meaningful user-facing work versus internal/testing artifacts

### Assessment
- Trust impact: **high**
- Perceived polish impact: **high**

---

## 3.4 Real manga project page: first-time user experience
Inside a live manga project page, the following UI surfaces are shown together on first view:
- stage navigation
- current episode controls
- asset library access
- settings / refresh
- story/novel text input
- manga mode toggle
- preset / layout / color mode
- style lock
- style strength
- chapter continuity mode
- chapter id
- conflict policy
- demo flow setup
- model availability
- teaser / brand / explainer bundles
- visual style gallery
- character direction presets
- environment presets
- primary generate CTA
- manga storytelling controls
- panel templates
- storytelling prompt kits
- quick actions
- scroll narrative preview
- conflict/style secondary controls
- run history

### UX finding
This is a textbook **cognitive overload** problem for beginners.

The page exposes too many decisions before the user has even completed the basic job:
> “I have an idea. Please help me turn it into manga panels.”

### Why this matters
A beginner does not know:
- which controls are required
- which controls are optional
- which controls are advanced
- which controls are safe to ignore
- what the recommended path is

### Assessment
- Power-user capability: **high**
- Beginner usability: **low to medium**
- Cognitive load: **high**

---

## 3.5 Primary CTA wording is misaligned with user expectation
The primary manga generation CTA currently appears as:
- `Tạo Script Demo (Manga)`

### Why this is a problem
For a beginner trying to create manga, this wording is confusing because:
1. it emphasizes **demo** instead of a real creation outcome
2. it implies a script-generation step, not manga generation
3. it does not tell the user what they will get next
4. it does not reinforce the feeling that they are on a guided beginner path

### Likely beginner questions triggered by this CTA
- Am I generating a demo or a real result?
- If I want manga panels, why am I pressing a “script demo” button?
- Is this only for internal testing or for actual use?

### Assessment
- Wording clarity: **weak for beginners**
- Action confidence: **low**

---

## 3.6 System-model language is leaking into the beginner journey
The page uses many internal/power-user concepts such as:
- panel-first controls
- chapter continuity
- style lock
- conflict policy
- runtime lane
- storytelling prompt kit

### Why this is problematic
These are valid concepts for advanced control, but they are not the right first language for a beginner.
A beginner thinks in outcome language:
- I have an idea
- I want manga pages/panels
- I want a style
- I want to fix bad results
- I want to continue from here

### Assessment
- Advanced control design: **strong**
- Beginner conceptual onboarding: **weak**

---

## 3.7 Language consistency problem
The live production page mixes English and Vietnamese in the same screen and same journey.

Examples observed:
- `Currently editing: Tập 1`
- `Asset Library`
- `Settings`
- `Refresh Data`
- `Manga setup`
- `Panel script`
- `Webtoon panels`
- but also many Vietnamese explanatory strings on the same page

### Why this matters
Mixed language inside a single flow increases cognitive cost, reduces trust, and makes the product feel unfinished.
For new users, this often registers as:
- harder to skim
- harder to trust
- harder to understand what is important

### Assessment
- Consistency: **poor**
- Production polish impact: **high**

---

## 3.8 “Demo flow setup” is off-path for beginner manga creation
The page prominently shows business/demo-oriented presets such as:
- Launch Teaser
- Brand Story
- Product Explainer

### Why this is a mismatch
These presets frame the product around:
- business outcomes
- promo/demo storytelling
- marketing intent

But a beginner trying to make manga is usually thinking:
- I want to create a story scene
- I want manga panels from my idea
- I want to explore characters and style

### UX risk
This block dilutes the manga-creation mental model and makes the page feel like a hybrid internal demo surface rather than a focused manga creation flow.

### Assessment
- Relevance to beginner manga task: **low**
- Distraction level: **medium to high**

---

## 3.9 Quick actions are powerful but not onboarded
The page exposes real quick actions:
- Add
- Duplicate
- Split
- Merge
- Reorder

These are useful and clearly valuable for iterative editing, but the page does not sufficiently explain:
- when to use each action
- which actions are safe for beginners
- what the expected effect will be
- which order of use is recommended

### Assessment
- Feature usefulness: **high**
- First-time usability guidance: **insufficient**

---

## 4. Final UX verdict: can a non-expert use this to create manga?

### Functional answer
Yes, the product can generate manga/webtoon output and the live runtime has proven it can reach panel output.

### UX answer
Not yet in a beginner-friendly way.

### More precise statement
A first-time user can probably:
- find the manga lane
- enter a project
- notice that there is a path to generate manga

But they are still likely to struggle with:
- understanding the sequence of steps
- knowing what to ignore
- trusting the main CTA
- distinguishing beginner vs advanced controls
- feeling confident that they are on the correct path

### Overall assessment
- Discoverability: **good**
- Trust/polish: **medium-low**
- Cognitive load: **high**
- Beginner confidence: **low to medium**
- Advanced control power: **high**

---

## 5. Prioritized UX recommendations

## P0 — mandatory
### 5.1 Stabilize production and keep it stable
Before all deeper UX work, production reliability must remain strong. Availability is the first UX requirement.

### 5.2 Enforce single-language consistency per locale
A user on English locale should not see mixed English/Vietnamese strings in the same core task flow.

---

## P1 — make the beginner path clear
### 5.3 Replace vague CTA wording
Recommended replacements for the main manga CTA:
- `Create Manga from Story`
- `Generate Manga Panels`
- `Step 1: Generate Panel Script`

Avoid emphasizing `Demo` in the primary beginner path unless the whole product is explicitly positioned as a demo environment.

### 5.4 Change workspace card CTA from `New Project`
Recommended replacements:
- `Create Manga Project`
- `Start Manga from Idea`
- `Start Webtoon from Story`

### 5.5 Add explicit beginner helper line
Examples:
- `Start with 1–3 sentences`
- `No screenplay required`
- `You can refine panels after generation`
- `Best for first-time manga creators`

---

## P1 — reduce cognitive load on the project page
### 5.6 Split the page into Beginner and Advanced modes
In Beginner mode, keep only:
1. story input
2. basic style choice
3. primary generate CTA
4. generated output

Move or collapse advanced controls:
- style lock
- chapter continuity
- chapter id
- conflict policy
- run history
- quick action advanced surfaces
- demo flow setup

### 5.7 Reframe system-model sections into user-task language
Instead of exposing `panel-first controls` first, start with outcome language:
- `Describe your scene`
- `Choose a visual style`
- `Generate manga panels`
- `Refine panel flow`

---

## P2 — improve trust and polish
### 5.8 Clean internal/test project noise from production-facing workspace
Hide or separate testing/internal projects from normal workspace view.

### 5.9 Add lightweight onboarding for quick actions
Provide micro-guidance such as:
- `Add = create a new panel after the current one`
- `Split = break one long panel into two beats`
- `Reorder = change reading flow order`

### 5.10 Reposition or collapse “Demo flow setup”
This section is too prominent for a beginner manga journey. It should move to:
- advanced mode
- optional presets
- or a separate business/demo section

---

## 6. Product recommendation in one sentence
The current production manga/webtoon flow is already capable, but to make it truly usable for non-expert creators, the product should shift from a **tool-centric advanced control surface** toward a **guided beginner creation journey** with clearer CTAs, less cognitive load, cleaner language consistency, and stronger trust signals.
