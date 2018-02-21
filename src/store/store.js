import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';
import _ from 'lodash';
Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    APIKey: null,
    secret: null,
    priceMainCoin: 0,
    eliotOrders: {},
    orders: [],
    currentCoin: {
      name: '',
      amount: 0
    },
    currentCoinPrice: 0,
    balanceMainCoin: 0,
    orderCount: 0,
    sessionStatus: false,
    sessionStartingValue: 0
  },
  getters: {
    getAPIKey: state => state.APIKey,
    getSecret: state => state.secret,
    getPriceMainCoin: state => state.priceMainCoin,
    getBalanceMainCoin: state => state.balanceMainCoin,
    getOrders: state =>
      _.uniqBy(state.orders, e => {
        return e.orderId;
      }),
    getCurrentCoin: state => state.currentCoin,
    getCurrentCoinPrice: state => state.currentCoinPrice,
    getSessionStartingValue: state => state.sessionStartingValue,
    getSessionStatus: state => state.sessionStatus,
    getEliotOrders: state => state.eliotOrders,
  },
  mutations: {
    setAPIKey: (state, key) => {
      state.APIKey = key;
    },
    setSecret: (state, secret) => {
      state.secret = secret;
    },
    setSessionStartingValue: (state, value) => {
      state.sessionStartingValue = value;
    },
    toggleSessionStatus: state => {
      state.sessionStatus = !state.sessionStatus;
    },
    incrementOrderCount: state => {
      state.orderCount++;
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
    setAddOrder: (state, order) => {
      if (state.orderCount < 1) {
        let tempOrder = order;
        tempOrder.time = moment(tempOrder.time).format('YYYY-MMM-DD HH:mm:ss');
        state.orders.push(tempOrder);
        if (state.orders.length > 1) {
          state.orders = state.orders.sort((a, b) => {
            return a.time > b.time ? 1 : b.time > a.time ? -1 : 0;
          });
        }
        state.orders = state.orders.reverse();
      }
    },
    setNewOrder: (state, order) => {
      let tempOrder = order;
      tempOrder.time = moment(tempOrder.time).format('YYYY-MMM-DD HH:mm:ss');
      state.orders.push(tempOrder);
      if (state.orders.length > 1) {
        state.orders = state.orders.sort((a, b) => {
          return a.time > b.time ? 1 : b.time > a.time ? -1 : 0;
        });
      }
      state.orders = state.orders.reverse();
    },
    setOrderChange: (state, orderId, orderStatus) => {
      state.orders.find(element => {
        return element.orderId === orderId;
      }).status = orderStatus;
    },
    setOrderFailed: (state, orderId) => {
      state.orders = state.orders.filter(element => {
        return element.orderId !== orderId;
      });
    },
    setEliotOrders: (state, eliotOrders) => {
      state.eliotOrders = eliotOrders;
    }
  },
  actions: {}
});
