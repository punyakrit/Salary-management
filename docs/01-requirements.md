# Requirements — ACME Salary Management (v1)

> One-page scope document, written before any code. Decisions referenced here are expanded in [`docs/adr/`](./adr).

## Goal

Replace the spreadsheets ACME's HR team uses for 10,000 employees across multiple countries with a web app that lets the **HR Manager** (1) keep salary records accurate, and (2) answer *"how does the org pay people?"* in seconds instead of pivot tables.

## Persona & jobs-to-be-done

**HR Manager** — a single trusted internal user, comfortable with Excel, not technical.

| # | Job to be done | How v1 answers it |
|---|---|---|
| J1 | "Find an employee and see what we pay them." | Searchable, filterable, sortable directory over 10k rows |
| J2 | "Onboard someone / fix a record / remove a leaver." | Create, edit, delete employee |
| J3 | "Give someone a raise and keep track of it." | Salary update that writes an append-only revision log |
| J4 | "What's the min / max / average salary in a country?" | Country insights, in local currency **and** USD |
| J5 | "What do we pay a given job title in a given country?" | Job-title-within-country breakdown |
| J6 | "Where does our payroll money go?" | Payroll cost & median by department and by country |

## In scope (v1)

1. **Employee directory** — server-side pagination, search (name / email / employee code), filters (country, department, job title), sorting.
2. **Employee CRUD** — name, email, job title, department, country, employment type, hire date, annual base salary + currency. Validated with the same schema on the client and the server.
3. **Salary revisions** — every salary change records previous → new, effective date, and reason.
4. **Insights** — org headcount, total annual payroll (USD), median salary; per-country and per-department min / max / avg / median; per-job-title stats within a country; salary distribution.
5. **Seed script** — 10,000 realistic, *deterministic* employees (same seed → same data) across ~10 countries.
6. **Deployed app + demo video.**

## Deliberately out of scope (and why)

| Left out | Reasoning |
|---|---|
| Authentication / roles | One trusted persona; auth is a well-known, separable layer (e.g. Clerk/Auth.js in front of the API). The deployed demo uses synthetic data only. **First item post-v1.** |
| Payroll processing (tax, deductions, payslips, payouts) | A different domain with country-specific law. v1 is the *system of record for compensation*, not a payroll engine. |
| Bonus, equity, allowances | Base salary answers the stated questions. The revision model extends to compensation components later. |
| Live FX rates | Static, dated rates in a table keep analytics reproducible and testable with no third-party dependency. Rates show an "as of" date. |
| Excel import / export | Valuable for migration, but the seed proves the 10k-row path. CSV export is the first stretch goal. |
| Demographic / pay-equity analytics | Requires sensitive PII, consent and access control that v1 doesn't have. |
| Manager hierarchy, approvals, notifications | Needs multiple roles, so it depends on auth. |
| Soft-delete / termination lifecycle | Delete is a hard delete in v1. Leavers' history matters for audits, but that's a compliance feature for later. |

## Non-functional targets

- Directory query (page of 25 over 10k rows, filtered + sorted): **< 300 ms p95** at the API.
- Insights queries: **< 500 ms** without caching.
- Seed 10k employees: **< 30 s** against Neon.
- Unit-test suite: **< 10 s**, no network, no database, deterministic.
- Money is never stored as floating point (see [ADR-0003](./adr/0003-money-and-currency.md)).

## Success looks like

The HR Manager can answer J1–J6 without leaving the app, and a reviewer can trace each decision from this page → ADR → code → test.
