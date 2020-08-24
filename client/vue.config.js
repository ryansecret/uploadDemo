module.exports = {
  lintOnSave: false,
  devServer: {
    host: "hosting.jdcloud.com"
  },
  configureWebpack: configs => {
    configs.module.rules.push({
      resourceQuery: /blockType=i18n/,
      type: "javascript/auto",
      loader: "@intlify/vue-i18n-loader"
    });
  }
};
