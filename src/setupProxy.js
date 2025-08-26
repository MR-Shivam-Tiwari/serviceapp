const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // only proxy API calls, NOT everything
    createProxyMiddleware({
      target: 'https://servicepbackend.insideoutprojects.in',
      changeOrigin: true,
      secure: false, // if you're using self-signed certs; true if using valid SSL
    })
  );
};
