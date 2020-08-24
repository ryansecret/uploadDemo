import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import OssUploader from "jdcloud-oss-upload";
import I18n from "vue-i18n";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(ElementUI);

Vue.config.productionTip = false;
Vue.use(I18n);

Vue.use(OssUploader);

export const i18n = new I18n({
  locale: 'cn', // 设置语言环境
  fallbackLocale: 'cn'
})

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");
