<template>
  <div id="trade">
  <v-card>
    <div class="topIcons">
      <v-icon light large style="cursor:pointer" @click="goBack">keyboard_arrow_left</v-icon>
      <v-spacer></v-spacer>
      <v-icon light large style="cursor:pointer" class="drag">drag_handle</v-icon>
      <v-spacer></v-spacer>
      <v-icon light large style="cursor:pointer" class="remove" @click="hideMenu">remove</v-icon>
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
    <v-snackbar
    :timeout="snackbarError.timeout"
    :top="snackbarError.y"
    v-model="snackbarError.status"
    :color="snackbarError.color"
    >
      {{ snackbarError.text }}
      <v-btn flat color="red" @click.native="snackbarError.status = false">Close</v-btn>
    </v-snackbar>
    <v-tabs v-model="active" v-if="!this.loading && !this.complete">
      <span style="color:red; display:flex; justify-content:center;" v-if="errorMessage">{{errorMessage}}</span>
      <v-tabs-bar class="green darken-3" dark>
        <v-tabs-item
          v-for="tab in tabs"
          :key="tab"
          :href="'#' + tab"
          ripple
        >
        {{tab}}
        </v-tabs-item>
        <v-tabs-slider color="yellow"></v-tabs-slider>
      </v-tabs-bar>
      <v-tabs-items>
        <v-tabs-content
          v-for="tab in tabs"
          :key="tab"
          :id="tab"
        >
          <v-card flat class="trade">
            <div class="buy">
              <div style="display:flex; flex-direction: row; justify-content: space-between"><h4>Buy {{getCurrentCoin.name}}</h4> <p style="font-size:1em">{{'BTC'}} Balance: {{getBalanceMainCoin}}</p></div>
            <form>
              <v-text-field v-if="tab === 'Limit'"
                label="Limit"
                type="number"
                :suffix="'BTC'"
                v-model ="buyPrice"
                step="0.00000001"
                min="0" max="9999999.99999999"
              ></v-text-field>
              <v-text-field v-if="tab === 'Market'"
                label="Market"
                type="number"
                disabled
                :suffix="'BTC'"
                v-model ="getMarketPrice"
              ></v-text-field>
              <v-text-field v-if="tab === 'Stop-Limit'"
                label="Stop"
                type="number"
                step="0.00000001"
                min="0" max="9999999.99999999"
                value="0.00000000"
                :suffix="'BTC'"
                v-model="stopBuy"
              ></v-text-field>
              <v-text-field v-if="tab === 'Stop-Limit'"
                label="Limit"
                type="number"
                 step="0.00000001"
                :suffix="'BTC'"
                min="0" max="9999999.99999999"
                value="0.00000000"
                v-model="limitBuy"
              ></v-text-field>
              <v-text-field
                label="Amount"
                v-model="buyAmount"
                type="number"
                step="1"
                min="0" max="9999999.99999999"
                :error-messages="buyAmountErrors"
                @input="$v.buyAmount.$touch()"
                @blur="$v.buyAmount.$touch()"
                required
                :suffix="getCurrentCoin.name"
              ></v-text-field>
              <div class="percentage-trade">
                <v-btn  outline color="indigo" v-for="percent in buttonTradePercentages" :key="percent" @click="percentBuyAmount(percent/100)">{{percent}}%</v-btn>
              </div>



            </form>
              <v-btn class="green darken-2" style="color:#fff" @click="placeBuyOrder(tab)">Buy {{getCurrentCoin.name}}</v-btn>
            </div>
            <div class="sell">
              <div style="display:flex; flex-direction: row; justify-content: space-between"><h4>Sell {{getCurrentCoin.name}}</h4> <p style="font-size:1em">{{getCurrentCoin.name}} Balance: {{getCurrentCoin.amount}}</p></div>
              <form>
                <v-text-field v-if="tab === 'Limit'"
                  label="Limit"
                  type="number"
                  :suffix="'BTC'"
                  v-model ="sellPrice"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                ></v-text-field>
                <v-text-field v-if="tab === 'Market'"
                  label="Market"
                  type="number"
                  disabled
                  :suffix="'BTC'"
                  v-model ="getMarketPrice"
                ></v-text-field>
                <v-text-field v-if="tab === 'Stop-Limit'"
                  label="Stop"
                  type="number"
                  :suffix="'BTC'"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                  value="0.00000000"
                  v-model="stopSell"
                ></v-text-field>
                <v-text-field v-if="tab === 'Stop-Limit'"
                  label="Limit"
                  type="number"
                  :suffix="'BTC'"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                  value="0.00000000"
                  v-model="limitSell"
                ></v-text-field>
                <v-text-field
                  label="Amount"
                  v-model="sellAmount"
                  type="number"
                  step="1"
                  min="0" max="9999999.99999999"
                  :suffix="getCurrentCoin.name"
                  :error-messages="sellAmountErrors"
                  @input="$v.sellAmount.$touch()"
                  @blur="$v.sellAmount.$touch()"
                  required
                ></v-text-field>
                <div class="percentage-trade">
                  <v-btn  outline color="indigo" v-for="percent in buttonTradePercentages" :key="percent" @click="percentSellAmount(percent/100)">{{percent}}%</v-btn>
                </div>
              </form>
              <v-btn class="pink accent-3" style="color:#fff" @click="placeSellOrder(tab)">Sell {{getCurrentCoin.name}}</v-btn>
            </div>
          </v-card>
        </v-tabs-content>
      </v-tabs-items>
    </v-tabs>
    <div v-if="loading && !complete" style="display:flex; justify-content:center; align-items:center; align-content:center"><v-progress-circular indeterminate v-bind:size="120" v-bind:width="7" color="blue"></v-progress-circular></div>

    <div v-if="complete && !loading" style="display:flex; flex-direction: column;justify-content:center; align-items:center; align-content:center; color:#42a5f5">

      <v-icon light large style="color:blue; font-size: 5em">done</v-icon>
      <div style="display:flex; flex-direction:row"><h2>{{traded.type}}</h2></div>
      <div style="display:flex; flex-direction:row">{{traded.side}}: {{traded.origQty}} </div>
      <div style="display:flex; flex-direction:row">At Price: {{traded.price}} BTC </div>
      <div style="display:flex; flex-direction:row">Total Price: {{traded.origQty * traded.price}} BTC</div>
      <div style="display:flex; flex-direction:row;">Total Price USD: <span style="color:green">${{((traded.origQty * traded.price)*getPriceMainCoin).toFixed(2)}}</span></div>

    </div>
  </v-card>
  </div>
