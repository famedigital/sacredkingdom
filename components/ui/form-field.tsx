'use client'

/**
 * FormField — Label + bordered stock Input/Textarea/select.
 * Canonical shadcn composition helper (not a custom visual skin).
 */
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SelectOption {
  value: string
  label: string
}

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  textarea?: boolean
  rows?: number
  select?: boolean
  options?: SelectOption[]
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(
  (
    {
      className = '',
      label,
      error,
      icon,
      iconPosition = 'left',
      disabled,
      textarea = false,
      rows = 4,
      select = false,
      options = [],
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || props.name

    return (
      <div className="grid gap-2">
        {label && (
          <Label htmlFor={fieldId} className={error ? 'text-destructive' : undefined}>
            {label}
            {props.required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && !textarea && !select && (
            <div className="pointer-events-none absolute top-1/2 left-2.5 z-10 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
              {icon}
            </div>
          )}
          {select ? (
            <select
              ref={ref as React.RefObject<HTMLSelectElement>}
              id={fieldId}
              disabled={disabled}
              value={props.value}
              onChange={props.onChange}
              name={props.name}
              required={props.required}
              aria-invalid={!!error}
              className={cn(
                'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
                className
              )}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : textarea ? (
            <Textarea
              ref={ref as React.RefObject<HTMLTextAreaElement>}
              id={fieldId}
              rows={rows}
              disabled={disabled}
              aria-invalid={!!error}
              className={cn(className)}
              value={props.value as string | undefined}
              onChange={props.onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
              name={props.name}
              placeholder={props.placeholder}
              required={props.required}
            />
          ) : (
            <Input
              ref={ref as React.RefObject<HTMLInputElement>}
              id={fieldId}
              type={props.type || 'text'}
              disabled={disabled}
              aria-invalid={!!error}
              className={cn(icon && iconPosition === 'left' && 'pl-8', className)}
              value={props.value as string | number | undefined}
              onChange={props.onChange as React.ChangeEventHandler<HTMLInputElement>}
              name={props.name}
              placeholder={props.placeholder}
              required={props.required}
              min={props.min}
              max={props.max}
              step={props.step}
              maxLength={props.maxLength}
            />
          )}
          {icon && iconPosition === 'right' && !textarea && !select && (
            <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
              {icon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const fieldId = id || props.name
    return (
      <div className="grid gap-2">
        {label && (
          <Label htmlFor={fieldId} className={error ? 'text-destructive' : undefined}>
            {label}
          </Label>
        )}
        <Textarea ref={ref} id={fieldId} aria-invalid={!!error} className={className} {...props} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
