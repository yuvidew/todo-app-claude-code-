# Database Setup & Authentication
## Specification Document

## 1. Objective

Set up a MySQL database for the existing Next.js application using Prisma ORM.

The database layer must:

- Use MySQL as the relational database.
- Use Prisma ORM for database access.
- Connect Prisma to the existing Next.js application.
- Store registered users in an authentication table.
- Support the existing Login and Sign Up UI.
- Provide a clean foundation for future authentication features.
- Reuse the existing Next.js architecture.
- Keep database credentials secure using environment variables.

The current application already has the authentication UI implemented.

This phase focuses on:

1. MySQL setup
2. Prisma installation
3. Prisma configuration
4. Database connection
5. Authentication/User schema
6. Initial migration
7. Prisma Client setup
8. Database connection testing

Do NOT implement the complete authentication/session system in this phase unless the existing project already contains authentication logic that needs database integration.

---

# 2. Existing Technology Stack

The project uses:

- Next.js
- TypeScript
- React
- Next.js frontend and backend
- MySQL
- Prisma ORM

The same Next.js application will contain both the frontend and backend/API logic.

Do not introduce a separate backend server.

---

# 3. Database Configuration

The MySQL database is:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=Raj@1234
MYSQL_DATABASE=todo_app
```

These values are provided for local development only.

## Important Security Requirement

Never hardcode these credentials inside:

- React components
- API routes
- Prisma files
- utility files
- configuration files
- Git-tracked source code

Store credentials in the environment configuration.

Prefer using a single Prisma-compatible connection string:

```env
DATABASE_URL="mysql://root:Raj@1234@localhost:3306/todo_app"
```

However, because the password contains `@`, ensure the connection string is correctly URL-encoded if Prisma requires it.

For example, the `@` character in the password should be encoded appropriately.

Also preserve the individual variables if the project wants to use them elsewhere:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=Raj@1234
MYSQL_DATABASE=todo_app
```

Do not expose any of these variables to the browser.

Do NOT use:

```env
NEXT_PUBLIC_MYSQL_PASSWORD
NEXT_PUBLIC_DATABASE_URL
```

Database credentials must remain server-side only.

---

# 4. Environment File

Create or update:

```text
.env
```

Example:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=Raj@1234
MYSQL_DATABASE=todo_app

