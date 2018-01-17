import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    APIKey: '',
    secret: '',
    priceMainCoin: 0,
    orders: []
  },
  getters: {
    getAPIKey: state => state.APIKey,
    getSecret: state => state.secret,
    getPriceMainCoin: state => state.priceMainCoin,
    getOrders: state => state.orders
  },
  mutations: {
    setAPIKey: (state, key) => {
      state.APIKey = key;
    },
    setSecret: (state, secret) => {
      state.secret = secret;
    },
    setPriceMainCoin: (state, price) => {
      state.priceMainCoin = price;
    },
    setOrders: (state, orders) => {
      state.orders = orders
    },
    setAddOrder: (state, order) => {
      state.orders.push(order);
      console.log(order);
    },
    setOrderChange: (state, order) => {
      state.orders.find(element => {
        return element.orderId === orderId;
      }).status = orderStatus;
    },
    setOrderFailed: (state, order) => {
      state.orders = state.orders.filter(element => {
        return element.orderId !== orderId;
      });
    }
  },
  actions: {}
});
