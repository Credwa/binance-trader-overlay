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
    <v-tabs-bar class="green" dark>
      <v-tabs-slider class="purple"></v-tabs-slider>
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
          <div class="buy">
            <div style="display:flex; flex-direction: row; justify-content: space-between"><h4>Buy {{currentCoin.name}}</h4> <p style="font-size:1em">{{'BTC'}} Balance: {{getBalanceMainCoin}}</p></div>
            <form>
              <v-text-field
                  label="Amount of BTC to Trade (optional)"
                  type="number"
                  :suffix="'BTC'"
                  v-model ="optTrade"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
              ></v-text-field>
              <div v-if="tab === 'Limit'">
                <v-text-field
                  label="Limit"
                  type="number"
                  :suffix="'BTC'"
                  v-model ="buyPrice"
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
                  v-model="stopBuy"
                ></v-text-field>
                <v-text-field
                  label="Limit"
                  type="number"
                  step="0.00000001"
                  :suffix="'BTC'"
                  min="0" max="9999999.99999999"
                  value="0.00000000"
                  v-model="limitBuy"
                ></v-text-field>
              </div>

              <v-text-field
                label="Amount"
                v-model="buyAmount"
                type="number"
                step="1"
                min="0" max="9999999.99999999"
                required
                :suffix="currentCoin.name"
              ></v-text-field>
            </form>
            <v-btn class="green darken-2" style="color:#fff" @click="placeBuyOrder(tab)">Buy {{currentCoin.name}}</v-btn>
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
      current_key: 'Limit',
      items: ['Limit', 'Market', 'Stop-Limit'],
      buyAmount: 0,
      stopBuy: parseFloat(0).toFixed(8),
      limitBuy: parseFloat(0).toFixed(8),
      balance: 0,
      active: null,
      loading: false,
      complete: false,
      buyPrice: null,
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
      if (Number(newVal) > Number(this.getBalanceMainCoin)) {
        this.optTrade = this.getBalanceMainCoin;
      } else {
        if (this.current_key === 'Limit' && this.buyPrice > 0) {
          this.buyAmount = (this.optTrade / this.buyPrice).toFixed(8);
        } else if (this.current_key === 'Market') {
          this.buyAmount = (this.optTrade / this.currentCoin.price).toFixed(8);
        } else if (this.current_key === 'Stop-Limit' && this.limitBuy) {
          this.buyAmount = (this.optTrade / this.limitBuy).toFixed(8);
        }
      }
    },
    buyAmount: function(newAmt, oldAmt) {
      if (this.current_key === 'Limit' && this.buyPrice > 0) {
        this.optTrade = (this.buyAmount * this.buyPrice).toFixed(8);
      } else if (this.current_key === 'Market') {
        this.optTrade = (this.buyAmount * this.currentCoin.price).toFixed(8);
      } else if (this.current_key === 'Stop-Limit' && this.limitBuy) {
        this.optTrade = (this.buyAmount * this.limitBuy).toFixed(8);
      }
    },
    buyPrice: function(newPrice, oldPrice) {
      if (this.current_key === 'Limit') {
        this.buyAmount = this.optTrade / this.buyPrice;
      }
    },
    limitBuy: function(newPrice, oldPrice) {
      if (this.current_key === 'Stop-Limit') {
        this.buyAmount = this.optTrade / this.limitBuy;
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
    placeBuyOrder(type) {
      this.loading = true;
      let self = this;
      if (type === 'Market') {
        binance.marketBuy(
          this.currentCoin.name + 'BTC',
          this.buyAmount,
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
        binance.buy(
          this.currentCoin.name + 'BTC',
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
          this.currentCoin.name + 'BTC',
          this.buyAmount,
          this.limitBuy,
          { stopPrice: this.stopBuy, type: 'TAKE_PROFIT_LIMIT' },
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
      }
      setTimeout(() => {
        this.errorMessage = 'Failed to Buy';
        this.loading = false;
      }, 5000);
      this.buyAmount = 0;
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
    ])
  },
  created() {
    this.buyPrice = this.currentCoin.price;
  }
};
</script>

<style scoped>
.trade {
  display: flex;
  justify-content: space-around;
}

.buy {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1em;
}
</style>

