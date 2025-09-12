module.exports = async (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Vercel function is working'
    });
};
