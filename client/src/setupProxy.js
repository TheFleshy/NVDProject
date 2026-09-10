const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: process.env.BACKEND_URL || 'http://nvd-backend:5000',
            changeOrigin: true,
        })
    );
};