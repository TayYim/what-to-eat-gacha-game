# 01 Exploration and Research

## Goal

Understand the product idea, research the surrounding ecosystem, and choose a
prototype implementation strategy before writing requirements or code.

## Required Steps

1. Restate the product idea in your own words.
2. Identify target users, core pain points, expected value, likely use cases, and
   implicit assumptions.
3. Run capability discovery for relevant skills, MCP tools, connectors,
   framework guidance, design guidance, research helpers, and reusable local
   workflow assets.
4. Conduct broad internet research.
5. Produce an implementation decision report.
6. Critically review the research and decision before moving to requirements.

## Research Questions

Internet research must answer:

1. What similar products or tools already exist?
2. What do they do well?
3. What are their weaknesses or gaps?
4. Are there open-source components that can be reused?
5. Is it worth building from scratch, extending an existing tool, integrating
   several tools, or using an existing mature product?
6. What architecture and implementation strategy is most reasonable?

## Decision Report

Compare at least three possible approaches:

- Build from scratch
- Build on top of existing open-source tools or libraries
- Use or configure an existing mature product instead of building a new one

For each approach, evaluate:

- Feasibility
- Development cost
- Maintainability
- Extensibility
- User value
- Risks
- Prototype speed

Use the implementation decision report template when helpful:
`templates/implementation-decision-report.md`.

## Review Gate

Before moving to Requirements and Product Design, perform a critical review of:

- Research breadth and quality
- Source traceability
- Unsupported assumptions
- Whether build-vs-buy conclusions follow from the evidence
- Whether the chosen strategy can produce a demonstrable prototype quickly
