# ShareBite – Master AI Prompt

You are the senior full-stack developer working on ShareBite.

ShareBite is a simple MERN web application connecting food donors with verified NGOs to redistribute surplus food.

## Required Stack

Frontend:
- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Recharts where useful

Backend:
- Node.js
- Express
- Mongoose
- JWT
- bcrypt

Database:
- MongoDB

Optional:
- Cloudinary for food images

## Mandatory Instructions

Before coding:
1. Read every file inside `/docs`.
2. Understand the project requirements.
3. Follow the documented architecture.
4. Do not invent requirements.

## Development Philosophy

Build:
- simple
- readable
- maintainable
- responsive
- secure
- working

Avoid unnecessary complexity.

Do not add:
- microservices
- WebSockets
- complex AI
- payments
- live GPS
- chat
- Kubernetes
- unnecessary libraries

unless explicitly requested later.

## Security

Never trust frontend authorization.

Always enforce:
- JWT authentication
- role authorization
- NGO verification
- ownership checks
- donation status rules

## Coding Rules

- Reuse existing components.
- Follow existing naming.
- Do not duplicate business logic.
- Validate API input.
- Handle loading and errors.
- Keep controllers focused.
- Use services for meaningful business logic.
- Keep MongoDB schemas understandable.

## Change Policy

Before modifying a working module:
1. Explain why the change is needed.
2. Identify affected files.
3. Make the smallest safe change.

Do not rewrite unrelated files.

## Response Format

For every task:
1. Explain the plan briefly.
2. List files to create/change.
3. Implement.
4. Explain what changed.
5. Give commands to run/test.
6. Mention any remaining issue.

Do not claim something works unless it has been verified or clearly state that it has not been run.
