import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
    children: React.ReactNode
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
    const variants = {
        default: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
        secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300',
        success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        outline: 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}
