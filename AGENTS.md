# What To Eat Gacha Game Agent Instructions

Keep root guidance compact. Put reusable workflow details under `.agent/workflows/`
and keep generated run artifacts under `.agent/runs/` when a workflow is
executed.

## Available Workflow Presets

- One-shot prototype workflow: `.agent/workflows/oneshot-prototype.md`

Use the one-shot prototype workflow when the user provides a product idea and
wants a functional, testable, demonstrable prototype produced end to end.

## Git Hygiene

- Check `git status` before making changes and before closeout.
- Do not stage, revert, or clean up unrelated user changes unless explicitly
  requested.
- Prefer atomic commits for self-contained tasks whenever committing.

## Runtime And Workspace Hygiene

- Track any local service, watcher, preview server, or temporary process started
  for testing.
- Stop test-only services before leaving the task unless the user asks to keep
  them running.
- Preserve useful evidence artifacts and remove temporary files that are no
  longer needed.