DATABASE_URL="..."
```

Use the project's existing environment-variable conventions if they already exist.

Before adding new variables, inspect the existing `.env`, `.env.local`, and project configuration.

Do not overwrite existing environment variables.

---

# 5. Git Security

Ensure sensitive environment files are ignored.

Check:

```text
.gitignore
```

It should contain appropriate environment files, for example:

```text
.env
.env.local
.env.*.local
```

Do not commit database credentials.

If `.env` is already tracked by Git, do not blindly remove or modify repository history. Report the situation before taking destructive actions.

---

# 6. Install Prisma

First inspect the existing `package.json`.

If Prisma is not installed, install the required dependencies.

For the current Prisma setup, use:

```bash
npm install prisma@7.10.0 --save-dev
npm install @prisma/client@7.10.0 @prisma/adapter-mariadb dotenv
```

The Prisma MySQL quickstart uses:

- `prisma` for the Prisma CLI
- `@prisma/client` for database queries
- `@prisma/adapter-mariadb` as the MySQL/MariaDB driver adapter
- `dotenv` for environment variables

If the project already has compatible Prisma packages installed, do not unnecessarily reinstall or downgrade them.

First inspect the installed versions.

---

# 7. Initialize Prisma

If Prisma has not already been initialized:

```bash
npx prisma init --datasource-provider mysql --output ../generated/prisma
```

This should create the Prisma configuration and schema structure.

Expected conceptual structure:

```text
project/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── generated/
│   └── prisma/
│
├── lib/
│   └── prisma.ts
│
├── .env
├── .gitignore
└── package.json
```

The exact location of `lib/prisma.ts` should follow the existing project architecture.

The Prisma MySQL setup creates a `prisma/` directory, `.env`, and Prisma configuration when initialized.

---

# 8. Prisma Configuration

For Prisma 7, use the project's generated Prisma configuration.

Conceptually:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Do not introduce a second Prisma configuration if the project already has one.

Inspect the existing project before creating this file.

---

# 9. Prisma Schema

Create/update:

```text
prisma/schema.prisma
```

The initial database should contain a `User` model for authentication.

Recommended model:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "mysql"
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

# 10. User Table Purpose

The `User` table represents application users.

It is the primary table used by the authentication system.

Database concept:

```text
User
│
├── id
├── email
├── passwordHash
├── createdAt
└── updatedAt
```

---

# 11. User ID

Field:

```prisma
id Int @id @default(autoincrement())
```

Requirements:

- Primary key
- Integer
- Automatically generated
- Must never be supplied manually during normal user creation

---

# 12. Email

Field:

```prisma
email String @unique
```

Requirements:

- Required
- Unique
- Used as the user's login identifier
- Must not allow duplicate accounts with the same email

Example:

```text
john@example.com
```

The application should normalize emails consistently before storing/querying them.

Recommended behavior:

```text
John@Example.com
```

should be normalized to:

```text
john@example.com
```

Do not implement inconsistent email normalization in different API routes.

---

# 13. Password Storage

NEVER store a user's raw password.

Do NOT create:

```prisma
password String
```

Instead use:

```prisma
passwordHash String
```

The database must only contain the hashed password.

Example:

```text
passwordHash:
$2b$...
```

The actual password must never be stored in the database.

Password hashing should be implemented in the authentication service/API layer, not in React components.

---

# 14. Created Timestamp

Field:

```prisma
createdAt DateTime @default(now())
```

Purpose:

Store when the user account was created.

The application should not manually supply this timestamp during normal account creation.

---

# 15. Updated Timestamp

Field:

```prisma
updatedAt DateTime @updatedAt
```

Purpose:

Automatically update the timestamp whenever the user record changes.

---

# 16. Initial Database Schema

The first database version should contain only the required authentication table.

Do NOT add unnecessary tables such as:

```text
posts
tasks
sessions
refresh_tokens
password_resets
oauth_accounts
verification_tokens
```

unless the existing application already requires them or a later authentication specification explicitly introduces them.

The goal of this phase is to establish a clean foundation.

---

# 17. Prisma Client

Create a reusable Prisma Client instance.

Recommended conceptual location:

```text
lib/prisma.ts
```

For Prisma 7, use the configured MySQL/MariaDB adapter.

Conceptually:

```typescript
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

export { prisma };
```

Follow the existing project module structure.

The Prisma MySQL reference uses the MariaDB adapter with host, user, password, database, and connection configuration.

If the project uses a different compatible Prisma 7 configuration, preserve the existing configuration instead of creating conflicting implementations.

---

# 18. Server-Only Database Access

Prisma must only run on the server.

Do NOT import:

```text
prisma
```

into:

- Client Components
- browser-side utilities
- React hooks
- frontend components

Correct architecture:

```text
Browser
   │
   │ HTTP request
   ▼
Next.js Route Handler / Server Action
   │
   ▼
Prisma Client
   │
   ▼
MySQL
```

Incorrect:

```text
React Component
   │
   ▼
Prisma
   │
   ▼
MySQL
```

---

# 19. Next.js Integration

The existing Next.js application is responsible for both frontend and backend functionality.

Use the project's existing backend architecture.

Before implementing database routes:

1. Inspect the Next.js version.
2. Determine whether the project uses App Router or Pages Router.
3. Inspect existing API routes.
4. Inspect existing Server Actions.
5. Inspect existing service/repository patterns.
6. Reuse the existing architecture.

Do not introduce Express, NestJS, Fastify, or another backend framework.

---

# 20. Database Service Layer

If the project architecture supports service/repository layers, keep database operations isolated.

Recommended conceptual structure:

```text
lib/
└── prisma.ts

services/
└── auth.service.ts

app/
└── api/
    └── auth/
        ├── login/
        └── signup/
```

This is conceptual only.

Adapt it to the existing project structure.

Do not create unnecessary abstractions if the existing project is small and uses a simpler pattern.

---

# 21. Signup Database Flow

The future signup implementation should follow this general flow:

```text
User
 │
 │ enters email + password
 ▼
Signup UI
 │
 ▼
