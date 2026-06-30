# 00 Intake

## Purpose

Collect the minimum information needed to start the one-shot prototype workflow.
Do not turn intake into product discovery. The later phases will research,
design, scope, and validate the product.

## Required Inputs

Capture these inputs when available:

- Product idea
- Target platform, such as web app, CLI tool, mobile app, desktop app, browser
  extension, or local-first tool
- Preferred tech stack, or permission to choose the best stack
- Existing codebase path or confirmation that there is no existing codebase
- Whether external services are allowed, including constraints
- Whether open-source tools are allowed
- Non-goals, especially anything the prototype must not build

## Defaults

- Internet research is required.
- Prototype quality target is functional, testable, and demonstrable.
- Use at most three full revision rounds by default.
- Do not ask the user to provide a revision-round count during intake.

## Intake Behavior

If the product idea is missing, ask the user for the product idea before doing
anything else.

If hard constraints are missing, ask for the missing hard constraints. Keep the
question concise. For non-hard preferences, make conservative assumptions, state
them explicitly, and proceed.

If the user already provided the product idea and hard constraints, start
Exploration and Research immediately.

After the product idea and hard constraints are available, do not ask for
routine approvals during later phases. Follow `agent-operating-standards.md` for
autonomy rules and blocker exceptions.
