# Environment Configuration Examples

Below are the required environment variables for each service. Please rename these files to `.env` in their respective directories.


---

## 1. Admin / Backend
*Location: `admin/backend/.env`*

```bash
# Server Configuration
PORT=5000                   # Port for the admin server to run on

# Security Secrets
JWT_SECRET_KEY=your_generated_secret_here   # Secret for signing JWT tokens
ENCRYPTION_KEY=your_generated_key_here      # 32-byte key for data encryption

# Database (PostgreSQL)
DB_HOST=localhost           # Database host
DB_PORT=5432                # Default PostgreSQL port
DB_NAME=parallelminds       # Database name
DB_USER=your_db_user        # Database username
DB_PASSWORD=your_db_password # Database password (ensure this matches Client Backend)

# Legacy 
# MONGODB_URI=              # (Previously used for NoSQL implementation)
```

---

## 2. Admin / Frontend

*Location: `admin/frontend/.env`*

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/admin  # URL pointing to the Admin Backend API

# External Services
VITE_GEOAPIFY_API_KEY=your_geoapify_key_here       # Key for map and address services
```

---

## 3. Client / Backend

*Location: `client/backend/.env`*

```bash
# Server Configuration
PORT=3000                   # Port for the client server
REDIS_URL=redis://localhost:6379  # Connection string for Redis 

# Security Secrets
JWT_SECRET_KEY=your_generated_secret_here   # Secret for signing JWT tokens
ENCRYPTION_KEY=your_generated_key_here      # 32-byte key (Should match Admin Backend)

# Database (PostgreSQL)
# Note: These credentials must match the Admin Backend to access the same data.
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parallelminds
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Legacy 
# MONGO_URI=                # (Previously used for NoSQL implementation)

```

---

## 4. Client / Frontend

*Location: `client/frontend/.env*`

```bash
# Backend Connection
VITE_BACKEND_PORT=3000                           # Must match Client Backend PORT
VITE_BACKEND_BASE_URL=http://localhost:3000      # Base URL for Client Backend

# External Services
VITE_GEOAPIFY_API_KEY=your_geoapify_key_here     # Key for map services
VITE_RAPIDAPI_KEY=your_rapidapi_key_here         # Key for external data APIs
```

**Tip:** To generate a secure random 32-byte string for `ENCRYPTION_KEY` or `JWT_SECRET_KEY`, run the following command in your terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
