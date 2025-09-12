const { supabase } = require('../../../lib/clients');

module.exports = async (req, res) => {
    const { sessionId } = req.query;
    
    if (req.method === 'GET') {
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
    } else if (req.method === 'DELETE') {
        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('conversation_id', sessionId);
            if (error) throw error;
            res.status(200).json({ message: 'Conversation cleared' });
        } catch (e) {
            res.status(500).json({ error: 'Failed to delete conversation' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};


