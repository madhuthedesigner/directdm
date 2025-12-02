'use client'

import { useUserConfig } from '@/hooks/useUserConfig'
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Zap, MessageSquare, DollarSign } from 'lucide-react'

export default function DashboardPage() {
    const { config, isLoading: configLoading } = useUserConfig()
    const { analytics, isLoading: analyticsLoading } = useRealtimeAnalytics(config?.id || '')
    const { messages, isLoading: messagesLoading } = useRealtimeMessages(config?.id || '')

    if (configLoading) {
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
                        Please set up your automation configuration in Settings to get started.
                    </p>
                </div>
            </div>
        )
    }

    const recentMessages = messages.slice(0, 5)

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    Welcome back! Here's your automation overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="DMs Received"
                    value={analytics?.dm_received || 0}
                    icon={MessageCircle}
                    loading={analyticsLoading}
                    color="primary"
                />
                <StatCard
                    label="Auto Replied"
                    value={analytics?.dm_auto_replied || 0}
                    icon={Zap}
                    loading={analyticsLoading}
                    color="success"
                />
                <StatCard
                    label="Comments"
                    value={analytics?.comments_received || 0}
                    icon={MessageSquare}
                    loading={analyticsLoading}
                    color="secondary"
                />
                <StatCard
                    label="API Cost"
                    value={`$${(analytics?.ai_api_cost_usd || 0).toFixed(2)}`}
                    icon={DollarSign}
                    loading={analyticsLoading}
                    color="warning"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                    Recent Activity
                </h2>

                {messagesLoading ? (
                    <Spinner />
                ) : recentMessages.length === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                        No activity yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {recentMessages.map((message) => (
                            <div
                                key={message.id}
                                className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                            @{message.sender_username}
                                        </span>
                                        <Badge variant={message.message_type === 'dm' ? 'default' : 'secondary'}>
                                            {message.message_type === 'dm' ? 'DM' : 'Comment'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                                        {message.content}
                                    </p>
                                </div>
                                {message.auto_reply_sent && (
                                    <Badge variant="success" className="ml-4">
                                        Replied
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
                <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                    💡 Real-Time Updates Enabled
                </h3>
                <p className="text-sm text-primary-800 dark:text-primary-200">
                    Your dashboard updates automatically when new messages arrive. No refresh needed!
                </p>
            </div>
        </div>
    )
}

function StatCard({
    label,
    value,
    icon: Icon,
    loading,
    color,
}: {
    label: string
    value: number | string
    icon: any
    loading: boolean
    color: 'primary' | 'success' | 'secondary' | 'warning'
}) {
    const colorClasses = {
        primary: 'text-primary-600 dark:text-primary-400',
        success: 'text-green-600 dark:text-green-400',
        secondary: 'text-secondary-600 dark:text-secondary-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
    }

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium mb-2">
                        {label}
                    </p>
                    {loading ? (
                        <Spinner size="sm" />
                    ) : (
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {value}
                        </p>
                    )}
                </div>
                <div className={`${colorClasses[color]} opacity-20`}>
                    <Icon size={48} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    )
}
