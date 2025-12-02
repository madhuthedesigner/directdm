'use client'

import { useUserConfig } from '@/hooks/useUserConfig'
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics'
import { Spinner } from '@/components/ui/spinner'
import { MessageCircle, MessageSquare, Zap, DollarSign, TrendingUp, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
    const { config, isLoading: configLoading } = useUserConfig()
    const { analytics, isLoading: analyticsLoading } = useRealtimeAnalytics(config?.id || '')

    if (configLoading || analyticsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!config) {
        return (
            <div className="p-8">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Configuration Required
                    </h3>
                    <p className="text-yellow-800 dark:text-yellow-200">
                        Please set up your automation configuration in Settings first.
                    </p>
                </div>
            </div>
        )
    }

    const dmRate = analytics?.dm_received
        ? Math.round((analytics.dm_auto_replied / analytics.dm_received) * 100)
        : 0

    const commentRate = analytics?.comments_received
        ? Math.round((analytics.comments_auto_replied / analytics.comments_received) * 100)
        : 0

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
                    Analytics
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    Today's automation metrics and performance
                </p>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="DMs Received"
                    value={analytics?.dm_received || 0}
                    icon={MessageCircle}
                    color="primary"
                />
                <MetricCard
                    label="DMs Replied"
                    value={analytics?.dm_auto_replied || 0}
                    icon={Zap}
                    color="success"
                />
                <MetricCard
                    label="Comments Received"
                    value={analytics?.comments_received || 0}
                    icon={MessageSquare}
                    color="secondary"
                />
                <MetricCard
                    label="Comments Replied"
                    value={analytics?.comments_auto_replied || 0}
                    icon={TrendingUp}
                    color="success"
                />
            </div>

            {/* Reply Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                        DM Reply Rate
                    </h3>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold text-primary-600">
                            {dmRate}%
                        </span>
                        <span className="text-neutral-500 mb-3">
                            {analytics?.dm_auto_replied}/{analytics?.dm_received || 0}
                        </span>
                    </div>
                    <div className="mt-4 bg-neutral-100 dark:bg-neutral-900 rounded-full h-3">
                        <div
                            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${dmRate}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                        Comment Reply Rate
                    </h3>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold text-secondary-600">
                            {commentRate}%
                        </span>
                        <span className="text-neutral-500 mb-3">
                            {analytics?.comments_auto_replied}/{analytics?.comments_received || 0}
                        </span>
                    </div>
                    <div className="mt-4 bg-neutral-100 dark:bg-neutral-900 rounded-full h-3">
                        <div
                            className="bg-secondary-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${commentRate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* API Usage & Cost */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={24} className="text-primary-600" />
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                        API Usage & Cost
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
                            Total API Calls
                        </p>
                        <p className="text-4xl font-bold text-neutral-900 dark:text-white">
                            {analytics?.ai_api_calls || 0}
                        </p>
                    </div>
                    <div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
                            Total Cost (USD)
                        </p>
                        <p className="text-4xl font-bold text-neutral-900 dark:text-white">
                            ${(analytics?.ai_api_cost_usd || 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string
    value: number
    icon: any
    color: 'primary' | 'success' | 'secondary'
}) {
    const colorClasses = {
        primary: 'text-primary-600 dark:text-primary-400',
        success: 'text-green-600 dark:text-green-400',
        secondary: 'text-secondary-600 dark:text-secondary-400',
    }

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium mb-2">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className={`${colorClasses[color]} opacity-20`}>
                    <Icon size={48} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    )
}