Next.js backend
 │
 ├── Validate email
 │
 ├── Validate password
 │
 ├── Normalize email
 │
 ├── Check existing user
 │
 ├── Hash password
 │
 └── Create User
        │
        ▼
      MySQL
```

Database creation should conceptually use:

```typescript
await prisma.user.create({
  data: {
    email,
    passwordHash,
  },
});
```

Never send `password` directly to Prisma as a stored database field.

---

# 22. Existing User Check

Before creating a new user:

```typescript
const existingUser = await prisma.user.findUnique({
  where: {
    email,
  },
});
```

If a user already exists, account creation must not create a duplicate record.

Handle the error through the application's existing error-handling strategy.

Do not expose unnecessary database implementation details to the client.

---

# 23. Login Database Flow

The future login implementation should follow:

```text
Login UI
   │
   ▼
Next.js backend
   │
   ├── Validate email
   │
   ├── Find user
   │
   ├── Compare password with passwordHash
   │
   └── Continue authentication/session flow
           │
           ▼
         User
```

The login endpoint should query the user using the unique email.

Conceptually:

```typescript
const user = await prisma.user.findUnique({
  where: {
    email,
  },
});
```

Do not return `passwordHash` to the frontend.

---

# 24. Password Hashing

Password hashing must be implemented using a proper password-hashing algorithm/library.

Do NOT:

```text
MD5
SHA1
plain SHA256
plain text
```

Do not implement custom cryptographic algorithms.

Before adding a new package, inspect the existing dependencies to determine whether a password hashing library already exists.

If there is no existing implementation, choose an established password hashing solution appropriate for the project.

Keep password hashing and password verification inside the server-side authentication layer.

---

# 25. Database Error Handling

Database errors must not expose:

- MySQL credentials
- SQL queries
- stack traces
- internal database structure
- Prisma internals

to the browser in production.

Example client-facing error:

```text
An account with this email already exists.
```

Instead of:

```text
PrismaClientKnownRequestError: ...
```

Internal errors should be logged server-side using the project's existing logging strategy.

---

# 26. Migration

After creating the Prisma schema:

```bash
npx prisma migrate dev --name init
```

This creates the initial migration and applies the schema to the MySQL database.

The Prisma MySQL workflow uses `prisma migrate dev` to create and apply the initial database tables.

After migration:

```bash
npx prisma generate
```

The Prisma Client must be generated from the current schema.

---

# 27. Database Connection Test

After setup, verify the database connection.

Test using Prisma.

The test should confirm:

```text
Next.js
   ↓
Prisma
   ↓
MySQL
   ↓
todo_app
```

If the connection fails, inspect:

- MySQL server status
- host
- port
- username
- password
- database name
- `DATABASE_URL`
- Prisma adapter configuration

Do not change unrelated application code to fix a database configuration issue.

---

# 28. Prisma Studio

Prisma Studio can be used to inspect the database:

```bash
npx prisma studio
```

Prisma Studio provides a visual interface for viewing/editing database data.

After migration, verify that the `User` table exists.

Expected:

```text
User
├── id
├── email
├── passwordHash
├── createdAt
└── updatedAt
```

---

# 29. Expected Project Structure

After completing this phase, the project should conceptually look similar to:

```text
project/
│
├── app/
│   ├── login/
│   ├── signup/
│   └── ...
│
├── components/
│   └── ...
│
├── lib/
│   └── prisma.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── generated/
│   └── prisma/
│
├── .env
├── .gitignore
├── package.json
├── prisma.config.ts
└── ...
```

Do not force this exact structure if the project already follows a different architecture.

---

# 30. Important Existing Project Rules

Before changing anything, Claude Code MUST inspect:

```text
package.json
```

```text
tsconfig.json
```

```text
.gitignore
```

```text
.env*
```

and the existing:

```text
app/
pages/
components/
lib/
services/
utils/
```

directories where applicable.

Identify:

- Next.js version
- App Router vs Pages Router
- TypeScript configuration
- existing dependencies
- existing database configuration
- existing authentication code
- existing API structure
- existing environment-variable conventions
- existing utility/service architecture

Do not replace existing architecture unnecessarily.

---

# 31. Dependency Rule

Before installing a package:

1. Inspect `package.json`.
2. Determine whether the functionality already exists.
3. Reuse existing dependencies where possible.
4. Only install a new dependency if necessary.

Do not install multiple libraries that solve the same problem.

---

# 32. Do Not Implement Yet

This database setup phase should NOT automatically implement:

- OAuth
- Google authentication
- Apple authentication
- password reset
- email verification
- refresh tokens
- session management
- JWT authentication
- role-based access control
- two-factor authentication

unless those systems already exist in the project.

These should be handled in separate authentication implementation specifications.

The current goal is establishing the database and User model correctly.

---

# 33. Relationship With Existing Authentication UI

The existing UI already contains:

```text
/login
/signup
/forgot-password
```

The database layer should be designed so the Login and Signup forms can later connect to the backend.

Current conceptual integration:

```text
                 Next.js Application
                         │
          ┌──────────────┴──────────────┐
          │                             │
     Authentication UI             Backend/API
          │                             │
          │                       Auth Service
          │                             │
          └─────────────────────────────┤
                                        │
                                   Prisma Client
                                        │
                                      MySQL
                                        │
                                  ┌─────▼─────┐
                                  │   User    │
                                  │   Table   │
                                  └───────────┘
