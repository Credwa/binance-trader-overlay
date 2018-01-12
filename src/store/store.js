import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    APIKey: '',
    secret: '',
    startingValue: 0,
    times: 0
  },
  getters: {
    getAPIKey: state => state.APIKey,
    getSecret: state => state.secret,
    getStartingValue: state => state.startingValue
  },
  mutations: {
    setAPIKey: (state, key) => {
      state.APIKey = key;
    },
    setSecret: (state, secret) => {
      state.secret = secret;
    },
    setStartingValue: (state, value) => {
      if (state.times < 1) {
        console.log('test')
        state.startingValue = value;
        state.times++;
      }
    }
  },
  actions: {}
});
