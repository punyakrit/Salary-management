# Data model

Source of truth: [`prisma/schema.prisma`](../prisma/schema.prisma).

```mermaid
erDiagram
    COUNTRY ||--o{ EMPLOYEE : employs
    DEPARTMENT ||--o{ EMPLOYEE : contains
    EXCHANGE_RATE ||--o{ EMPLOYEE : "converts currency"
    EMPLOYEE ||--o{ SALARY_REVISION : "salary history"

    COUNTRY { char2 code PK "ISO 3166" text name char3 currency "default pay currency" }
    DEPARTMENT { int id PK text name UK }
    EXCHANGE_RATE { char3 currency PK decimal usd_rate date as_of }
    EMPLOYEE {
        uuid id PK
        serial employee_number UK "shown as EMP-000123"
        text first_name
        text last_name
        text email UK
        text job_title
        int department_id FK
        char2 country_code FK
        enum employment_type
        date hire_date
        decimal salary "annual base, DECIMAL(14,2)"
        char3 currency FK
    }
    SALARY_REVISION {
        uuid id PK
        uuid employee_id FK
        decimal previous_salary "null = initial"
        char3 previous_currency
        decimal new_salary
        char3 currency
        text reason
        date effective_date
    }
```

## Why it looks like this

- **Current salary on `employees`, history in `salary_revisions`.** Directory and insights read one row per person. Every pay change appends a revision in the same transaction.
- **`currency` per employee, defaulted from the country.** This covers expats and contractors paid in USD or EUR. It's a foreign key to `exchange_rates`, so an employee can't have a currency we can't convert.
- **`DECIMAL(14,2)`, never float.** It's exact and fits annual salaries in IDR or JPY. `CHECK (salary > 0)` backs up the app-level validation.
- **`departments` is a table, `job_title` is text.** Departments are a small governed list; job titles are many and change often.
- **UUID primary key plus a human `employee_number`.** URLs stay opaque, while HR searches by `EMP-000123`.
- **Hard delete (cascades to revisions).** Termination lifecycle is out of scope for v1.

## Indexes

| Index | Serves |
|---|---|
| `email` unique, `employee_number` unique | integrity + exact-match search |
| `(country_code, job_title)` | country filter; "pay by job title in a country" |
| `department_id` | department filter and payroll by department |
| `(last_name, first_name)` | default directory sort |
| `salary_revisions (employee_id, effective_date DESC)` | one employee's salary history |

## Seed

`pnpm db:seed` generates 10,000 employees across 10 countries.

- **Deterministic:** fixed faker seed, so the same data comes out every run.
- **Realistic pay:** `salary = job band (USD) × country pay level × ±15% jitter`, converted to local currency and rounded.
- **Idempotent:** truncates first, inserts in batches of 1,000.
- **Tested:** the generators in `prisma/seed/generators.ts` are pure functions with unit tests.
