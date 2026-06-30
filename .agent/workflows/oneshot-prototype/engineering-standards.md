# Engineering Standards

During implementation:

1. Prefer simple, maintainable solutions.
2. Avoid unnecessary complexity.
3. Use existing stable libraries when appropriate.
4. Keep the architecture modular.
5. Write meaningful tests for core logic.
6. Preserve existing behavior unless intentionally changed.
7. Avoid breaking public APIs or user-facing workflows without justification.
8. Document setup, usage, and known limitations.
9. Make the prototype easy to run and demonstrate.
10. Keep documentation structured and concise.
11. Clean up test-only services and temporary artifacts before closeout.

## Tooling And Fallbacks

If a preferred tool, dependency, permission, credential, install step, or
external service is missing, do not silently downgrade to a weaker fallback.
Explain the blocker and ask the user whether to approve setup or a fallback.

## Existing Code

When modifying an existing project, inspect live files, tests, scripts, and
runtime behavior before changing code. Keep edits scoped to the milestone and do
not refactor unrelated areas.

## Verification

Verification should match the prototype type. For example:

- Core logic should have unit or integration tests.
- CLI tools should have command-level smoke tests.
- Frontends should have rendered checks for common paths and states.
- Backends should verify API behavior and failure handling.

Report any verification that could not be run.

## Git And Cleanup

Follow `agent-operating-standards.md` for Git hygiene, runtime cleanup,
documentation hygiene, autonomy, and capability discovery.
