---
description: Create a single dummy user in the database using the existing Prisma User schema
allowed-tools: Read, Bash
---

# Seed Dummy User

Create exactly one dummy user in the database using the existing Prisma setup.

## Instructions

1. Read `prisma/schema.prisma` first.

2. Inspect the `User` model and determine:
   - Required fields
   - Optional fields
   - Unique fields
   - Default values
   - Field types

3. Do not assume the User schema shown in this command is still current.
   Always use the actual `prisma/schema.prisma` as the source of truth.

4. Inspect the project before creating the seed logic:
   - `package.json`
   - existing Prisma configuration
   - existing Prisma client
   - existing seed scripts
   - existing password hashing utilities

5. Reuse existing project utilities whenever possible.

6. Do NOT create duplicate Prisma clients or duplicate password hashing utilities.

7. Generate a secure password hash for the dummy user's password.
   Never store the plaintext password in the database.

8. Create exactly one dummy user.

9. Before creating the user, check whether the dummy user's email already exists.

10. If the user already exists:
    - Do not create another user.
    - Report that the dummy user already exists.
    - Display the existing user's email and ID if appropriate.
    - Try again to until email is unique

11. If the user does not exist:
    - Create the user.
    - Let Prisma generate `id`.
    - Let Prisma generate `createdAt`.
    - Let Prisma manage `updatedAt`.

12. Never manually provide fields that Prisma generates automatically unless the schema requires them.

13. Do not modify `prisma/schema.prisma`.

14. Do not create migrations.

15. Do not modify existing application code unless absolutely required for the seed operation.

16. Do not modify the authentication UI.

17. Do not create fake authentication logic.

## Dummy User

Use a clearly identifiable development-only account.

Email: derived from the name with a random 2-3 digit 
    number suffix (e.g. rahul.sharma21@gmail.com)

Password: "Password@123" hashed with the hashPassword() function

Important:

- The password above is only for local development/testing.
- Never use this account in production.
- Never store the plaintext password in MySQL.
- Store only the generated password hash.

## Expected Flow

Follow this flow:

Read Schema
    ↓
Inspect Existing Project
    ↓
Find Existing Prisma/Password Utilities
    ↓
Check Dummy User
    ↓
User Exists?
    ├── Yes → Do not create → Report existing user
    │
    └── No
          ↓
      Hash Password
          ↓
      Create User
          ↓
      Verify Creation
          ↓
      Report Result

## Database Operation

Prefer the project's existing Prisma access pattern.

Conceptually:

```typescript
const existingUser = await prisma.user.findUnique({
  where: {
    email: "rahul.sharma21@gmail.com",
  },
});