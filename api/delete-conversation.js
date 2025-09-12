const { supabase } = require('../lib/clients');

module.exports = async (req, res) => {
    if (req.method !== 'DELETE') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        console.log('=== DELETE CONVERSATION ENDPOINT ===');
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('Body:', req.body);
        console.log('Query:', req.query);
        
        // Get sessionId from query parameter
        const { sessionId } = req.query;
        
        console.log('SessionId from query:', sessionId);
        
        if (!sessionId) {
            return res.status(400).json({ error: 'SessionId is required' });
        }
        
        console.log('Attempting to delete conversation:', sessionId);
        
        // First check if conversation exists
        const { data: existing, error: checkError } = await supabase
            .from('conversations')
            .select('conversation_id, created_at')
            .eq('conversation_id', sessionId);
            
        console.log('Check result:', { existing, checkError });
        
        if (checkError) {
            console.error('Error checking conversation:', checkError);
            return res.status(500).json({ 
                error: 'Check failed',
                details: checkError.message 
            });
        }
        
        if (!existing || existing.length === 0) {
            console.log('Conversation not found');
            return res.status(404).json({ 
                error: 'Conversation not found',
                sessionId 
            });
        }
        
        console.log('Conversation found, proceeding with delete...');
        
        // Delete the conversation
        const { data, error } = await supabase
            .from('conversations')
            .delete()
            .eq('conversation_id', sessionId)
            .select();
            
        console.log('Delete result:', { data, error });
        
        if (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ 
                error: 'Delete failed',
                details: error.message,
                code: error.code
            });
        }
        
        console.log('Delete successful, deleted count:', data ? data.length : 0);
        
        res.status(200).json({ 
            message: 'Conversation deleted successfully',
            deleted: data,
            deletedCount: data ? data.length : 0
        });
        
    } catch (e) {
        console.error('Delete conversation error:', e);
        res.status(500).json({ 
            error: 'Delete failed',
            details: e.message 
        });
    }
};
