import { useState, useEffect, useCallback } from 'react';
import { RepositoryStatus } from '../types/github';
import { GitHubApiService } from '../services/githubApi';

interface UseGitHubStatusProps {
  repositories: Array<{ owner: string; repo: string; branch?: string }>;
  refreshInterval?: number; // in milliseconds
}

export const useGitHubStatus = ({ 
  repositories, 
  refreshInterval = 300000 // 5 minutes default
}: UseGitHubStatusProps) => {
  const [statuses, setStatuses] = useState<RepositoryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRepositoryStatus = useCallback(async (owner: string, repo: string, branch: string = 'main') => {
    try {
      const [repoData, latestRun] = await Promise.all([
        GitHubApiService.getRepository(owner, repo),
        GitHubApiService.getLatestWorkflowRun(owner, repo, branch)
      ]);

      return {
        repo: repoData,
        latestRun,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching status for ${owner}/${repo}:`, error);
      return {
        repo: {
          id: 0,
          name: repo,
          full_name: `${owner}/${repo}`,
          html_url: `https://github.com/${owner}/${repo}`,
          description: 'Repository information unavailable',
          updated_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
          default_branch: branch
        },
        latestRun: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const fetchAllStatuses = useCallback(async () => {
    setIsLoading(true);
    
    const statusPromises = repositories.map(({ owner, repo, branch }) =>
      fetchRepositoryStatus(owner, repo, branch)
    );

    try {
      const results = await Promise.all(statusPromises);
      setStatuses(results);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching repository statuses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [repositories, fetchRepositoryStatus]);

  const refreshStatuses = useCallback(() => {
    fetchAllStatuses();
  }, [fetchAllStatuses]);

  useEffect(() => {
    fetchAllStatuses();
  }, [fetchAllStatuses]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchAllStatuses, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAllStatuses, refreshInterval]);

  return {
    statuses,
    isLoading,
    lastUpdated,
    refreshStatuses
  };
};