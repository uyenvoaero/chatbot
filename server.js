const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
=======
const dotenv = require('dotenv');
const OpenAI = require('openai');
const path = require('path');

// Load environment variables
dotenv.config();
>>>>>>> 595295f079d4c97283ee2e9dd718455c57ef556c

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

<<<<<<< HEAD
// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
=======
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// In-memory conversation storage
const conversations = {};
>>>>>>> 595295f079d4c97283ee2e9dd718455c57ef556c

// Generate a unique session ID
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

<<<<<<< HEAD
// Get conversation from Supabase
async function getConversation(sessionId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('conversation_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching conversation:', error);
      return [];
    }

    return data ? data.messages : [];
  } catch (error) {
    console.error('Error in getConversation:', error);
    return [];
  }
}

// Save conversation to Supabase
async function saveConversation(sessionId, messages) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .upsert({
        conversation_id: sessionId,
        messages: messages
      }, {
        onConflict: 'conversation_id'
      });

    if (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveConversation:', error);
    throw error;
  }
}

// API endpoint to send message to OpenAI
=======
// Initialize conversation for a session
function initializeConversation(sessionId) {
  if (!conversations[sessionId]) {
    conversations[sessionId] = {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Be friendly, informative, and concise in your responses.'
        }
      ],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
  }
  return conversations[sessionId];
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get or create a new session
app.post('/api/session', (req, res) => {
  const sessionId = generateSessionId();
  initializeConversation(sessionId);
  
  res.json({ 
    sessionId,
    message: 'Session created successfully'
  });
});

// Chat endpoint
>>>>>>> 595295f079d4c97283ee2e9dd718455c57ef556c
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
<<<<<<< HEAD
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session ID
    const currentSessionId = sessionId || generateSessionId();
    
    // Get conversation history for this session from Supabase
    const conversation = await getConversation(currentSessionId);
    
    // Add user message to conversation
    conversation.push({ role: 'user', content: message });
    
    // Prepare messages for OpenAI (include system message and conversation history)
    const messages = [
      {
        role: "system",
        content: `You are the MindTek AI Assistant — a friendly and helpful virtual assistant representing MindTek AI, a company that offers AI consulting and implementation services.
          Your goal is to guide users through a structured discovery conversation to understand their industry, challenges, and contact details, and recommend appropriate services.
          💬 Always keep responses short, helpful, and polite.
          💬 Always reply in the same language the user speaks.
          💬 Ask only one question at a time.
          🔍 RECOMMENDED SERVICES:
          - For real estate: Mention customer data extraction from documents, integration with CRM, and lead generation via 24/7 chatbots.
          - For education: Mention email automation and AI training.
          - For retail/customer service: Mention voice-based customer service chatbots, digital marketing, and AI training.
          - For other industries: Mention chatbots, process automation, and digital marketing.
          ✅ BENEFITS: Emphasize saving time, reducing costs, and improving customer satisfaction.
          💰 PRICING: Only mention 'starting from $1000 USD' if the user explicitly asks about pricing.
          🧠 CONVERSATION FLOW:
          1. Ask what industry the user works in.
          2. Then ask what specific challenges or goals they have.
          3. Based on that, recommend relevant MindTek AI services.
          4. Ask if they'd like to learn more about the solutions.
          5. If yes, collect their name → email → phone number (one at a time).
          6. Provide a more technical description of the solution and invite them to book a free consultation.
          7. Finally, ask if they have any notes or questions before ending the chat.
          ⚠️ OTHER RULES:
          - Be friendly but concise.
          - Do not ask multiple questions at once.
          - Do not mention pricing unless asked.
          - Stay on-topic and professional throughout the conversation.`
      },
      ...conversation
    ];
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Add AI response to conversation
    conversation.push({ role: 'assistant', content: aiResponse });
    
    // Keep only last 20 messages to prevent context from getting too long
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }
    
    // Save updated conversation to Supabase
    await saveConversation(currentSessionId, conversation);
    
    res.json({
      response: aiResponse,
      sessionId: currentSessionId
    });
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error.message 
    });
  }
});

