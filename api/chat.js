const { openai } = require('../lib/clients');
const { supabase } = require('../lib/clients');

function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getConversation(sessionId) {
    const { data, error } = await supabase
        .from('conversations')
        .select('messages')
        .eq('conversation_id', sessionId)
        .single();
    if (error && error.code !== 'PGRST116') return [];
    return data ? data.messages : [];
}

async function saveConversation(sessionId, messages) {
    await supabase.from('conversations').upsert(
        { conversation_id: sessionId, messages },
        { onConflict: 'conversation_id' }
    );
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { message, sessionId } = req.body || {};
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        const currentSessionId = sessionId || generateSessionId();
        const conversation = await getConversation(currentSessionId);
        conversation.push({ role: 'user', content: message });
        const messages = [
            { role: 'system', content: `You are the MindTek AI Assistant — a friendly and helpful virtual assistant representing MindTek AI, a company that offers AI consulting and implementation services.
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
          - Stay on-topic and professional throughout the conversation.` },
            ...conversation
        ];
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500,
            temperature: 0.7
        });
        const aiResponse = completion.choices[0].message.content;
        conversation.push({ role: 'assistant', content: aiResponse });
        if (conversation.length > 20) {
            conversation.splice(0, conversation.length - 20);
        }
        await saveConversation(currentSessionId, conversation);
        res.status(200).json({ response: aiResponse, sessionId: currentSessionId });
    } catch (e) {
        res.status(500).json({ error: 'Failed to get response from AI', details: e.message });
    }
};


