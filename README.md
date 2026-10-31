# Ceria Belajar — E2E Test Automation

[![E2E Tests](https://github.com/despisatria/ceria-belajar-automation/actions/workflows/e2e.yml/badge.svg)](https://github.com/despisatria/ceria-belajar-automation/actions/workflows/e2e.yml)
[![Allure Report](https://img.shields.io/badge/report-Allure-orange)](https://despisatria.github.io/ceria-belajar-automation/)

End-to-end tests for **[Ceria Belajar](https://ceria-belajar.pages.dev)**, a free learning PWA for Indonesian pre-school kids (alphabet, numbers, reading, maths, Hijaiyah, English, colours, science). I built the app, and this repo is how I test it.

**Stack:** Playwright · TypeScript · Page Object Model · axe-core · GitHub Actions · Allure

📊 **Latest report:** https://despisatria.github.io/ceria-belajar-automation/

---

## Test strategy

The app has no backend: every child profile, medal and star lives in the browser's `localStorage`. That shapes the approach.

| Decision | Why |
|---|---|
| **Seed state through `localStorage`** instead of clicking through the UI | A test that checks the "Huruf Hijaiyah" medal should not have to play 30 letters first. Seeding the exact data shape the app writes makes tests fast and isolated, and lets one test cover each of the 32 medals. |
| **The UI is still tested end-to-end where it matters** | Profile creation, selection, editing and deletion run through the real screens, because that is what a parent actually does first. |
| **Run against production by default** | It is a static site with no server-side data, so tests cannot pollute anything. |
| **Local mode for unreleased changes** | `APP_DIR=../ceria-belajar` builds the app and serves it with `vite preview`, so a branch is tested before it ships. |
| **Accessible locators first** (`getByRole`, `getByLabel`) | Locators that a screen reader could use are both stable and a check that the app is usable without a mouse. Where the app fell short, I fixed the app (see below) instead of falling back to CSS selectors. |
| **Known bugs are `test.fail()`, not skipped** | The suite stays green while a bug is open, and turns red ("expected to fail, but passed") the moment a fix ships, so the marker never goes stale. |
| **Desktop + mobile** | Core flows tagged `@mobile` also run on a Pixel 7 viewport, because most kids use a phone or tablet. |

## Coverage

| Area | What is checked |
|---|---|
| **Profiles** | create, uppercase name, 10-character limit, trimming, empty and blank names, avatar choice (mouse and keyboard), session kept after reload, switch player, select, edit, cancel, delete, delete the last profile, 6-profile limit |
| **Medals** | each of the 32 collection medals is awarded by exactly its own progress, threshold boundary, Home counter vs collection, category filter, closing the modal |
| **Stars** | single-level games, roll-up of 3 levels into overall stars, same stars on the game menu and on Home, category filter |

More areas (navigation smoke over every route, games, backup/restore, PWA offline, accessibility scans, visual checks) are being added.

## Bugs found

Found by this suite. Open bugs are tracked in [`src/data/known-bugs.ts`](src/data/known-bugs.ts); when a fix ships, its `test.fail()` mark is removed and the tests become ordinary regression tests.

| ID | Bug | Impact | Status |
|---|---|---|---|
| **BUG-001** | The medal collection marks the wrong medal as earned for Hijaiyah, Membaca, Berhitung and Bahasa Inggris (e.g. finishing *Huruf Hijaiyah* unlocks *Suku Kata Dasar*). | 19 of 32 medals show the wrong reward to the child. | Fixed in app v1.18.1 |
| **BUG-002** | The Home medal counter skips the *Campur Warna* medal. | Counter shows 31 when all 32 are earned. | Fixed in app v1.18.1 |
| **BUG-003** | Berhitung games give 2 overall stars from 5 level stars; Home needs 6. | The same child sees 2 stars on the menu and 1 on Home. | Fixed in app v1.18.2 |

Writing the tests also surfaced **testability and accessibility gaps** in the app, fixed in the app repo before these tests were written:
profile cards, avatar choices and dashboard buttons were plain `div`s with click handlers (no keyboard or screen-reader support), the confirm modal was not exposed as a dialog, and the manage-profiles animation ignored `prefers-reduced-motion`.

## Running locally

```bash
npm ci
npx playwright install chromium

npm test                  # everything, against production
npm run test:smoke        # @smoke only
npm run test:mobile       # mobile viewport project
npm run test:local        # against a local checkout of the app in ../ceria-belajar
npm run test:ui           # Playwright UI mode
npm run allure:report     # build and open the Allure report
```

`BASE_URL` overrides the target, e.g. a Cloudflare preview deployment.

## CI

[`.github/workflows/e2e.yml`](.github/workflows/e2e.yml) runs on every push and pull request, and on demand from the Actions tab (**Run workflow**) with an optional target URL, tag and spec. Each run writes a results table to the job summary. On `main` it publishes the Allure report to GitHub Pages and carries the report history forward, so trends build up across runs.

In the Allure report every test carries a plain-language description of what it verifies, is grouped by feature and story, and reads as Given / When / Then steps, with each check named after what it confirms.

## Structure

```
src/
  config/      target URL (production, local build or override)
  data/        test data builders, the medal catalogue, known bugs
  fixtures/    `player` (signed-in child) and `freshVisitor` fixtures
  pages/       page objects: ProfileSelector, Home, CategoryMenu
  components/  shared UI: ConfirmModal, CollectionModal
  utils/       localStorage seeding and reading
tests/
  profile/     profile gate and management
  progress/    medals and stars
```
