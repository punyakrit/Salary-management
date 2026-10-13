---
name: commit-checkpoint
description: Close out a logical unit of work — verify it, stage exactly that unit, and hand the human a commit message. The agent never commits or pushes. Use whenever a feature, fix, refactor or doc change is complete, or when the user asks "what should I commit?".
---

# Commit checkpoint

The commit history is graded, so each commit must be one coherent, green step. **The human commits; the agent only stages.**

1. **Verify** the unit is green:
   ```bash
   pnpm typecheck && pnpm test && pnpm lint
   ```
   If anything fails, fix it first. Never stage red work.
2. **Check the index is free:** `git diff --cached --stat`. If something is already staged, the human hasn't committed the previous unit yet. Tell them and wait. Don't mix units.
3. **Stage only this unit's paths** (`git add <paths>`), never `git add -A` blindly. Leave unrelated work unstaged.
4. **Show** `git diff --cached --stat` and give the message in a fenced block:
   ```bash
   git commit -m "<type>(<scope>): <what changed and why, imperative, ≤ 72 chars>"
   ```
   Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Scope: `employees`, `insights`, `db`, `ui`, `seed`…
5. Add a line to the prompt log in `docs/04-ai-usage.md` if the unit came from a significant prompt or decision.

Never run `git commit`, `git push`, `git reset --hard`, or rewrite history.
