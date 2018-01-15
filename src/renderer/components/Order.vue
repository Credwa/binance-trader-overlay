<template>
  <v-expansion-panel expand >
    <v-expansion-panel-content style="background-color: rgba(0, 0, 0, .1); color: white">
      <div slot="header">Orders</div>
       <v-card dark style="background-color: rgba(0,0,0,.01)">
        <v-card-title>
          <v-switch v-model="switchUSD" style="color:white; top:12px; margin-left:2vw" name="showUSD"></v-switch>
          <v-spacer></v-spacer>
          <v-icon @click="refreshPrices" v-if="!refreshing && !refreshed" class="refresh-button" style="color:#42a5f5; font-size: 2em">refresh</v-icon>
          <v-progress-circular v-if="refreshing && !refreshed"  indeterminate color="primary"></v-progress-circular>
          <v-icon v-if="refreshed"  style="color:#42a5f5; font-size: 2em">done</v-icon>
          <v-spacer></v-spacer>
          <v-text-field
            append-icon="search"
            label="Search"
            single-line
            hide-details
            v-model="search"
          ></v-text-field>
        </v-card-title>
        <v-data-table dark
            v-bind:headers="headers"
            v-bind:items="orders"
            v-bind:search="search"
            no-data-text="No orders found"
            style="background-color: rgba(0,0,0,.1)"
            item-key="orderId"
            default-sort="date"
            :pagination.sync="pagination"
            :total-items="totalItems"
          >
          <template slot="items" slot-scope="props">
            <tr class="a-row" @click="showCurrentGainLoss(props.item.symbol); props.expanded = !props.expanded" :style="props.item.status === 'NEW' ? 'background-color:rgba(47, 139, 206, .2)' : (props.item.freshOrder) === true ? 'background-color:rgba(37, 196, 53,.2)' : 0">
            <td  class="text-xs-center">{{ props.item.symbol }} </td>
            <td  class="text-xs-center">{{ props.item.price }}</td>
            <td  class="text-xs-center">{{ props.item.origQty }}</td>
            <td  v-if="!switchUSD" class="text-xs-center">
              <span :style="(parseFloat((symbolPrices[props.item.symbol]*props.item.origQty) - (props.item.price * props.item.origQty))).toFixed(8) > 0 ? 'color:#4caf50' : 'color: #f9a825'">
                {{ (parseFloat((symbolPrices[props.item.symbol]*props.item.origQty) - (props.item.price * props.item.origQty))).toFixed(8) }}
              </span>
            </td>
            <td  v-if="switchUSD" class="text-xs-center">
              <span v-if="parseFloat((symbolPrices[props.item.symbol] * props.item.origQty) -(props.item.price * props.item.origQty)).toFixed(2) > 0" style="color:#4caf50 ">

                ${{ (parseFloat((symbolPrices[props.item.symbol]*props.item.origQty) - (props.item.price * props.item.origQty)) * priceMainCoin).toFixed(2) }}
              </span>

                <span v-else style="color:#f9a825 ">

                -${{ parseFloat((symbolPrices[props.item.symbol] * props.item.origQty) - (props.item.price * props.item.origQty) * priceMainCoin).toFixed(2)* -1 }}

              </span>
            </td>
            <td  class="text-xs-center" :style="props.item.side === 'BUY' ? 'color:green' : 'color:red'">{{ props.item.side  }}/<span :style="props.item.type === 'MARKET' ? 'color:#81d4fa' : (props.item.type === 'LIMIT' ? 'color: #ffd54f' : 'color:#9ccc65')">{{props.item.type}}</span></td>
            <td  class="text-xs-center">{{ props.item.status }}</td>
            <td  class="text-xs-center">{{ props.item.time | formatDate }}</td>
            </tr>
          </template>
          <template slot="expand" slot-scope="props" >
            <v-card flat>
              <v-card-text class="subbedData" v-if="!switchUSD">
                <div>
                <span>24Hr: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'">{{subbedSymbolData.priceChange}} ({{subbedSymbolData.percentChange}}%)</span></span>
                <span>AvgPrice: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> {{subbedSymbolData.averagePrice}} </span></span>
                <span>Best Ask: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> {{subbedSymbolData.bestAsk}} </span></span>
                <span>Best Bid: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> {{subbedSymbolData.bestBid}} </span></span>
                </div>

                <div>
                <span>High: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> {{subbedSymbolData.high}} </span></span>
                <span>Low: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> {{subbedSymbolData.low}} </span></span>
                <span>Active Gain/Loss: <span :style="(parseFloat((subbedSymbolData.bestAsk *props.item.origQty) - (props.item.price * props.item.origQty))).toFixed(8) > 0 ? 'color:#4caf50' : 'color: #f9a825'">
                {{ (parseFloat((subbedSymbolData.bestAsk*props.item.origQty) - (props.item.price * props.item.origQty))).toFixed(8) }}
              </span></span>
              </div>
              </v-card-text>
              <v-card-text class="subbedData" v-else>
                <div>
                <span>24Hr: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'">${{(subbedSymbolData.priceChange * priceMainCoin).toFixed(2)}} ({{subbedSymbolData.percentChange}}%)</span></span>
                <span>AvgPrice: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'">${{(subbedSymbolData.averagePrice * priceMainCoin).toFixed(2)}} </span></span>
                <span>Best Ask: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.bestAsk * priceMainCoin).toFixed(2)}} </span></span>
                <span>Best Bid: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.bestBid * priceMainCoin).toFixed(2)}} </span></span>
                </div>

                <div>
                <span>High: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.high * priceMainCoin).toFixed(2)}} </span></span>
                <span>Low: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.low * priceMainCoin).toFixed(2)}} </span></span>
                <span>Active Gain/Loss: <span :style="(parseFloat((subbedSymbolData.bestAsk *props.item.origQty) - (props.item.price * props.item.origQty))).toFixed(2) > 0 ? 'color:#4caf50' : 'color: #f9a825'">
                ${{ (parseFloat((subbedSymbolData.bestAsk*props.item.origQty) - (props.item.price * props.item.origQty)) * priceMainCoin).toFixed(2) }}
              </span></span>
              </div>
              </v-card-text>
            </v-card>
          </template>
        </v-data-table>
      </v-card>
    </v-expansion-panel-content>
  </v-expansion-panel>