// API endpoint to get conversation history
app.get('/api/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await getConversation(sessionId);
    
    res.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// API endpoint to get all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    // First try with lead analysis columns
    let { data, error } = await supabase
      .from('conversations')
      .select('conversation_id, created_at, messages, customer_name, customer_email, customer_phone, customer_industry, customer_problem, customer_availability, customer_consultation, special_notes, lead_quality, analysis_completed, analysis_date')
      .order('created_at', { ascending: false });

    // If lead analysis columns don't exist, fall back to basic columns
    if (error && error.code === '42703') {
      console.log('Lead analysis columns not found, using basic columns');
      const basicResult = await supabase
        .from('conversations')
        .select('conversation_id, created_at, messages')
        .order('created_at', { ascending: false });
      
      data = basicResult.data;
      error = basicResult.error;
    }

    if (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    // Transform data to include conversation summary and lead analysis
    const conversations = data.map(conv => ({
      id: conv.conversation_id,
      createdAt: conv.created_at,
      updatedAt: conv.created_at, // Use created_at as updated_at since we don't have updated_at
      messageCount: conv.messages ? conv.messages.length : 0,
      firstMessage: conv.messages && conv.messages.length > 0 
        ? conv.messages.find(m => m.role === 'user')?.content?.substring(0, 50) + '...'
        : 'No messages',
      lastMessage: conv.messages && conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1]?.content?.substring(0, 50) + '...'
        : 'No messages',
      // Lead analysis data (will be null if columns don't exist)
      leadAnalysis: {
        customerName: conv.customer_name || null,
        customerEmail: conv.customer_email || null,
        customerPhone: conv.customer_phone || null,
        customerIndustry: conv.customer_industry || null,
        customerProblem: conv.customer_problem || null,
        customerAvailability: conv.customer_availability || null,
        customerConsultation: conv.customer_consultation || false,
        specialNotes: conv.special_notes || null,
        leadQuality: conv.lead_quality || null,
        analysisCompleted: conv.analysis_completed || false,
        analysisDate: conv.analysis_date || null
      }
    }));

    res.json({ conversations });
  } catch (error) {
    console.error('Error in get conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// API endpoint to analyze conversation for lead quality
app.post('/api/conversation/:sessionId/analyze', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get conversation messages
    const conversation = await getConversation(sessionId);
    
    if (!conversation || conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Prepare messages for OpenAI analysis (only user messages)
    const userMessages = conversation
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');
    
    if (!userMessages.trim()) {
      return res.status(400).json({ error: 'No user messages found in conversation' });
    }
    
    // System prompt for lead analysis
    const systemPrompt = `
Extract the following customer details from the transcript:
- Name
- Email address
- Phone number
- Industry
- Problems, needs, and goals summary
- Availability
- Whether they have booked a consultation (true/false)
- Any special notes
- Lead quality (categorize as 'good', 'ok', or 'spam')

Format the response using this JSON schema:
{
  "type": "object",
  "properties": {
    "customerName": { "type": "string" },
    "customerEmail": { "type": "string" },
    "customerPhone": { "type": "string" },
    "customerIndustry": { "type": "string" },
    "customerProblem": { "type": "string" },
    "customerAvailability": { "type": "string" },
    "customerConsultation": { "type": "boolean" },
    "specialNotes": { "type": "string" },
    "leadQuality": { "type": "string", "enum": ["good", "ok", "spam"] }
  },
  "required": ["customerName", "customerEmail", "customerProblem", "leadQuality"]
}

If the user provided contact details (email or phone), set lead quality to "good"; otherwise, "spam".
If the conversation shows genuine interest but no contact details, set to "ok".
`;

    // Call OpenAI API for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this conversation transcript:\n\n${userMessages}` }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent analysis
    });
    
    const analysisText = completion.choices[0].message.content;
    
    // Parse JSON response
    let analysis;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse analysis response' });
    }
    
    // Validate required fields
    if (!analysis.customerName || !analysis.leadQuality) {
      return res.status(500).json({ error: 'Invalid analysis response format' });
    }
    
    // Try to save analysis to database
    let updateError = null;
    try {
      const result = await supabase
        .from('conversations')
        .update({
          customer_name: analysis.customerName || null,
          customer_email: analysis.customerEmail || null,
          customer_phone: analysis.customerPhone || null,
          customer_industry: analysis.customerIndustry || null,
          customer_problem: analysis.customerProblem || null,
          customer_availability: analysis.customerAvailability || null,
          customer_consultation: analysis.customerConsultation || false,
          special_notes: analysis.specialNotes || null,
          lead_quality: analysis.leadQuality,
          analysis_completed: true,
          analysis_date: new Date().toISOString()
        })
        .eq('conversation_id', sessionId);
      
      updateError = result.error;
    } catch (dbError) {
      console.log('Lead analysis columns not available, analysis completed but not saved to database');
      console.log('Please run the migration to enable database storage of lead analysis');
    }
    
    if (updateError && updateError.code === '42703') {
      console.log('Lead analysis columns not available, analysis completed but not saved to database');
      console.log('Please run the migration to enable database storage of lead analysis');
    } else if (updateError) {
      console.error('Error saving analysis:', updateError);
      return res.status(500).json({ error: 'Failed to save analysis' });
    }
    
    res.json({
      success: true,
      analysis: analysis
    });
    
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    res.status(500).json({ 
      error: 'Failed to analyze conversation',
      details: error.message 
    });
  }
});

