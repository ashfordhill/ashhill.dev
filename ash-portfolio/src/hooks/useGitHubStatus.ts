import { useState, useEffect, useCallback, useRef } from 'react';
import { RepositoryStatus } from '../types/github';
import { GitHubApiService } from '../services/githubApi';

interface UseGitHubStatusProps {
  repositories: Array<{ owner: string; repo: string; branch?: string }>;
  enabled?: boolean; // whether to fetch data at all
}

export const useGitHubStatus = ({ 
  repositories, 
  enabled = true
}: UseGitHubStatusProps) => {
  // Initialize with loading states for immediate display
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
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isMountedRef = useRef(true);

  const fetchRepositoryStatus = useCallback(async (owner: string, repo: string, branch: string = 'main') => {
    console.log(`Fetching status for ${owner}/${repo}`);
    
    let repoData = null;
    let latestRun = null;
    let error = null;

    try {
      // Try to fetch repository data
      repoData = await GitHubApiService.getRepository(owner, repo);
      console.log(`Repository data for ${owner}/${repo}:`, repoData ? 'success' : 'null');
    } catch (repoError) {
      console.error(`Repository fetch failed for ${owner}/${repo}:`, repoError);
      error = 'Repository fetch failed';
    }

    try {
      // Try to fetch workflow data
      latestRun = await GitHubApiService.getLatestWorkflowRun(owner, repo, branch);
      console.log(`Workflow data for ${owner}/${repo}:`, latestRun ? 'success' : 'null');
    } catch (workflowError) {
      console.error(`Workflow fetch failed for ${owner}/${repo}:`, workflowError);
      if (!error) { // Only set workflow error if we don't have a repo error
        error = 'No workflows found';
      }
    }

    // Create final repository object
    const finalRepo = repoData || {
      id: 0,
      name: repo,
      full_name: `${owner}/${repo}`,
      html_url: `https://github.com/${owner}/${repo}`,
      description: `${repo} repository`,
      updated_at: new Date().toISOString(),
      pushed_at: new Date().toISOString(),
      default_branch: branch
    };

    return {
      repo: finalRepo,
      latestRun,
      isLoading: false,
      error
    };
  }, []);

  const fetchAllStatuses = useCallback(async () => {
    if (!enabled || !isMountedRef.current) {
      return;
    }

    console.log('Starting to fetch all repository statuses');
    setIsLoading(true);
    
    try {
      // Fetch all repositories in parallel for better performance
      const results = await Promise.all(
        repositories.map(({ owner, repo, branch }) => 
          fetchRepositoryStatus(owner, repo, branch)
        )
      );

      if (isMountedRef.current) {
        console.log('Successfully fetched all statuses');
        setStatuses(results);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
      
      // On complete failure, show error states for all repos
      if (isMountedRef.current) {
        const errorStatuses = repositories.map(({ owner, repo, branch = 'main' }) => ({
          repo: {
            id: 0,
            name: repo,
            full_name: `${owner}/${repo}`,
            html_url: `https://github.com/${owner}/${repo}`,
            description: `${repo} repository`,
            updated_at: new Date().toISOString(),
            pushed_at: new Date().toISOString(),
            default_branch: branch
          },
          latestRun: null,
          isLoading: false,
          error: 'Network error'
        }));
        setStatuses(errorStatuses);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [repositories, fetchRepositoryStatus, enabled]);

  // Only fetch on mount if enabled
  useEffect(() => {
    if (enabled) {
      fetchAllStatuses();
    }
  }, [enabled]); // Only depend on enabled to avoid re-fetching

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    statuses,
    isLoading,
    lastUpdated,
    refreshStatuses: fetchAllStatuses
  };
};