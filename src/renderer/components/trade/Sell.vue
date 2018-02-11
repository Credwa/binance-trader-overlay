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
                <p class="body-1">Trailing Stop Percentage Select:</p>
                <v-radio-group v-model="row" row>
                  <v-radio label="1%" value="radio-1" v-model="trailPerc.one"></v-radio>
                  <v-radio label="2%" value="radio-2"  v-model="trailPerc.two"></v-radio>
                  <v-radio label="Custom Trail" value="radio-3"  v-model="trailPerc.custom"></v-radio>
                </v-radio-group>
                <v-text-field
                v-if="row === 'custom'"
                  label="Percent"
                  type="number"
                  step="0.1"
                  min="0" max="10"
                  value="0.0"
                  :suffix="'%'"
                  v-model="customTrailPerc"
                ></v-text-field>

                <v-checkbox label="Subscribe to Eliot-Order updates for this coin" v-model="emailSub" light></v-checkbox>
                <v-text-field
                v-if="emailSub"
                  label="Email"
                  type="email"
                ></v-text-field>
              </div>

            </form>
            <v-btn class="red" style="color:#fff" @click="placesellOrder(tab)">sell {{getCurrentCoin.name}}</v-btn>
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
      emailSub: false,
      row: null,
      trailPerc: {
        one: 1,
        two: 2,
        custom: 'custom'
      },
      customTrailPerc: 3,
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
      } else if (this.current_key === 'Market' || this.current_key === 'Eliot-Order') {
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
        } else if (this.current_key === 'Market' || this.current_key === 'Eliot-Order') {
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
    placesellOrder(type) {
      this.loading = true;
      let self = this;
      if (type === 'Market') {
        binance.marketsell(
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
          initialPrice: this.getMarketPrice,
          trailingSellStopPrice: this.calculatedInitialStopPrice,
          amount: this.sellAmount,
          trail: this.trailingSellPercentage
        };
        binance.sell(
          this.currentCoin.name + 'BTC',
          this.sellAmount,
          this.getMarketPrice * 150,
          { stopPrice: this.getMarketPrice * 100, type: 'TAKE_PROFIT_LIMIT' },
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
              self.$socket.emit('trailing_sell', { ...data, ...resp });
            }
          }
        );
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
      return (
        this.currentCoin.price *
        (1 - this.trailingSellPercentage / 100)
      ).toFixed(8);
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
</style>

