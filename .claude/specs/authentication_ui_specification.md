# Authentication UI --- Specification Document

## 1. Objective

Build a polished, modern, responsive authentication experience with:

-   Login page
-   Sign Up page
-   Email and password authentication forms
-   Password show/hide functionality
-   Form validation
-   Navigation between Login and Sign Up
-   Forgot Password link
-   Google and Apple authentication buttons
-   Loading and disabled states
-   Dark Mode and Light Mode support
-   Responsive desktop, tablet, and mobile layouts

Use the attached reference image as a **layout and UX reference only**.
The reference is dark, but the implementation must support the
application's existing Dark/Light theme system.

------------------------------------------------------------------------

## 2. Important Theme Requirement

The project already supports **Dark Mode and Light Mode**.

The authentication pages must automatically follow the application's
existing theme.


Reuse the project's existing:

-   Theme configuration
-   CSS variables
-   Design tokens
-   Color utilities
-   Dark/light classes
-   Existing UI components

The authentication pages should look like a natural part of the
application in both themes.

------------------------------------------------------------------------

# 3. Login Page

## Route

`/login`

## Layout

Create a centered authentication layout.

Structure:

1.  Application logo/icon
2.  Heading
3.  Supporting text
4.  Sign Up redirect
5.  Login form
6.  Forgot Password link
7.  Login button
8.  Social authentication divider
9.  Google and Apple buttons
10. Terms and Privacy text

------------------------------------------------------------------------

## 3.1 Login Header

### Logo

Display the application's existing logo or brand icon.

Keep it centered above the heading.

### Heading

`Welcome back`

### Description

`Sign in to continue to your account`

### Sign Up Link

`Don't have an account? Sign up`

The **Sign up** link must navigate to:

`/signup`

------------------------------------------------------------------------

# 4. Login Form

The Login form contains two fields.

## 4.1 Email

Label:

`Email`

Placeholder:

`you@example.com`

Requirements:

-   Required
-   Email format validation
-   Accessible label
-   Inline validation error

Example:

`Please enter a valid email address.`

------------------------------------------------------------------------

## 4.2 Password

Label:

`Password`

Placeholder:

`Enter your password`

Requirements:

-   Required
-   Password input
-   Eye icon inside the right side of the input
-   Clicking the icon toggles password visibility

States:

-   Hidden → `type="password"`
-   Visible → `type="text"`

The eye button must have an accessible label:

-   `Show password`
-   `Hide password`

------------------------------------------------------------------------

# 5. Forgot Password

Add a:

`Forgot password?`

link near the password field.

Route:

`/forgot-password`

If the backend/route does not exist yet, keep the UI ready for future
implementation and do not invent backend behavior.

------------------------------------------------------------------------

# 6. Login Button

Primary button:

`Sign in`

Requirements:

-   Full form width
-   Hover state
-   Focus state
-   Disabled state
-   Loading state
-   Prevent duplicate submissions

Loading text:

`Signing in...`

During submission, disable the button and prevent multiple requests.

------------------------------------------------------------------------

# 7. Social Authentication

Below the Login button, add a divider:

`Or continue with`

Add:

-   Continue with Google
-   Continue with Apple

The buttons should:

-   Include their appropriate icons
-   Have consistent sizing
-   Have hover/focus states
-   Stack vertically on small screens if needed

If authentication providers are not implemented yet, do not create fake
authentication. Keep the buttons ready for integration.

------------------------------------------------------------------------

# 8. Terms and Privacy

At the bottom of the form:

`By continuing, you agree to our Terms of Service and Privacy Policy.`

Requirements:

-   Terms of Service should be a link
-   Privacy Policy should be a link
-   Use secondary/muted typography
-   Maintain good contrast in both themes

------------------------------------------------------------------------

# 9. Sign Up Page

## Route

`/signup`

Use the same visual system as the Login page.

The page should contain:

1.  Application logo/icon
2.  Heading
3.  Supporting text
4.  Login redirect
5.  Sign Up form
6.  Create Account button
7.  Social authentication
8.  Terms and Privacy text

------------------------------------------------------------------------

# 10. Sign Up Header

### Heading

`Create your account`

### Description

`Get started with your account`

### Login Redirect

`Already have an account? Sign in`

The **Sign in** link must navigate to:

`/login`

