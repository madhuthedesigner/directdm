'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Instagram, Check, X } from 'lucide-react'

interface InstagramAccount {
    id: string
    ig_username: string
    ig_account_id: string
    created_at: string
}

export function InstagramStatus() {
    const [account, setAccount] = useState<InstagramAccount | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAccount = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setIsLoading(false)
                return
            }

            const { data } = await supabase
                .from('instagram_accounts')
                .select('*')
                .eq('user_id', user.id)
                .single()

            setAccount(data as InstagramAccount | null)
            setIsLoading(false)
        }

        fetchAccount()
    }, [])

    if (isLoading) {
        return (
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                <Spinner size="sm" />
            </div>
        )
    }

    return (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                        <Instagram className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                            Instagram Account
                        </h3>
                        {account ? (
                            <>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                    @{account.ig_username}
                                </p>
                                <Badge variant="success" className="gap-1">
                                    <Check size={14} />
                                    Connected
                                </Badge>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                    No account connected
                                </p>
                                <Badge variant="outline" className="gap-1">
                                    <X size={14} />
                                    Disconnected
                                </Badge>
                            </>
                        )}
                    </div>
                </div>

                {!account && (
                    <button
                        onClick={() => window.location.href = '/api/instagram/oauth'}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                        Connect Instagram
                    </button>
                )}
            </div>

            {account && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Connected on {new Date(account.created_at).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    )
}
