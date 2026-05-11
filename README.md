# CI/CD Incident Analyzer — LLM-powered Dashboard

A full-stack dashboard for monitoring CI/CD pipelines across GitHub repositories, with automated **Root Cause Analysis (RCA)** of failed builds powered by **Google Gemini**.

## Overview

This project is a diploma research tool that demonstrates how Large Language Models can optimize Continuous Integration and Deployment processes through intelligent incident analysis.

**Core flow:**
1. GitHub Actions pipeline fails on one of your repositories
2. The Cloudflare Worker fetches the job logs via GitHub API
3. Error lines are extracted using pattern matching (with ±10/15 lines of context)
4. The workflow `.yaml` configuration is also fetched for additional context
5. Gemini analyzes both logs + YAML and returns structured RCA: category, severity, root cause, solution, and actionable terminal commands
6. Results are stored in Cloudflare D1 and displayed in the React dashboard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Recharts, Tailwind CSS 4 |
| Backend | Cloudflare Workers (Hono framework) |
| Database | Cloudflare D1 (SQLite) |
| Cache | Cloudflare KV (log + LLM result caching) |
| LLM | Google Gemini 2.5 Flash Lite |
| CI/CD source | GitHub Actions API |
| Auth | JWT (cookie-based) |

## Installation

```bash
npm install
```

## Environment Setup

Create a `.dev.vars` file for local development (see `.dev.vars.example`).

You also need to create the following Secrets Store entries. Use this command template for each secret:

```bash
npx wrangler secrets-store secret create <STORE_ID> --name <SECRET_NAME> --scopes workers
```

Your `<STORE_ID>` is listed in `wrangler.jsonc` under `secrets_store_secrets[].store_id`.

### Required secrets

| Secret name | Purpose |
|-------------|---------|
| `ASH_LIST_TASKS_EMAIL` | App login email |
| `ASH_LIST_TASKS_PASSWORD` | App login password |
| `ASH_LIST_TASKS_CF_TOKEN` | Cloudflare API token |
| `ASH_LIST_TASKS_CF_ACCOUNT_ID` | Cloudflare Account ID |
| `ASH_LIST_TASKS_GITHUB_TOKEN` | GitHub token (read workflows + logs) |
| `ASH_LIST_GITHUB_ORGANIZATION` | GitHub org / owner name |
| `ASH_LIST_GITHUB_REPO` | GitHub repository name |
| `ASH_LIST_GITHUB_BRANCH` | Default branch (e.g. `main`) |
| `ASH_LIST_WORKFLOW_FILENAME` | GitHub Actions workflow filename |
| `OPENAI_API_KEY` | Google Gemini API key |

## Development

Requires Node.js 20+. If you use NVM:

```bash
nvm use
```

Start the local dev server:

```bash
npm run dev
```

Run DB migrations locally:

```bash
npm run db:migrate:local
```

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Linting & Formatting

```bash
npm run lint          # ESLint check
npm run format:check  # Prettier check
npm run format:fix    # Auto-format
```

## Architecture

```
GitHub Actions Failure
        │
        ▼
Cloudflare Worker (Hono)
  ├── GitHubService     — fetch logs, workflow YAML, trigger runs
  ├── extractErrorLines — regex pattern matching + context window
  ├── GeminiService     — LLM Root Cause Analysis (structured JSON)
  │
  ├── D1 Database       — incidents, workflow_runs, projects
  └── KV Cache          — raw logs + LLM summaries (TTL 1 week)
        │
        ▼
React Dashboard
  ├── Projects list + deployment status
  ├── Per-project: live job logs + LLM error summary
  └── Analytics: category breakdown, severity chart, weekly trend
```

## Configuration

- Environment variables and secrets are managed via Wrangler and `.dev.vars`
- See `wrangler.jsonc` for bindings and deployment configuration