------------------------------------------------------------------------

# 11. Sign Up Form

The Sign Up form contains three fields.

## 11.1 Email

Label:

`Email`

Placeholder:

`you@example.com`

Requirements:

-   Required
-   Valid email format
-   Inline validation
-   Accessible label

------------------------------------------------------------------------

## 11.2 Password

Label:

`Password`

Placeholder:

`Create a password`

Requirements:

-   Required
-   Password input
-   Eye icon
-   Show/hide functionality
-   Accessible toggle button

------------------------------------------------------------------------

## 11.3 Confirm Password

Label:

`Confirm password`

Placeholder:

`Confirm your password`

Requirements:

-   Required
-   Password input
-   Independent eye icon
-   Independent show/hide state
-   Accessible toggle button

Important:

The Password and Confirm Password visibility states must be independent.

For example:

-   `passwordVisible`
-   `confirmPasswordVisible`

Do not use one state for both fields.

------------------------------------------------------------------------

# 12. Password Confirmation Validation

The Sign Up form must verify:

`password === confirmPassword`

If they don't match, display:

`Passwords do not match.`

Do not allow account creation while the passwords do not match.

If the project already has password requirements, reuse them.

Example:

`Password must contain at least 8 characters.`

------------------------------------------------------------------------

# 13. Create Account Button

Primary button:

`Create account`

Loading state:

`Creating account...`

Requirements:

-   Full width
-   Hover state
-   Focus state
-   Disabled state
-   Loading state
-   Prevent duplicate submissions

------------------------------------------------------------------------

# 14. Authentication Navigation

The two authentication pages must be connected.

### Login → Sign Up

`Don't have an account? Sign up`

Navigate to:

`/signup`

### Sign Up → Login

`Already have an account? Sign in`

Navigate to:

`/login`

Use the application's existing client-side routing system.

Do not introduce a new routing solution.

------------------------------------------------------------------------

# 15. Visual Design

The UI should be:

-   Modern
-   Minimal
-   Professional
-   Clean
-   Premium
-   Responsive
-   Consistent with the rest of the application

Use the reference image for general layout inspiration.

Do not copy it pixel-for-pixel.

------------------------------------------------------------------------

## Authentication Container

Recommended maximum width:

`420px`

The form should remain compact and centered.

Avoid making the authentication area unnecessarily large.

------------------------------------------------------------------------

# 16. Input Design

Inputs should have:

-   Rounded corners
-   Theme-aware background
-   Theme-aware border
-   Comfortable padding
-   Clear focus state
-   Clear error state
-   Password visibility icon inside the input

Example:

``` text
┌──────────────────────────────────────┐
│ Enter your password             👁   │
└──────────────────────────────────────┘
```

The eye button should be positioned inside the input without changing
the input's layout.

------------------------------------------------------------------------

# 17. Error States

Errors must appear inline and close to the relevant field.

Example:

``` text
Email
┌──────────────────────────────────────┐
│ invalid-email                        │
└──────────────────────────────────────┘
Please enter a valid email address.
```

Password mismatch:

``` text
Confirm password
┌──────────────────────────────────────┐
│ ********                             │
└──────────────────────────────────────┘
Passwords do not match.
```

Do not rely only on color to communicate errors.

------------------------------------------------------------------------

# 18. Responsive Design

The authentication UI must work on:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

### Desktop

Use a centered authentication container with a maximum width around
420px.

### Mobile

Use:

-   Full available width
-   Comfortable horizontal padding
-   Touch-friendly controls
-   Stacked social buttons when necessary

Do not allow horizontal overflow.

------------------------------------------------------------------------

# 19. Accessibility

Ensure:

-   Every input has a proper label
-   Password visibility buttons have accessible names
-   Buttons are keyboard accessible
-   Links are keyboard accessible
-   Focus states are visible
-   Error messages are associated with the relevant fields
-   Text has sufficient contrast in both themes
-   Semantic HTML is used
-   Interactive elements have appropriate accessible states

------------------------------------------------------------------------

# 20. Reusable Component Structure

Reuse components instead of duplicating the same UI.

Suggested conceptual structure:

``` text
AuthLayout
├── AuthHeader
│   ├── Logo
│   ├── Heading
│   ├── Description
│   └── AuthSwitchLink
│
├── LoginForm
│   ├── EmailInput
│   ├── PasswordInput
│   ├── ForgotPassword
│   └── SubmitButton
│
├── SignupForm
│   ├── EmailInput
│   ├── PasswordInput
│   ├── ConfirmPasswordInput
│   └── SubmitButton
│
├── SocialAuth
│   ├── GoogleButton
│   └── AppleButton
│
└── AuthLegal
    ├── TermsLink
    └── PrivacyLink
```

This is a conceptual structure. Adapt it to the project's existing
component architecture.

------------------------------------------------------------------------

# 21. Existing Project Integration

Before writing code:

1.  Inspect the existing project structure.
2.  Identify the current routing system.
3.  Identify the current authentication implementation.
4.  Identify existing UI components.
5.  Identify the existing theme system.
6.  Identify existing form/validation utilities.
7.  Reuse existing components and utilities where possible.

Do not replace existing architecture unnecessarily.

Do not introduce new dependencies if an existing project dependency
already provides the required functionality.

------------------------------------------------------------------------

# 22. Authentication Backend

If authentication APIs already exist:

-   Integrate with the existing API
-   Reuse the existing authentication flow
-   Follow the existing error handling
-   Follow the existing session/token behavior

If authentication APIs do not exist:

-   Implement the complete UI
-   Implement client-side validation
-   Keep API submission logic isolated
-   Do not create fake authentication
-   Make the integration point easy to connect later

------------------------------------------------------------------------

# 23. Theme Requirements

All visual elements must work in both themes:

  -----------------------------------------------------------------------
  Element                 Dark Mode               Light Mode
  ----------------------- ----------------------- -----------------------
  Page background         Existing dark theme     Existing light theme
                          token                   token

  Text                    Existing primary text   Existing primary text
                          token                   token

  Secondary text          Existing muted token    Existing muted token

  Input                   Existing surface token  Existing surface token

  Border                  Existing border token   Existing border token

  Button                  Existing primary token  Existing primary token

  Error                   Existing error token    Existing error token

  Links                   Existing accent token   Existing accent token
  -----------------------------------------------------------------------

Do not hardcode these colors if the project already provides theme
tokens.

------------------------------------------------------------------------

# 24. UX Requirements

### Password Visibility

Each password field must maintain its own visibility state.

### Form Submission

Prevent submission when:

-   Required fields are empty
-   Email is invalid
-   Password is invalid
-   Confirm password doesn't match

### Loading

During authentication:

-   Disable submit
-   Prevent duplicate submissions
-   Show loading feedback
-   Preserve entered values

### Errors

Display useful inline errors instead of generic browser alerts.

------------------------------------------------------------------------

# 25. Acceptance Criteria

## Login

-   [ ] `/login` works
-   [ ] Email field exists
-   [ ] Password field exists
-   [ ] Password show/hide works
-   [ ] Email validation works
-   [ ] Required validation works
-   [ ] Forgot Password link exists
-   [ ] Sign Up redirect works
-   [ ] Sign In loading state works
-   [ ] Google button exists
-   [ ] Apple button exists
-   [ ] Terms and Privacy links exist

## Sign Up

-   [ ] `/signup` works
-   [ ] Email field exists
-   [ ] Password field exists
-   [ ] Confirm Password field exists
-   [ ] Both password fields have independent show/hide controls
-   [ ] Email validation works
-   [ ] Required validation works
-   [ ] Password confirmation validation works
-   [ ] Create Account loading state works
-   [ ] Login redirect works
-   [ ] Google button exists
-   [ ] Apple button exists

## Theme

-   [ ] Login works in Dark Mode
-   [ ] Login works in Light Mode
-   [ ] Sign Up works in Dark Mode
-   [ ] Sign Up works in Light Mode
-   [ ] No hardcoded dark-only styling
-   [ ] Existing application theme system is reused

## Responsive

-   [ ] Desktop layout works
-   [ ] Tablet layout works
-   [ ] Mobile layout works
-   [ ] No horizontal overflow
-   [ ] Inputs and buttons remain touch-friendly

## Quality

-   [ ] Existing application functionality is not broken
-   [ ] Existing architecture is preserved
-   [ ] Reusable components are used
-   [ ] Accessibility requirements are satisfied
-   [ ] UI follows the provided reference direction
-   [ ] UI is polished beyond the reference design
