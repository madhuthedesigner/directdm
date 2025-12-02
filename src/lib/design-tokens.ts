// Design Tokens for DirectDM
export const colors = {
    primary: {
        50: '#F0F9FF',
        500: '#0EA5E9',
        600: '#0284C7',
        700: '#0369A1',
    },
    secondary: {
        50: '#F5F3FF',
        500: '#8B5CF6',
        600: '#7C3AED',
    },
    neutral: {
        50: '#F9FAFB',
        200: '#E5E7EB',
        500: '#6B7280',
        900: '#111827',
    },
    status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },
    dark: {
        bg: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        text: '#F1F5F9',
    },
} as const

export type ColorPalette = typeof colors
