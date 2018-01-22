<template>
       <v-card dark>
        <div class="topIcons">
          <v-icon dark large style="cursor:pointer" @click="goBack">keyboard_arrow_left</v-icon>
          <v-spacer></v-spacer>
          <v-icon dark large style="cursor:pointer" class="drag">drag_handle</v-icon>
          <v-spacer></v-spacer>
          <v-icon dark large style="cursor:pointer" class="remove" @click="hideMenu">remove</v-icon>
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
            :headers="headers"
            :items="getOrders"
            :search="search"
            no-data-text="No orders found"
            style="background-color: rgba(0,0,0,.1)"
            item-key="orderId"
            :disable-initial-sort="true"
            :customFilter="customFilter"
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

                ${{ (parseFloat((symbolPrices[props.item.symbol]*props.item.origQty) - (props.item.price * props.item.origQty)) * getPriceMainCoin).toFixed(2) }}
              </span>

                <span v-else style="color:#f9a825 ">

                -${{ parseFloat((symbolPrices[props.item.symbol] * props.item.origQty) - (props.item.price * props.item.origQty) * getPriceMainCoin).toFixed(2)* -1 }}

              </span>
            </td>
            <td  class="text-xs-center" :style="props.item.side === 'BUY' ? 'color:green' : 'color:red'">{{ props.item.side  }}</td>

            <td class="text-xs-center"><span :style="props.item.type === 'MARKET' ? 'color:#81d4fa' : (props.item.type === 'LIMIT' ? 'color: #ffd54f' : 'color:#9ccc65')">{{props.item.type}}</span></td>
            <td  class="text-xs-center">{{ props.item.status }}</td>
            <td  class="text-xs-center">{{ props.item.time }}</td>
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
                <span>24Hr: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'">${{(subbedSymbolData.priceChange * getPriceMainCoin).toFixed(2)}} ({{subbedSymbolData.percentChange}}%)</span></span>
                <span>AvgPrice: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'">${{(subbedSymbolData.averagePrice * getPriceMainCoin).toFixed(2)}} </span></span>
                <span>Best Ask: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.bestAsk * getPriceMainCoin).toFixed(2)}} </span></span>
                <span>Best Bid: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.bestBid * getPriceMainCoin).toFixed(2)}} </span></span>
                </div>

                <div>
                <span>High: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.high * getPriceMainCoin).toFixed(2)}} </span></span>
                <span>Low: <span :style="subbedSymbolData.percentChange > 0 ? 'color:#4caf50' : 'color: #f9a825'"> ${{(subbedSymbolData.low * getPriceMainCoin).toFixed(2)}} </span></span>
                <span>Active Gain/Loss: <span :style="(parseFloat((subbedSymbolData.bestAsk *props.item.origQty) - (props.item.price * props.item.origQty))).toFixed(2) > 0 ? 'color:#4caf50' : 'color: #f9a825'">
                ${{ (parseFloat((subbedSymbolData.bestAsk*props.item.origQty) - (props.item.price * props.item.origQty)) * getPriceMainCoin).toFixed(2) }}
              </span></span>
              </div>
              </v-card-text>
            </v-card>
          </template>
        </v-data-table>
      </v-card>

</template>

<script>
import moment from 'moment';
const binance = require('node-binance-api');
import { mapMutations, mapGetters } from 'vuex';

export default {
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
      snackbar: {
        status: false,
        y: 'top',
        x: null,
        mode: '',
        timeout: 3000,
        text: '',
        color: 'red lighten-4'
      },
      headers: [
        { text: 'Symbol', align: 'center', value: 'symbol', sortable: false },
        { text: 'Price', align: 'center', value: 'price' },
        { text: 'origQty', align: 'center', value: 'origQty' },
        { text: 'Gain/Loss', align: 'center', value: 'gain/loss' },
        { text: 'Side', align: 'center', value: 'side' },
        { text: 'Type', align: 'center', value: 'type' },
        { text: 'Status', align: 'center', value: 'status' },
        { text: 'Date', align: 'center', value: 'time', sortable: false },

      ]
    };
  },
  filters: {
    formatDate(time) {
      return moment(time).format('YYYY-MMM-DD hh:mm:ss');
    }
  },
  methods: {
    ...mapMutations([
      'setNewOrder',
      'setOrderChange',
      'setBalanceMainCoin',
      'setOrderFailed',
      'setCurrentCoin'
    ]),
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
      console.log(binance.websockets.subscriptions());
    },
    hideMenu() {
      let currWindow = this.$electron.remote.getCurrentWindow();
      currWindow.minimize();
    },
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
    },
    customFilter(items, filterKey) {
      if (filterKey) {
        let search = new RegExp(
          filterKey.replace(/ [\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
          'i'
        );

        return items.filter(row =>
          this.headers.some(column => {
            return search.test(row[column.value]);
          })
        );
      }

      return items;
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
      'getOrders',
      'getPriceMainCoin',
      'getCurrentCoin'
    ]),
    pages() {
      return this.pagination.rowsPerPage
        ? Math.ceil(this.getOrders.length / this.pagination.rowsPerPage)
        : 0;
    },
    testOrders() {
      let temp = this.getOrders;
      return temp;
    }
  },
  created() {
    let self = this;
    binance.options({
      APIKEY: this.getAPIKey,
      APISECRET: this.getSecret,
      useServerTime: true,
      reconnect: false
    });

    binance.prices(function(ticker) {
      self.symbolPrices = ticker;
    });

    binance.websockets.userData(this.balance_update, this.execution_update);
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
