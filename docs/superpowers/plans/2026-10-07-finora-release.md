# FINORA 1.0.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebrand the existing encrypted finance app as FINORA, polish input and tablet layouts, and add verifiable iOS build and stable Android release signing paths.

**Architecture:** Keep React/TypeScript/Vite, Capacitor, IndexedDB and existing vault/ledger untouched. Centralize copy through existing UI locations, override focus at the form control wrapper, adapt dashboard grid through semantic panel classes, and add platform workflows without changing IDs.

**Tech Stack:** React 19, TypeScript, Vite, Capacitor 8, Gradle/AGP, Xcode/SPM, Playwright, Vitest.

**Spec:** User attachment from 2026-10-07, copied to `docs/reference/permintaan-finora.txt`.

## Global Constraints

- Version 1.0.2, Android versionCode 3, iOS build 3; package/bundle identifier `id.fahmidjawas.keuanganrumah`.
- Password any nonempty string, PIN exactly six digits; no vault migration or auto demo data.
- Android release signing requires four specified GitHub Secrets; debug APK is not interchangeable with signed release.
- iOS simulator build is unsigned; IPA production requires real Apple credentials.

## Review Focus

- Existing-account login with password `1` and PIN after rebrand: E2E verifies both.
- Focused password nested inside wrapper: computed styles and screenshot verify no browser outline while wrapper focus is visible.
- Landscape tablet and keyboard open: responsive E2E checks active input visibility, no horizontal overflow and nav behavior.
- Existing data with new version: native Activity recreation and browser persistence E2E.
- Missing Android signing secrets: workflow must skip release safely and still publish debug artifact.

### Task 1: Input and brand

**Files:** `src/reference.css`, `src/pages/Login.tsx`, `src/pages/OwnerSetup.tsx`, `src/components/Brand.tsx`, `src/App.tsx`, `src/pages/Settings.tsx`, `index.html`, `vite.config.ts`, `capacitor.config.ts`, `tests/finora.spec.ts`.

- [ ] Write E2E for FINORA onboarding/login brand, focus computed styles, show/hide, password `1`.
- [ ] Run focused E2E red; implement shared input styling and brand copy.
- [ ] Run focused E2E green; inspect login screenshots.

### Task 2: Tablet dashboard

**Files:** `src/pages/Overview.tsx`, `src/reference.css`, `tests/finora.spec.ts`.

- [ ] Write landscape tablet layout assertion for 4 KPI row and panel pairs.
- [ ] Run red; add semantic panel classes/order and compact spacing.
- [ ] Run green and review portrait/landscape screenshots.

### Task 3: Native brand and release paths

**Files:** Android/iOS resources and build settings, `.github/workflows/android.yml`, new `ios.yml`, `README.md`, `CHANGELOG.md`, version files, `tests/native.test.ts`.

- [ ] Write unit tests for synced versions/IDs/display names/workflows and run red.
- [ ] Set 1.0.2/build 3, update icon/splash branding, add conditional signing and unsigned iOS simulator workflow.
- [ ] Run unit green, sync native source and compile Android; verify APK badge/signature/assets.

### Task 4: Release verification

- [ ] Run npm ci, lint, typecheck, unit, E2E, web build, Capacitor Android/iOS sync, Gradle debug and test APK compile.
- [ ] Commit and push `main`, wait CI/Android/iOS Actions; fix any failures with next patch version if needed.
- [ ] Report artifact, signing prerequisites, iOS validation and cloud environment draft.
