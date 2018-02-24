<template>
  <div class="eliotOrders">
        <div class="topIcons">
          <v-icon dark large style="cursor:pointer" @click="goBack">keyboard_arrow_left</v-icon>
          <v-spacer></v-spacer>
          <v-icon dark large style="cursor:pointer" class="drag">drag_handle</v-icon>
          <v-spacer></v-spacer>
          <v-icon dark large style="cursor:pointer" class="remove" @click="hideMenu">remove</v-icon>
        </div>
    <eliot-order v-for="order in getEliotOrders" :eliotOrder="order" :key="order.key"> </eliot-order>
    <h2 v-if="!isThereEliotOrders" style="color:red;">No Eliot Orders</h2>
  </div>
</template>

<script>
import eliotOrder from './trade/Active-Eliot-Order';
import { mapMutations, mapGetters } from 'vuex';
export default {
  components: {
    eliotOrder
  },
  data() {
    return {
      activeOrders: null
    };
  },
  sockets: {
    active_orders: function(data) {
      this.setEliotOrders(data);
    }
  },
  methods: {
    ...mapMutations(['setEliotOrders']),
    hideMenu() {
      let currWindow = this.$electron.remote.getCurrentWindow();
      currWindow.minimize();
    },
    goBack() {
      window.history.go(-1);
    }
  },
  computed: {
    ...mapGetters(['getEliotOrders', 'getAPIKey', 'getSecret']),
    isThereEliotOrders() {
      if (Object.keys(this.getEliotOrders).length > 0) {
        return true;
      }
      return false;
    }
  },
  mounted() {
    this.$socket.emit('user_connected', {
      apiKey: this.getAPIKey,
      secret: this.getSecret
    });
  }
};
</script>

<style>
.eliotOrders {
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-content: space-between;
}
</style>


