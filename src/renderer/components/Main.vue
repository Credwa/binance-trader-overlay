<template>
<div id="main">
  <div class="menu">
    <div class="topIcons">
      <v-icon dark large class="drag">drag_handle</v-icon>

      <v-icon dark large class="remove" @click="hideMenu">remove</v-icon>
    </div>
    <div>
    <div class="top-details">
          <div style="margin-left:5%"><h4>{{currentCoin.name + '/' + mainCoin}} 24hr <span v-if="parseFloat(currentCoin.percentChange) > 0" style="color: #4caf50">+{{currentCoin.percentChange}}%</span>
          <span v-if="parseFloat(currentCoin.percentChange) < 0" style="color:#ef5350">{{currentCoin.percentChange}}%</span>
          </h4></div>
          <div style="margin-right:5%">{{mainCoin}} Value: <span style="color: #4caf50">${{parseFloat(priceMainCoin).toLocaleString(undefined, {minimumFractionDigits: 4})}}</span></div>
          <div>
            <v-switch v-model="switchUSD" style="color:white; top:12px; margin-left:2vw" name="showUSD" class="text-xs-center"></v-switch>
          </div>
        <div style="display:flex; justify-content:center;">
          <v-btn-toggle mandatory v-model="toggle_one" style="margin-left:5%">
          </v-btn-toggle>
          <v-menu top offset-y>
            <v-btn color="red lighten-3" outline flat dark slot="activator" class="">Holdings</v-btn>
            <v-list>
                  <v-list-tile v-on:click.stop="">
                    <v-text-field
                    append-icon="search"
                    label="Search"
                    single-line
                    hide-details
                    v-model="search"
                    style="width: 10px"
                ></v-text-field>
                </v-list-tile>
              <v-list-tile :disabled="key === mainCoin" v-for="(balance,key) in balances" :key="key" @click="
              if (key !== mainCoin)changeCurrentCoin(key, balance.available)" v-if="search.length === 0">
                <v-list-tile-title>{{key}}: {{balance.available}}</v-list-tile-title>
              </v-list-tile>

              <v-list-tile :disabled="balance.symbol === mainCoin" v-for="(balance,index) in balancesFilter" :key="index" @click="
              if (balance.symbol !== mainCoin)changeCurrentCoin(balance.symbol, balance.available)" v-if="search.length > 0">
                <v-list-tile-title>{{balance.symbol}}: {{balance.available}}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </div>
      </div>

    <div class="details">
      <div style="margin-left: 5%; margin-right: 5%"><h5><span style="color:#f9a825">{{currentCoin.name}} Balance: </span>{{currentCoin.amount}}    </h5></div>
      <div v-if="switchUSD"><h5><span style="color:#4caf50"> USD Balance: </span>${{(currentCoin.amount * (currentCoin.price * priceMainCoin)).toFixed(2)}} </h5></div>
      <div v-if="!switchUSD"><h5><span style="color:#4caf50"> Estimated {{mainCoin}}: </span>{{(currentCoin.price * currentCoin.amount).toFixed(8)}} </h5></div>
      <div v-if="switchUSD"><h5><span style="color:#64b5f6">  {{currentCoin.name}}/USD: </span>${{((currentCoin.price * priceMainCoin)).toFixed(2)}} </h5></div>
      <div v-if="!switchUSD"><h5><span style="color:#64b5f6"> {{currentCoin.name}}/{{mainCoin}}: </span>{{currentCoin.price}} </h5></div>
    </div>
    <div class="infos">
    <div class="day-trading">
      <div>Starting Value: <v-chip color="yellow darken-1" v-if="!switchUSD">{{getSessionStartingValue.toFixed(8)}} {{mainCoin}}</v-chip><v-chip v-if="switchUSD" color="green">${{(priceMainCoin * getSessionStartingValue).toFixed(2)}}</v-chip>
      </div>
      <div>Current Value: <v-chip v-if="!switchUSD" color="yellow darken-1">{{estimatedTotalPrice.toFixed(8)}} {{mainCoin}}</v-chip><v-chip v-if="switchUSD" color="green">${{(priceMainCoin * estimatedTotalPrice).toFixed(2)}}</v-chip></div>

      <div >Gain/Loss:
        <span v-if="!switchUSD && getSessionStartingValue > 0" :style="(estimatedTotalPrice - getSessionStartingValue) >= 0 ? 'color: #4caf50' :  'color: #ef5350'">{{(estimatedTotalPrice - getSessionStartingValue).toFixed(8)}}({{(((estimatedTotalPrice - getSessionStartingValue)/getSessionStartingValue )* 100).toFixed(3)}}%)</span>

        <span v-if="switchUSD && getSessionStartingValue > 0" :style="(estimatedTotalPrice - getSessionStartingValue) >= 0 ? 'color: #4caf50' :  'color: #ef5350'">${{((estimatedTotalPrice - getSessionStartingValue) * priceMainCoin).toFixed(2)}}({{(((estimatedTotalPrice - getSessionStartingValue)/getSessionStartingValue )* 100).toFixed(3)}}%)</span>

        <span v-if="getSessionStartingValue === 0">0(0.000%)</span>
      </div>
      <v-btn :color="getSessionData.status" @click="sessionStart">{{getSessionData.data}}</v-btn>
    </div>
      <v-snackbar
      :timeout="snackbar.timeout"
      :top="snackbar.y"
      v-model="snackbar.status"
      :color="snackbar.color"
    >
      {{ snackbar.text }}
      <v-btn flat color="red" @click.native="snackbar.status = false">Close</v-btn>
    </v-snackbar>
    </div>
    <v-btn color="blue" outline style="width:95%" @click="openOrders">orders</v-btn>
    <trades :currentCoin="currentCoin"> </trades>
  </div>
  </div>
