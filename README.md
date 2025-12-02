# DirectDM - Instagram Auto-Reply System

AI-powered Instagram DM and Comment auto-reply automation system built with Next.js 15, Supabase, and LLM APIs (Gemini/Claude).

## 🚀 Features

- **Real-time Auto-Replies**: Automated responses to Instagram DMs and comments
- **AI-Powered Responses**: Uses Gemini 2.0 Flash or Claude 3.5 Sonnet for contextual replies
- **Keyword Triggers**: Configure keyword-based automation per post
- **Per-Post Control**: Enable/disable automation for individual posts
- **Custom System Prompts**: Define AI behavior and response style
- **Analytics Dashboard**: Track messages, costs, and performance metrics
- **Real-time Updates**: Live message history with Supabase subscriptions

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router, Server Components)
- **Tailwind CSS v4** (Modern styling)
- **TypeScript** (Type safety)
- **TanStack Query v5** (Data fetching)
- **Zustand** (State management)

### Backend
- **Supabase** (PostgreSQL + Row-Level Security + Realtime)
- **Instagram Graph API v20+** (DM & Comment webhooks)
- **Gemini 2.0 Flash** / **Claude 3.5 Sonnet** (AI responses)
- **Next.js API Routes** (Serverless functions)

## 📋 Prerequisites

1. **Instagram Business Account** connected to a Facebook Page
2. **Meta Developer App** with Instagram permissions
3. **Supabase Project** (free tier works)
4. **LLM API Key** (Gemini or Claude)

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
cd directdm
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Meta/Instagram
INSTAGRAM_APP_ID=your_meta_app_id
INSTAGRAM_APP_SECRET=your_meta_app_secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token

# LLM APIs (choose one or both)
GEMINI_API_KEY=your_gemini_api_key
CLAUDE_API_KEY=your_claude_api_key

# Encryption (generate a random 32-character string)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 3. Database Setup

Run the Supabase migration to create all tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually execute the SQL file in Supabase Dashboard
# File: supabase/migrations/001_initial_schema.sql
```

This creates:
- `users` - User accounts
- `instagram_accounts` - Connected Instagram Business Accounts
- `automation_configs` - LLM and automation settings
- `post_automation_settings` - Per-post automation rules
- `messages` - Message history log
- `analytics` - Daily analytics metrics

### 4. Instagram Webhook Setup

1. **Local Development** (using ngrok):
   ```bash
   ngrok http 3000
   ```

2. **Configure Webhook in Meta Dashboard**:
   - Go to your Meta App → Products → Webhooks
   - Subscribe to Instagram → `messages` and `comments`
   - Callback URL: `https://your-domain.com/api/webhooks/instagram`
   - Verify Token: (same as `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`)

3. **Test Webhook**:
   ```bash
   curl -X GET "http://localhost:3000/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
   ```

## 🚀 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

```
directdm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── webhooks/      # Instagram webhook handler
│   │   │   ├── config/        # Automation config endpoints
│   │   │   ├── posts/         # Post management
│   │   │   ├── messages/      # Message history
│   │   │   └── analytics/     # Analytics data
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── messages/      # Message history view
│   │   │   ├── posts/         # Post automation control
│   │   │   ├── settings/      # Settings page
│   │   │   └── analytics/     # Analytics dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── lib/                   # Core libraries
│   │   ├── supabase.ts        # Supabase client
│   │   ├── instagram-api.ts   # Instagram Graph API wrapper
│   │   ├── llm-api.ts         # LLM API wrappers (Gemini/Claude)
│   │   ├── constants.ts       # App constants
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript types
│       ├── database.ts        # Supabase schema types
│       ├── instagram.ts       # Instagram API types
│       └── llm.ts             # LLM API types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── .env.example               # Environment template
└── package.json
```

## 🔐 Security Notes

> **IMPORTANT**: This is a development build. Before production deployment:

1. **Enable Supabase Auth**: Replace placeholder `userId` query params with actual authentication
2. **Encrypt Sensitive Data**: Implement encryption for `ig_access_token` and `llm_api_key` fields
3. **Add Rate Limiting**: Protect API endpoints from abuse
4. **Implement CORS**: Configure proper CORS policies
5. **Webhook Signature Verification**: Already implemented but verify in production

## 📊 API Endpoints

### Configuration
- `GET /api/config?userId={id}` - Get automation config
- `POST /api/config` - Update automation config
- `POST /api/config/system-prompt` - Update AI system prompt

### Posts
- `GET /api/posts?userId={id}` - List Instagram posts
- `GET /api/posts/[postId]?userId={id}` - Get post automation settings
- `PATCH /api/posts/[postId]` - Update post automation

### Messages
- `GET /api/messages?userId={id}&limit=20&offset=0` - Get message history

### Analytics
- `GET /api/analytics?userId={id}&days=7` - Get analytics data

### Webhooks
- `GET /api/webhooks/instagram` - Webhook verification
- `POST /api/webhooks/instagram` - Handle Instagram events

## 💰 Cost Tracking

The system automatically tracks AI API costs:

- **Gemini 2.0 Flash**: Free during preview (then ~$0.075 per 1M tokens)
- **Claude 3.5 Sonnet**: ~$3/1M input, ~$15/1M output tokens

View costs in the Analytics dashboard.

## 🐛 Known Issues

1. **Build Errors**: TypeScript strict mode causes type inference issues with Supabase client. Type casts (`as any`) are used as a temporary workaround.
2. **Authentication**: Currently uses placeholder `userId` query params. Implement Supabase Auth for production.
3. **Token Encryption**: Access tokens stored as plain text. Implement encryption before production.

## 📝 TODO

- [ ] Implement Supabase Authentication
- [ ] Add token encryption
- [ ] Build production-ready UI components
- [ ] Add rate limiting
- [ ] Implement error logging
- [ ] Add unit tests
- [ ] Deploy to Vercel
- [ ] Configure production webhooks

## 📄 License

MIT

## 🤝 Contributing

This is a personal project. Feel free to fork and customize for your needs.

---

**Built with ❤️ using Next.js, Supabase, and AI**
