# Troubleshooting Guide

Solutions to common problems you may encounter.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Prisma Issues](#prisma-issues)
- [TypeScript Issues](#typescript-issues)
- [Runtime Errors](#runtime-errors)
- [Testing Issues](#testing-issues)
- [Docker Issues](#docker-issues)
- [IDE Issues](#ide-issues)

---

## Installation Issues

### `npm install` fails with permission errors

**Symptom:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Node version too old

**Symptom:**
```
error This project requires Node.js >= 20.0.0
```

**Solution:**
```bash
# Check current version
node --version

# Update via nvm
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### `prisma generate` fails during install

**Symptom:**
```
Error: @prisma/client did not initialize
```

**Solution:**
```bash
# Manually generate
npm run prisma:generate

# If still failing, delete and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

## Database Issues

### Cannot connect to database

**Symptom:**
```
Can't reach database server at `localhost:5432`
```

**Solutions:**

1. **Check if PostgreSQL is running:**
   ```bash
   docker compose ps
   # Should show postgres container running
   ```

2. **Start PostgreSQL:**
   ```bash
   docker compose up -d postgres
   ```

3. **Check connection string:**
   ```bash
   # Verify DATABASE_URL in .env
   cat .env | grep DATABASE_URL
   ```

4. **Check port availability:**
   ```bash
   lsof -i :5432
   # If another process is using it, kill or change port
   ```

### Authentication failed

**Symptom:**
```
password authentication failed for user "postgres"
```

**Solutions:**

1. **Check credentials in `.env`:**
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_dev"
   ```

2. **Reset Docker volume:**
   ```bash
   docker compose down -v
   docker compose up -d postgres
   ```

### Database does not exist

**Symptom:**
```
database "myapp_dev" does not exist
```

**Solutions:**

1. **For Docker:** Database is created automatically. Restart container:
   ```bash
   docker compose down
   docker compose up -d postgres
   ```

2. **For local PostgreSQL:**
   ```bash
   createdb myapp_dev
   ```

### Connection timeout

**Symptom:**
```
Connection timed out
```

**Solutions:**

1. **Check Docker network:**
   ```bash
   docker network ls
   docker network inspect node-express-prisma-clean_default
   ```

2. **Check firewall:**
   ```bash
   # macOS
   sudo pfctl -sr | grep 5432
   ```

3. **Use host.docker.internal (if app is in Docker):**
   ```
   DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/myapp_dev"
   ```

---

## Prisma Issues

### Prisma client not generated

**Symptom:**
```
PrismaClient is not defined
```

**Solution:**
```bash
npm run prisma:generate
```

### Migration drift

**Symptom:**
```
Drift detected: Your database schema is not in sync
```

**Solutions:**

1. **Development - reset database:**
   ```bash
   npm run db:reset
   ```

2. **Production - create baseline:**
   ```bash
   npx prisma migrate resolve --applied "migration_name"
   ```

### Migration failed

**Symptom:**
```
Migration failed to apply
```

**Solutions:**

1. **Check migration SQL:**
   ```bash
   cat prisma/migrations/*/migration.sql
   ```

2. **Reset in development:**
   ```bash
   npm run db:reset
   ```

3. **Manual fix in production:**
   ```bash
   # Mark as applied if already done manually
   npx prisma migrate resolve --applied "20240101120000_init"

   # Or roll back
   npx prisma migrate resolve --rolled-back "20240101120000_init"
   ```

### Schema validation error

**Symptom:**
```
Error validating: This field is required
```

**Solution:** Check `prisma/schema.prisma` for syntax errors:
```bash
npx prisma validate
```

### Prisma Studio won't open

**Symptom:**
```
Error: Cannot open Prisma Studio
```

**Solution:**
```bash
# Kill any existing instance
pkill -f "prisma studio"

# Try different port
npx prisma studio --port 5556
```

---

## TypeScript Issues

### Type errors after schema change

**Symptom:**
```
Property 'newField' does not exist on type 'User'
```

**Solution:**
```bash
# Regenerate Prisma types
npm run prisma:generate

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Module not found

**Symptom:**
```
Cannot find module '../domain/entities/user.entity.js'
```

**Solutions:**

1. **Check file extension:** Must use `.js` in imports (ESM requirement):
   ```typescript
   // ✅ Correct
   import { User } from './user.entity.js';

   // ❌ Wrong
   import { User } from './user.entity';
   ```

2. **Check file exists:**
   ```bash
   ls -la src/domain/entities/
   ```

### Path alias not working

**Symptom:**
```
Cannot find module '@domain/entities/user.entity.js'
```

**Note:** Path aliases (`@domain`, etc.) are configured in `tsconfig.json` but require a bundler or runtime support. For simplicity, this project uses relative imports.

---

## Runtime Errors

### Invalid environment variables

**Symptom:**
```
Invalid environment variables:
{
  "DATABASE_URL": { "_errors": ["Required"] }
}
```

**Solution:**
```bash
# Check .env file exists
cat .env

# Copy from example if missing
cp .env.example .env

# Edit with correct values
nano .env
```

### Port already in use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Find and kill process:**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Use different port:**
   ```bash
   PORT=3001 npm run dev
   ```

### CORS errors (in browser)

**Symptom:**
```
Access-Control-Allow-Origin header is missing
```

**Solution:** Add CORS middleware to `src/main/app.ts`:
```typescript
import cors from 'cors';

// In createApp function
app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  credentials: true,
}));
```

Install package:
```bash
npm install cors
npm install -D @types/cors
```

### Memory issues

**Symptom:**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

---

## Testing Issues

### Tests failing with database error

**Symptom:**
```
Can't reach database server
```

**Solution:** Tests use environment variables from `vitest.config.ts`. Check the `env` section has correct `DATABASE_URL`.

### Tests hang indefinitely

**Symptom:** Tests never complete

**Solutions:**

1. **Check for open handles:**
   ```bash
   npm test -- --detectOpenHandles
   ```

2. **Add proper cleanup in tests:**
   ```typescript
   afterAll(async () => {
     await prisma.$disconnect();
   });
   ```

### Mock not working

**Symptom:**
```
TypeError: mockFunction is not a function
```

**Solution:** Ensure proper mock setup:
```typescript
import { vi } from 'vitest';

const mockRepo = {
  findById: vi.fn(),
  create: vi.fn(),
};

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## Docker Issues

### Container won't start

**Symptom:**
```
Error starting container
```

**Solutions:**

1. **Check logs:**
   ```bash
   docker compose logs postgres
   ```

2. **Remove and recreate:**
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### Volume permission issues

**Symptom:**
```
Permission denied on volume mount
```

**Solution:**
```bash
# Remove volume and recreate
docker compose down -v
docker volume prune
docker compose up -d
```

### Container exits immediately

**Symptom:**
```
Container exited with code 1
```

**Solution:**
```bash
# Check exit logs
docker compose logs postgres

# Common fix: remove corrupted data
docker compose down -v
docker compose up -d
```

---

## IDE Issues

### ESLint not working in VS Code

**Solutions:**

1. **Install ESLint extension**

2. **Check workspace settings:**
   ```json
   {
     "eslint.workingDirectories": ["."]
   }
   ```

3. **Restart ESLint server:**
   ```
   Cmd/Ctrl + Shift + P → "ESLint: Restart ESLint Server"
   ```

### Prettier conflicts with ESLint

**Solution:** This project uses `eslint-config-prettier` to disable conflicting rules. If still seeing conflicts:

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### TypeScript IntelliSense slow

**Solutions:**

1. **Exclude node_modules in tsconfig:**
   ```json
   {
     "exclude": ["node_modules", "dist"]
   }
   ```

2. **Restart TS Server:**
   ```
   Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
   ```

### Prisma syntax highlighting not working

**Solution:** Install "Prisma" extension from VS Code marketplace.

---

## Still Having Issues?

1. **Check the logs:**
   ```bash
   # Application logs
   npm run dev 2>&1 | tee app.log

   # Docker logs
   docker compose logs -f
   ```

2. **Reset everything:**
   ```bash
   # Nuclear option - reset all
   rm -rf node_modules dist
   docker compose down -v
   npm install
   docker compose up -d postgres
   npm run prisma:migrate:dev
   npm run dev
   ```

3. **Check GitHub issues** for similar problems

4. **Verify versions:**
   ```bash
   node --version    # Should be >= 20
   npm --version     # Should be >= 10
   docker --version  # Latest
   ```
