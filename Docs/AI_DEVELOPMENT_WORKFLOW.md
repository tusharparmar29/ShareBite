# ShareBite – AI Development Workflow

## Purpose
This document explains how to use Claude Code, Codex, Antigravity, Cursor, or another coding AI without losing project consistency.

## Golden Rule

Do not ask the AI to build the entire application in one prompt.

Build in small verified modules.

Recommended order:

1. Project setup
2. Backend configuration
3. Database models
4. Authentication
5. Donation APIs
6. NGO verification
7. Claim and completion logic
8. Backend testing
9. Frontend setup
10. Authentication UI
11. Donor pages
12. NGO pages
13. Admin pages
14. Smart expiry and priority UI
15. Testing and polish

## Before Coding

Give the AI access to all files in `/docs`.

First ask it to read the documentation and explain its understanding.

Do not let it code until you approve the plan.

## During Coding

Give only one module at a time.

After every module:

1. Run the application.
2. Test the feature.
3. Check errors.
4. Ask the AI to fix only the current issue.
5. Commit the working version to Git.

## Important Rule

The AI must not:
- rename the project
- change the stack
- replace MongoDB
- introduce another framework
- redesign the architecture
- add undocumented features
- rewrite working modules without permission

## If AI Wants to Change Architecture

Ask:

"Why is this change necessary? Can the current documented architecture solve the problem without adding complexity?"

Prefer the simpler solution.

## When Something Breaks

Do not say:
"Everything is broken. Fix it."

Instead give:
- exact error
- file name
- relevant code
- what you expected
- what actually happened

Ask the AI to identify the root cause before changing code.

## Context Reset

If starting a new AI conversation, tell the AI:

"Read all files in /docs before making changes. This is an existing project. Do not assume missing requirements."

Then explain the current phase.
