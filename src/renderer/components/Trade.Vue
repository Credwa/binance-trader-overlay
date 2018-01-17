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
    <v-tabs v-model="active">
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
              <div style="display:flex; flex-direction: row; justify-content: space-between"><h4>Buy {{'CION'}}</h4> <p style="font-size:1em">{{'BTC'}} Balance:</p></div>
            <form>
              <v-text-field v-if="tab === 'Limit'"
                label="Limit"
                type="number"
                :suffix="'BTC'"
                v-model ="price"
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
                value="0.00000000"
                :suffix="'BTC'"
              ></v-text-field>
              <v-text-field v-if="tab === 'Stop-Limit'"
                label="Limit"
                type="number"
                :suffix="'BTC'"
                value="0.00000000"
              ></v-text-field>
              <v-text-field
                label="Amount"
                v-model="buyAmount"
                type="number"
                step="0.00000001"
                min="0" max="9999999.99999999"
                :error-messages="buyAmountErrors"
                @input="$v.buyAmount.$touch()"
                @blur="$v.buyAmount.$touch()"
                required
                :suffix="'coin'"
              ></v-text-field>
              <div class="percentage-trade">
                <v-btn  outline color="indigo" v-for="percent in buttonTradePercentages" :key="percent" @click="percentBuyAmount(percent/100)">{{percent}}%</v-btn>
              </div>



            </form>
              <v-btn class="green darken-2" style="color:#fff" @click="placeBuyOrder(tab)">Buy {{'coin'}}</v-btn>
            </div>
            <div class="sell">
              <div style="display:flex; flex-direction: row; justify-content: space-between"><h4>Sell {{'BTC'}}</h4> <p style="font-size:1em">{{'BTC'}} Balance:</p></div>
              <form>
                <v-text-field v-if="tab === 'Limit'"
                  label="Limit"
                  type="number"
                  :suffix="'BTC'"
                  v-model ="price"
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
                ></v-text-field>
                <v-text-field v-if="tab === 'Stop-Limit'"
                  label="Limit"
                  type="number"
                  :suffix="'BTC'"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                  value="0.00000000"
                ></v-text-field>
                <v-text-field
                  label="Amount"
                  v-model="sellAmount"
                  type="number"
                  step="0.00000001"
                  min="0" max="9999999.99999999"
                  :suffix="'coin'"
                  :error-messages="sellAmountErrors"
                  @input="$v.sellAmount.$touch()"
                  @blur="$v.sellAmount.$touch()"
                  required
                ></v-text-field>
                <div class="percentage-trade">
                  <v-btn  outline color="indigo" v-for="percent in buttonTradePercentages" :key="percent" @click="percentSellAmount(percent/100)">{{percent}}%</v-btn>
                </div>
              </form>
              <v-btn class="pink accent-3" style="color:#fff" @click="placeSellOrder(tab)">Sell {{'coin'}}</v-btn>
            </div>
          </v-card>
        </v-tabs-content>
      </v-tabs-items>
    </v-tabs>
  </v-card>
  </div>
</template>

<script>
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
      balance: 0,
      active: null,
      price: null,
      buttonTradePercentages: [25, 50, 75, 100]
    };
  },
  methods: {
    hideMenu() {
      let currWindow = this.$electron.remote.getCurrentWindow();
      currWindow.minimize();
    },
    goBack() {
      let loginWindow = this.$electron.remote.getCurrentWindow();
      let screenSize = this.$electron.screen.getPrimaryDisplay().size;
      let newWindowWidth = Math.floor(screenSize.width/4.5);
      let newWindowHeight = Math.floor(screenSize.height/1.5);
      loginWindow.setAlwaysOnTop(true);
      loginWindow.setPosition(
        screenSize.width - newWindowWidth,
        screenSize.height - newWindowHeight - 100
      );
      loginWindow.setSize(newWindowWidth, newWindowHeight);
      window.history.go(-1)
    }
    // percentSellAmount(percent) {
    //   // this.sellAmount = (this.getActiveTradeBalance.one * percent).toFixed(0);
    // },
    // percentBuyAmount(percent) {
    //   // this.buyAmount = ((this.getActiveTradeBalance.two / this.getActiveTradePrice) * percent).toFixed(0);
    // },
    // placeBuyOrder(type) {
    //   if (type === 'Market') {
    //     axios.get('http://localhost:3000/api/buy', {
    //       params: {
    //         type: 'Market',
    //         amount: this.buyAmount,
    //         trade: this.getActiveTrade.split('/').join(''),
    //       },
    //     })
    //     .then((data) => {
    //       console.log(data);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    //   } else if (type === 'Limit') {
    //     axios.get('http://localhost:3000/api/buy', {
    //       params: {
    //         type: 'Limit',
    //         price: this.price,
    //         amount: this.buyAmount,
    //         trade: this.getActiveTrade.split('/').join(''),
    //       },
    //     })
    //     .then((data) => {
    //       console.log(data);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    //   }
    // },
    // placeSellOrder(type) {
    //   if (type === 'Market') {
    //     axios.get('http://localhost:3000/api/sell', {
    //       params: {
    //         type: 'Market',
    //         amount: this.sellAmount,
    //         trade: this.getActiveTrade.split('/').join(''),
    //       },
    //     })
    //     .then((data) => {
    //       console.log(data);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    //   } else if (type === 'Limit') {
    //     axios.get('http://localhost:3000/api/sell', {
    //       params: {
    //         type: 'Limit',
    //         price: this.price,
    //         amount: this.sellAmount,
    //         trade: this.getActiveTrade.split('/').join(''),
    //       },
    //     })
    //     .then((data) => {
    //       console.log(data);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    //   }
    // },
  },
  computed: {
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
      this.price = this.getActiveTradePrice;
      return this.getActiveTradePrice;
    }
  }
};
</script>

<style scoped>
#trade {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 40vw;
  margin: 1em;
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