```

---

# 34. Acceptance Criteria

## Prisma

- [ ] Prisma is installed.
- [ ] Prisma version is compatible with the existing project.
- [ ] Prisma is initialized.
- [ ] Prisma configuration exists.
- [ ] Prisma schema exists.
- [ ] Prisma Client generates successfully.

## MySQL

- [ ] MySQL server is running.
- [ ] `todo_app` database exists or is created appropriately.
- [ ] Prisma can connect to MySQL.
- [ ] Database credentials are stored in environment variables.
- [ ] Credentials are not exposed to the browser.

## User Table

- [ ] `User` table exists.
- [ ] `id` is the primary key.
- [ ] `id` auto-increments.
- [ ] `email` is required.
- [ ] `email` is unique.
- [ ] `passwordHash` is required.
- [ ] Raw passwords are never stored.
- [ ] `createdAt` exists.
- [ ] `updatedAt` exists.

## Migration

- [ ] Initial migration is created.
- [ ] Migration applies successfully.
- [ ] Prisma Client is generated.
- [ ] Prisma Studio can display the User table.

## Next.js

- [ ] Prisma is accessible from server-side code.
- [ ] Prisma is not imported into Client Components.
- [ ] Existing Next.js architecture is preserved.
- [ ] No separate backend framework is introduced.

## Security

- [ ] Database credentials are not hardcoded.
- [ ] `.env` is not committed.
- [ ] Passwords are not stored in plain text.
- [ ] `passwordHash` is never returned to the client.
- [ ] Database errors are not exposed directly to users.

---

# 35. Claude Code Execution Instructions

When implementing this specification, follow this order:

### Step 1 — Inspect

Inspect the existing project before modifying anything.

### Step 2 — Dependencies

Check whether Prisma is already installed.

### Step 3 — Environment

Check existing environment configuration.

Do not overwrite existing variables.

### Step 4 — Prisma

Initialize/configure Prisma only if it does not already exist.

### Step 5 — Schema

Create the `User` model.

### Step 6 — Client

Create the reusable server-side Prisma Client.

### Step 7 — Migration

Run:

```bash
npx prisma migrate dev --name init
```

### Step 8 — Generate

Run:

```bash
npx prisma generate
```

### Step 9 — Verify

Verify that:

```text
MySQL
  ↓
Prisma
  ↓
User table
```

works correctly.

### Step 10 — Report

At the end, report:

1. Files created
2. Files modified
3. Dependencies installed
4. Prisma version
5. Database connection status
6. Migration status
7. Generated Prisma Client status
8. Any issues or warnings

Do not modify authentication UI unless required for database integration.

Do not redesign the existing authentication pages.

Do not introduce unrelated features.

---

# 36. Final Database Target

The final initial database should be:

```text
MySQL
└── todo_app
    └── User
        ├── id
        ├── email
        ├── passwordHash
        ├── createdAt
        └── updatedAt
```

This database will become the foundation for the next authentication implementation phase.