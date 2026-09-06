# Authentication API
## MVP Specification Document

## 1. Objective

Build the first version of the application's authentication backend using:

- Next.js
- TypeScript
- Prisma ORM
- MySQL
- Email/password authentication

The database and Prisma connection have already been completed.

This phase will implement:

1. Authentication database model(s)
2. Sign Up API
3. Login API
4. Password hashing
5. Password verification
6. Input validation
7. Duplicate email handling
8. Authentication error handling
9. Reusable authentication services
10. Clean MVP-oriented architecture
11. Secure server-side implementation
12. Integration-ready API responses

The implementation must be reusable, maintainable, and easy to extend in future phases.

---

# 2. MVP Scope

## Included

The MVP authentication system should support:

```text
Sign Up
   ↓
Create User
   ↓
Hash Password
   ↓
Store User
```

and:

```text
Login
   ↓
Find User
   ↓
Verify Password
   ↓
Authenticate User
```

The system should also provide a clean foundation for future:

- Sessions
- Cookies
- Logout
- Google OAuth
- Apple OAuth
- Forgot Password
- Email Verification
- Refresh Tokens
- Role-based authorization

---

# 3. Important Architecture Rule

Do NOT put all authentication logic inside the API route.

Avoid:

```text
API Route
├── validation
├── password hashing
├── database query
├── duplicate checking
├── password verification
├── response formatting
└── error handling
```

Instead, separate responsibilities.

Recommended conceptual architecture:

```text
Request
   │
   ▼
API Route
   │
   ▼
Validation
   │
   ▼
Auth Service
   │
   ├── User Repository
   │        │
   │        ▼
   │      Prisma
   │        │
   │        ▼
   │      MySQL
   │
   └── Password Utility
```

The goal is to keep each layer responsible for one thing.

---

# 4. Recommended Project Structure

Adapt this structure to the existing project architecture.

```text
src/
│
├── app/
│   └── api/
│       └── auth/
│           ├── signup/
│           │   └── route.ts
│           │
│           └── login/
│               └── route.ts
│
├── lib/
│   ├── prisma.ts
│   └── auth/
│       └── password.ts
│
├── services/
│   └── auth/
│       └── auth.service.ts
│
├── repositories/
│   └── user.repository.ts
│
├── validators/
│   └── auth.validator.ts
│
├── types/
│   └── auth.types.ts
│
└── utils/
    └── api-response.ts
```

This is a conceptual structure.

Before creating these directories, inspect the existing project.

If equivalent folders already exist, reuse them.

Do not create duplicate abstractions.

---

# 5. Reusability Requirement

All authentication functionality should be implemented with reusable functions.

Avoid repeating:

```typescript
prisma.user.findUnique(...)
```

throughout multiple API routes.

Instead, centralize user database operations.

For example:

```typescript
userRepository.findByEmail(email)
```

and:

```typescript
userRepository.createUser(data)
```

This allows future authentication features to reuse the same database layer.

---

# 6. Separation of Responsibilities

Each layer should have a clear responsibility.

## API Route

Responsible for:

- Receiving HTTP requests
- Parsing request body
- Calling validation
- Calling authentication service
- Returning HTTP responses

It should NOT contain complex authentication logic.

---

## Validator

Responsible for:

- Required fields
- Email validation
- Password validation
- Confirm password validation

Example:

```text
Email
Password
Confirm Password
```

---

## Authentication Service

Responsible for:

- Signup business logic
- Login business logic
- User lookup
- Password hashing
- Password verification
- Authentication decisions

---

## Repository

Responsible for:

- Prisma queries
- User creation
- User lookup
- User database operations

It should NOT contain HTTP-specific logic.

---

## Password Utility

Responsible for:

- Hashing passwords
- Comparing passwords

Example:

```text
hashPassword()
verifyPassword()
```

---

# 7. Code Comment Requirement

Each important function should contain a short comment explaining its responsibility.

Example:

```typescript
/**
 * Creates a new user account after validating
 * the email and securely hashing the password.
 */
async function createUser(...) {
   ...
}
```

