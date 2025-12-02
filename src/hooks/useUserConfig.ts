'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type AutomationConfig = Database['public']['Tables']['automation_configs']['Row']

export function useUserConfig() {
    const [config, setConfig] = useState<AutomationConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const supabase = createClient()

        const fetchConfig = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) {
                    setIsLoading(false)
                    return
                }

                const { data, error: configError } = await supabase
                    .from('automation_configs')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (configError && configError.code !== 'PGRST116') throw configError
                setConfig(data as AutomationConfig | null)
                setIsLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch config'))
                setIsLoading(false)
            }
        }

        fetchConfig()

        const channel = supabase
            .channel('user-config')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'automation_configs',
                },
                (payload) => {
                    setConfig(payload.new as AutomationConfig)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return { config, isLoading, error }
}
