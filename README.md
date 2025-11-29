# AI Chatbot App

An intelligent chatbot application that learns from conversations and can generate personality profiles based on chat history.

## Features

- 💬 **Free Chat**: Chat naturally with an AI assistant
- 🧠 **Learning**: Stores and learns from past conversations
- 👤 **Personality Profiles**: Ask "Who am I?" or "Tell me about myself" to get a personality profile derived from your chat history
- 🎨 **Clean UI**: Modern, responsive interface built with Tailwind CSS
- 🧪 **Tested**: Core functionality covered with tests
- ☁️ **Hosted**: Ready for deployment on Vercel

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **LLM**: Google Gemini 1.5 Flash
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Gemini API key

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ChatBot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **SQL Editor**
3. Run the SQL script from `supabase/schema.sql` to create the necessary tables
4. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

### 4. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq AI Configuration (FREE - Get key from https://console.groq.com/)
GROQ_API_KEY=your_groq_api_key

# Application Configuration (optional, defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** We use Groq (100% FREE) instead of paid services like OpenAI or Google Gemini. Get your free API key at https://console.groq.com/

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add the same environment variables in Vercel's project settings
4. Deploy!

The app will be automatically deployed and you'll get a hosted URL.

### Environment Variables in Vercel

Make sure to add all environment variables from your `.env.local` file in the Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_API_KEY`
- `NEXT_PUBLIC_APP_URL` (optional)

## Usage

1. **Start Chatting**: Type any message and start a conversation
2. **Build History**: Have several conversations to build up chat history
3. **Ask for Profile**: After chatting for a bit, ask:
   - "Who am I?"
   - "Tell me about myself"
   - "What do you know about me?"
   - "Describe me"

The chatbot will analyze your conversation history and generate a personality profile!

## Project Structure

```
ChatBot/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API endpoint
│   │   └── profile/       # Profile generation endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/
│   ├── ChatInput.tsx      # Message input component
│   └── ChatMessage.tsx    # Message display component
├── lib/
│   ├── db.ts              # Database operations
│   ├── gemini.ts          # Google Gemini API integration
│   └── supabase.ts        # Supabase client setup
├── supabase/
│   └── schema.sql         # Database schema
├── __tests__/             # Test files
└── README.md
```

## API Endpoints

### POST `/api/chat`

Send a message and get a response.

**Request:**

```json
{
  "userId": "user-123",
  "message": "Hello!"
}
```

**Response:**

```json
{
  "conversationId": "conv-123",
  "messageId": "msg-456",
  "response": "Hello! How can I help you?"
}
```

### POST `/api/profile`

Generate a personality profile from chat history.

**Request:**

```json
{
  "userId": "user-123"
}
```

**Response:**

```json
{
  "profile": "Based on our conversations, you seem to be..."
}
```

## Database Schema

- **conversations**: Stores conversation sessions
- **messages**: Stores individual messages (user and assistant)
- **user_profiles**: Stores generated personality profiles

## Testing

The project includes tests for:

- Chat input component functionality
- Message rendering
- Profile request detection
- Message validation

Run tests with `npm test`.

## Notes

- The app uses a default user ID for demo purposes. In production, you'd want to implement proper authentication.
- The chatbot requires at least 3 messages before generating a profile.
- All conversations are persisted in Supabase and can be retrieved later.

## License

MIT

## Demo

- **Live Demo**: [Your Vercel deployment URL]
- **Video Demo**: [Your 30-60 second video link]
- **Repository**: [Your GitHub repository URL]

## Author

Built as a take-home assignment demonstrating:

- End-to-end execution
- Product thinking
- Independent work capability

---

## Quick Start for Submission

See [HOSTING_GUIDE.md](./HOSTING_GUIDE.md) for complete deployment instructions.
