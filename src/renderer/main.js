import Vue from "vue";
import Vuetify from "vuetify";
import VueSocketio from "vue-socket.io";

import App from "./App";
import router from "./router";
import { store } from "./../store/store";

import("../../node_modules/vuetify/dist/vuetify.min.css");

Vue.use(Vuetify);

// connect to socket
// Vue.use(VueSocketio, 'https://desolate-lake-73523.herokuapp.com/');
Vue.use(VueSocketio, "ec2-34-228-29-156.compute-1.amazonaws.com:3000");
// Vue.use(VueSocketio, 'http://localhost:3000');

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: "<App/>"
}).$mount("#app");
