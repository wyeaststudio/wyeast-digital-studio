# Specs — Wy'east Digital Studio

This site is built with **spec-driven development**: every feature is specified, planned, and broken into tasks before any code is written. AI agents and humans follow the same process.

## Structure

```
specs/
├── README.md            # This file: the process
├── constitution.md      # Non-negotiable rules for every spec and every line of code
├── roadmap.md           # Ordered list of features and their status
├── _templates/          # Copy these to start a feature
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
└── NNN-feature-name/    # One folder per feature, e.g. 001-foundation/
    ├── spec.md          # WHAT and WHY (EARS requirements + acceptance criteria)
    ├── plan.md          # HOW (architecture, schemas, components, files)
    ├── tasks.md         # Ordered, checkable implementation steps
    └── review/          # UX review screenshots and findings (optional)
```

## Workflow and approval gates

Each phase ends with an **explicit owner sign-off** before the next one starts.

| Phase | Output | Gate |
| --- | --- | --- |
| 1. Specify | `spec.md`: problem, users, EARS requirements, acceptance criteria, UX checklist, open questions | Owner approves spec |
| 2. Plan | `plan.md`: technical design that satisfies the spec within the constitution | Owner approves plan |
| 3. Tasks | `tasks.md`: small, ordered, testable tasks that trace to requirement IDs | Owner approves tasks |
| 4. Implement | Code + tests, one task at a time, checked off in `tasks.md` | All automated checks pass |
| 5. UX review | AI review agent compares screenshots to the spec and Figma; findings go in `review/` | Owner signs off and the feature is marked **Done** |

Rules:

- Agents MUST NOT write production code for a feature whose `tasks.md` is not approved.
- If implementation reveals the spec or plan is wrong, **stop**, update the document, and get re-approval. Never let code silently drift from its spec.
- Each document has a `Status` header: `Draft` → `In review` → `Approved` (→ `Done` for specs).
- Unresolved decisions go in the spec's **Open questions** section and are asked of the owner. They are never assumed.

## Requirement format (EARS)

Each requirement has a stable ID (`<FEATURE>-R<n>`, e.g. `CONTACT-R3`) and uses one of the EARS patterns:

| Pattern | Template |
| --- | --- |
| Ubiquitous | THE SYSTEM SHALL `<response>`. |
| Event-driven | WHEN `<trigger>`, THE SYSTEM SHALL `<response>`. |
| State-driven | WHILE `<state>`, THE SYSTEM SHALL `<response>`. |
| Unwanted behavior | IF `<condition>`, THEN THE SYSTEM SHALL `<response>`. |
| Optional feature | WHERE `<feature is included>`, THE SYSTEM SHALL `<response>`. |

Every requirement needs at least one verifiable acceptance criterion. Tasks and tests reference requirement IDs so each one can be traced to code.
