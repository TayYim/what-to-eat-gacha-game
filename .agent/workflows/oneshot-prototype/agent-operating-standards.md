# Agent Operating Standards

These standards apply across the one-shot prototype workflow.

## Autonomy After Intake

After the user provides the product idea and hard constraints, proceed
autonomously from research through final prototype delivery.

Do not ask the user to approve routine phase transitions, design choices,
technical choices, reviewer feedback triage, or accepted iteration TODOs. Make
the decision, document the rationale, and keep moving.

Stop for human input only when:

- The product idea or a hard constraint is missing
- A credential, account, paid service, or permission is required
- A destructive or legally sensitive action is required
- A required preferred tool is unavailable and the current rules require setup
  approval before fallback
- The user explicitly added an approval gate

## Capability Discovery

Before specialized work, search for relevant installed skills, MCP tools,
connectors, framework-specific guidance, design guidance, testing helpers, and
local workflow assets.

Use discovered capabilities when they materially improve research, design,
implementation, testing, review, deployment, or documentation quality.

If a useful capability is not installed or needs credentials, setup, or network
access, explain the blocker. Install, enable, or fall back only when the current
tool and permission rules allow it.

## Git Hygiene

Use Git deliberately:

- Inspect status before editing and before closeout.
- Treat each milestone or self-contained fix as a potential atomic commit
  boundary whenever committing.
- Do not mix unrelated changes in one commit.
- Do not stage or revert unrelated user changes.
- Verify relevant behavior before committing.

If the current task does not include commits, still structure the work so it
could be committed atomically later.

## Runtime And Workspace Cleanup

Track services, watchers, preview servers, background jobs, generated files, and
temporary artifacts created during the workflow.

Before final delivery:

- Stop test-only services that should not remain running.
- Remove temporary files and stale generated artifacts that are not useful
  evidence.
- Preserve useful logs, screenshots, reports, and build artifacts when they are
  part of the evidence trail.
- Report any service intentionally left running and why.

Do not delete persistent data, project caches, databases, user files, or
production-like service state unless the cleanup is clearly safe or explicitly
requested.

## Documentation Hygiene

Keep documentation concise and structured:

- Put durable workflow rules in the relevant workflow layer.
- Put reusable output shapes in templates.
- Avoid large duplicated explanations across files.
- Keep generated project docs limited to setup, usage, architecture decisions,
  known limitations, test evidence, and next steps.

Prefer a clear index plus small focused files over one oversized document.
