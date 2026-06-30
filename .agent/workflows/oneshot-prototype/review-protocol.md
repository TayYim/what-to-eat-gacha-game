# Review Protocol

## Reviewer Selection

All formal review steps must be performed by independent skeptical subagents.
Choose three distinct reviewer perspectives that are most relevant to the
product. Do not always use the same roles.

Possible perspectives include:

- Real target user
- Product manager
- UI/UX designer
- Senior software engineer
- Security engineer
- Reliability engineer
- Data engineer
- Researcher
- Domain expert
- Growth or adoption strategist
- Accessibility reviewer
- QA engineer

If independent subagents are unavailable, perform three separate role-based
skeptical review passes yourself. Keep the reviewer roles distinct, write each
review independently before combining them, and disclose in the final report
that inline role-based review was used because subagents were unavailable.

## Reviewer Instructions

Each reviewer must independently:

1. Score the current project out of 100.
2. Identify major weaknesses.
3. Identify missing or poorly implemented requirements.
4. Identify usability, architecture, testing, maintainability, or product risks.
5. Produce a compact prioritized TODO list.

Use the reviewer report template when helpful:
`templates/reviewer-report.md`.

## Main-Agent Triage

After receiving all reviews:

1. Justify each reviewer suggestion.
2. Accept valid criticism.
3. Reject or defer unreasonable suggestions with clear reasoning.
4. Combine and deduplicate all accepted TODOs.
5. Prioritize accepted TODOs by impact and urgency.

Do not ignore review feedback silently.

## Revision Budget

Use at most three full revision rounds by default. A full revision round means:

1. Run a three-reviewer critical review.
2. Triage review feedback.
3. Implement accepted TODOs.
4. Verify the changes.
5. Decide whether the passing criteria are met.

Stop early if the passing criteria are met. If the target is not reached after
three full revision rounds, report the remaining blockers honestly.

## Evidence Standard

Do not claim success without evidence from tests, demos, inspection, or reviewer
outputs. Do not hide unresolved problems.
