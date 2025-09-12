const { supabase } = require('../../../lib/clients');

module.exports = async (req, res) => {
    console.log('=== SIMPLE ENDPOINT DEBUG ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);
    console.log('Headers:', req.headers);
    
    // Extract sessionId from URL path instead of query
    const urlParts = req.url.split('/');
    const sessionId = urlParts[urlParts.length - 1];
    
    console.log('URL parts:', urlParts);
    console.log('Extracted SessionId:', sessionId);
    
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
            console.log('Simple delete - SessionId:', sessionId);
            
            if (!sessionId) {
                return res.status(400).json({ error: 'SessionId is required' });
            }
            
            const { data, error } = await supabase
                .from('conversations')
                .delete()
                .eq('conversation_id', sessionId)
                .select();
            
            console.log('Simple delete result:', { data, error });
            
            if (error) {
                console.error('Simple delete error:', error);
                return res.status(500).json({ 
                    error: 'Delete failed',
                    details: error.message 
                });
            }
            
            res.status(200).json({ 
                message: 'Conversation deleted',
                deleted: data 
            });
        } catch (e) {
            console.error('Simple delete exception:', e);
            res.status(500).json({ 
                error: 'Delete failed',
                details: e.message 
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
