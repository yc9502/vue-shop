import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/element.js";
import axios from "axios";

//导入全局样式表
import "./assets/css/global.css";

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";

Vue.prototype.$http = axios;

//请求拦截器 添加token令牌,保证拥有获取数据的权限
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
