"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleSkip = () => {
        router.push('/dashboard');
    };

    const handleContinue = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                            Step {step} of 3
                        </span>
                        <button
                            onClick={handleSkip}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Skip for now
                        </button>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-card border border-border rounded-lg p-8">
                    {step === 1 && (
                        <div>
                            <h1 className="text-3xl font-bold mb-4">
                                Welcome to DirectDM! 🎉
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                Let's get you set up with automated Instagram replies powered by AI.
                                This will only take a few minutes.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Connect Instagram</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Link your Instagram Business Account
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Configure AI</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Set up your AI model and custom prompts
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Enable Automation</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Start auto-replying to DMs and comments
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Connect Instagram</h2>
                            <p className="text-muted-foreground mb-6">
                                You'll need an Instagram Business Account connected to a Facebook Page.
                            </p>
                            <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6">
                                <p className="text-sm">
                                    <strong>Note:</strong> Connecting your Instagram account requires
                                    setting up a Meta Developer App and configuring webhooks. You can
                                    do this later from the Settings page.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm font-medium">Instructions:</p>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                                    <li>Create a Meta Developer App</li>
                                    <li>Add Instagram Basic Display product</li>
                                    <li>Configure OAuth redirect URLs</li>
                                    <li>Subscribe to webhooks (messages & comments)</li>
                                    <li>Connect your Instagram Business Account</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Configure AI Model</h2>
                            <p className="text-muted-foreground mb-6">
                                Choose your AI provider and add your API key to start generating
                                automated replies.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Recommended: Gemini 2.0 Flash</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Free during preview period, fast responses, great quality
                                    </p>
                                    <a
                                        href="https://makersuite.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Get Gemini API Key →
                                    </a>
                                </div>
                                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Alternative: Claude 3.5 Sonnet</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Premium quality, $3-15 per million tokens
                                    </p>
                                    <a
                                        href="https://console.anthropic.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Get Claude API Key →
                                    </a>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                You can configure your API key in Settings after completing onboarding.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-8">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleContinue}
                            className="ml-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            {step === 3 ? 'Go to Dashboard' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