Comments should explain:

- What the function does
- Why it exists
- Important security/business behavior

Do NOT add unnecessary comments to every line.

Avoid comments like:

```typescript
// Create user
const user = await ...
```

Prefer meaningful comments:

```typescript
// Passwords must never be stored in plaintext.
// Hash the password before persisting the user.
```

---

# 8. Database Model

The existing `User` model should be reused if it already exists.

Expected minimum structure:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Do not create another authentication user table if the existing database already contains the appropriate `User` model.

Do not duplicate user records across multiple authentication tables.

---

# 9. Authentication Data Model

The authentication system should distinguish between:

```text
User identity
```

and:

```text
Authentication/session information
```

For the MVP, the `User` table stores:

```text
id
email
passwordHash
createdAt
updatedAt
```

Future authentication-related tables can be introduced separately.

For example:

```text
User
Session
OAuthAccount
PasswordResetToken
EmailVerificationToken
```

Do not create these future tables unless required by the current implementation.

---

# 10. Sign Up API

## Endpoint

```http
POST /api/auth/signup
```

---

# 11. Signup Request

Expected JSON:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

If the existing UI sends a different structure, adapt the API to the actual UI contract rather than unnecessarily changing the frontend.

---

# 12. Signup Validation

Validate:

### Email

- Required
- Must be a valid email
- Normalize before lookup/storage

Example:

```text
User@Example.com
```

becomes:

```text
user@example.com
```

---

### Password

- Required
- Must satisfy the project's password requirements
- Must not be empty
- Must be securely hashed before storage

If password requirements already exist in the project, reuse them.

Do not create conflicting validation rules between frontend and backend.

---

# 13. Signup Password Confirmation

The frontend may send:

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

The backend should validate password confirmation if the API contract includes `confirmPassword`.

However, the backend must ultimately persist only:

```text
passwordHash
```

Never store:

```text
password
confirmPassword
```

---

# 14. Signup Flow

The complete flow should be:

```text
POST /api/auth/signup
        │
        ▼
Parse request
        │
        ▼
Validate input
        │
        ▼
Normalize email
        │
        ▼
Find existing user
        │
     ┌──┴──┐
     │     │
    Yes    No
     │     │
     ▼     ▼
 Return   Hash password
 error        │
              ▼
         Create User
              │
              ▼
        Return response
```

---

# 15. Duplicate Email

Before creating the user:

```typescript
const existingUser =
  await userRepository.findByEmail(email);
```

If the user already exists:

Return an appropriate client-facing error.

Example:

```json
{
  "success": false,
  "message": "An account with this email already exists."
}
```

Do not expose Prisma or MySQL errors.

---

# 16. Password Hashing

Never store plaintext passwords.

Incorrect:

```typescript
await prisma.user.create({
  data: {
    email,
    password: password
  }
});
```

Correct:

```typescript
const passwordHash = await hashPassword(password);

await userRepository.createUser({
  email,
  passwordHash
});
```

The hashing implementation must use an established password-hashing library/algorithm.

Before installing a package, inspect `package.json` and reuse an existing suitable dependency if available.

Do not implement custom cryptography.

---

# 17. Signup Success Response

On successful account creation:

```http
201 Created
```

Example:

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
}
```

Never return:

```text
password
passwordHash
```

to the frontend.

---

# 18. Login API

## Endpoint

```http
POST /api/auth/login
```

---

# 19. Login Request

Expected JSON:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

---

# 20. Login Flow

```text
POST /api/auth/login
        │
        ▼
Parse request
        │
        ▼
Validate input
        │
        ▼
Normalize email
        │
        ▼
Find User
        │
     ┌──┴──┐
     │     │
   Found  Not Found
     │     │
     ▼     ▼
Verify   Return
Password  Error
     │
  ┌──┴──┐
  │     │
Valid  Invalid
  │     │
  ▼     ▼
Auth    Return
Success Error
```

---

# 21. Login User Lookup

Use the unique email field.

Conceptually:

```typescript
const user =
  await userRepository.findByEmail(email);
