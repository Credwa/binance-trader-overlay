<template>
  <v-tabs fixed centered>
    <v-tabs-bar class="grey darken-3" dark>
      <v-tabs-slider class="blue"></v-tabs-slider>
      <v-tabs-item
        v-for="i in items"
        :key="i"
        :href="'#tab-' + i"
      >
        {{ i }}
      </v-tabs-item>
    </v-tabs-bar>
    <v-tabs-items>
      <v-tabs-content
        v-for="i in items"
        :key="i"
        :id="'tab-' + i"
      >
        <v-card flat>
          <buy :currentCoin="currentCoin" v-if="i === 'BUY'"> </buy>
          <sell :currentCoin="currentCoin" v-if="i === 'SELL'"> </sell>
        </v-card>
      </v-tabs-content>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
import { mapMutations } from 'vuex';
import Buy from './Buy.vue';
import Sell from './Sell.vue';
export default {
  props: ['currentCoin'],
  components: {
    Buy,
    Sell
  },
  data() {
    return {
      items: ['BUY', 'SELL']
    };
  },
  methods: {
    ...mapMutations([
      'setEliotOrders'
    ]),
  },
  sockets: {
    active_orders: function(data) {
      this.setEliotOrders(data);
    }
  }
};
</script>

<style scoped>

</style>

