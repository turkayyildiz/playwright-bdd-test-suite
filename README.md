# 🎭 TypeScript Playwright BDD Framework

![CI](https://github.com/turkayyildiz/playwright-bdd-test-suite/actions/workflows/bdd-tests.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.44-45ba4b?logo=playwright&logoColor=white)
![Cucumber](https://img.shields.io/badge/Cucumber-10.x-23D96C?logo=cucumber&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

**Note:** This repository is a personal showcase of the architectural patterns and best practices I implement in my professional automation projects. My primary daily contributions are hosted in private repositories at [@turkayyildizz](https://github.com/turkayyildizz)

A production-grade E2E and API test automation framework built with **TypeScript**, **Playwright**, and **Cucumber (BDD)**. Designed to scale across multiple environments and teams — featuring multi-environment config management, Pino structured logging, Playwright traces, Docker containerisation, and full CI/CD via GitHub Actions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Decisions](#architecture-decisions)
- [Test Scenarios](#test-scenarios)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Environment Management](#environment-management)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker](#docker)
- [Reporting & Observability](#reporting--observability)

---

## Overview

This framework covers two test layers:

- **UI E2E** — Login functionality on [SauceDemo](https://www.saucedemo.com) using Playwright browser automation
- **API** — Full CRUD booking lifecycle on [Restful Booker](https://restful-booker.herokuapp.com) using Playwright's native request context

Both layers share the same BDD Gherkin format, typed world, structured logging, and CI pipeline — making the framework consistent and easy to extend with new applications.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| TypeScript | 5.x | Strict type-safe test authoring |
| Playwright | 1.44 | Browser automation + API request context |
| Cucumber | 10.x | BDD / Gherkin test runner |
| Pino | 9.x | Structured JSON logging (console + file) |
| Docker | — | Containerised test execution |
| GitHub Actions | — | CI/CD pipeline |
| cross-env | 7.x | Cross-platform environment variable management |
| ts-node | 10.x | TypeScript execution without compile step |

---

## Project Structure

```
ts-playwright-personal-framework/
│
├── .github/
│   └── workflows/
│       └── bdd-tests.yml             # CI: smoke gate → full suite → Docker run
│
├── api/
│   └── bookingClient.ts              # Typed API client — auth, CRUD, helpers
│
├── config/
│   └── env.config.ts                 # Multi-environment config — reads .env.{ENV}
│
├── features/
│   ├── ui/
│   │   └── login.feature             # UI scenarios (@smoke @negative @security)
│   └── api/
│       └── booking.feature           # API scenarios (@api @smoke @negative)
│
├── hooks/
│   ├── hooks.ts                      # UI lifecycle — browser, trace, screenshots
│   └── api.hooks.ts                  # API lifecycle — request context, error logging
│
├── pages/
│   └── loginPage.ts                  # Page Object — locators, assertions, logging
│
├── steps/
│   ├── ui/
│   │   └── login.steps.ts            # Given/When/Then for UI login scenarios
│   └── api/
│       └── booking.steps.ts          # Given/When/Then for API booking scenarios
│
├── support/
│   └── world.ts                      # ICustomWorld — typed shared state for UI + API
│
├── utils/
│   ├── logger.ts                     # Pino logger — console (pretty) + file output
│   └── test-data.factory.ts          # Type-safe user factory and scenario datasets
│
├── reports/                          # Generated — gitignored
│   ├── cucumber-report.html
│   ├── test-run.log
│   ├── videos/
│   └── traces/
│
├── .env.example                      # Committed — template for local setup
├── .env.staging                      # Gitignored — staging credentials
├── .env.dev                          # Gitignored — dev credentials
├── Dockerfile                        # Containerised test runner
├── cucumber.config.js                # Cucumber config — tag + env aware
├── package.json
└── tsconfig.json
```

---

## Architecture Decisions

**Separated hooks by layer** — `hooks.ts` handles browser lifecycle for UI tests, using `{ tags: 'not @api' }` so API scenarios never open a browser context. `api.hooks.ts` handles `APIRequestContext` lifecycle for API tests, using `{ tags: '@api' }` so it only fires for API scenarios. No cross-contamination.

**Single typed world** — `ICustomWorld` holds both UI fields (`browser`, `page`, `loginPage`) and API fields (`apiRequest`, `bookingClient`, `bookingId`, `lastResponse`) in one typed interface. Steps across both layers share state safely.

**Typed API client** — `BookingClient` encapsulates all HTTP calls with strict interfaces (`Booking`, `BookingDates`, `AuthResponse`). No raw `any` types. Auth headers managed internally — steps never construct headers directly.

**Test data factory** — `UserFactory` and `LoginScenarios` in `utils/test-data.factory.ts` provide all test data via typed factory functions. No hardcoded strings in tests or page objects.

**Environment abstraction** — `config/env.config.ts` loads `.env.{TEST_ENV}` at runtime. Switching environments requires zero code changes — pass `TEST_ENV=dev` at the command line.

**Structured observability** — Pino logger writes to console (pretty-printed) and `reports/test-run.log`. On UI failure: screenshot + Playwright trace zip + browser console errors all auto-attached to the HTML report. On API failure: response status and body logged and attached.

**Known API bugs documented** — Restful Booker returns `500` instead of `400` for missing required fields. This is documented in the feature file with a comment rather than silently adjusted — QA engineers document bugs, not hide them.

---

## Test Scenarios

### UI — Login (`features/ui/login.feature`)

| Tag | Scenario | Expected Result |
|---|---|---|
| `@smoke` `@positive` | Valid credentials login | Redirected to `/inventory.html` |
| `@positive` | Multiple valid user types (Outline) | All redirect to inventory |
| `@negative` | Invalid username + password | Error message shown |
| `@negative` | Empty username | "Username is required" |
| `@negative` | Empty password | "Password is required" |
| `@negative` | Locked out user | "Sorry, this user has been locked out" |
| `@security` | Error message dismissed | Error no longer visible |
| `@smoke` | Login → Logout full flow | Redirected back to login page |

**Users under test (SauceDemo):**

| Type | Username | Outcome |
|---|---|---|
| Standard | `standard_user` | Login success |
| Performance | `performance_glitch_user` | Login success (intentionally slow) |
| Locked | `locked_out_user` | Blocked |
| Invalid | `invalid_user` | Auth error |

---

### API — Booking (`features/api/booking.feature`)

| Tag | Scenario | Expected Status |
|---|---|---|
| `@api` `@smoke` | Get all bookings | `200` + non-empty list |
| `@api` `@smoke` | Create a new booking | `200` + booking id returned |
| `@api` | Get a specific booking by id | `200` + correct data |
| `@api` | Update a booking (PUT) | `200` + updated fields |
| `@api` | Partially update a booking (PATCH) | `200` + updated firstname |
| `@api` `@negative` | Get non-existent booking | `404` |
| `@api` `@negative` | Delete a booking | `201` + booking gone |
| `@api` `@negative` | Create with missing firstname | `500` ⚠️ known API bug |

> ⚠️ **Known API bug:** Restful Booker returns `500 Internal Server Error` instead of `400 Bad Request` when required fields are missing. This is intentional in the practice API and documented as a bug finding.

---

## Getting Started

**Prerequisites:** Node.js 20+, npm, Docker (optional)

```bash
# Clone
git clone https://github.com/turkayyildiz/playwright-bdd-test-suite.git
cd ts-playwright-personal-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Set up local environment
cp .env.example .env.staging
# Edit .env.staging with your values if needed
```

---

## Running Tests

```bash
# Full suite (UI + API) — staging environment
npm test

# Full suite — dev environment
npm run test:dev

# Smoke tests only (fast pre-deploy gate)
npm run test:smoke

# UI tests only
npm run test:ui

# API tests only
npm run test:api

# Negative scenarios only
npm run test:negative

# Security scenarios only
npm run test:security

# Headed mode — watch the browser
npm run test:headed
```

---

## Environment Management

The framework supports multiple environments with zero code changes.

**Switch environment at runtime:**
```bash
cross-env TEST_ENV=dev npm test        # loads .env.dev
cross-env TEST_ENV=staging npm test    # loads .env.staging
```

**`.env.staging` structure** (copy from `.env.example`):
```
BASE_URL=https://www.saucedemo.com
USER_STANDARD=standard_user
USER_LOCKED=locked_out_user
USER_INVALID=invalid_user
USER_PERF=performance_glitch_user
PASSWORD=secret_sauce
PASSWORD_INVALID=wrong_password
TIMEOUT_DEFAULT=30000
TIMEOUT_NAVIGATION=60000
TIMEOUT_ASSERTION=10000
```

> ⚠️ Never commit `.env.staging` or `.env.dev` — they are gitignored. Only `.env.example` is committed.

---

## CI/CD Pipeline

The GitHub Actions pipeline ([`.github/workflows/bdd-tests.yml`](.github/workflows/bdd-tests.yml)) triggers on every push to `main`/`develop`, every pull request, and daily at **07:00 UTC** Monday–Friday.

**Three-stage pipeline:**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   1. Smoke      │────▶│  2. Full Suite   │────▶│   3. Docker     │
│   @smoke tags   │     │  UI + API        │     │  containerised  │
│   ~2 minutes    │     │  ~10 minutes     │     │  isolated run   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

Credentials injected via **GitHub Secrets** — never hardcoded:
- `STAGING_URL` → base URL for staging environment
- `TEST_PASSWORD` → test account password

Reports uploaded as artifacts with 14-day retention after every run.

---

## Docker

Run the full suite in a fully isolated container — no local browser install needed:

```bash
# Build
docker build -t ts-playwright-framework .

# Run against staging
docker run --rm \
  -e TEST_ENV=staging \
  -e BASE_URL=https://www.saucedemo.com \
  -e PASSWORD=secret_sauce \
  -v $(pwd)/reports:/app/reports \
  ts-playwright-framework
```

The Dockerfile uses the official `mcr.microsoft.com/playwright` base image — Chromium is pre-installed, ensuring identical execution between local and CI environments.

---

## Reporting & Observability

**After every run:**

```bash
# Open HTML report
open reports/cucumber-report.html

# View structured log
cat reports/test-run.log
```

**On failure, the following are automatically captured:**

| Layer | Artifact | Details |
|---|---|---|
| UI | Screenshot | Full-page capture at point of failure |
| UI | Playwright Trace | `reports/traces/{scenario}.zip` |
| UI | Console errors | Browser JS errors captured during scenario |
| UI | Video | Recorded in CI (`reports/videos/`) |
| API | Response log | Status code + body attached to HTML report |

**View a Playwright trace locally:**
```bash
npx playwright show-trace "reports/traces/Scenario Name.zip"
```

---

## Author

**Turkay Yildiz** — Test Automation Engineer  
[LinkedIn](https://linkedin.com/in/turkayyildiz) · [GitHub](https://github.com/turkayyildizz)