```

If no user exists, return a safe authentication error.

Do not expose whether the email exists if the project's security requirements favor generic authentication errors.

Recommended:

```text
Invalid email or password.
```

---

# 22. Password Verification

Never compare plaintext passwords manually.

Use the password utility:

```typescript
const isValid =
  await verifyPassword(password, user.passwordHash);
```

If verification fails:

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

Do not return:

```text
Email does not exist
```

for login failures unless there is an explicit product requirement.

---

# 23. Login Success Response

For the initial MVP, return only safe user information.

Example:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
}
```

Do not return:

```text
passwordHash
password
database information
internal Prisma objects
```

---

# 24. Session / Authentication Token

The current MVP should establish a clear integration point for session authentication.

Do not invent a session architecture if the project already has one.

Before implementing:

1. Inspect existing authentication code.
2. Check whether JWT is already used.
3. Check whether sessions already exist.
4. Check whether cookies are already configured.
5. Check whether an authentication library is already installed.

If no authentication/session mechanism exists, keep the signup/login business logic isolated so session management can be added as the next phase.

Do NOT introduce JWT + database sessions + OAuth simultaneously.

Choose one authentication strategy in the dedicated session implementation phase.

---

# 25. API Response Standard

All authentication endpoints should follow a consistent response structure.

Success:

```json
{
  "success": true,
  "message": "Operation successful.",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong."
}
```

If the existing project already has an API response utility, reuse it.

Do not create a second response format.

---

# 26. HTTP Status Codes

Use meaningful status codes.

### Signup

Successful:

```text
201 Created
```

Validation:

```text
400 Bad Request
```

Duplicate user:

```text
409 Conflict
```

Unexpected server/database error:

```text
500 Internal Server Error
```

### Login

Successful:

```text
200 OK
```

Invalid credentials:

```text
401 Unauthorized
```

Invalid request:

```text
400 Bad Request
```

Unexpected server error:

```text
500 Internal Server Error
```

---

# 27. Error Handling

Do not use generic browser alerts.

The API should return structured errors.

Example:

```json
{
  "success": false,
  "message": "Please enter a valid email address."
}
```

The frontend authentication UI can then display the message near the appropriate field.

---

# 28. Validation Layer

If the project already uses a validation library such as Zod, reuse it.

Do not create custom validation utilities if an existing validation system is already available.

Conceptually:

```typescript
signupSchema
loginSchema
```

Example responsibilities:

```text
signupSchema
├── email
├── password
└── confirmPassword

loginSchema
├── email
└── password
```

Backend validation is mandatory even if the frontend already validates the forms.

Never trust client-side validation alone.

---

# 29. User Repository

Create reusable database operations.

Conceptual interface:

```typescript
findByEmail(email)
findById(id)
createUser(data)
```

Example:

```typescript
/**
 * Finds a user by their normalized email address.
 * Used by both signup and login authentication flows.
 */
async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
```

The repository should not know anything about HTTP requests or responses.

---

# 30. Authentication Service

The authentication service should contain business logic.

Conceptual functions:

```typescript
signup(input)
login(input)
```

Example responsibility:

```text
signup()
├── normalize email
├── validate business rules
├── check existing user
├── hash password
└── create user

login()
├── normalize email
├── find user
└── verify password
```

The API route should call these functions instead of implementing the logic itself.

---

# 31. Password Utility

Create reusable password functions.

Conceptual API:

```typescript
hashPassword(password)
verifyPassword(password, passwordHash)
```

Example:

```typescript
/**
 * Securely hashes a plaintext password before database storage.
 */
async function hashPassword(password: string) {
  // implementation
}
```

and:

```typescript
/**
 * Verifies a plaintext password against the stored password hash.
 */
async function verifyPassword(
  password: string,
  passwordHash: string
) {
  // implementation
}
```

These functions should be server-only.

---

# 32. Server-Only Security

Authentication utilities and Prisma must never be bundled into client-side code.

Do not import:

