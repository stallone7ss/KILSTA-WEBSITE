import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { validationIssues } from '../lib/api';

/**
 * Map server-side Zod issues onto react-hook-form fields. Unknown paths are
 * returned so the caller can show them in a summary.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: Array<Path<T>>
): string[] {
  const remaining: string[] = [];
  for (const issue of validationIssues(error)) {
    const field = issue.path as Path<T>;
    if (knownFields.includes(field)) {
      setError(field, { type: 'server', message: issue.message }, { shouldFocus: true });
    } else {
      remaining.push(issue.message);
    }
  }
  return remaining;
}
