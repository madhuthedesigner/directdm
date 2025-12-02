'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Analytics = Database['public']['Tables']['analytics']['Row']

export function useRealtimeAnalytics(configId: string) {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!configId) {
            setIsLoading(false)
            return
        }

        const supabase = createClient()

        const fetchAnalytics = async () => {
            try {
                const today = new Date().toISOString().split('T')[0]
                const { data, error } = await supabase
                    .from('analytics')
                    .select('*')
                    .eq('automation_config_id', configId)
                    .eq('date', today)
                    .single()

                if (error && error.code !== 'PGRST116') throw error
                setAnalytics(data as Analytics | null)
                setIsLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch analytics'))
                setIsLoading(false)
            }
        }

        fetchAnalytics()

        const channel = supabase
            .channel(`analytics:${configId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'analytics',
                    filter: `automation_config_id=eq.${configId}`,
                },
                (payload) => {
                    setAnalytics(payload.new as Analytics)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [configId])

    return { analytics, isLoading, error }
}
