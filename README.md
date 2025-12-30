# ashhill.dev

Portfolio website with multiple versions.

## Active Version

**Currently Deployed: v1**

The active version is controlled by the `ACTIVE_VERSION` GitHub variable (currently set to `v1`).

## Versions

- **[v1](./v1/README.md)** - Original portfolio site with pathfinding visualizer
- **[v2](./v2/)** - New version (in development)

## Setup

To work on a specific version, navigate to its directory:

```sh
cd v1  # or v2
pnpm i
npm run dev
```

## Switching Active Version

To change which version is deployed and screenshotted:

1. Go to repository **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Update the `ACTIVE_VERSION` variable to `v1` or `v2`
3. The next push will trigger the workflow with the new version

## Cloudflare Pages Deployment

Update your Cloudflare Pages build settings to match the active version:
- **Build directory**: `v1` (or current active version)
- **Output directory**: `v1/out` (or current active version + `/out`)
