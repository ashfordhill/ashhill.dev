import { GitHubRepository, GitHubWorkflowRunsResponse } from '../types/github';
import { GitHubApiClientService } from './githubApiClient';

export class GitHubApiService {
  static async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
    try {
      return await GitHubApiClientService.getRepository(owner, repo);
    } catch (error) {
      console.error(`Error fetching repository ${owner}/${repo}:`, error);
      return null;
    }
  }

  static async getWorkflowRuns(
    owner: string, 
    repo: string, 
    branch: string = 'main',
    perPage: number = 1
  ): Promise<GitHubWorkflowRunsResponse | null> {
    try {
      return await GitHubApiClientService.getWorkflowRuns(owner, repo, branch, perPage);
    } catch (error) {
      console.error(`Error fetching workflow runs for ${owner}/${repo}:`, error);
      return null;
    }
  }

  static async getLatestWorkflowRun(owner: string, repo: string, branch: string = 'main') {
    try {
      const runs = await this.getWorkflowRuns(owner, repo, branch, 1);
      return runs?.workflow_runs?.[0] || null;
    } catch (error) {
      console.error(`Error fetching latest workflow run for ${owner}/${repo}:`, error);
      return null;
    }
  }
}