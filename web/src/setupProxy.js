/**
 * Proxy API requests to Backend during development
 * يوجّه طلبات /servy إلى الباك إند لتجنب CORS
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

const API_TARGET = process.env.REACT_APP_PROXY_TARGET || 'https://souq-917s.onrender.com';

module.exports = function (app) {
  app.use(
    '/servy',
    createProxyMiddleware({
      target: API_TARGET,
      changeOrigin: true,
      secure: true,
    })
  );
};
