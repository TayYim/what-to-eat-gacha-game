# 03 Planning and Execution

## Goal

Implement each milestone through an explicit plan, verification loop, and
acceptance gate.

## Milestone Plan

For each milestone, create a concrete execution plan before coding. The plan
must include:

1. Files or modules likely to be created or modified
2. Step-by-step implementation tasks
3. Test plan
4. Acceptance criteria
5. Regression risks
6. Git commit boundary, if commits are part of the current task
7. Runtime and temporary-artifact cleanup plan
8. Rollback or recovery strategy, if applicable

Use the milestone plan template when helpful:
`templates/milestone-plan.md`.

## Plan Review Gate

Review the plan before executing it. Check that the plan is scoped to the
milestone, has testable acceptance criteria, and can be completed without
silently changing unrelated behavior.

## Implementation Loop

After implementing a milestone:

1. Run relevant unit tests, integration tests, and manual checks.
2. Confirm that all acceptance criteria are satisfied.
3. Confirm that no existing functionality has regressed.
4. Fix issues found during testing.
5. Document what changed and why.

Do not mark a milestone complete until it passes its acceptance tests.

When a milestone is self-contained and commits are part of the current task,
commit it atomically after verification. Do not bundle unrelated changes into
the same commit.

## Existing Codebase Rule

If working in an existing codebase, inspect the live project structure before
editing. Follow existing patterns unless the milestone explicitly requires a
targeted structural improvement.
