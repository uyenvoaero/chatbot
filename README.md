# AI Website Chatbot

A modern AI-powered chatbot with OpenAI integration, featuring a beautiful UI and conversation memory.

## Features

- 🤖 **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses
- 💬 **Conversation Memory**: Maintains context throughout the conversation
- 🎨 **Modern UI**: Beautiful, responsive chat interface
- 🔄 **Real-time Communication**: Seamless frontend-backend communication
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🗂️ **Session Management**: Unique session IDs for conversation tracking
- 📊 **Conversation Dashboard**: View and manage all chat conversations with timestamps
- 🔍 **Message History**: Click on any conversation to view all messages
- 🚀 **Easy Navigation**: Seamless switching between chat and dashboard

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

1. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Supabase Configuration**: Get your project URL and service role key from your Supabase dashboard
3. Open the `.env` file and replace the placeholder values:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Supabase Database Setup

Make sure you have created a table named `conversations` in your Supabase database with the following columns:

- `id` (bigint, primary key, auto-increment)
- `created_at` (timestamp with time zone, default: now())
- `conversation_id` (text, unique)
- `messages` (jsonb)

### 4. Start the Server

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 5. Access the Chatbot

Open your browser and go to: `http://localhost:3000`

## Usage

### Main Chat Interface
1. **Start chatting**: Type your message and press Enter or click Send
2. **Enjoy the conversation**: The AI will respond with helpful and engaging messages
3. **Access Dashboard**: Click the "Dashboard" button in the top-right corner

### Conversation Dashboard
1. **View Conversations**: See all your chat conversations listed with timestamps and message counts
2. **Browse History**: Click on any conversation to view all messages in that chat
3. **Return to Chat**: Use the "Back to Chat" button to return to the main chat interface
4. **Refresh Data**: Use the refresh button to update the conversation list

## API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:sessionId` - Get conversation history
- `GET /api/conversations` - Get all conversations for dashboard
- `DELETE /api/conversation/:sessionId` - Clear conversation
- `GET /api/health` - Health check

## Project Structure

```
├── server.js          # Node.js backend server
├── index.html         # Main chat interface
├── script.js          # Frontend JavaScript
├── styles.css         # Chat interface styling
├── dashboard.html     # Conversation dashboard page
├── dashboard.js       # Dashboard JavaScript functionality
├── dashboard.css      # Dashboard styling
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (API keys)
└── .gitignore        # Git ignore rules
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT-3.5-turbo
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Modern CSS with gradients and animations

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `SUPABASE_URL`: Your Supabase project URL (required)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (required)
- `PORT`: Server port (default: 3000)

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- API keys are stored securely in environment variables

## Troubleshooting

1. **"Failed to get response from AI"**: Check your OpenAI API key in `.env`
2. **"Supabase connection failed"**: Verify your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env`
3. **CORS errors**: Make sure the backend server is running on port 3000
4. **Connection refused**: Ensure the server is started with `npm start`
5. **Database errors**: Make sure your `conversations` table exists in Supabase with the correct schema

## License

MIT License