import { GitHubRepository, GitHubWorkflowRunsResponse } from '../types/github';
import { GitHubApiClientService } from './githubApiClient';

export class GitHubApiService {
  private static async tryServerSideApi<T>(
    apiPath: string,
    fallbackFn: () => Promise<T>
  ): Promise<T> {
    try {
      // Try server-side API first (works when deployed with serverless functions)
      const response = await fetch(apiPath);
      
      if (response.ok) {
        return response.json();
      }
      
      // If server-side API fails, fall back to client-side
      console.log('Server-side API not available, falling back to client-side');
      return fallbackFn();
    } catch (error) {
      // If server-side API fails, fall back to client-side
      console.log('Server-side API error, falling back to client-side:', error);
      return fallbackFn();
    }
  }

  static async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.tryServerSideApi(
      `/api/github/repository?owner=${owner}&repo=${repo}`,
      () => GitHubApiClientService.getRepository(owner, repo)
    );
  }

  static async getWorkflowRuns(
    owner: string, 
    repo: string, 
    branch: string = 'main',
    perPage: number = 1
  ): Promise<GitHubWorkflowRunsResponse> {
    const params = new URLSearchParams({
      owner,
      repo,
      branch,
      per_page: perPage.toString()
    });

    return this.tryServerSideApi(
      `/api/github/workflow-runs?${params}`,
      () => GitHubApiClientService.getWorkflowRuns(owner, repo, branch, perPage)
    );
  }

  static async getLatestWorkflowRun(owner: string, repo: string, branch: string = 'main') {
    try {
      const runs = await this.getWorkflowRuns(owner, repo, branch, 1);
      return runs.workflow_runs[0] || null;
    } catch (error) {
      console.error(`Error fetching latest workflow run for ${owner}/${repo}:`, error);
      return null;
    }
  }
}