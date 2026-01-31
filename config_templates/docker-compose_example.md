# Docker Compose Configuration

Use this `docker-compose.yml` file to spin up the required infrastructure (Database, Redis).

```yaml
version: '3.8'

services:
  # PostgreSQL with PostGIS pre-installed
  db:
    image: postgis/postgis:15-3.3
    container_name: parallelminds_db
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: your_db_password  # CHANGE THIS
      POSTGRES_DB: parallelminds
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:alpine
    container_name: parallelminds_redis
    restart: always
    ports:
      - "6379:6379"

  # pgAdmin (Database GUI)
  pgadmin:
    image: dpage/pgadmin4
    container_name: parallelminds_pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com      # CHANGE THIS
      PGADMIN_DEFAULT_PASSWORD: your_pgadmin_password # CHANGE THIS
    ports:
      - "5050:80"
    depends_on:
      - db

volumes:
  postgres_data: