// Client-side mirror of lib/members/validators.ts's create-member checks,
// so AddMemberDialog can show inline field errors before hitting the
// network - matching the pattern in components/auth/validation.ts.
import { validateEmail } from "@/components/auth/validation";

export interface AddMemberFieldErrors {
  name?: string;
  email?: string;
}

export function validateMemberName(name: string): string | undefined {
  if (!name.trim()) return "Name is required.";
  return undefined;
}

/**
 * Validates the Add Member form as a whole. avatarUrl is intentionally
 * unvalidated (optional, free-text), matching validateCreateMemberInput.
 */
export function validateAddMemberForm(values: { name: string; email: string }): AddMemberFieldErrors {
  const errors: AddMemberFieldErrors = {};

  const nameError = validateMemberName(values.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  return errors;
}
