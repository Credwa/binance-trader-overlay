<template>
  <v-expansion-panel expand >
    <v-expansion-panel-content style="background-color: rgba(0, 0, 0, .1); color: white">
      <div slot="header">Orders</div>
       <v-card dark>
        <v-card-title>
          Orders
          <v-spacer></v-spacer>
          <v-switch v-model="switchUSD" style="color:white; top:12px; margin-left:2vw" name="showUSD"></v-switch>
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
          >
          <template slot="items" slot-scope="props">
            <td  class="text-xs-center">{{ props.item.symbol }} </td>
            <td  class="text-xs-center">{{ props.item.price }}</td>
            <td  class="text-xs-center">{{ props.item.quantity }}</td>
            <td  v-if="!switchUSD" class="text-xs-center"><span :style="(parseFloat(props.item.price * props.item.quantity) - parseFloat(symbolPrices[props.item.symbol].price * props.item.quantity)).toFixed(8) > 0 ? 'color:#4caf50' : 'color: #f9a825'">{{ (parseFloat(props.item.price * props.item.quantity) - parseFloat(symbolPrices[props.item.symbol].price * props.item.quantity)).toFixed(8) }} </span></td>
            <td  v-if="switchUSD" class="text-xs-center"><span :style="(parseFloat(props.item.price * props.item.quantity) - parseFloat(symbolPrices[props.item.symbol].price * props.item.quantity)).toFixed(8) > 0 ? 'color:#4caf50' : 'color: #f9a825'">{{ ((parseFloat(props.item.price * props.item.quantity) - parseFloat(symbolPrices[props.item.symbol].price * props.item.quantity))* priceMainCoin).toFixed(8) }} </span></td>
            <td  class="text-xs-center">{{ props.item.side }}</td>
            <td  class="text-xs-center">{{ props.item.time | formatDate }}</td>
          </template>
          <template slot="pageText" slot-scope="{ pageStart, pageStop }">
            From {{ pageStart }} to {{ pageStop }}
          </template>
        </v-data-table>
      </v-card>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import moment from 'moment'
export default {
  props: ['orders', 'symbolPrices', 'priceMainCoin'],
  data() {
    return {
      max25chars: v => v.length <= 25 || 'Input too long!',
      tmp: '',
      search: '',
      moment: moment,
      switchUSD: false,
      pagination: {
        rowsPerPage: 5
      },
      sum: 0,
      selected: [],
      headers: [
        { text: 'Symbol', align: 'center', value: 'symbol' },
        { text: 'Price', align: 'center', value: 'price' },
        { text: 'Quantity', align: 'center', value: 'quantity' },
        { text: 'Gain/Loss', align: 'center', value: 'gain/loss'},
        { text: 'Type', align: 'center', value: 'side' },
        { text: 'Date', align: 'center', value: 'date' },
      ]
    };
  },
  filters: {
    formatDate(time) {
      return moment(time).format('YYYY-MMM-DD hh:mm:ss')
    }
  },
  computed: {
    pages() {
      return this.pagination.rowsPerPage
        ? Math.ceil(this.orders.length / this.pagination.rowsPerPage)
        : 0;
    }
  }
};
</script>

<style>

</style>

