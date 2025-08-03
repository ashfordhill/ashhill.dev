import { useState, useEffect, useCallback } from 'react';
import { RepositoryStatus } from '../types/github';
import { GitHubApiService } from '../services/githubApi';

interface UseGitHubStatusProps {
  repositories: Array<{ owner: string; repo: string; branch?: string }>;
  refreshInterval?: number; // in milliseconds
}

// Simple cache to store repository data
const repositoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useGitHubStatus = ({ 
  repositories, 
  refreshInterval = 900000 // 15 minutes default
}: UseGitHubStatusProps) => {
  // Initialize with placeholder statuses for immediate display
  const [statuses, setStatuses] = useState<RepositoryStatus[]>(() => 
    repositories.map(({ owner, repo, branch = 'main' }) => ({
      repo: {
        id: 0,
        name: repo,
        full_name: `${owner}/${repo}`,
        html_url: `https://github.com/${owner}/${repo}`,
        description: 'Loading repository information...',
        updated_at: new Date().toISOString(),
        pushed_at: new Date().toISOString(),
        default_branch: branch
      },
      latestRun: null,
      isLoading: true,
      error: null
    }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRepositoryStatus = useCallback(async (owner: string, repo: string, branch: string = 'main') => {
    const cacheKey = `${owner}/${repo}`;
    const now = Date.now();
    
    // Check cache first
    const cached = repositoryCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Using cached data for ${cacheKey}`);
      return {
        ...cached.data,
        isLoading: false
      };
    }

    try {
      // Try to fetch repository data first
      let repoData;
      let latestRun = null;
      let errorMessage = null;

      try {
        repoData = await GitHubApiService.getRepository(owner, repo);
      } catch (repoError) {
        console.warn(`Failed to fetch repository data for ${owner}/${repo}:`, repoError);
        // Use fallback repository data
        repoData = {
          id: 0,
          name: repo,
          full_name: `${owner}/${repo}`,
          html_url: `https://github.com/${owner}/${repo}`,
          description: 'Repository information unavailable (API limit reached)',
          updated_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
          default_branch: branch
        };
        errorMessage = repoError instanceof Error ? repoError.message : 'Repository fetch failed';
      }

      // Try to fetch workflow run data
      try {
        latestRun = await GitHubApiService.getLatestWorkflowRun(owner, repo, branch);
      } catch (workflowError) {
        console.warn(`Failed to fetch workflow data for ${owner}/${repo}:`, workflowError);
        // Don't override the error message if we already have one from repo fetch
        if (!errorMessage) {
          errorMessage = workflowError instanceof Error ? workflowError.message : 'Workflow fetch failed';
        }
      }

      const result = {
        repo: repoData,
        latestRun,
        isLoading: false,
        error: errorMessage
      };

      // Cache the result if successful or if we have partial data
      if (!errorMessage || repoData) {
        repositoryCache.set(cacheKey, {
          data: result,
          timestamp: now
        });
      }

      return result;
    } catch (error) {
      console.error(`Unexpected error fetching status for ${owner}/${repo}:`, error);
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
    
    // Update each repository status individually as they complete
    repositories.forEach(async ({ owner, repo, branch }, index) => {
      try {
        const result = await fetchRepositoryStatus(owner, repo, branch);
        setStatuses(prevStatuses => {
          const newStatuses = [...prevStatuses];
          newStatuses[index] = result;
          return newStatuses;
        });
      } catch (error) {
        console.error(`Error fetching status for ${owner}/${repo}:`, error);
        setStatuses(prevStatuses => {
          const newStatuses = [...prevStatuses];
          newStatuses[index] = {
            ...prevStatuses[index],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          return newStatuses;
        });
      }
    });

    // Set overall loading to false after a short delay to allow individual updates
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
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