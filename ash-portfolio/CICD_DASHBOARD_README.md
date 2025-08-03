# CI/CD Dashboard Setup

This document explains how to set up and configure the CI/CD Dashboard that monitors GitHub Actions.

## Overview

The CI/CD Dashboard replaces the previous health/wellness section and provides real-time monitoring of GitHub Actions workflows for your repositories.

## Features

- **Real-time Status Monitoring**: Shows success/failure status of latest builds
- **Multiple Repository Support**: Currently monitors 3 repositories
- **Visual Indicators**: Color-coded status icons with hover effects
- **Auto-refresh**: Updates every 5 minutes automatically
- **Interactive Elements**: Click to view repositories and workflow runs on GitHub
- **Responsive Design**: Works on desktop and mobile devices

## Monitored Repositories

Currently monitoring:
- `ashfordhill/dynamic-integration-tester`
- `ashfordhill/puppeteer-action`
- `ashfordhill/ashhill.dev`

## Environment Setup

### For Local Development

Add your GitHub Personal Access Token to `.env.local`:

```bash
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
```

### For Production (Cloudflare Pages)

Set the environment variable in Cloudflare Pages dashboard:
- Variable name: `GITHUB_TOKEN`
- Type: Secret
- Value: Your GitHub Personal Access Token

## GitHub Token Setup

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `public_repo` (for public repositories)
   - `repo` (if you want to monitor private repositories)
4. Copy the generated token
5. Add it to your environment variables

## Architecture

The dashboard uses a hybrid approach:

1. **Server-side API Routes** (preferred for production):
   - `/api/github/repository` - Fetches repository information
   - `/api/github/workflow-runs` - Fetches workflow run data

2. **Client-side Fallback** (for static exports):
   - Direct GitHub API calls when server-side APIs are not available

## API Rate Limits

- **Without token**: 60 requests per hour per IP
- **With token**: 5,000 requests per hour

The dashboard makes 6 API calls every 5 minutes (2 calls per repository × 3 repositories), which is well within the rate limits.

## Customization

### Adding More Repositories

Edit `src/components/sections/HealthSection.tsx` and update the `repositories` array:

```typescript
const repositories = [
  { owner: 'ashfordhill', repo: 'dynamic-integration-tester', branch: 'main' },
  { owner: 'ashfordhill', repo: 'puppeteer-action', branch: 'main' },
  { owner: 'ashfordhill', repo: 'ashhill.dev', branch: 'main' },
  // Add more repositories here
  { owner: 'your-username', repo: 'your-repo', branch: 'main' },
];
```

### Changing Refresh Interval

Update the `refreshInterval` in the `useGitHubStatus` hook call:

```typescript
const { statuses, isLoading, lastUpdated, refreshStatuses } = useGitHubStatus({
  repositories,
  refreshInterval: 300000 // 5 minutes in milliseconds
});
```

## Troubleshooting

### "API Error" Cards

If you see "API Error" cards:
1. Check that your GitHub token is correctly set
2. Verify the token has the required scopes
3. Check browser console for detailed error messages

### Rate Limiting

If you hit rate limits:
1. Increase the refresh interval
2. Reduce the number of monitored repositories
3. Ensure you're using a GitHub token (not anonymous requests)

### Static Export Issues

The current setup works with both static exports and server-side rendering. If you encounter issues:
1. The system will automatically fall back to client-side API calls
2. Check browser console for fallback messages
3. Ensure `NEXT_PUBLIC_GITHUB_TOKEN` is set for client-side fallback

## Security Notes

- **Production**: Use `GITHUB_TOKEN` (server-side) in Cloudflare environment variables
- **Development**: Use `NEXT_PUBLIC_GITHUB_TOKEN` (client-side) in `.env.local`
- Never commit tokens to version control
- The `.env.local` file is already in `.gitignore`

## Files Structure

```
src/
├── components/sections/HealthSection.tsx    # Main dashboard component
├── hooks/useGitHubStatus.ts                 # Status management hook
├── services/
│   ├── githubApi.ts                         # Main API service with fallback
│   └── githubApiClient.ts                   # Client-side API service
├── types/github.ts                          # TypeScript interfaces
└── pages/api/github/                        # Server-side API routes
    ├── repository.ts
    └── workflow-runs.ts
```