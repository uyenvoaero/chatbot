module.exports = async (req, res) => {
    const envVars = {
        SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };
    
    console.log('Environment variables status:', envVars);
    
    res.status(200).json({
        message: 'Environment variables check',
        envVars: envVars,
        timestamp: new Date().toISOString()
    });
};
