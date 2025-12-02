'use client'

import { useState } from 'react'
import { useUserConfig } from '@/hooks/useUserConfig'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'

export default function MessagesPage() {
    const { config, isLoading: configLoading } = useUserConfig()
    const { messages, isLoading: messagesLoading } = useRealtimeMessages(config?.id || '')
    const [filter, setFilter] = useState<'all' | 'dm' | 'comment'>('all')

    if (configLoading || messagesLoading) {
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

    const filteredMessages = messages.filter((msg) => {
        if (filter === 'all') return true
        return msg.message_type === filter
    })

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
                    Messages
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    All incoming DMs and comments ({messages.length} total)
                </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
                {(['all', 'dm', 'comment'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600'
                            }`}
                    >
                        {f === 'all' ? 'All Messages' : f === 'dm' ? 'Direct Messages' : 'Comments'}
                    </button>
                ))}
            </div>

            {/* Messages List */}
            {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <MessageCircle size={48} className="text-neutral-300 dark:text-neutral-600 mb-4" />
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        No messages found
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        Your messages will appear here once you receive DMs or comments
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMessages.map((message) => (
                        <div
                            key={message.id}
                            className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                            @{message.sender_username}
                                        </span>
                                        <Badge variant={message.message_type === 'dm' ? 'default' : 'secondary'}>
                                            {message.message_type === 'dm' ? 'Direct Message' : 'Comment'}
                                        </Badge>
                                        {message.auto_reply_sent && (
                                            <Badge variant="success">Auto Replied</Badge>
                                        )}
                                    </div>

                                    <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                                        {message.content}
                                    </p>

                                    {message.auto_reply_content && (
                                        <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-950 rounded-lg border border-primary-200 dark:border-primary-800">
                                            <p className="text-xs font-medium text-primary-700 dark:text-primary-300 mb-2">
                                                Auto Reply:
                                            </p>
                                            <p className="text-sm text-primary-900 dark:text-primary-100">
                                                {message.auto_reply_content}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
                                        <span>
                                            {new Date(message.created_at).toLocaleString()}
                                        </span>
                                        {message.processing_time_ms && (
                                            <span>Processed in {message.processing_time_ms}ms</span>
                                        )}
                                        {message.ai_model_used && (
                                            <span>Model: {message.ai_model_used}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
