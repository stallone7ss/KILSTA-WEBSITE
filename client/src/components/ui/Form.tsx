import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FieldWrapperProps {
  label: string | ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children
}: FieldWrapperProps) {
  return (
    <div className={cn('w-full', className)}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="field-error" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, containerClassName, id, required, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <input
        ref={ref}
        id={inputId}
        className={cn('input-base', error && 'input-error', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        required={required}
        {...props}
      />
    </Field>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, containerClassName, id, required, rows = 5, ...props },
  ref
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  return (
    <Field
      label={label}
      htmlFor={textareaId}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn('input-base resize-y', error && 'input-error', className)}
        aria-invalid={error ? true : undefined}
        required={required}
        {...props}
      />
    </Field>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, containerClassName, id, required, options, children, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <Field
      label={label}
      htmlFor={selectId}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <select
        ref={ref}
        id={selectId}
        className={cn('input-base appearance-none bg-white pr-9', error && 'input-error', className)}
        aria-invalid={error ? true : undefined}
        required={required}
        {...props}
      >
        {children}
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500',
            className
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        <label htmlFor={checkboxId} className="text-sm leading-6 text-slate-600">
          {label}
        </label>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
});
