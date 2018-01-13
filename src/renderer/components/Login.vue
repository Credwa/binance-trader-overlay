<template>
   <v-card id="login" class="elevation-3">
    <v-card-title>
      <v-spacer></v-spacer>
      <h1 style="color:#42a5f5">Login</h1>
      <v-spacer></v-spacer>
    </v-card-title >
      <v-form v-model="valid" class="login-form" v-if="!loading">
        <v-text-field
          label="API Key "
          v-model="apiKey"
          :rules="apiKeyRules"
          required
        ></v-text-field>
        <v-text-field
          label="Secret "
          v-model="secret"
          :rules="secretRules"
          required
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue" :disabled="!valid" @click="login">Login</v-btn>
          <v-btn color="red" dark @click="clear">Clear</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-form>
      <v-progress-circular indeterminate v-bind:size="70" v-bind:width="7" color="blue" v-if="loading"></v-progress-circular>
  </v-card>
</template>

<script>
const binance = require('node-binance-api');
const remote = require('electron').remote;
import { mapMutations, mapGetters } from 'vuex';

export default {
  name: 'login',
  components: {},
  data() {
    return {
      valid: false,
      loading: false,
      apiKey:
        '',
      apiKeyRules: [v => !!v || 'API Key is required'],
      secret:
        '',
      secretRules: [v => !!v || 'Secret is required']
    };
  },
  methods: {
    ...mapMutations(['setAPIKey', 'setSecret']),
    login() {
      this.loading = true;
      binance.options({
        APIKEY: this.apiKey,
        APISECRET: this.secret,
        recvWindow: 1200000,
      });
      binance.balance(balances => {
        this.loading = false;
        this.setAPIKey(this.apiKey);
        this.setSecret(this.secret);
        this.$router.push('main');
        this.updateWindow();
      });
    },
    updateWindow() {
      let loginWindow = this.$electron.remote.getCurrentWindow();
      let screenSize = this.$electron.screen.getPrimaryDisplay().size;
      let newWindowWidth = 500;
      let newWindowHeight = 200;
      loginWindow.setAlwaysOnTop(true);
      loginWindow.setPosition(
        screenSize.width - newWindowWidth,
        screenSize.height - newWindowHeight - 100
      );
      loginWindow.setSize(newWindowWidth, newWindowHeight);
    },
    clear() {
      this.secret = '';
      this.apiKey = '';
    }
  },
  mounted() {}
};
</script>

<style>
#login {
  min-height: 70vh;
  max-width: 70vw;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  align-items: center;
  top: 10vh;
}

.login-form {
  width: 80%;
}
</style>
