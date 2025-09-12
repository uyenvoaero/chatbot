module.exports = async (req, res) => {
    console.log('=== SIMPLE TEST ENDPOINT ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    
    res.status(200).json({
        message: 'Simple test endpoint working',
        method: req.method,
        url: req.url,
        query: req.query,
        timestamp: new Date().toISOString()
    });
};
