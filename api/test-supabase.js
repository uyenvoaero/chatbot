const { supabase } = require('../lib/clients');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('conversations')
            .select('conversation_id')
            .limit(1);
            
        if (error) {
            console.error('Supabase test error:', error);
            return res.status(500).json({ 
                error: 'Supabase connection failed',
                details: error.message,
                code: error.code
            });
        }
        
        // Test delete permissions with a dummy ID
        const testDelete = await supabase
            .from('conversations')
            .delete()
            .eq('conversation_id', 'test-delete-permission')
            .select();
            
        console.log('Delete test result:', testDelete);
        
        res.status(200).json({
            success: true,
            message: 'Supabase connection working',
            data: data,
            deleteTest: {
                error: testDelete.error,
                code: testDelete.error?.code
            }
        });
        
    } catch (e) {
        console.error('Test error:', e);
        res.status(500).json({ 
            error: 'Test failed',
            details: e.message 
        });
    }
};