```text
prisma
password hashing
database repositories
authentication services
```

into Client Components.

Architecture:

```text
Browser
   │
   │ HTTP
   ▼
Next.js API Route
   │
   ▼
Auth Service
   │
   ├── Validator
   ├── Password Utility
   └── User Repository
              │
              ▼
            Prisma
              │
              ▼
             MySQL
```

---

# 33. Authentication UI Integration

The existing authentication UI should remain unchanged unless an API integration change is required.

Login:

```text
Login Form
   │
   ▼
POST /api/auth/login
   │
   ▼
API
   │
   ▼
Authentication Service
```

Signup:

```text
Signup Form
   │
   ▼
POST /api/auth/signup
   │
   ▼
API
   │
   ▼
Authentication Service
```

The frontend should consume the API response and display appropriate success/error states.

---

# 34. Loading State

The existing UI already supports loading states.

Connect them to the actual API request.

Signup:

```text
Create account
       ↓
Creating account...
       ↓
API response
       ↓
Success / Error
```

Login:

```text
Sign in
   ↓
Signing in...
   ↓
API response
   ↓
Success / Error
```

Prevent duplicate submissions while the request is running.

---

# 35. Security Requirements

The implementation MUST:

- Never store plaintext passwords.
- Never return password hashes.
- Never expose database credentials.
- Never expose Prisma errors to users.
- Never expose SQL errors to users.
- Validate input server-side.
- Normalize emails consistently.
- Use secure password hashing.
- Keep database access server-side.
- Prevent duplicate account creation.
- Use safe authentication error messages.
- Keep secrets in environment variables.

---

# 36. Reusable Code Requirements

Before writing new code, inspect the project for:

- Existing validators
- Existing API response utilities
- Existing error classes
- Existing database repositories
- Existing service patterns
- Existing logging utilities
- Existing authentication utilities
- Existing password hashing dependencies

If equivalent functionality already exists, reuse it.

Do not create:

```text
utils2
authServiceNew
newValidator
anotherApiResponse
```

just because the authentication feature is being added.

---

# 37. MVP Development Order

Implement in this exact order.

### Phase 1 — Inspect

Understand the existing architecture.

### Phase 2 — User Model

Verify the existing Prisma `User` model.

### Phase 3 — Password Utility

Implement:

```text
hashPassword()
verifyPassword()
```

### Phase 4 — Validation

Implement/reuse:

```text
signupSchema
loginSchema
```

### Phase 5 — Repository

Implement:

```text
findByEmail()
createUser()
```

### Phase 6 — Authentication Service

Implement:

```text
signup()
login()
```

### Phase 7 — API Routes

Implement:

```text
POST /api/auth/signup
POST /api/auth/login
```

### Phase 8 — UI Integration

Connect the existing forms to the APIs.

### Phase 9 — Testing

Test successful and failure scenarios.

---

# 38. Testing Requirements

Test Signup:

### Valid Signup

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

Expected:

```text
201 Created
```

and a new User record.

---

### Duplicate Email

Create the same account twice.

Expected:

```text
409 Conflict
```

---

### Invalid Email

```json
{
  "email": "invalid-email",
  "password": "Password123!"
}
```

Expected:

```text
400 Bad Request
```

---

### Empty Password

Expected:

```text
400 Bad Request
```

---

### Login With Correct Credentials

Expected:

```text
200 OK
```

---

### Login With Wrong Password

Expected:

```text
401 Unauthorized
```

---

### Login With Unknown Email

Expected:

```text
401 Unauthorized
```

---

### Password Storage

Verify the database contains:

```text
passwordHash
```

and NOT:

```text
password
```

---

# 39. Manual Verification

Use Prisma Studio:

```bash
npx prisma studio
```

Verify the User table.

After signup:

```text
User
-----------------------------------------
id
email
passwordHash
createdAt
updatedAt
```

Confirm that:

```text
passwordHash != user's original password
```

---

# 40. No Fake Authentication

Do not implement fake responses such as:

```typescript
return {
  success: true
};
```

