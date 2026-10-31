# Ceria Belajar — E2E Test Automation

[![E2E Tests](https://github.com/despisatria/ceria-belajar-automation/actions/workflows/e2e.yml/badge.svg)](https://github.com/despisatria/ceria-belajar-automation/actions/workflows/e2e.yml)
[![Allure Report](https://img.shields.io/badge/report-Allure-orange)](https://despisatria.github.io/ceria-belajar-automation/)
![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

End-to-end test automation for **[Ceria Belajar](https://ceria-belajar.pages.dev)**, a free, ad-free learning web app (PWA) for Indonesian pre-school children: letters, numbers, reading, maths, Hijaiyah, English, colours and science. I built the app, and this repo is how I test it.

| | |
|---|---|
| 🧪 **72 test runs** | 67 test cases on desktop, plus core flows repeated on a mobile viewport |
| 🐞 **3 bugs found and fixed** | in the medal and star system, plus accessibility gaps fixed along the way ([details](#bugs-found)) |
| 📊 **Live report** | https://despisatria.github.io/ceria-belajar-automation/ |

---

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Reports](#reports)
- [CI (GitHub Actions)](#ci-github-actions)
- [Test strategy](#test-strategy)
- [Coverage](#coverage)
- [Bugs found](#bugs-found)
- [Project structure](#project-structure)
- [Writing a new test](#writing-a-new-test)
- [Roadmap](#roadmap)

---

## Tech stack

| Area | Tool |
|---|---|
| Test framework | [Playwright Test](https://playwright.dev) 1.64 |
| Language | TypeScript (strict) |
| Design | Page Object Model, custom fixtures, data builders |
| Reporting | Allure 2 (published to GitHub Pages), Playwright HTML report |
| CI | GitHub Actions |
| Browsers | Chromium on Desktop Chrome and Pixel 7 viewports |

---

## Getting started

### Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| [Node.js](https://nodejs.org) | 20 or newer | running the tests |
| npm | comes with Node.js | installing dependencies |
| Java | 8 or newer | only for building the Allure report locally |

### Installation

```bash
git clone https://github.com/despisatria/ceria-belajar-automation.git
cd ceria-belajar-automation

npm ci                              # install dependencies
npx playwright install chromium     # download the browser Playwright drives
```

No `.env` file, accounts or secrets are needed: by default the tests run against the public production site.

### Check the setup

```bash
npm run test:smoke
```

All 12 smoke tests should pass in about half a minute.

---

## Running tests

### Scripts

| Command | What it runs |
|---|---|
| `npm test` | Every test, desktop and mobile |
| `npm run test:smoke` | Tests tagged `@smoke`: the critical paths |
| `npm run test:regression` | Tests tagged `@regression` |
| `npm run test:mobile` | Only the mobile viewport project (tests tagged `@mobile`) |
| `npm run test:headed` | Every test with the browser window visible |
| `npm run test:ui` | Playwright UI mode: pick tests, watch them run, time-travel through each step |
| `npm run typecheck` | TypeScript check without running anything |

### Running a subset

```bash
npx playwright test tests/progress                        # one folder
npx playwright test tests/profile/create-profile.spec.ts  # one file
npx playwright test --grep @profile                       # by tag
npx playwright test -g "Huruf Hijaiyah"                   # by test title
npx playwright test --project=desktop                     # desktop only
```

Tags in use: `@smoke`, `@regression`, `@mobile`, `@a11y`, and one per area: `@profile`, `@progress`.

### Choosing the target

| Target | How |
|---|---|
| **Production** (default) | nothing to set: `https://ceria-belajar.pages.dev` |
| **Any deployed URL**, e.g. a Cloudflare branch preview | `BASE_URL=https://<branch>.ceria-belajar.pages.dev npx playwright test` |
| **Local build of the app** | `npm run test:local`: builds the app from `../ceria-belajar` and serves it with `vite preview` on port 4173. Needs a checkout of the app repository, which is private. |

### Debugging a failure

```bash
npx playwright test -g "test title" --debug     # step through with the Playwright Inspector
npx playwright show-report                      # open the HTML report of the last run
npx playwright show-trace test-results/<test-folder>/trace.zip
```

Failed tests keep a screenshot and a video in `test-results/`; a trace is recorded when a test is retried in CI.

---

## Reports

### Allure report (online)

**https://despisatria.github.io/ceria-belajar-automation/**

Updated by every CI run on `main`. It is written to be readable without opening the code:

- **Behaviors** groups tests as *Ceria Belajar → Profiles / Medals / Stars → story*.
- Each test has a **description** listing, in plain language, what it verifies, and names the bug it guards when it covers one.
- The body reads as **Given / When / Then** steps. Page-object actions appear as one readable step (e.g. *Create profile "Daffa" with avatar panda*), and every check is titled after what it confirms (e.g. *the profile chip shows "DAFFA"*).
- **Trend** charts and the **Executors** widget link each report back to its CI run.

### Allure report (local)

```bash
npm test                 # writes allure-results/
npm run allure:report    # builds allure-report/ and opens it in the browser (needs Java)
```

### Playwright HTML report

```bash
npx playwright show-report
```

---

## CI (GitHub Actions)

Workflow: [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml)

| Trigger | When |
|---|---|
| `push` | every push to `main` |
| `pull_request` | every pull request |
| `workflow_dispatch` | on demand, from the Actions tab |

### Running it manually

1. Open **[Actions → E2E Tests](https://github.com/despisatria/ceria-belajar-automation/actions/workflows/e2e.yml)** and click **Run workflow**.
2. Optionally fill in:
   - **Target URL**: leave empty for production, or paste a preview URL.
   - **Tag**: `All`, `@smoke`, `@regression`, `@mobile`, `@profile` or `@progress`.
   - **Spec**: a folder or file under `tests/`, e.g. `progress` or `progress/medals.spec.ts`.

From the terminal:

```bash
gh workflow run e2e.yml -R despisatria/ceria-belajar-automation -f tag=@smoke
```

### What a run does

1. Installs dependencies, type-checks, and installs Chromium.
2. Runs the selected tests.
3. Restores the Allure history from the published report, so trend charts carry over between runs, then builds the Allure report.
4. Writes a **results table** to the run's summary page: target, tag, spec, passed, failed, broken, skipped, total, success rate, duration, and a link to the report.
5. On `main`, publishes the Allure report to GitHub Pages. Pull requests keep their Playwright report as a downloadable artifact instead.
6. Fails the run if any test failed, after the report is published.

---

## Test strategy

The app has no backend: every child profile, medal and star lives in the browser's `localStorage`. That shapes the approach.

| Decision | Why |
|---|---|
| **Seed state through `localStorage`** instead of clicking through the UI | A test that checks the *Huruf Hijaiyah* medal should not have to play through 30 letters first. Seeding the exact data shape the app writes keeps tests fast and isolated, and lets one test cover each of the 32 medals. |
| **The UI is still tested end-to-end where it matters** | Creating, choosing, editing and deleting a profile run through the real screens, because that is the first thing a parent does. |
| **Run against production by default** | It is a static site with no server-side data, so tests cannot pollute anything. |
| **Accessible locators first** (`getByRole`, `getByLabel`) | Locators that a screen reader could use are stable, and they double as a check that the app works without a mouse. Where the app fell short, I fixed the app instead of falling back to CSS selectors. |
| **Known bugs are `test.fail()`, not skipped** | The run stays green while a bug is open, and turns red (*expected to fail, but passed*) the moment a fix ships, so the marker never goes stale. |
| **Desktop and mobile** | Core flows tagged `@mobile` also run on a Pixel 7 viewport, because most children use a phone or tablet. |

---

## Coverage

| Area | Tests | What is checked |
|---|---|---|
| **Profiles** | 20 (+5 on mobile) | create, uppercase name, 10-character limit, trimming, empty and blank names, avatar choice by mouse and keyboard, staying signed in after a reload, switching player, choosing, editing, cancelling, deleting, deleting the last profile, the 6-profile limit |
| **Medals** | 37 | each of the 32 collection medals is awarded by exactly its own progress, the threshold boundary, the Home counter against the collection, the category filter, closing the modal |
| **Stars** | 10 | single-level games, rolling 3 levels up into overall stars, the same stars on the game menu and on Home, the category filter |

---

## Bugs found

Open bugs are tracked in [`src/data/known-bugs.ts`](src/data/known-bugs.ts). When a fix ships, its `test.fail()` mark is removed and the tests become ordinary regression tests.

| ID | Bug | Impact | Status |
|---|---|---|---|
| **BUG-001** | The medal collection marked the wrong medal as earned for Hijaiyah, Membaca, Berhitung and Bahasa Inggris (finishing *Huruf Hijaiyah* unlocked *Suku Kata Dasar*). | 19 of 32 medals showed the wrong reward to the child. | ✅ Fixed in app v1.18.1 |
| **BUG-002** | The Home medal counter skipped the *Campur Warna* medal. | The counter showed 31 when all 32 were earned. | ✅ Fixed in app v1.18.1 |
| **BUG-003** | Berhitung games gave 2 overall stars from 5 level stars; Home needed 6. | The same child saw 2 stars on the menu and 1 on Home. | ✅ Fixed in app v1.18.2 |

Writing the tests also surfaced **testability and accessibility gaps**, fixed in the app before these tests were written: profile cards, avatar choices and dashboard buttons were plain `div`s with click handlers (no keyboard or screen-reader support), the confirm modal was not exposed as a dialog, and the manage-profiles animation ignored the device's *reduce motion* setting.

---

## Project structure

```
.
├── .github/workflows/e2e.yml   CI: run, summarise, publish the Allure report
├── playwright.config.ts        projects (desktop, mobile), reporters, local web server
├── src/
│   ├── config/env.ts           target URL: production, BASE_URL or local build
│   ├── data/
│   │   ├── profiles.ts         child-profile builder and app limits
│   │   ├── badges.ts           the 32 medals with the progress that earns each one
│   │   └── known-bugs.ts       open bugs referenced by test.fail()
│   ├── fixtures/index.ts       page objects plus `player` and `freshVisitor` fixtures
│   ├── pages/                  page objects: ProfileSelectorPage, HomePage, CategoryMenuPage
│   ├── components/             shared UI: ConfirmModal, CollectionModal
│   └── utils/
│       ├── storage.ts          seed and read localStorage
│       └── report.ts           documentTest() and step() for readable reports
└── tests/
    ├── profile/                create-profile, manage-profile
    └── progress/               medals, stars
```

---

## Writing a new test

1. **Use the fixtures.** Import `test` and `expect` from `src/fixtures`. Ask for `player` to start signed in on Home, or `freshVisitor` for a first-time visitor. For custom data, call `seedStorage(page, { profiles, activeProfileId })` with profiles from `buildProfile({ progress })`.
2. **Go through page objects.** Locators and multi-step actions live in `src/pages` and `src/components`; wrap a new action in `step('Readable title', ...)` so it shows as one step in the report.
3. **Document it.** Start the test with `documentTest({ feature, story, severity, verifies: [...] })`.
4. **Write Given / When / Then steps** with `test.step(...)`, and give every `expect` a message saying what it confirms.
5. **Tag it** `@smoke` or `@regression`, plus the area tag, plus `@mobile` if it is a core flow on phones.
6. **Found a bug?** Add it to `known-bugs.ts`, mark the test with `test.fail(true, knownBug('BUG-00X'))`, and remove the mark once the fix is live.

```ts
import { expect, test } from '../../src/fixtures';
import { documentTest } from '../../src/utils/report';

test('should keep the child signed in after a reload', { tag: ['@smoke', '@profile'] }, async ({ page, player, homePage }) => {
  await documentTest({
    feature: 'Profiles', story: 'Stay signed in', severity: 'critical',
    verifies: ['Reloading the app keeps the same child signed in'],
  });

  await test.step(`When ${player.name} reloads Home`, async () => {
    await homePage.goto();
    await page.reload();
  });

  await test.step(`Then ${player.name} is still the active player`, async () => {
    await homePage.expectSignedInAs(player.name);
  });
});
```

---

## Roadmap

- Navigation smoke test over every route
- Game flows (answering, lives, game over, saving stars)
- Settings: backup and restore of progress
- PWA: install manifest, service worker, offline use
- Automated accessibility scans with axe-core
- Visual checks of Home and the category menus

---

Built by **[Desphi Satria Nurjaya](https://despisatria.github.io/)**, Software Quality Assurance Engineer.