// API endpoint to clear conversation
app.delete('/api/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', sessionId);
    
    if (error) {
      console.error('Error deleting conversation:', error);
      return res.status(500).json({ error: 'Failed to delete conversation' });
    }
    
    res.json({ message: 'Conversation cleared' });
  } catch (error) {
    console.error('Error in delete conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
=======
    if (!message || !sessionId) {
      return res.status(400).json({ 
        error: 'Message and sessionId are required' 
      });
    }

    // Initialize or get conversation
    const conversation = initializeConversation(sessionId);
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message
    });
    
    // Update last activity
    conversation.lastActivity = new Date().toISOString();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: conversation.messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    // Keep only last 20 messages to manage memory
    if (conversation.messages.length > 20) {
      conversation.messages = conversation.messages.slice(-20);
    }

    res.json({
      response: aiResponse,
      sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle different types of errors
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ 
        error: 'API quota exceeded. Please check your OpenAI account.' 
      });
    } else if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API key.' 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to get response from AI. Please try again.' 
      });
    }
  }
});

// Get conversation history
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversation = conversations[sessionId];
  
  if (!conversation) {
    return res.status(404).json({ 
      error: 'Conversation not found' 
    });
  }

  res.json({
    sessionId,
    messages: conversation.messages.filter(msg => msg.role !== 'system'),
    createdAt: conversation.createdAt,
    lastActivity: conversation.lastActivity
  });
});

// Clear conversation
app.delete('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (conversations[sessionId]) {
    delete conversations[sessionId];
    res.json({ message: 'Conversation cleared successfully' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// Get all active sessions (for debugging)
app.get('/api/sessions', (req, res) => {
  const sessionList = Object.keys(conversations).map(sessionId => ({
    sessionId,
    messageCount: conversations[sessionId].messages.length - 1, // Exclude system message
    createdAt: conversations[sessionId].createdAt,
    lastActivity: conversations[sessionId].lastActivity
  }));
  
  res.json({ sessions: sessionList });
>>>>>>> 595295f079d4c97283ee2e9dd718455c57ef556c
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

<<<<<<< HEAD
// Serve the dashboard HTML file
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test Supabase connection on startup
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.log('Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log('📝 Make sure to set your OPENAI_API_KEY in the .env file');
  console.log('🗄️  Testing Supabase connection...');
  await testSupabaseConnection();
=======
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure to set your OPENAI_API_KEY in the .env file`);
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('⚠️  WARNING: Please set your OPENAI_API_KEY in the .env file');
  }
>>>>>>> 595295f079d4c97283ee2e9dd718455c57ef556c
});

module.exports = app;
