# AI Website Chatbot


## Features

- 🤖 **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses
<<<<<<< HEAD
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
=======
- 💬 **Real-time Chat**: Smooth conversation flow with typing indicators
- 🎨 **Modern UI**: Beautiful, responsive design with gradient backgrounds
- 📝 **Session Management**: Persistent conversations with unique session IDs
- 🔄 **Memory Management**: Automatic conversation history management
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- OpenAI API key

### Installation

1. **Clone or download the project files**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your OpenAI API key:**
   - Open the `.env` file
   - Replace `your_openai_api_key_here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Start chatting with the AI!

## API Endpoints

- `POST /api/session` - Create a new chat session
- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:sessionId` - Get conversation history
- `DELETE /api/conversation/:sessionId` - Clear conversation
- `GET /api/sessions` - List all active sessions
- `GET /api/health` - Health check

## Project Structure

```
website-chatbot/
├── server.js          # Node.js backend server
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (API keys)
├── index.html        # Frontend HTML
├── script.js         # Frontend JavaScript
├── styles.css        # Frontend CSS
└── README.md         # This file
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `PORT`: Server port (default: 3000)

### OpenAI Model Settings

The chatbot uses GPT-3.5-turbo with the following settings:
- Max tokens: 500
- Temperature: 0.7
- Conversation memory: Last 20 messages

## Troubleshooting

### Common Issues

1. **"Invalid API key" error:**
   - Make sure your OpenAI API key is correctly set in the `.env` file
   - Ensure you have sufficient credits in your OpenAI account

2. **"Failed to get response" error:**
   - Check your internet connection
   - Verify the server is running on port 3000
   - Check the browser console for detailed error messages

3. **CORS errors:**
   - Make sure you're accessing the app through `http://localhost:3000`
   - Don't open the HTML file directly in the browser

### Getting Help

- Check the browser console for error messages
- Verify the server logs in the terminal
- Ensure all dependencies are installed correctly

## License

MIT License - feel free to use this project for your own purposes!