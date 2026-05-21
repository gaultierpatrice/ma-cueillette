# Deployment Guide

This guide covers deploying Ma Cueillette to production environments.

## Local Development

### Quick Start

Use the helper script:
```powershell
.\start.ps1
```

Or manually:
```powershell
# Load environment variables and start
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
    }
}
podman compose up -d
```

### Stop Services
```powershell
podman compose down
```

## Production Deployment

### Security Checklist

Before deploying to production:

1. **Change All Secrets**
   - Generate a strong JWT secret (at least 256 bits)
   - Use strong database passwords
   - Change pgAdmin credentials

2. **Environment Variables**
   - **Never commit `.env` to git** (already in .gitignore)
   - Use your hosting platform's secrets management:
     - Docker Swarm: Use secrets
     - Kubernetes: Use Secrets or ConfigMaps
     - Cloud providers: Use their secret managers (AWS Secrets Manager, Azure Key Vault, etc.)

3. **Database**
   - Consider using a managed database service (AWS RDS, Azure Database, etc.)
   - Set up automated backups
   - Enable SSL/TLS connections

4. **Networking**
   - Set up a reverse proxy (Nginx, Traefik, Caddy)
   - Enable HTTPS with SSL certificates (Let's Encrypt)
   - Configure proper CORS settings
   - Don't expose database ports publicly

### Deployment Options

#### Option 1: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Create secrets
echo "your-db-password" | docker secret create db_password -
echo "your-jwt-secret" | docker secret create jwt_secret -

# Deploy stack
docker stack deploy -c docker-compose.prod.yml ma_cueillette
```

#### Option 2: Kubernetes

Generate Kubernetes manifests from your compose file:
```bash
podman generate kube cueillette-db > k8s-db.yaml
podman generate kube cueillette-backend > k8s-backend.yaml
podman generate kube cueillette-frontend > k8s-frontend.yaml
```

Then deploy with kubectl or Helm charts.

#### Option 3: Cloud Platforms

**AWS (ECS/Fargate):**
- Use AWS ECS with Fargate
- Store secrets in AWS Secrets Manager
- Use RDS for PostgreSQL
- CloudFront for frontend distribution

**Azure:**
- Use Azure Container Instances or App Service
- Store secrets in Azure Key Vault
- Use Azure Database for PostgreSQL
- Azure CDN for frontend

**DigitalOcean:**
- Use App Platform or Kubernetes
- Managed PostgreSQL database
- Spaces for static assets

### Production Docker Compose

Use the base file only (do **not** merge `docker-compose.dev.yml`):

```bash
podman compose up -d --build
```

- Only the **frontend** is published on the host (port 4200 in Compose, or 80/443 behind your reverse proxy).
- **Backend** (8080), **PostgreSQL** (5432), and **pgAdmin** are not published — they stay on the Docker network only.
- Nginx rate limits public API routes (`frontend/nginx-rate-limit.conf`, `frontend/nginx.conf`).
- Do not merge `docker-compose.dev.yml` in production (that file exposes admin ports on `127.0.0.1` for local tooling only).

For local debugging with direct API access, use:

```bash
podman compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

That binds backend to `127.0.0.1:8080` only (not reachable from other machines on the LAN).

Optional `docker-compose.prod.yml` overrides (managed DB, image tags, etc.):

```yaml
services:
  backend:
    image: your-registry.com/ma-cueillette-backend:latest
    environment:
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_URL: jdbc:postgresql://your-managed-db-host:5432/cueillette_db
    restart: always

  frontend:
    image: your-registry.com/ma-cueillette-frontend:latest
    restart: always
```

### CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: |
          podman build -t registry.com/backend:${{ github.sha }} ./backend
          podman build -t registry.com/frontend:${{ github.sha }} ./frontend
      
      - name: Push images
        run: |
          podman push registry.com/backend:${{ github.sha }}
          podman push registry.com/frontend:${{ github.sha }}
      
      - name: Deploy
        run: |
          # Deploy to your platform
```

### Monitoring & Logging

Consider adding:
- **Logging**: ELK Stack, Loki, or cloud provider logs
- **Monitoring**: Prometheus + Grafana, Datadog, New Relic
- **Error tracking**: Sentry
- **Uptime monitoring**: UptimeRobot, Pingdom

### Backup Strategy

1. **Database Backups**
   - Automated daily backups
   - Test restore procedures regularly
   - Store backups in multiple locations

2. **Volume Backups**
   - Backup pgAdmin data if storing configurations
   - Consider S3 or equivalent for long-term storage

### Scaling

For high traffic:
- Scale backend horizontally (multiple instances)
- Use a load balancer
- Consider database read replicas
- Add Redis for caching
- Use CDN for static assets

## Environment Variables Reference

Required for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | Database name | `cueillette_db` |
| `DB_USERNAME` | Database user | `app_user` |
| `DB_PASSWORD` | Database password | `strong-password-here` |
| `JWT_SECRET` | JWT signing secret | `256-bit-random-string` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `production` |

Optional:
| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Backend port | `8080` |
| `SPRING_JPA_SHOW_SQL` | Show SQL logs | `false` (prod) |
