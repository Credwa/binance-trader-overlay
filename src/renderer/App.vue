<template>
  <div id="app">
    <v-app style="background-color: rgba(0,0,0,0)">
      <v-content>
          <router-view></router-view>
      </v-content>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'binance-trader-overlay',
};
</script>

<style>
/* CSS */

html,
body {
  background: rgba(0, 0, 0, 0);
}
</style>
