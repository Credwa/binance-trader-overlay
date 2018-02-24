<template>
  <v-tabs fixed centered v-model="current_key">
    <v-snackbar
    :timeout="snackbarError.timeout"
    :top="snackbarError.y"
    v-model="snackbarError.status"
    :color="snackbarError.color"
    >
      {{ snackbarError.text }}
      <v-btn flat color="red" @click.native="snackbarError.status = false">Close</v-btn>
    </v-snackbar>
    <v-tabs-bar class="red lighten-1" dark>
      <v-tabs-slider class="yellow"></v-tabs-slider>
      <v-tabs-item
        v-for="tab in items"
        :key="tab"
        :href="tab"
      >
        {{ tab }}
      </v-tabs-item>
    </v-tabs-bar>
    <v-tabs-items>
      <v-tabs-content
        v-for="tab in items"
        :key="tab"
        :id="tab"
      >
        <v-card flat class="trade">
          <div class="sell">
            <div style="display:flex; flex-direction: row; justify-content: space-between"><h4>Sell {{currentCoin.name}}</h4> <p style="font-size:1em">{{currentCoin.name}} Balance: {{currentCoin.amount}}</p></div>
            <form>
              <v-text-field
                  :label="`Amount of ${currentCoin.name} to Trade`"
                  type="number"
                  :suffix="currentCoin.name"
                  v-model ="sellAmount"
                  required
                  step="1"
                  min="0" max="9999999.99999999"
              ></v-text-field>
              <div v-if="tab === 'Limit'">
                <v-text-field
                  label="Limit"
                  type="number"
                  :suffix="'BTC'"
                  v-model ="sellPrice"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                ></v-text-field>
              </div>

              <div v-if="tab === 'Market'">
                <v-text-field
                  label="Market"
                  type="number"
                  disabled
                  :suffix="'BTC'"
                  v-model ="currentCoin.price"
                ></v-text-field>
              </div>

              <div v-if="tab === 'Stop-Limit'">
                <v-text-field
                  label="Stop"
                  type="number"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                  value="0.00000000"
                  :suffix="'BTC'"
                  v-model="stopSell"
                ></v-text-field>
                <v-text-field
                  label="Limit"
                  type="number"
                  step="0.00000001"
                  :suffix="'BTC'"
                  min="0" max="9999999.99999999"
                  value="0.00000000"
                  v-model="limitSell"
                ></v-text-field>
              </div>

              <v-text-field
                label="Amount of BTC Gained (optional)"
                v-model="optTrade"
                type="number"
                step="0.00000001"
                min="0" max="9999999.99999999"
                :suffix="'BTC'"
              ></v-text-field>

              <div v-if="tab === 'Eliot-Order'">
                <v-text-field
                  label="Price"
                  type="number"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                  value="0.00000000"
                  :suffix="'BTC'"
                  v-model="currentCoin.price"
                  disabled
                ></v-text-field>
                <p class="body-1">Pre buy then set eliot order:</p>
                <v-radio-group v-model="buyRow" row>
                  <v-radio label="Off" value="radio-off" v-model="preBuy.off"></v-radio>
                  <v-radio label="Market" value="radio-market"  v-model="preBuy.market"></v-radio>
                  <v-radio label="Limit" value="radio-limit"  v-model="preBuy.limit"></v-radio>
                </v-radio-group>
                <v-text-field
                v-if="buyRow === 3"
                  :label="'Price per ' + currentCoin.name"
                  type="number"
                  :suffix="'BTC'"
                  v-model ="preOrderLimitBuyPrice"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                ></v-text-field>
                <v-text-field
                v-if="buyRow === 2 || buyRow === 3"
                  :label="`Amount of ${currentCoin.name} to Buy`"
                  type="number"
                  :suffix="currentCoin.name"
                  v-model="preOrderAmt"
                  step="1"
                  min="0" max="9999999.99999999"
              ></v-text-field>

                <p class="body-1">Set Risk Tolerance:</p>
                <v-radio-group v-model="row" row>
                  <v-radio label="1%" value="radio-1" v-model="trailPerc.one"></v-radio>
                  <v-radio label="2%" value="radio-2"  v-model="trailPerc.two"></v-radio>
                  <v-radio label="Custom Trail" value="radio-3"  v-model="trailPerc.custom"></v-radio>
                </v-radio-group>

                <v-text-field
                class="customTrail"
                v-if="row === 'customVal'"
                  label="Percent"
                  type="number"
                  step="0.1"
                  min="0" max="10"
                  value="0.0"
                  :suffix="'%'"
                  v-model="trailPerc.customVal"
                ></v-text-field>

                <v-checkbox label="Gain % Protection" v-model="gainPercProtection" light ></v-checkbox>
                <v-text-field class="customTrail"
                style="min-width:65%"
                v-if="gainPercProtection"
                  step="0.1"
                  min="0" max="10"
                  value="0.0"
                  :suffix="'%'"
                  label="Gain Protection Percent"
                  type="numberl"
                  v-model="gainPercentProtection"
                ></v-text-field>

                <v-checkbox label="Subscribe to Eliot-Order updates for this coin" v-model="emailSub" light></v-checkbox>
                <p v-if="emailSub" style="color:red">Check spam for updates!*</p>
                <v-text-field
                v-if="emailSub"
                  label="Email"
                  type="email"
                  v-model="email"
                ></v-text-field>
              </div>

            </form>
            <v-btn class="red" @click="placesellOrder(tab)"> <span v-if="current_key !== 'Eliot-Order'">Sell {{currentCoin.name}}</span> <Span v-else>Set Eliot Order {{currentCoin.name}}</Span></v-btn>
            <v-btn v-if="current_key === 'Eliot-Order'" class="blue" @click="viewEliotOrders" >View Eliot Orders</v-btn>
          </div>
        </v-card>
      </v-tabs-content>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
