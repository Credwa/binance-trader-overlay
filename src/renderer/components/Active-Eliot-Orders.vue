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
      console.log(data);
      this.activeOrders = data;
    }
  },
  methods: {
    hideMenu() {
      let currWindow = this.$electron.remote.getCurrentWindow();
      currWindow.minimize();
    },
    goBack() {
      let loginWindow = this.$electron.remote.getCurrentWindow();
      let screenSize = this.$electron.screen.getPrimaryDisplay().size;
      let newWindowWidth = Math.floor(screenSize.width / 4.35);
      let newWindowHeight = Math.floor(screenSize.height / 1.2);
      loginWindow.setAlwaysOnTop(true);
      loginWindow.setPosition(
        screenSize.width - 15 - newWindowWidth,
        screenSize.height - newWindowHeight - 100
      );
      loginWindow.setSize(newWindowWidth, newWindowHeight);
      window.history.go(-1);
    }
  },
  computed: {
    ...mapGetters(['getEliotOrders'])
  },
  created() {}
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


