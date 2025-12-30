export interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  workflow_id: number;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  html_url: string;
  run_number: number;
  event: string;
  actor: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubWorkflowRunsResponse {
  total_count: number;
  workflow_runs: GitHubWorkflowRun[];
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
}

export interface RepositoryStatus {
  repo: GitHubRepository;
  latestRun: GitHubWorkflowRun | null;
  isLoading: boolean;
  error: string | null;
}