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
  name: 'binance-trader-overlay'
};
</script>

<style>
/* CSS */
.dragme {
  -webkit-app-region: drag;
}
.toolbar-height {
  max-height: 15vh;
}
* {
  overflow:hidden;
}
html,
body {
  background: rgba(0, 0, 0, 0);
  overflow: hidden;
}
</style>
