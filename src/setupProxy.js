const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/openApi.do", {
      target: "https://www.schoolinfo.go.kr/",
      changeOrigin: true,
    })
  );
};
