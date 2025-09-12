const { supabase } = require('../../../lib/clients');

module.exports = async (req, res) => {
    const { sessionId } = req.query;
    if (req.method !== 'GET') {
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
        res.status(200).json({ conversation: data ? data.messages : [] });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
};


