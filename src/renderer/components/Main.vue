<template>
<div id="main">
  <div class="menu">
    <div class="topIcons">
      <v-icon dark large class="drag">drag_handle</v-icon>
      <v-icon dark large class="remove" @click="hideMenu">remove</v-icon>
    </div>

    <div class="top-details">
          <div style="margin-left:5%"><h4>{{currentCoin.name + '/' + mainCoin}} 24hr <span v-if="parseFloat(currentCoin.percentChange) > 0" style="color: #4caf50">+{{currentCoin.percentChange}}%</span>
          <span v-if="parseFloat(currentCoin.percentChange) < 0" style="color:#ef5350">{{currentCoin.percentChange}}%</span>
          </h4></div>
          <v-btn-toggle mandatory v-model="toggle_one" style="margin-left:5%">
          </v-btn-toggle>
          <v-switch v-model="switchUSD" style="color:white; top:12px; margin-left:2vw" name="showUSD"></v-switch>
          <v-menu open-on-hover top offset-y>
            <v-btn color="red lighten-3" outline flat dark slot="activator" class="">Holdings</v-btn>
            <v-list>
              <v-list-tile :disabled="key === mainCoin" v-for="(balance,key) in balances" :key="key" @click="
              if (key !== mainCoin)changeCurrentCoin(key, balance.available)" v-if="balance.available > 0">
                <v-list-tile-title>{{key}}: {{balance.available}}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <div style="margin-right:5%">{{mainCoin}} Value: <span style="color: #4caf50">${{parseFloat(priceMainCoin).toLocaleString(undefined, {minimumFractionDigits: 4})}}</span></div>
      </div>

    <div class="details">
      <div style="margin-left: 5%"><h5><span style="color:#f9a825">{{currentCoin.name}} Balance: </span>{{currentCoin.amount}}    </h5></div>
      <div v-if="switchUSD"><h5><span style="color:#4caf50"> USD Balance: </span>${{(currentCoin.amount * (currentCoin.price * priceMainCoin)).toFixed(2)}} </h5></div>
      <div v-if="!switchUSD"><h5><span style="color:#4caf50"> Estimated {{mainCoin}}: </span>{{(currentCoin.price * currentCoin.amount).toFixed(8)}} </h5></div>
      <div v-if="switchUSD"><h5><span style="color:#64b5f6">  {{currentCoin.name}}/USD: </span>${{((currentCoin.price * priceMainCoin)).toFixed(2)}} </h5></div>
      <div v-if="!switchUSD"><h5><span style="color:#64b5f6"> {{currentCoin.name}}/{{mainCoin}}: </span>{{currentCoin.price}} </h5></div>
    </div>

    <div class="infos">
    <div class="day-trading">
      <div>Starting Value: <v-chip color="yellow darken-1">{{startingValue.toFixed(8)}} {{mainCoin}}</v-chip> / <v-chip color="green">${{(priceMainCoin * startingValue).toFixed(2)}}</v-chip>
      </div>
      <div>Current Estimated Value: <v-chip color="yellow darken-1">{{estimatedTotalPrice.toFixed(8)}} {{mainCoin}}</v-chip> / <v-chip color="green">${{(priceMainCoin * estimatedTotalPrice).toFixed(2)}}</v-chip></div>
      <v-btn color="green lighten-6" @click="sessionStart">Start Session</v-btn>
    </div>

    <div class="recentTradesUpdates">
       <v-list dark>
          <v-list-tile  v-for="order in orderUpdates" v-bind:key="order.time" @click="">
            <v-list-tile-action>
              <v-icon v-if="order.status === 'NEW'" color="blue">announcement</v-icon>
              <v-icon v-if="order.status === 'FILLED'" color="green">done</v-icon>
              <v-icon v-if="order.status === 'CANCELED' || order.status === 'REJECTED'" color="red">warning</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title :style="order.side === 'SELL' ? 'color:red' : 'color:green'">{{order.symbol}} |
                Price: {{order.price}} |
                Quantity: {{order.origQty}}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
    </div>

    </div>
    <orders :orders="orders" :priceMainCoin="priceMainCoin"></orders>
  </div>
</div>
</template>

<script>
const binance = require('node-binance-api');
const remote = require('electron').remote;
import Orders from './Order';
import { mapMutations, mapGetters } from 'vuex';
let tradeSymbols = {};
export default {
  name: 'main-menu',
  components: {
    Orders
  },
  data() {
    return {
      currentCoin: { name: '', amount: 0, price: 0, percentChange: 0 },
      mainCoin: 'BTC',
      toggle_one: 0,
      priceMainCoin: 0,
      percentChangeMainCoin: 0,
      totalEstimatedValue: 0,
      startingValue: 0,
      valid: false,
      loading: false,
      switchUSD: false,
      apiKey: '',
      apiKeyRules: [v => !!v || 'API Key is required'],
      secret: '',
      secretRules: [v => !!v || 'Secret is required'],
      balances: null,
      balance: 0,
      priceTicker: null,
      orders: [],
      tradeSymbols: {},
      orderUpdates: [
        {
          symbol: 'null',
          price: 'null',
          origQty: 'null',
          side: 'null',
          orderId: 'null',
          type: 'null',
          status: 'null',
          freshOrder: true
        }
      ]
    };
  },
  methods: {
    ...mapMutations(['setAPIKey', 'setSecret']),
    sessionStart() {
      this.startingValue = this.estimatedTotalPrice;
    },
    hideMenu() {
      let currWindow = this.$electron.remote.getCurrentWindow();
      currWindow.minimize();
    },
    changeCurrentCoin(name, amt) {
      // change current coin when new coin in holding is clicked
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
          }
        );
      }
    },
    storeOrders(coin) {
      let self = this;
      binance.allOrders(coin + 'BTC', function(orders, symbol) {
        if (orders.length > 0) {
          for (let i = 0; i < orders.length; i++) {
            if (orders[i].status !== 'CANCELED') {
              self.orders.push(orders[i]);
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
            if (balances[balance].available > 0) {
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
        self.balances = balances;

        // set default current coin to coin with greatest balance
        self.currentCoin.name = newBalances[0].name;
        self.currentCoin.amount = newBalances[0].amount;

        // subscribe to current coin to get data
        binance.websockets.prevDay(
          self.currentCoin.name.toString() + self.mainCoin.toString() + '',
          function(response) {
            self.currentCoin.price = response.bestBid;
            self.currentCoin.percentChange = response.percentChange;
          }
        );
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
      }
    },
    orderUpdate(data) {
      this.orderUpdates.pop();
      this.orderUpdates.unshift(data);
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
        this.orders.unshift({
          symbol,
          price,
          origQty: quantity,
          side,
          orderId,
          time: new Date().getTime(),
          type: orderType,
          status: orderStatus,
          freshOrder: true
        })
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
        this.orders.find(element => {
          return element.orderId === orderId;
        }).status = orderStatus;
        // console.log(data);
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
        this.orders = this.orders.filter(element => {
          return element.orderId !== orderId;
        });
      }
      //NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED
    }
  },
  computed: {
    ...mapGetters(['getAPIKey', 'getSecret']),
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
    let self = this;
    binance.websockets.prevDay(this.mainCoin + 'USDT', function(response) {
      self.priceMainCoin = response.bestBid;
      self.percentChangeMainCoin = response.percentChange;
    });
    binance.options({
      APIKEY:
        this.getAPIKey,
      APISECRET:
        this.getSecret,
      recvWindow: 1200000,
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
  flex-direction: row;
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
}
.infos {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.remove:active {
  box-shadow: none;
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
