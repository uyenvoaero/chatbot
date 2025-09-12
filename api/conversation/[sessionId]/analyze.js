const { openai, supabase } = require('../../../lib/clients');

module.exports = async (req, res) => {
    const { sessionId } = req.query;
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { data, error } = await supabase
            .from('conversations')
            .select('messages')
            .eq('conversation_id', sessionId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        const conversation = data ? data.messages : [];
        if (!conversation || conversation.length === 0) {
            res.status(404).json({ error: 'Conversation not found' });
            return;
        }
        const userMessages = conversation.filter(m => m.role === 'user').map(m => m.content).join('\n');
        if (!userMessages.trim()) {
            res.status(400).json({ error: 'No user messages found in conversation' });
            return;
        }
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
`;
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this conversation transcript:\n\n${userMessages}` }
            ],
            max_tokens: 1000,
            temperature: 0.1
        });
        const analysisText = completion.choices[0].message.content;
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            res.status(500).json({ error: 'Failed to parse analysis response' });
            return;
        }
        const analysis = JSON.parse(jsonMatch[0]);
        try {
            const hasContact = (analysis.customerEmail && analysis.customerEmail.trim()) || (analysis.customerPhone && analysis.customerPhone.trim());
            analysis.leadQuality = hasContact ? 'good' : 'spam';
        } catch (_) {}
        if (!analysis.customerName || !analysis.leadQuality) {
            res.status(500).json({ error: 'Invalid analysis response format' });
            return;
        }
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
        } catch (dbErr) {}
        if (updateError && updateError.code !== '42703') {
            res.status(500).json({ error: 'Failed to save analysis' });
            return;
        }
        res.status(200).json({ success: true, analysis });
    } catch (e) {
        res.status(500).json({ error: 'Failed to analyze conversation', details: e.message });
    }
};


