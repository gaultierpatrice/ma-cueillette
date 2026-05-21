# Docker/Podman Setup Guide

This guide will help you run the Ma Cueillette application using Podman (or Docker).

## Prerequisites

- Podman or Docker installed
- Podman Compose or Docker Compose installed

## Initial Setup

### 1. Create your environment file

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your actual values:
- `DB_USERNAME` and `DB_PASSWORD`: Choose credentials for PostgreSQL
- `PGADMIN_EMAIL` and `PGADMIN_PASSWORD`: Credentials for pgAdmin
- `JWT_SECRET`: Generate a secure random string (at least 32 characters)

### 2. Build and start all services

**Production-style** (only the app on port 4200; DB, pgAdmin, and backend API are not published on the host):

```bash
podman compose build
podman compose up -d
```

**Local development** (PostgreSQL, pgAdmin, and API on `127.0.0.1` only — not exposed to the LAN):

```bash
podman compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

The `.env` file will be automatically loaded by all services.

### 3. Access the application

Once all containers are running:
- **Frontend** (and API through Nginx rate limiting): http://localhost:4200
- **Backend API direct** (dev override only): http://127.0.0.1:8080
- **pgAdmin** (dev override only): http://127.0.0.1:5050
- **PostgreSQL** (dev override only): `127.0.0.1:5432`

## Useful Commands

### View running containers
```bash
podman-compose ps
```

### View logs
```bash
# All services
podman-compose logs

# Specific service
podman-compose logs backend
podman-compose logs frontend
podman-compose logs db

# Follow logs in real-time
podman-compose logs -f backend
```

### Stop all services
```bash
podman-compose down
```

### Stop and remove volumes (fresh start)
```bash
podman-compose down -v
```

### Rebuild a specific service
```bash
podman-compose build backend
podman-compose up -d backend
```

### Execute commands in a container
```bash
# Access PostgreSQL
podman exec -it cueillette-db psql -U your_db_user -d cueillette_db

# Access backend shell
podman exec -it cueillette-backend sh

# View backend logs directly
podman logs -f cueillette-backend
```

## Troubleshooting

### Database connection issues
- Ensure the database service is healthy: `podman-compose ps`
- Check backend logs: `podman-compose logs backend`
- Verify environment variables in `.env`

### Flyway migration issues
- Migrations run automatically when backend starts
- If migrations fail, check: `podman-compose logs backend`
- For a fresh start: `podman-compose down -v && podman-compose up`

### Port conflicts
If port 4200 is already in use, edit `docker-compose.yml` to change the frontend host port (left side of the mapping). For 5432, 5050, or 8080, adjust `docker-compose.dev.yml` if you use the dev override.

### API rate limiting

Nginx enforces per-IP limits on public API routes (see `frontend/nginx-rate-limit.conf` and `frontend/nginx.conf`). Stricter limits apply to login, register, and contact; other `/api/` traffic uses a higher read limit. Exceeded limits return HTTP **429**.

Example:
```yaml
ports:
  - "3000:80"  # Access frontend on port 3000 instead of 4200
```

### Frontend can't connect to backend
- Check that backend is running: `podman-compose ps`
- Verify backend health (via Nginx): `curl http://localhost:4200/api/` (or with dev override: `curl http://127.0.0.1:8080/actuator/health`)
- Check browser console for CORS errors

## Development Workflow

### Making backend changes
1. Make your code changes
2. Rebuild and restart: `podman-compose build backend && podman-compose up -d backend`

### Making frontend changes
1. Make your code changes
2. Rebuild and restart: `podman-compose build frontend && podman-compose up -d frontend`

### Adding new Flyway migrations
1. Add migration file to `backend/src/main/resources/db/migration/`
2. Restart backend: `podman-compose restart backend`
3. Flyway will automatically apply new migrations

## Production Deployment

For production, consider:
1. Create a separate `.env.production` file
2. Use proper secrets management (not `.env` files)
3. Set up SSL/TLS termination
4. Use a reverse proxy (Nginx, Traefik)
5. Consider using managed database services
6. Enable production builds for Angular
7. Set appropriate resource limits in compose file

## Notes

- All data is persisted in Docker/Podman volumes
- To completely reset: `podman-compose down -v`
- The `.env` file is gitignored for security
- Default Angular build uses production configuration
