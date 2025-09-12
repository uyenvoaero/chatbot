const { supabase } = require('../../../lib/clients');

module.exports = async (req, res) => {
    console.log('=== CONVERSATION ENDPOINT HIT ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);
    console.log('Headers:', req.headers);
    
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
            console.log('=== DELETE REQUEST DEBUG ===');
            console.log('SessionId:', sessionId);
            console.log('Request method:', req.method);
            console.log('Request headers:', req.headers);
            
            // First, check if conversation exists
            console.log('Checking if conversation exists...');
            const { data: existingData, error: checkError } = await supabase
                .from('conversations')
                .select('conversation_id, created_at')
                .eq('conversation_id', sessionId);
            
            console.log('Check result:', { existingData, checkError });
            
            if (checkError) {
                console.error('Error checking conversation:', checkError);
                throw checkError;
            }
            
            if (!existingData || existingData.length === 0) {
                console.log('Conversation not found');
                return res.status(404).json({ 
                    error: 'Conversation not found',
                    sessionId: sessionId
                });
            }
            
            console.log('Conversation found, proceeding with delete...');
            
            // Now delete the conversation
            const { data, error } = await supabase
                .from('conversations')
                .delete()
                .eq('conversation_id', sessionId)
                .select();
            
            console.log('Delete result:', { data, error });
            console.log('Deleted count:', data ? data.length : 0);
            
            if (error) {
                console.error('Supabase delete error:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);
                throw error;
            }
            
            // Verify deletion
            const { data: verifyData, error: verifyError } = await supabase
                .from('conversations')
                .select('conversation_id')
                .eq('conversation_id', sessionId);
            
            console.log('Verification result:', { verifyData, verifyError });
            console.log('Still exists after delete:', verifyData && verifyData.length > 0);
            
            res.status(200).json({ 
                message: 'Conversation cleared',
                deleted: data,
                deletedCount: data ? data.length : 0,
                stillExists: verifyData && verifyData.length > 0
            });
        } catch (e) {
            console.error('Delete conversation error:', e);
            res.status(500).json({ 
                error: 'Failed to delete conversation',
                details: e.message,
                code: e.code
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};


