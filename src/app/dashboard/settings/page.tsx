'use client'

import { useState, useEffect } from 'react'
import { useUserConfig } from '@/hooks/useUserConfig'
import { InstagramStatus } from '@/components/dashboard/InstagramStatus'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
    const { config, isLoading } = useUserConfig()
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showError, setShowError] = useState(false)

    const [formData, setFormData] = useState({
        llm_provider: 'gemini',
        llm_model: 'gemini-2.0-flash',
        llm_api_key: '',
        system_prompt: '',
        dm_auto_reply_enabled: true,
        comment_auto_reply_enabled: true,
    })

    useEffect(() => {
        if (config) {
            setFormData({
                llm_provider: config.llm_provider || 'gemini',
                llm_model: config.llm_model || 'gemini-2.0-flash',
                llm_api_key: '',
                system_prompt: config.system_prompt || '',
                dm_auto_reply_enabled: config.dm_auto_reply_enabled ?? true,
                comment_auto_reply_enabled: config.comment_auto_reply_enabled ?? true,
            })
        }
    }, [config])

    // Check for connection success/error in URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('connected') === 'true') {
            setShowSuccess(true)
            setTimeout(() => {
                window.history.replaceState({}, '', '/dashboard/settings')
                setShowSuccess(false)
            }, 5000)
        }
        if (params.get('error')) {
            setShowError(true)
            setTimeout(() => {
                window.history.replaceState({}, '', '/dashboard/settings')
                setShowError(false)
            }, 5000)
        }
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error('Failed to save')

            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (error) {
            setShowError(true)
            setTimeout(() => setShowError(false), 3000)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    Configure your automation preferences and connect Instagram
                </p>
            </div>

            {/* Success/Error Messages */}
            {showSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200">
                        ✓ Settings saved successfully!
                    </p>
                </div>
            )}

            {showError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">
                        ✗ Failed to save settings. Please try again.
                    </p>
                </div>
            )}

                    </label>
                    <textarea
                        placeholder="You are a helpful assistant..."
                        value={formData.system_prompt}
                        onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono text-sm"
                    />
                </div >
            </div >
        </div >

        {/* Automation Settings */ }
        < div className = "bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 space-y-6" >
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Automation Settings
        </h2>

        <div className="space-y-4">
            {/* DM Auto-reply */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                        Auto-reply to DMs
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Automatically respond to direct messages
                    </p>
                </div>
                <button
                    onClick={() => setFormData({ ...formData, dm_auto_reply_enabled: !formData.dm_auto_reply_enabled })}
                    className={`relative w-14 h-8 rounded-full transition-colors ${formData.dm_auto_reply_enabled
                        ? 'bg-primary-600'
                        : 'bg-neutral-300 dark:bg-neutral-600'
                        }`}
                >
                    <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${formData.dm_auto_reply_enabled ? 'translate-x-6' : ''
                            }`}
                    />
                </button>
            </div>

            {/* Comment Auto-reply */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                        Auto-reply to Comments
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Automatically respond to post comments
                    </p>
                </div>
                <button
                    onClick={() => setFormData({ ...formData, comment_auto_reply_enabled: !formData.comment_auto_reply_enabled })}
                    className={`relative w-14 h-8 rounded-full transition-colors ${formData.comment_auto_reply_enabled
                        ? 'bg-primary-600'
                        : 'bg-neutral-300 dark:bg-neutral-600'
                        }`}
                >
                    <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${formData.comment_auto_reply_enabled ? 'translate-x-6' : ''
                            }`}
                    />
                </button>
            </div>
        </div>
    </div >

        {/* Save Button */ }
        < div className = "flex justify-end" >
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
                {isSaving ? (
                    <>
                        <Spinner size="sm" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save size={20} />
                        Save Settings
                    </>
                )}
            </button>
    </div >
        </div >
    )
}