const binance = require('node-binance-api');
import { mapMutations, mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
export default {
  props: ['currentCoin'],
  data() {
    return {
      gainPercProtection: false,
      gainPercentProtection: 0,
      emailSub: false,
      email: null,
      buyRow: 1,
      preBuy: {
        off: 1,
        market: 2,
        limit: 3
      },
      preOrderAmt: 0,
      preOrderLimitBuyPrice: 0,
      row: 1,
      preLimitBuy: false,
      preMarketBuy: false,
      trailPerc: {
        one: 1,
        two: 2,
        custom: 'customVal',
        customVal: 3
      },
      current_key: 'Limit',
      items: ['Limit', 'Market', 'Stop-Limit', 'Eliot-Order'],
      sellAmount: 0,
      stopSell: parseFloat(0).toFixed(8),
      limitSell: parseFloat(0).toFixed(8),
      trailingSellPercentage: 1,
      trailingSellStopPrice: 0,
      balance: 0,
      active: null,
      loading: false,
      complete: false,
      sellPrice: null,
      optTrade: null,
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
  watch: {
    optTrade: function(newVal, oldVal) {
      if (this.current_key === 'Limit' && this.sellPrice > 0) {
        if (Number(newVal) > Number(this.currentCoin.amount * this.sellPrice)) {
          this.optTrade = this.currentCoin.amount * this.sellPrice;
        } else {
          this.sellAmount = (this.optTrade / this.sellPrice).toFixed(8);
        }
      } else if (
        this.current_key === 'Market' ||
        this.current_key === 'Eliot-Order'
      ) {
        this.sellAmount = (this.optTrade / this.currentCoin.price).toFixed(8);
      } else if (this.current_key === 'Stop-Limit' && this.limitSell) {
        if (Number(newVal) > Number(this.currentCoin.amount * this.limitSell)) {
          this.optTrade = this.currentCoin.amount * this.limitSell;
        } else {
          this.sellAmount = (this.optTrade / this.limitSell).toFixed(8);
        }
      }
    },
    sellAmount: function(newAmt, oldAmt) {
      if (Number(newAmt) > Number(this.currentCoin.amount)) {
        this.sellAmount = this.currentCoin.amount;
      } else {
        if (this.current_key === 'Limit' && this.sellPrice > 0) {
          this.optTrade = (this.sellAmount * this.sellPrice).toFixed(8);
        } else if (
          this.current_key === 'Market' ||
          this.current_key === 'Eliot-Order'
        ) {
          this.optTrade = (this.sellAmount * this.currentCoin.price).toFixed(8);
        } else if (this.current_key === 'Stop-Limit' && this.limitSell) {
          this.optTrade = (this.sellAmount * this.limitSell).toFixed(8);
        }
      }
    },
    sellPrice: function(newPrice, oldPrice) {
      if (this.current_key === 'Limit') {
        this.optTrade = this.sellAmount * this.sellPrice;
      }
    },
    limitSell: function(newPrice, oldPrice) {
      if (this.current_key === 'Stop-Limit') {
        this.sellAmount = this.optTrade / this.limitSell;
      }
    }
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
    viewEliotOrders() {
      this.$router.push('active-eliot-orders');
    },
    placesellOrder(type) {
      this.loading = true;
      let self = this;
      if (type === 'Market') {
        binance.marketSell(
          this.currentCoin.name + 'BTC',
          this.sellAmount,
          function(resp) {
            if (resp.msg) {
              self.snackbarError.text = resp.msg;
              self.snackbarError.status = true;
            } else {
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
          this.currentCoin.name + 'BTC',
          this.sellAmount,
          this.sellPrice,
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
        binance.sell(
          this.currentCoin.name + 'BTC',
          this.sellAmount,
          this.limitSell,
          { stopPrice: this.stopSell, type: 'TAKE_PROFIT_LIMIT' },
          function(resp) {
            if (resp.msg) {
              self.snackbarError.text = resp.msg;
              self.snackbarError.status = true;
            } else {
              self.loading = false;
              self.complete = true;
              setTimeout(() => {
                self.complete = false;
              }, 3000);
              self.traded = resp;
            }
          }
        );
      } else if (type === 'Eliot-Order') {
        let data = {
          APIKEY: this.getAPIKey,
          APISECRET: this.getSecret,
          initialPrice: this.currentCoin.price,
          trailingSellStopPrice: this.calculatedInitialStopPrice,
          amount: this.sellAmount,
          symbol: this.currentCoin.name,
          trail: this.row === 'customVal' ? this.trailPerc.customVal : this.row,
          gainProtection: this.gainPercentProtection,
          email: this.email,
          preBuy:
            this.buyRow === 1
              ? null
              : this.preOrderAmt > 0
                ? {
                    amount: this.preOrderAmt,
                    price: this.preOrderLimitBuyPrice
                  }
                : null
        };
        self.$socket.emit('trailing_sell', data);
      }
      setTimeout(() => {
        this.errorMessage = 'Failed to sell';
        this.loading = false;
      }, 5000);
      this.sellAmount = 0;
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
    calculatedInitialStopPrice() {
      let trail = 0;
      if (this.row === 'customVal') {
        trail = this.trailPerc.customVal;
      } else {
        trail = this.row;
      }
      return (this.currentCoin.price * (1 - trail / 100)).toFixed(8);
    }
  },
  created() {
    this.sellPrice = this.currentCoin.price;
    this.limitSell = this.currentCoin.price;
  }
};
</script>

<style scoped>
.trade {
  display: flex;
  justify-content: space-around;
}

.sell {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1em;
}

.customTrail {
  max-width: 25%;
  margin: auto;
}
</style>

