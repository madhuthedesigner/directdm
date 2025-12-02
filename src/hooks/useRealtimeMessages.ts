'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']

export function useRealtimeMessages(configId: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!configId) {
            setIsLoading(false)
            return
        }

        const supabase = createClient()

        // Fetch initial data
        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('automation_config_id', configId)
                    .order('created_at', { ascending: false })
                    .limit(100)

                if (error) throw error
                setMessages(data || [])
                setIsLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
                setIsLoading(false)
            }
        }

        fetchMessages()

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`messages:${configId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `automation_config_id=eq.${configId}`,
                },
                (payload) => {
                    setMessages((prev) => {
                        const isDuplicate = prev.some((m) => m.id === payload.new.id)
                        return isDuplicate ? prev : [payload.new as Message, ...prev]
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `automation_config_id=eq.${configId}`,
                },
                (payload) => {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m))
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [configId])

    return { messages, isLoading, error }
}
