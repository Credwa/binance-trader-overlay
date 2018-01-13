<template>
<div id="main">
  <div class="menu">
    <div class="top-details">
          <div><h4>{{currentCoin.name + '/' + mainCoin}} 24hr <span v-if="currentCoin.percentChange > 0" style="color: #4caf50">+{{currentCoin.percentChange}}%</span>
          <span v-if="changeCurrentCoin.percentChange < 0" style="color: red">-{{currentCoin.percentChange}}%</span></h4></div>
          <v-btn-toggle mandatory v-model="toggle_one">
              <v-btn flat color="orange" @click="toggleMainCoin('BTC')">
                BTC
              </v-btn>
              <v-btn flat color="blue" @click="toggleMainCoin('ETH')">
                ETH
              </v-btn>
          </v-btn-toggle>
          <v-switch v-model="switchUSD" style="color:white; top:12px; margin-left:2vw" name="showUSD"></v-switch>
          <v-menu open-on-hover top offset-y>
            <v-btn color="red lighten-3" outline flat dark slot="activator" class="">Holdings</v-btn>
            <v-list>
              <v-list-tile  v-for="(balance,key) in balances" :key="key" @click="changeCurrentCoin(key, balance.available)" v-if="balance.available > 0">
                <v-list-tile-title>{{key}}: {{balance.available}}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>

      </div>
    <div class="details">
      <div style="margin-left: 5%"><h5><span style="color:#f9a825">{{currentCoin.name}} Balance: </span>{{currentCoin.amount}}    </h5></div>
      <div v-if="switchUSD"><h5><span style="color:#4caf50"> USD Balance: </span>${{(currentCoin.amount * (currentCoin.price * priceMainCoin)).toFixed(2)}} </h5></div>
      <div v-if="!switchUSD"><h5><span style="color:#4caf50"> Estimated {{mainCoin}}: </span>{{(currentCoin.price * currentCoin.amount).toFixed(8)}} </h5></div>
      <div v-if="switchUSD"><h5><span style="color:#64b5f6">  {{currentCoin.name}}/USD: </span>${{((currentCoin.price * priceMainCoin)).toFixed(2)}} </h5></div>
      <div v-if="!switchUSD"><h5><span style="color:#64b5f6"> {{currentCoin.name}}/{{mainCoin}}: </span>{{currentCoin.price}} </h5></div>
    </div>
    <div class="day-trading">
      <div>Starting Value: <v-chip color="yellow darken-1">{{getStartingValue.toFixed(8)}} {{mainCoin}}</v-chip> / <v-chip color="green">${{(priceMainCoin * getStartingValue).toFixed(2)}}</v-chip></div>

      <div>Current Estimated Value: <v-chip color="yellow darken-1">{{estimatedTotalPrice.toFixed(8)}} {{mainCoin}}</v-chip> / <v-chip color="green">${{(priceMainCoin * estimatedTotalPrice).toFixed(2)}}</v-chip></div>
    </div>
  </div>
</div>
</template>

<script>
const binance = require('node-binance-api');
const remote = require('electron').remote;
import { mapMutations, mapGetters } from 'vuex';

export default {
  name: 'main-menu',
  components: {},
  data() {
    return {
      currentCoin: { name: '', amount: 0, price: 0, percentChange: 0 },
      mainCoin: 'BTC',
      toggle_one: 0,
      priceMainCoin: 0,
      totalEstimatedValue: 0,
      valid: false,
      loading: false,
      switchUSD: false,
      apiKey: '',
      apiKeyRules: [v => !!v || 'API Key is required'],
      secret: '',
      secretRules: [v => !!v || 'Secret is required'],
      balances: null,
      balance: 0,
      priceTicker: null
    };
  },
  methods: {
    ...mapMutations(['setAPIKey', 'setSecret', 'setStartingValue']),
    changeCurrentCoin(name, amt) {
      let self = this;
      binance.websockets.terminate(
        this.currentCoin.name.toLocaleLowerCase() +
          this.mainCoin.toLocaleLowerCase() +
          '@ticker'
      );

      this.currentCoin.name = name;
      this.currentCoin.amount = amt;

      binance.websockets.prevDay(
        this.currentCoin.name + this.mainCoin,
        function(response) {
          self.currentCoin.price = response.bestBid;
          self.currentCoin.percentChange = response.percentChange;
        }
      );
    },
    getBalances() {
      let self = this;
      binance.balance(function(balances) {
        binance.websockets.terminate(
          self.currentCoin.name.toLocaleLowerCase() +
            self.mainCoin.toLocaleLowerCase() +
            '@ticker'
        );
        let newBalances = [];
        for (let balance in balances) {
          if (balances.hasOwnProperty(balance)) {
            if (balances[balance].available > 0) {
              newBalances.push({
                name: balance,
                amount: balances[balance].available
              });
            }
          }
        }
        newBalances.sort((a, b) => {
          return a.amount > b.amount ? 1 : b.amount > a.amount ? -1 : 0;
        });
        newBalances.reverse();
        self.balances = balances;
        self.currentCoin.name = newBalances[0].name;
        self.currentCoin.amount = newBalances[0].amount;
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
      let self = this;
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
      console.log(binance.websockets.subscriptions());
    },
    balance_update(data) {
      for (let obj of data.B) {
        let { a: asset, f: available, l: onOrder } = obj;
        if (available == '0.00000000') continue;
        this.balances[asset].available = available;
        this.balances[asset].onOrder = onOrder;
      }
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
      if (executionType == 'NEW') {
        if (orderStatus == 'REJECTED') {
          console.log('Order Failed! Reason: ' + data.r);
        }
        console.log(
          symbol +
            ' ' +
            side +
            ' ' +
            orderType +
            ' ORDER #' +
            orderId +
            ' (' +
            orderStatus +
            ')'
        );
        console.log('..price: ' + price + ', quantity: ' + quantity);
        return;
      }
      //NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED
      console.log(
        symbol +
          '\t' +
          side +
          ' ' +
          executionType +
          ' ' +
          orderType +
          ' ORDER #' +
          orderId
      );
    },
    startingValue() {}
  },
  computed: {
    ...mapGetters(['getAPIKey', 'getSecret', 'getStartingValue']),
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
        this.setStartingValue(total);
      }
      return total;
    }
  },
  created() {
    let self = this;
    binance.websockets.prevDay(this.mainCoin + 'USDT', function(response) {
      self.priceMainCoin = response.bestBid;
    });
    binance.options({
      APIKEY:
        this.getAPIKey,
      APISECRET:
        this.getSecret,
      recvWindow: 1200000,
    });
    this.getBalances();

    binance.prices(function(ticker) {
      self.priceTicker = ticker;
    });
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
  justify-content: space-between;
  align-items: center;
  align-items: center;
}

.details {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>
