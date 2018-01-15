import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    APIKey: '',
    secret: '',
    times: 0
  },
  getters: {
    getAPIKey: state => state.APIKey,
    getSecret: state => state.secret,
  },
  mutations: {
    setAPIKey: (state, key) => {
      state.APIKey = key;
    },
    setSecret: (state, secret) => {
      state.secret = secret;
    }
  },
  actions: {}
});
