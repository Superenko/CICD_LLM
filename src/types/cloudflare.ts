export interface Stage {
  /**
   * When the stage ended.
   */
  ended_on?: string | null;

  /**
   * The current build stage.
   */
  name?: 'queued' | 'initialize' | 'clone_repo' | 'build' | 'deploy';

  /**
   * When the stage started.
   */
  started_on?: string | null;

  /**
   * State of the current stage.
   */
  status?: 'success' | 'idle' | 'active' | 'failure' | 'canceled';
}

export interface Deployment {
  /**
   * Id of the deployment.
   */
  id?: string;

  /**
   * A list of alias URLs pointing to this deployment.
   */
  aliases?: Array<string> | null;

  /**
   * When the deployment was created.
   */
  created_on?: string;

  /**
   * Type of deploy.
   */
  environment?: 'preview' | 'production';

  /**
   * If the deployment has been skipped.
   */
  is_skipped?: boolean;

  /**
   * The status of the deployment.
   */
  latest_stage?: Stage;

  /**
   * When the deployment was last modified.
   */
  modified_on?: string;

  /**
   * Id of the project.
   */
  project_id?: string;

  /**
   * Name of the project.
   */
  project_name?: string;

  /**
   * Short Id (8 character) of the deployment.
   */
  short_id?: string;

  /**
   * List of past stages.
   */
  stages?: Array<Stage>;

  /**
   * The live URL to view this deployment.
   */
  url?: string;
}

export interface Project {
  /**
   * Id of the project.
   */
  id?: string;

  /**
   * Most recent deployment to the repo.
   */
  canonical_deployment?: Deployment | null;

  /**
   * When the project was created.
   */
  created_on?: string;

  /**
   * A list of associated custom domains for the project.
   */
  domains?: Array<string>;

  /**
   * Most recent deployment to the repo.
   */
  latest_deployment?: Deployment | null;

  /**
   * Name of the project.
   */
  name?: string;

  /**
   * Production branch of the project. Used to identify production deployments.
   */
  production_branch?: string;

  /**
   * The Cloudflare subdomain associated with the project.
   */
  subdomain?: string;
}
