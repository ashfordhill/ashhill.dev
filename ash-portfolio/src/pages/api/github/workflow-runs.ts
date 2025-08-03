import type { NextApiRequest, NextApiResponse } from 'next';
import { GitHubWorkflowRunsResponse } from '../../../types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: HeadersInit = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ashhill.dev-portfolio',
};

if (GITHUB_TOKEN) {
  headers['Authorization'] = `token ${GITHUB_TOKEN}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GitHubWorkflowRunsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { owner, repo, branch = 'main', per_page = '1' } = req.query;

  if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
    return res.status(400).json({ error: 'Owner and repo parameters are required' });
  }

  try {
    const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs`);
    url.searchParams.set('branch', branch as string);
    url.searchParams.set('per_page', per_page as string);
    url.searchParams.set('status', 'completed');

    const response = await fetch(url.toString(), {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data: GitHubWorkflowRunsResponse = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch workflow runs' 
    });
  }
}