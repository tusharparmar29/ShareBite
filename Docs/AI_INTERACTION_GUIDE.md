# ShareBite – How to Work With Coding AI

## 1. First Message

Start a new coding AI session with:

"Read every file in /docs before coding. This project is ShareBite. Do not code yet. Summarize the architecture, roles, database, API rules and current development phase."

## 2. Then Give One Task

Example:

"Implement Backend Prompt 01 from BACKEND_BUILD_PROMPTS.md. Follow all documentation. Do not implement later modules."

## 3. After It Codes

Ask:

"Explain exactly what changed and give me the commands to run and test this module."

Then test it yourself.

## 4. If It Fails

Use:

"I tested the current implementation and got this exact error:

[PASTE ERROR]

Expected:
[EXPECTED RESULT]

Actual:
[ACTUAL RESULT]

First identify the root cause. Then make the smallest fix. Do not rewrite unrelated code."

## 5. Before Moving Forward

Say:

"The current module is working. Do not modify it unless required by the next module. Continue with [next module]."

## 6. If AI Adds Unwanted Features

Say:

"This is outside the current ShareBite requirements. Remove the unnecessary complexity and implement the documented simple approach."

## 7. If AI Changes Existing Architecture

Say:

"Stop. Do not change the architecture yet. Explain why the documented architecture cannot solve this problem. I will approve architectural changes separately."

## 8. New Chat

When context is lost:

"Read /docs first. This is an existing ShareBite project. Do not assume it is a new project. Tell me what you understand about the current architecture and ask me what module is currently being worked on."

## 9. Good Prompt Structure

Use:

Context
+
Task
+
Requirements
+
Restrictions
+
Expected output

Example:

"ShareBite backend is already configured.

Task:
Implement NGO verification.

Requirements:
- admin only
- PENDING -> VERIFIED or REJECTED
- follow API_SPECIFICATION.md

Restrictions:
- do not change authentication
- do not add new collections

Output:
- files changed
- implementation
- test commands
- explanation"

## 10. Git Rule

After every working module:

git add .
git commit -m "feat: complete authentication"

Create small commits.

If a later AI change breaks something, you can return to the last working commit.

## 11. Never Let AI Guess

If documentation does not define something important, ask the AI to stop and identify the missing requirement instead of inventing behavior.
