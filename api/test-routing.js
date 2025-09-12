module.exports = async (req, res) => {
    res.status(200).json({
        message: 'Routing test successful',
        method: req.method,
        url: req.url,
        query: req.query,
        headers: req.headers
    });
};
