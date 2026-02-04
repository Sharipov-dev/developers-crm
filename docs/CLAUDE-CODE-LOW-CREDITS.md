# Claude Code Low-Credit Guide

This file is a standalone checklist for using Claude Code with minimal credits.
It does not change any existing docs. Review this file and decide whether to
merge parts into other guides later.

## Core Principles

- Keep prompts short and requirements-only.
- Minimize context: only the files needed for the task.
- Work in small steps; approve one step at a time.
- Prefer diffs over long explanations.

## Prompt Template (Low-Credit)

```
Add a "[feature name]" module.

Entity:
- field: type, required/optional, constraints

Operations:
- Operation 1
- Operation 2

Business rules:
- Rule 1
- Rule 2

Constraints:
- Only touch: <list of files or folders>
- No tests yet
- Reply with: files changed + diff only
```

## Claude Code Usage Tips

- Ask for a plan first, then say: "Proceed with step 1 only."
- Split full CRUD into smaller requests (create + list first).
- Avoid implementation details (controller names, method signatures, etc.).
- Explicitly say: "Do not add extra features or refactors."
- Avoid attaching large files; reference paths instead.
- If you need a specific file, ask Claude to open only that file.

## Example Low-Credit Prompt

```
Add a "tags" module.

Entity:
- name: string, required, unique, max 30 chars
- slug: string, required, unique

Operations:
- Create tag
- List tags (paginated)

Business rules:
- name is case-insensitive (store lowercase)

Constraints:
- Only touch: prisma/schema.prisma, src/domain/, src/application/
- No tests yet
- Reply with: files changed + diff only
```

## Optional Workflow

1. Ask for a plan.
2. Approve step 1 only.
3. Review diff.
4. Repeat.
