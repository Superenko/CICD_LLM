# Ash Lists Tasks (Front-End)

A React-based dashboard for managing and monitoring applications deployed on Cloudflare Workers. Features include app listing, deployment monitoring, search functionality, and real-time deployment logs.

## Installation

```bash
npm install
```

## Environment Setup

You also need to create the following Secrets Store entries (one-time setup). Use this command template for each secret:

```bash
npx wrangler secrets-store secret create <STORE_ID> --name <SECRET_NAME> --scopes workers
```

Tip: Your `<STORE_ID>` is listed in `wrangler.jsonc` under `secrets_store_secrets[].store_id`.

Required secrets:

| Secret name                    | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `ASH_LIST_TASKS_EMAIL`         | App login email for browser access                                 |
| `ASH_LIST_TASKS_PASSWORD`      | App login password for browser access                              |
| `ASH_LIST_TASKS_CF_TOKEN`      | Cloudflare API token used by the Worker to call Cloudflare APIs    |
| `ASH_LIST_TASKS_CF_ACCOUNT_ID` | Cloudflare Account ID paired with the token above                  |
| `ASH_LIST_TASKS_GITHUB_TOKEN`  | GitHub token to list workflows, dispatch runs, and call GitHub API |
| `ASH_LIST_AIRTABLE_BASE_ID`    | Airtable base ID for tasks storage                                 |
| `ASH_LIST_AIRTABLE_KEY`        | Airtable API key                                                   |
| `ASH_LIST_GITHUB_ORGANIZATION` | GitHub organization/owner name                                     |
| `ASH_LIST_GITHUB_REPO`         | GitHub repository name                                             |
| `ASH_LIST_GITHUB_BRANCH`       | Default branch for workflow dispatches (for example, `main`)       |
| `ASH_LIST_WORKFLOW_FILENAME`   | GitHub Actions workflow filename                                   |

## Development

Before starting the development server, make sure you are using Node.js version 20 or higher. If you use NVM, you can switch to the correct version by running:

```bash
nvm use
```

Start a local development server:

```bash
npm run dev
```

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Linting & Formatting

Check code with ESLint:

```bash
npm run lint
```

Check code formatting with:

```bash
npm run format:check
```

Format code with:

```bash
npm run format:fix
```

## Configuration

- Environment variables and secrets are managed via Wrangler and `.dev.vars`
- See `wrangler.jsonc` for bindings and deployment configuration