</div>
</template>

<script>
const binance = require('node-binance-api');
import Orders from './Order';
import { mapMutations, mapGetters } from 'vuex';
import Trades from './trade/Trades.vue';
let tradeSymbols = {};
export default {
  name: 'main-menu',
  components: {
    Orders,
    Trades
  },
  data() {
    return {
      snackbar: {
        status: false,
        y: 'top',
        x: null,
        mode: '',
        timeout: 3000,
        text: '',
        color: 'red lighten-4'
      },
      sessionData: 'Start Session',
      sessionStatus: 'green lighten-6',
      sessionInProgress: false,
      currentCoin: { name: '', amount: 0, price: 0, percentChange: 0 },
      mainCoin: 'BTC',
      toggle_one: 0,
      priceMainCoin: 0,
      percentChangeMainCoin: 0,
      totalEstimatedValue: 0,
      startingValue: 0,
      valid: false,
      loadingData: false,
      search: '',
      switchUSD: false,
      apiKey: '',
      apiKeyRules: [v => !!v || 'API Key is required'],
      secret: '',
      secretRules: [v => !!v || 'Secret is required'],
      balances: {},
      balance: 0,
      priceTicker: null,
      orders: [],
      tradeSymbols: {}
    };
  },
  methods: {
    ...mapMutations([
      'setPriceMainCoin',
      'setAddOrder',
      'setNewOrder',
      'setOrderChange',
      'setOrderFailed',
      'setCurrentCoin',
      'setCurrentCoinPrice',
      'setBalanceMainCoin',
      'toggleSessionStatus',
      'setSessionStartingValue',
      'incrementOrderCount'
    ]),
    // deprecate next
    openTrade() {
      let window = this.$electron.remote.getCurrentWindow();
      let screenSize = this.$electron.screen.getPrimaryDisplay().size;
      let newWindowWidth = Math.floor(screenSize.width / 2);
      let newWindowHeight = Math.floor(screenSize.height / 2.5);
      window.setPosition(
        screenSize.width - newWindowWidth,
        screenSize.height - newWindowHeight - 100
      );
      window.setSize(newWindowWidth, newWindowHeight);
      this.setCurrentCoin({
        name: this.currentCoin.name,
        amount: this.currentCoin.amount
      });
      this.setCurrentCoinPrice(this.currentCoin.price);
      this.$router.push('trade');
    },
    openOrders() {
      this.$router.push('orders');
      this.incrementOrderCount();
    },
    sessionStart() {
      this.toggleSessionStatus();
      if (this.getSessionStatus) {
        this.setSessionStartingValue(this.estimatedTotalPrice);
        this.sessionStatus = 'red darken-5';
        this.sessionData = 'End Session';
      } else {
        this.setSessionStartingValue(0);
        this.sessionStatus = 'green darken-5';
        this.sessionData = 'Start Session';
      }
    },
    hideMenu() {
      let currWindow = this.$electron.remote.getCurrentWindow();
      currWindow.minimize();
    },
    changeCurrentCoin(name, amt) {
      // change current coin when new coin in holding is clicked
      this.loadingData = true;
      let self = this;

      // unsub to old coin
      binance.websockets.terminate(
        this.currentCoin.name.toLocaleLowerCase() +
          this.mainCoin.toLocaleLowerCase() +
          '@ticker'
      );

      // set new coin data
      this.currentCoin.name = name;
      this.currentCoin.amount = amt;
      if (name === this.mainCoin) {
      } else {
        // sub to new coin
        binance.websockets.prevDay(
          this.currentCoin.name + this.mainCoin,
          function(response) {
            self.currentCoin.price = response.bestBid;
            self.currentCoin.percentChange = response.percentChange;
            self.loadingData = false;
          }
        );
      }

      setTimeout(() => {
        self.loadingData = false;
      }, 2000);
    },
    storeOrders(coin) {
      let self = this;
      binance.allOrders(coin + 'BTC', function(orders, symbol) {
        if (orders.length > 0) {
          for (let i = 0; i < orders.length; i++) {
            if (orders[i].status !== 'CANCELED') {
              self.setAddOrder(orders[i]);
            }
          }
        }
      });
    },
    getBalances() {
      // get all current balances this is only called once upon component creation
      let self = this;
      binance.balance(function(balances) {
        // terminate any prev subscribtions this is a failsafe to prevent any unforseen errors
        binance.websockets.terminate(
          self.currentCoin.name.toLocaleLowerCase() +
            self.mainCoin.toLocaleLowerCase() +
            '@ticker'
        );

        // create new array which only shows balances with value more than 0 and sort
        let newBalances = [];
        for (let balance in balances) {
          if (balances.hasOwnProperty(balance)) {
            if (balance === self.mainCoin) {
              self.setBalanceMainCoin(balances[balance].available);
            }
            if (balances[balance].available) {
              if (balance !== 'GAS' && balance !== 'ETF') {
                // temp solution
                self.storeOrders(balance);
              }
              newBalances.push({
                name: balance,
                amount: balances[balance].available
              });
            }
          }
        }
        let sortedKeys = Object.keys(balances).sort((a, b) => {
          return balances[b].available - balances[a].available;
        });
        sortedKeys.forEach(key => {
          if (key === '123' || key === '456') {
          } else {
            self.$set(self.balances, key, balances[key]);
          }
        });
        // console.log(balances);

        // set default current coin to coin with greatest balance
        if (newBalances[0].name === self.mainCoin && newBalances.length > 1) {
          self.currentCoin.name = sortedKeys[1];
          self.currentCoin.amount = balances[sortedKeys[1]].available;
        } else {
          self.currentCoin.name = sortedKeys[0];
          self.currentCoin.amount = balances[sortedKeys[0]].available;
        }

        // subscribe to current coin to get data
        binance.websockets.prevDay(
          self.currentCoin.name.toString() + self.mainCoin.toString() + '',
          function(response) {
            self.currentCoin.price = response.bestBid;
            self.currentCoin.percentChange = response.percentChange;
            self.loadingData = false;
          }
        );
        setTimeout(() => {
          self.loadingData = false;
        }, 1000);
      });
    },
    toggleMainCoin(newCoin) {
      // toggles main coin either BTC or ETH on click
      let self = this;
      // unsub to late main coin to usdt
      binance.websockets.terminate(
        self.mainCoin.toLocaleLowerCase() + 'usdt' + '@ticker'
      );
      binance.websockets.terminate(
        this.currentCoin.name.toLocaleLowerCase() +
          this.mainCoin.toLocaleLowerCase() +
          '@ticker'
      );

      this.mainCoin = newCoin;
      binance.websockets.prevDay(this.mainCoin + 'USDT', function(response) {
        self.priceMainCoin = response.bestBid;
        self.setPriceMainCoin(response.bestBid);
      });

      binance.websockets.prevDay(
        this.currentCoin.name + this.mainCoin,
        function(response) {
          self.currentCoin.price = response.bestBid;
          self.currentCoin.percentChange = response.percentChange;
        }
      );
    },
    balance_update(data) {
      for (let obj of data.B) {
        let { a: asset, f: available, l: onOrder } = obj;
        if (available == '0.00000000') continue;
        this.balances[asset].available = available;
        this.balances[asset].onOrder = onOrder;
        if (asset === this.mainCoin) {
          this.setBalanceMainCoin(this.balances[asset].available);
        }
        if (asset === this.currentCoin.name) {
          this.currentCoin.amount = available;
        }
      }
    },
    orderUpdate(data) {
      this.snackbar.status = true;
      if (data.status === 'NEW') {
        this.snackbar.color = 'blue lighten-3';
      } else if (data.status === 'FILLED') {
        this.snackbar.color = 'green lighten-3blue lighten-3';
      } else if (data.status === 'CANCELED') {
        this.snackbar.color = 'red lighten-4';
      }
      this.snackbar.text =
        data.side +
        ' ' +
        data.origQty +
        data.symbol.replace('BTC', '') +
        ' for ' +
        data.price +
        'BTC';
    },
    execution_update(data) {
      let {
        x: executionType,
        s: symbol,
        p: price,
        q: quantity,
        S: side,
        o: orderType,
        i: orderId,
        X: orderStatus
      } = data;
      if (orderStatus == 'NEW') {
        this.orderUpdate({
          symbol,
          price,
          origQty: quantity,
          side,
          orderId,
          time: new Date().getTime(),
          type: orderType,
          status: orderStatus,
          freshOrder: true
        });
        this.setNewOrder({
          symbol,
          price,
          origQty: quantity,
          side,
          orderId,
          time: new Date().getTime(),
          type: orderType,
          status: orderStatus,
          freshOrder: true
        });
        if (orderStatus == 'REJECTED') {
          console.log('Order Failed! Reason: ' + data.r);
        }
        return;
      } else if (orderStatus === 'FILLED') {
        this.orderUpdate({
          symbol,
          price,
          origQty: quantity,
          side,
          orderId,
          time: new Date().getTime(),
          type: orderType,
          status: orderStatus,
          freshOrder: true
        });
        this.setOrderChange(orderId);
      } else if (orderStatus === 'CANCELED' || orderStatus === 'EXPIRED') {
        this.orderUpdate({
          symbol,
          price,
          origQty: quantity,
          side,
          orderId,
          time: new Date().getTime(),
          type: orderType,
          status: orderStatus,
          freshOrder: true
        });
        this.setOrderFailed(orderId);
      }
      //NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED
    }
  },
  computed: {
    ...mapGetters([
      'getAPIKey',
      'getSecret',
      'getCurrentCoin',
      'getSessionStartingValue',
      'getSessionStatus'
    ]),
    getSessionData() {
      if (this.getSessionStatus) {
        return {
          data: 'End Session',
          status: 'red lighten-6'
        };
      } else {
        return {
          data: 'Start Session',
          status: 'green lighten-6'
        };
      }
    },
    balancesFilter() {
      let tempBalances = [];
      let reg = new RegExp(`${this.search.toUpperCase()}`);
      for (let balance in this.balances) {
        if (this.balances.hasOwnProperty(balance)) {
          if (this.balances[balance].available) {
            tempBalances.push({
              symbol: balance,
              available: this.balances[balance].available
            });
          }
        }
      }
      tempBalances = tempBalances.filter(element => {
        return !element.symbol.search(reg);
      });
      return tempBalances;
    },
    estimatedTotalPrice() {
      let total = 0;
      if (this.balances && this.priceTicker) {
        for (let balance in this.balances) {
          if (this.balances.hasOwnProperty(balance)) {
            if (this.balances[balance].available > 0) {
              if (
                this.priceTicker[balance + this.mainCoin] &&
                balance !== this.mainCoin
              ) {
                total +=
                  parseFloat(this.priceTicker[balance + this.mainCoin]) *
                  this.balances[balance].available;
              } else if (balance === this.mainCoin) {
                total += parseFloat(this.balances[balance].available);
              }
            }
          }
        }
      }
      return total;
    }
  },

  created() {
    this.loadingData = true;
    let self = this;
    binance.websockets.prevDay(this.mainCoin + 'USDT', function(response) {
      self.priceMainCoin = response.bestBid;
      self.setPriceMainCoin(response.bestBid);
      self.percentChangeMainCoin = response.percentChange;
    });
    binance.options({
      APIKEY: this.getAPIKey,
      APISECRET: this.getSecret,
      useServerTime: true,
      reconnect: false
    });
    this.getBalances();

    binance.prices(function(ticker) {
      self.priceTicker = ticker;
    });
    binance.websockets.userData(this.balance_update, this.execution_update);
  }
};
</script>

<style>
#main {
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  color: white;
}

label {
  color: white;
}
.day-trading {
  margin-top: 3vh;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  flex-direction: column;
}

.top-details {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  align-items: center;
  flex-wrap: wrap;
}

.details {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.drag {
  -webkit-app-region: drag;
  cursor: pointer;
}
.infos {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.remove:hover {
  box-shadow: none;
  cursor: pointer;
}

.topIcons {
  display: flex;
  align-content: space-between;
  justify-content: space-between;
  flex-direction: row;
  margin-top: 1%;
  margin-left: 2%;
}
</style>
