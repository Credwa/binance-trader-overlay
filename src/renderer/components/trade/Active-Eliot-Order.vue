<template>
  <v-layout class="order">
    <v-flex xs12>
      <v-card color="blue-grey darken-2" class="white--text elevation-4" >
        <v-card-title primary-title>
          <div>{{eliotOrder.amount}} {{eliotOrder.symbol}}</div>
          <pre>Current base price: {{eliotOrder.initialPrice}}
Current Stop Price: {{eliotOrder.trailingSellStopPrice}}
Trail %: {{eliotOrder.trail}}% | Gain Protection: {{eliotOrder.gainProtection}}%</pre>

        </v-card-title>
        <v-card-actions>
          <v-btn outline color="red" dark style="margin-left: 70%; margin-top:-20px" @click="cancelEliotOrder(eliotOrder)">cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
export default {
  props: ['eliotOrder'],
  data() {
    return {};
  },
  methods: {
    cancelEliotOrder(order) {
      this.$socket.emit('cancel_order', order);
    }
  },
  computed: {
    ...mapGetters(['getAPIKey', 'getSecret'])
  },
  created() {}
};
</script>

<style scoped>
.order {
  margin-bottom: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
}
</style>