without actually validating the user against the database.

Signup must create the user in MySQL.

Login must verify the credentials against the database.

---

# 41. No Unnecessary Features

Do NOT implement in this phase:

- Google OAuth
- Apple OAuth
- Forgot password
- Email verification
- Logout
- Refresh tokens
- User roles
- Admin authentication
- Two-factor authentication
- Account deletion
- Profile management

These can be separate implementation phases.

---

# 42. Acceptance Criteria

## Database

- [ ] Existing Prisma setup is reused.
- [ ] User model exists.
- [ ] Email is unique.
- [ ] Password is stored only as a hash.
- [ ] Created/updated timestamps exist.

## Signup API

- [ ] `POST /api/auth/signup` exists.
- [ ] Request validation works.
- [ ] Email is normalized.
- [ ] Duplicate emails are rejected.
- [ ] Password is hashed.
- [ ] User is created in MySQL.
- [ ] Password hash is never returned.
- [ ] Appropriate HTTP status codes are used.

## Login API

- [ ] `POST /api/auth/login` exists.
- [ ] Request validation works.
- [ ] Email is normalized.
- [ ] User lookup works.
- [ ] Password verification works.
- [ ] Invalid credentials return `401`.
- [ ] Password hash is never returned.

## Architecture

- [ ] API routes are thin.
- [ ] Authentication business logic is in a service.
- [ ] Prisma queries are reusable.
- [ ] Password logic is reusable.
- [ ] Validation is reusable.
- [ ] Response format is consistent.
- [ ] Existing project architecture is preserved.

## Code Quality

- [ ] Functions have meaningful comments.
- [ ] No unnecessary duplicated code.
- [ ] No unnecessary dependencies.
- [ ] No unnecessary abstractions.
- [ ] TypeScript types are used.
- [ ] Errors are handled consistently.
- [ ] Secrets remain server-side.

## UI Integration

- [ ] Existing Login UI calls Login API.
- [ ] Existing Signup UI calls Signup API.
- [ ] Loading states work.
- [ ] API errors appear in the UI.
- [ ] Existing authentication UI design is not unnecessarily changed.

---

# 43. Final Architecture

The final MVP should look like:

```text
                    Browser
                       │
              ┌────────┴────────┐
              │                 │
          Login UI          Signup UI
              │                 │
              └────────┬────────┘
                       │
                    HTTP API
                       │
             ┌─────────┴─────────┐
             │                   │
       /api/auth/login    /api/auth/signup
             │                   │
             └─────────┬─────────┘
                       │
                 Auth Service
                       │
          ┌────────────┼────────────┐
          │            │            │
      Validator    Password     Repository
                       │            │
                       │          Prisma
                       │            │
                       └──────┬─────┘
                              │
                            MySQL
                              │
                            User
```

The architecture should remain simple enough for an MVP while providing clear extension points for future authentication features.

---

# 44. Claude Code Implementation Rules

Before making changes:

1. Inspect the complete existing project structure.
2. Inspect `package.json`.
3. Inspect the existing Prisma schema.
4. Inspect the existing Prisma client.
5. Inspect existing API routes.
6. Inspect existing service/repository patterns.
7. Inspect existing validation utilities.
8. Inspect existing authentication-related code.
9. Inspect the existing Login and Signup UI.
10. Identify reusable code before creating new files.

Then implement the authentication MVP.

### Important

Do not rewrite working code.

Do not redesign the authentication UI.

Do not create duplicate utilities.

Do not introduce unnecessary dependencies.

Do not introduce a new architectural pattern if the project already has one.

Follow the existing project conventions wherever possible.

After implementation, run the project's existing:

```bash
npm run lint
npm run type-check
npm run build
```

commands if they exist.

Also test both API endpoints manually.

Finally, report:

```text
Files created
Files modified
Dependencies added
Database changes
API endpoints
Validation behavior
Password hashing implementation
Tests performed
Remaining authentication work
```

The implementation is complete only when the Signup and Login APIs successfully communicate with the existing MySQL database through Prisma.