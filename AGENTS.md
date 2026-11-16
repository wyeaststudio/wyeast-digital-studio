<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Spec-driven development

This project is built from specs in [`specs/`](./specs/). Before any work:

1. Read [`specs/constitution.md`](./specs/constitution.md). Its rules override everything else.
2. Read [`specs/README.md`](./specs/README.md) for the workflow and approval gates.
3. Find the active feature in [`specs/roadmap.md`](./specs/roadmap.md) and read its `spec.md`, `plan.md`, and `tasks.md`.

Do not write production code unless the feature's `tasks.md` is `Approved`. Implement one task at a time and check it off only after the Definition of Done passes. If the spec or plan turns out to be wrong, stop and ask the owner. Never guess at open questions.
