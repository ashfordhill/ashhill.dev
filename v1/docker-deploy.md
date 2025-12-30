# Docker Deployment Guide

## Local Testing:
```bash
# Build the Docker image
docker build -t ashhill-portfolio .

# Run locally
docker run -p 3000:3000 ashhill-portfolio
```

## Deploy to Cloudflare (using Docker):

### Option A: Push to Docker Hub, then deploy
```bash
# Tag and push to Docker Hub
docker tag ashhill-portfolio your-username/ashhill-portfolio
docker push your-username/ashhill-portfolio
```

### Option B: Use Cloudflare Workers for Containers
1. Enable Cloudflare Workers for your domain
2. Use `wrangler` to deploy the container:
```bash
wrangler deploy --compatibility-date 2024-01-15
```

## Benefits of Docker approach:
- Consistent builds across environments
- Better control over dependencies
- Easier debugging
- Can be deployed to multiple platforms (Cloudflare, AWS, etc.)