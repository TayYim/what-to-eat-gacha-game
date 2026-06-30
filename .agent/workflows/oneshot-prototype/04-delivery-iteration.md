# 04 Delivery, Review, and Iteration

## Goal

Demonstrate the working prototype, test it end to end, subject it to skeptical
review, and iterate within the default revision budget.

## Milestone Delivery

When a working prototype is completed and can be demonstrated, mark it as a
milestone delivery.

Run end-to-end testing to confirm that all core requirements are covered and
working correctly. If the project includes a frontend, GUI, visual workflow, or
interactive interface, perform visual end-to-end testing as well.

For visual or interactive prototypes, check:

- Layout
- Usability
- Empty states
- Error states
- Loading states
- Common user paths

## Multi-Agent Critical Review

After end-to-end testing, perform the review process defined in
`review-protocol.md`.

Each review round must use three independent skeptical reviewer subagents. The
reviewer identities must be selected based on the project type rather than
reused mechanically.

## Iteration Loop

For each accepted TODO from review:

1. Brainstorm possible fixes.
2. Select the best fix.
3. Plan the change.
4. Implement the change.
5. Test the change.
6. Review the result.
7. Refine if necessary.

After completing accepted TODOs, run another three-reviewer round when the
default revision budget allows it.

## Passing Criteria

Continue iterating until all of these are true, or until the default revision
budget is exhausted:

- Average reviewer score is above 95 out of 100
- No individual reviewer score is below 93 out of 100
- There is no unresolved critical issue
- There is no unresolved source-traceability issue for claims based on research

If the passing criteria are not reached after at most three full revision rounds
by default, report the blockers honestly.

## Closeout Cleanup

Before final delivery, apply the cleanup rules in
`agent-operating-standards.md`. Stop test-only services, remove temporary
rubbish, preserve useful evidence, and report anything intentionally left
running.
