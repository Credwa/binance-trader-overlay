import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    APIKey: '',
    secret: '',
    priceMainCoin: 0,
    orders: [],
    currentCoin: { name: '', amount: 0 },
    currentCoinPrice: 0,
    balanceMainCoin: 0
  },
  getters: {
    getAPIKey: state => state.APIKey,
    getSecret: state => state.secret,
    getPriceMainCoin: state => state.priceMainCoin,
    getBalanceMainCoin: state => state.balanceMainCoin,
    getOrders: state => state.orders,
    getCurrentCoin: state => state.currentCoin,
    getCurrentCoinPrice: state => state.currentCoinPrice
  },
  mutations: {
    setAPIKey: (state, key) => {
      state.APIKey = key;
    },
    setSecret: (state, secret) => {
      state.secret = secret;
    },
    setCurrentCoin: (state, coin) => {
      state.currentCoin.name = coin.name;
      state.currentCoin.amount = coin.amount;
    },
    setCurrentCoinPrice: (state, price) => {
      state.currentCoinPrice = price;
    },
    setBalanceMainCoin: (state, balance) => {
      state.balanceMainCoin = balance;
    },
    setPriceMainCoin: (state, price) => {
      state.priceMainCoin = price;
    },
    setOrders: (state, orders) => {
      state.orders = orders;
    },
    setAddOrder: (state, order) => {
      state.orders.push(order);
    },
    setOrderChange: (state, orderId) => {
      state.orders.find(element => {
        return element.orderId === orderId;
      }).status = orderStatus;
    },
    setOrderFailed: (state, orderId) => {
      state.orders = state.orders.filter(element => {
        return element.orderId !== orderId;
      });
    }
  },
  actions: {}
});
