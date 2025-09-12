const { supabase } = require('../lib/clients');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { conversationId } = req.body;
        
        if (!conversationId) {
            return res.status(400).json({ error: 'conversationId is required' });
        }
        
        console.log('Testing delete for conversation:', conversationId);
        
        // First check if it exists
        const { data: existing, error: checkError } = await supabase
            .from('conversations')
            .select('conversation_id, created_at')
            .eq('conversation_id', conversationId);
            
        console.log('Check result:', { existing, checkError });
        
        if (checkError) {
            return res.status(500).json({ 
                error: 'Check failed',
                details: checkError.message 
            });
        }
        
        if (!existing || existing.length === 0) {
            return res.status(404).json({ 
                error: 'Conversation not found',
                conversationId 
            });
        }
        
        // Try to delete
        const { data, error } = await supabase
            .from('conversations')
            .delete()
            .eq('conversation_id', conversationId)
            .select();
            
        console.log('Delete result:', { data, error });
        
        if (error) {
            return res.status(500).json({ 
                error: 'Delete failed',
                details: error.message,
                code: error.code
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Delete test successful',
            deleted: data,
            deletedCount: data ? data.length : 0
        });
        
    } catch (e) {
        console.error('Test delete error:', e);
        res.status(500).json({ 
            error: 'Test failed',
            details: e.message 
        });
    }
};
