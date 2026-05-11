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

Simply run:
```bash
podman compose build
podman compose up
```

Or in detached mode (background):
```bash
podman compose up -d
```

The `.env` file will be automatically loaded by all services.

### 3. Access the application

Once all containers are running:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **pgAdmin**: http://localhost:5050
- **PostgreSQL**: localhost:5432

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
If ports 4200, 8080, 5432, or 5050 are already in use, edit `docker-compose.yml` to change the host port (left side of the port mapping).

Example:
```yaml
ports:
  - "3000:80"  # Access frontend on port 3000 instead of 4200
```

### Frontend can't connect to backend
- Check that backend is running: `podman-compose ps`
- Verify backend health: `curl http://localhost:8080/actuator/health`
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
