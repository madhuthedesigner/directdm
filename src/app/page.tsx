import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            DirectDM
          </h1>
          <p className="text-2xl text-gray-300 mb-2">
            AI-Powered Instagram Auto-Reply System
          </p>
          <p className="text-lg text-gray-400">
            Automate your Instagram DMs and comments with intelligent AI responses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Replies</h3>
            <p className="text-gray-300 text-sm">
              Respond to DMs and comments within 2 seconds using AI
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Keyword Triggers</h3>
            <p className="text-gray-300 text-sm">
              Control which messages trigger auto-replies with keywords
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-300 text-sm">
              Track all interactions and AI usage with detailed metrics
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </Link>
          <a
            href="https://developers.facebook.com/docs/instagram-api"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors border border-white/30"
          >
            API Documentation
          </a>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          <p>Powered by Gemini 2.0 Flash • Next.js 15 • Supabase</p>
        </div>
      </div>
    </div>
  );
}
