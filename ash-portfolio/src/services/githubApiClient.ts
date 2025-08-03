import { GitHubRepository, GitHubWorkflowRunsResponse } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';

// Client-side GitHub API service (fallback for static sites)
export class GitHubApiClientService {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ashhill.dev-portfolio',
    };

    // Only add token if available (for development)
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    return headers;
  }

  static async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // Log the specific error for debugging
        console.warn(`GitHub API error for ${owner}/${repo}:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        // If rate limited, provide a more specific error
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
          const rateLimitReset = response.headers.get('x-ratelimit-reset');
          throw new Error(`GitHub API rate limit exceeded. Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'unknown'}`);
        }

        throw new Error(`Failed to fetch repository: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // If it's a network error or other fetch error, provide a fallback
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error while fetching repository data`);
      }
      throw error;
    }
  }

  static async getWorkflowRuns(
    owner: string, 
    repo: string, 
    branch: string = 'main',
    perPage: number = 1
  ): Promise<GitHubWorkflowRunsResponse> {
    try {
      const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs`);
      url.searchParams.set('branch', branch);
      url.searchParams.set('per_page', perPage.toString());
      url.searchParams.set('status', 'completed');

      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // Log the specific error for debugging
        console.warn(`GitHub API error for workflow runs ${owner}/${repo}:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        // If rate limited, provide a more specific error
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
          const rateLimitReset = response.headers.get('x-ratelimit-reset');
          throw new Error(`GitHub API rate limit exceeded. Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'unknown'}`);
        }

        throw new Error(`Failed to fetch workflow runs: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // If it's a network error or other fetch error, provide a fallback
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error while fetching workflow runs`);
      }
      throw error;
    }
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