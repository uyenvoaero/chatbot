const { supabase } = require('../../../lib/clients');

module.exports = async (req, res) => {
    const { sessionId } = req.query;
    if (req.method !== 'DELETE') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
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
};