</template>

<script>
import moment from 'moment';
const binance = require('node-binance-api');
import { mapMutations, mapGetters } from 'vuex';

export default {
  props: ['orders', 'priceMainCoin'],
  data() {
    return {
      max25chars: v => v.length <= 25 || 'Input too long!',
      tmp: '',
      search: '',
      moment: moment,
      totalItems: 0,
      switchUSD: false,
      refreshing: false,
      currentSubSymbol: '',
      subbedSymbolData: {},
      refreshed: false,
      pagination: {},
      symbolPrices: {},
      sum: 0,
      selected: [],
      headers: [
        { text: 'Symbol', align: 'center', value: 'symbol' },
        { text: 'Price', align: 'center', value: 'price' },
        { text: 'origQty', align: 'center', value: 'origQty' },
        { text: 'Gain/Loss', align: 'center', value: 'gain/loss' },
        { text: 'Type', align: 'center', value: 'side' },
        { text: 'Status', align: 'center', value: 'status' },
        { text: 'Date', align: 'center', value: 'date' }
      ]
    };
  },
  filters: {
    formatDate(time) {
      return moment(time).format('YYYY-MMM-DD hh:mm:ss');
    }
  },
  methods: {
    showCurrentGainLoss(symbol) {
      let self = this;
      binance.websockets.terminate(
        this.currentSubSymbol.toLocaleLowerCase() + '@ticker'
      );

      this.currentSubSymbol = symbol;

      binance.websockets.prevDay(this.currentSubSymbol, function(response) {
        self.subbedSymbolData = response;
      });
    },
    refreshPrices() {
      this.refreshing = true;
      let self = this;
      binance.prices(function(ticker) {
        self.symbolPrices = ticker;
        self.refreshing = false;
        self.refreshed = true;
        setTimeout(() => {
          self.refreshed = false;
        }, 1000);
      });
    }
  },
  computed: {
    ...mapGetters(['getAPIKey', 'getSecret']),
    pages() {
      return this.pagination.rowsPerPage
        ? Math.ceil(this.orders.length / this.pagination.rowsPerPage)
        : 0;
    }
  },
  created() {
    let self = this;
    binance.options({
      APIKEY:
        this.getAPIKey,
      APISECRET:
        this.getSecret,
      recvWindow: 1200000,
      reconnect: false
    });

    binance.prices(function(ticker) {
      self.symbolPrices = ticker;
    });
  }
};
</script>

<style>
i {
  cursor: pointer;
}
.a-row {
  cursor: pointer;
}

.a-row:hover {
  background-color: red;
  box-shadow: 1px 1px 1px 1px;
}

.a-row:active {
  color: pink;
  box-shadow: 1px 1px 1px 1px;
}

.subbedData {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

.subbedData div {
  display: flex;
  flex-direction: column;
}
</style>
