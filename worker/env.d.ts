declare namespace Cloudflare {
  interface Env {
    WORKFLOW_RUN_LOGS: KVNamespace;
    ASH_LIST_TASKS_DB: D1Database;
    ASH_LIST_TASKS_EMAIL: SecretsStoreSecret;
    ASH_LIST_TASKS_PASSWORD: SecretsStoreSecret;
    ASH_LIST_TASKS_GITHUB_TOKEN: SecretsStoreSecret;
    ASH_LIST_GITHUB_ORGANIZATION: SecretsStoreSecret;
    ASH_LIST_GITHUB_REPO: SecretsStoreSecret;
    ASH_LIST_GITHUB_BRANCH: SecretsStoreSecret;
    ASH_LIST_WORKFLOW_FILENAME: SecretsStoreSecret;
    OPENAI_API_KEY?: SecretsStoreSecret;
    JWT_SECRET?: string;
    ASH_LIST_TASKS_CF_TOKEN?: SecretsStoreSecret;
    ASH_LIST_TASKS_CF_ACCOUNT_ID?: SecretsStoreSecret;
    ENVIRONMENT?: string;
    ASSETS: any;
  }
}
interface Env extends Cloudflare.Env {
  ASSETS: any;
}