</template>

<script>
const binance = require('node-binance-api');
import { mapMutations, mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {
  mixins: [validationMixin],
  validations: {
    sellAmount: { required },
    buyAmount: { required }
  },
  data() {
    return {
      tabs: ['Limit', 'Market', 'Stop-Limit'],
      buyAmount: 0,
      sellAmount: 0,
      stopSell: parseFloat(0).toFixed(8),
      stopBuy: parseFloat(0).toFixed(8),
      limitSell: parseFloat(0).toFixed(8),
      limitBuy: parseFloat(0).toFixed(8),
      balance: 0,
      active: null,
      loading: false,
      complete: false,
      buyPrice: null,
      sellPrice: null,
      buttonTradePercentages: [25, 50, 75, 100],
      traded: {},
      snackbar: {
        status: false,
        y: 'top',
        x: null,
        mode: '',
        timeout: 3000,
        text: '',
        color: 'red lighten-4'
      },
      snackbarError: {
        status: false,
        y: 'top',
        x: null,
        mode: '',
        timeout: 3000,
        text: '',
        color: 'red lighten-6'
      },
      errorMessage: null
    };
  },
  methods: {
    ...mapMutations([
      'setPriceMainCoin',
      'setNewOrder',
      'setOrderChange',
      'setOrderFailed',
      'setCurrentCoin',
      'setCurrentCoinPrice',
      'setBalanceMainCoin'
    ]),
    hideMenu() {
      let currWindow = this.$electron.remote.getCurrentWindow();
      currWindow.minimize();
    },
    goBack() {
      let loginWindow = this.$electron.remote.getCurrentWindow();
      let screenSize = this.$electron.screen.getPrimaryDisplay().size;
      let newWindowWidth = Math.floor(screenSize.width / 4.5);
      let newWindowHeight = Math.floor(screenSize.height / 1.5);
      loginWindow.setAlwaysOnTop(true);
      loginWindow.setPosition(
        screenSize.width - newWindowWidth,
        screenSize.height - newWindowHeight - 100
      );
      loginWindow.setSize(newWindowWidth, newWindowHeight);
      window.history.go(-1);
    },
    percentSellAmount(percent) {
      this.sellAmount = Math.floor(
        (this.getCurrentCoin.amount * percent).toFixed(2)
      );
    },
    percentBuyAmount(percent) {
      this.buyAmount = Math.floor(
        (
          parseFloat(this.getBalanceMainCoin) /
          parseFloat(this.getCurrentCoinPrice) *
          percent
        ).toFixed(2)
      );
    },
    placeBuyOrder(type) {
      this.loading = true;
      let self = this;
      if (type === 'Market') {
        binance.marketBuy(
          this.getCurrentCoin.name + 'BTC',
          this.buyAmount,
          function(resp) {
            if (resp.msg) {
              self.snackbarError.text = resp.msg;
              self.snackbarError.status = true;
            } else {
              console.log(resp);
              self.loading = false;
              self.complete = true;
              setTimeout(() => {
                self.complete = false;
              }, 3000);
              self.traded = resp;
            }
          }
        );
      } else if (type === 'Limit') {
        binance.buy(
          this.getCurrentCoin.name + 'BTC',
          this.buyAmount,
          this.buyPrice,
          { type: 'LIMIT' },
          (error, response) => {
            self.loading = false;
            if (error.msg) {
              self.snackbarError.text = error.msg;
              self.snackbarError.status = true;
            } else {
              self.complete = true;
              setTimeout(() => {
                self.complete = false;
              }, 3000);
              self.traded = error;
            }
          }
        );
      } else if (type === 'Stop-Limit') {
        binance.buy(
          this.getCurrentCoin.name + 'BTC',
          this.buyAmount,
          this.limitBuy,
          { stopPrice: this.stopBuy, type: 'TAKE_PROFIT_LIMIT' },
          function(resp) {
            if (resp.msg) {
              self.snackbarError.text = resp.msg;
              self.snackbarError.status = true;
            } else {
              console.log(resp);
              self.loading = false;
              self.complete = true;
              setTimeout(() => {
                self.complete = false;
              }, 3000);
              self.traded = resp;
            }
          }
        );
      }
      setTimeout(() => {
        this.errorMessage = 'Failed to Buy';
        this.loading = false;
      }, 10000);
      this.buyAmount = 0;
    },
    placeSellOrder(type) {
      this.loading = true;
      let self = this;
      if (type === 'Market') {
        binance.marketSell(
          this.getCurrentCoin.name + 'BTC',
          this.sellAmount,
          function(resp) {
            if (resp.msg) {
              self.snackbarError.text = resp.msg;
              self.snackbarError.status = true;
            } else {
              console.log(resp);
              self.loading = false;
              self.complete = true;
              setTimeout(() => {
                self.complete = false;
              }, 3000);
              self.traded = resp;
            }
          }
        );
      } else if (type === 'Limit') {
        binance.sell(
          this.getCurrentCoin.name + 'BTC',
          this.sellAmount,
          this.sellPrice,
          { type: 'LIMIT' },
          function(resp) {
            if (resp.msg) {
              self.snackbarError.text = resp.msg;
              self.snackbarError.status = true;
            } else {
              console.log(resp);
              self.loading = false;
              self.complete = true;
              setTimeout(() => {
                self.complete = false;
              }, 3000);
              self.traded = resp;
            }
          }
        );
      } else if (type === 'Stop-Limit') {
        binance.sell(
          this.getCurrentCoin.name + 'BTC',
          this.sellAmount,
          this.limitSell,
          { stopPrice: this.stopSell, type: 'TAKE_PROFIT_LIMIT' },
          function(resp) {
            if (resp.msg) {
              self.snackbarError.text = resp.msg;
              self.snackbarError.status = true;
            } else {
              console.log(resp);
              self.loading = false;
              self.complete = true;
              setTimeout(() => {
                self.complete = false;
              }, 3000);
              self.traded = resp;
            }
          }
        );
      }
      setTimeout(() => {
        this.loading = false;
      }, 5000);
      this.sellAmount = 0;
    },
    balance_update(data) {
      for (let obj of data.B) {
        let { a: asset, f: available, l: onOrder } = obj;
        if (available == '0.00000000') continue;
        if (asset === this.mainCoin) {
          this.setBalanceMainCoin(available);
        }
        if (asset === this.getCurrentCoin.name) {
          this.setCurrentCoin({
            name: asset,
            amount: available
          });
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
      'getCurrentCoinPrice',
      'getBalanceMainCoin',
      'getPriceMainCoin'
    ]),
    sellAmountErrors() {
      const errors = [];
      if (!this.$v.sellAmount.$dirty) return errors;
      !this.$v.sellAmount.required && errors.push('Amount to sell is required');
      return errors;
    },
    buyAmountErrors() {
      const errors = [];
      if (!this.$v.buyAmount.$dirty) return errors;
      !this.$v.buyAmount.required && errors.push('Amount to buy is required');
      return errors;
    },
    getMarketPrice() {
      this.buyPrice = this.getCurrentCoinPrice;
      this.sellPrice = this.getCurrentCoinPrice;
      return this.getCurrentCoinPrice;
    }
  },
  created() {
    binance.options({
      APIKEY: this.getAPIKey,
      APISECRET: this.getSecret,
      useServerTime: true,
      reconnect: false
    });
    binance.websockets.userData(this.balance_update, this.execution_update);
  }
};
</script>

<style scoped>
#trade {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 40vw;
}
.trade {
  display: flex;
  justify-content: space-around;
}
.buy,
.sell {
  display: flex;
  flex-direction: column;
  width: 50%;
  padding: 1em;
}
.buy {
  border-right: 0.5px solid #eee;
}

.percentage-trade {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
}

.percentage-trade button {
  max-width: 1em;
}

.topIcons {
  display: flex;
  align-content: space-between;
  justify-content: space-between;
  flex-direction: row;
  margin-top: 1%;
  margin-left: 2%;
}
.drag {
  -webkit-app-region: drag;
}
</style>
