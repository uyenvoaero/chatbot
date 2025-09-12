const { supabase } = require('../lib/clients');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        let { data, error } = await supabase
            .from('conversations')
            .select('conversation_id, created_at, messages, customer_name, customer_email, customer_phone, customer_industry, customer_problem, customer_availability, customer_consultation, special_notes, lead_quality, analysis_completed, analysis_date')
            .order('created_at', { ascending: false });
        if (error && error.code === '42703') {
            const basic = await supabase
                .from('conversations')
                .select('conversation_id, created_at, messages')
                .order('created_at', { ascending: false });
            data = basic.data;
        } else if (error) {
            throw error;
        }
        const conversations = (data || []).map(conv => ({
            id: conv.conversation_id,
            createdAt: conv.created_at,
            updatedAt: conv.created_at,
            messageCount: conv.messages ? conv.messages.length : 0,
            firstMessage: conv.messages && conv.messages.length > 0 ? (conv.messages.find(m => m.role === 'user')?.content?.substring(0, 50) + '...') : 'No messages',
            lastMessage: conv.messages && conv.messages.length > 0 ? (conv.messages[conv.messages.length - 1]?.content?.substring(0, 50) + '...') : 'No messages',
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
        res.status(200).json({ conversations });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};


