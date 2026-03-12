```
# AGENTS.md

Always review `~/.codex/AGENTS.md` at the beginning of each new Codex CLI session.

## How guidance is loaded (debug quick notes)

- Codex home defaults to `~/.codex`.
- Codex stops adding instruction files once the combined instruction chain reaches `project_doc_max_bytes` (32 KiB / 32768 bytes by default). Keep this file small.
- To confirm what loaded:
  - `codex --ask-for-approval never "Summarize the current instructions."`

## Baseline workflow

- Start every task by determining:
  1. goal + acceptance criteria,
  2. constraints (time, safety, scope),
  3. what must be inspected (files, commands, tests).
- If requirements are ambiguous, ask targeted clarifying questions before making irreversible changes.
- When changes are required:
  - propose a short plan (2–6 bullets), then execute.

## Editing files

- Make the smallest safe change that solves the issue.
- Preserve existing style and conventions.
- Prefer patch-style edits (small, reviewable diffs) over full-file rewrites.
- After making changes, run the project’s standard checks when feasible (format/lint, unit tests, build/typecheck).


## Secrets and sensitive data

- Never print secrets (tokens, private keys, credentials) to terminal output.
- Do not request users paste secrets.
- Avoid commands that might expose secrets (e.g., dumping env vars broadly, `cat ~/.ssh/*`).
- Prefer existing authenticated CLIs; redact sensitive strings in any displayed output.

## Context7 MCP (library docs)

Use Context7 to fetch accurate, version-matched documentation during coding tasks.

- Add `use context7` when you need library/API docs.
- If known, pin the library with slash syntax (e.g., `use library /supabase/supabase`).
- Mention the target version.
- Fetch minimal targeted docs; summarize (no large dumps).

## Task tracking for multi-step work (recommended)

For non-trivial tasks (multi-step, >30 minutes, or spanning sessions), keep two files:

### `PLANS.md` (execution plan + progress ledger)

Keep these sections up to date:
- Purpose / Big Picture
- Progress (checkboxes + timestamps)
- Surprises & Discoveries (evidence snippets)
- Decision Log (decision + rationale + date)
- Outcomes & Retrospective
- Validation and Acceptance

### `MEMORIES.md` (durable project memory)

Keep short, high-signal bullets:
- Current state (key paths)
- Decisions (what/why)
- Conventions (tooling, commands)
- Gotchas (failure modes + fixes)
- Open questions / TODO

## Definition of done

A task is done when:
- the requested change is implemented or the question is answered,
- impact is explained (what changed, where, why),
- verification is provided (commands run / tests / clear manual steps),
- follow-ups are listed if anything was intentionally left out.

```
