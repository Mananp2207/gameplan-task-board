# GamePlan Task Board

A full-stack Kanban task management application built with React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, and Vercel.

## Live Application

`https://gameplan-task-board.vercel.app/login`

## What GamePlan Solves

GamePlan gives individuals and small teams one place to create, prioritize, assign, review, and complete work. Tasks move through **To Do**, **In Progress**, **In Review**, and **Done**. Urgent work is ordered first, followed by the earliest due date.

## Verified Features

- Email sign-up and sign-in
- Anonymous guest sessions
- Protected application routes
- Member and Supervisor roles
- Task create, read, update, move, return, and delete operations
- Supervisor return messages
- Team creation and membership management
- Search across task title, description, and manager feedback
- Calendar view
- Light/dark theme persistence
- Keyboard shortcuts: `D`, `N`, and `Escape`
- Avatar color and image services
- Vercel deployment configuration

## Important Implementation Notes

- The application expects Supabase Row Level Security to authorize task and team data, but policy SQL and migrations are not included in this repository.
- Analytics is currently a coming-soon route.
- `@dnd-kit` packages are installed, but drag-and-drop is not wired into the uploaded source.
- An automated test suite is not currently included.

## Architecture

```text
Browser -> Vercel React App -> Supabase Client
                              -> Authentication
                              -> PostgreSQL
                              -> Storage
```

## Documentation

- [Software Design Document](docs/Software_Design_Document.pdf)
- [Detailed ER Diagram](docs/ER_Diagram.pdf)
- [System Architecture](docs/Architecture.png)
- [Authentication Flow](docs/diagrams/Authentication_Flow.png)
- [Component Hierarchy](docs/diagrams/Component_Hierarchy.png)
- [Deployment Architecture](docs/diagrams/Deployment_Architecture.png)
- [Task Lifecycle](docs/diagrams/Task_Lifecycle.png)

The Software Design Document contains the detailed architecture, database model, security analysis, developer setup, testing strategy, design decisions, limitations, and roadmap.

## Tech Stack

- React 19
- TypeScript 5
- Vite 8
- Tailwind CSS 4
- React Router 7
- Supabase JavaScript Client 2
- PostgreSQL
- Vercel
- Oxlint

## Local Setup

```bash
git clone https://github.com/Mananp2207/gameplan-task-board.git
cd gameplan-task-board
npm install
```

Create `.env`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

The Supabase project must contain the expected tables, authentication configuration, Storage bucket, and authorization policies.

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Main Data Entities

- `profiles`
- `tasks`
- `teams`
- `team_members`

## Roadmap

1. Add source-controlled Supabase migrations and RLS policies.
2. Add automated unit, integration, E2E, and policy tests.
3. Add CI for typecheck, lint, build, and tests.
4. Add comments, activity history, notifications, and attachments.
5. Add scoped realtime collaboration and analytics.

## Author

**Manan Hiteshkumar Patel**
