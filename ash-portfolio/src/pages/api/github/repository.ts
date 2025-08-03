import type { NextApiRequest, NextApiResponse } from 'next';
import { GitHubRepository } from '../../../types/github';

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
  res: NextApiResponse<GitHubRepository | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { owner, repo } = req.query;

  if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
    return res.status(400).json({ error: 'Owner and repo parameters are required' });
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data: GitHubRepository = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch repository' 
    });
  }
}