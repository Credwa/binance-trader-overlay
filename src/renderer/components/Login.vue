<template>
   <v-card id="login" class="elevation-3" style="padding:0;margin:0;">
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
          type="password"
          autofocus
        ></v-text-field>
        <v-text-field
          label="Secret "
          v-model="secret"
          :rules="secretRules"
          required
          autofocus
          type="password"
        ></v-text-field>
        <v-checkbox
          v-model="remembered"
          value="1"
          label="Remember me"
          type="checkbox"
          class="test"
          required
        ></v-checkbox>
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
import { mapMutations, mapGetters } from 'vuex';
const storage = require('electron-json-storage');
const defaultDataPath = storage.getDefaultDataPath();

export default {
  name: 'login',
  components: {},
  data() {
    return {
      valid: false,
      remembered: false,
      loading: false,
      savedDataLoaded: false,
      apiKey: '',
      apiKeyRules: [v => !!v || 'API Key is required'],
      secret: '',
      secretRules: [v => !!v || 'Secret is required']
    };
  },
  methods: {
    ...mapMutations(['setAPIKey', 'setSecret']),
    login() {
      this.loading = true;
      binance.options({
        APIKEY: this.apiKey.trim(),
        APISECRET: this.secret.trim(),
        useServerTime: true
      });
      binance.balance((balances, error) => {
        // save login info if remembered
        if (this.remembered) {
          storage.set(
            'saved-login',
            {
              apiKey: this.apiKey.trim(),
              secret: this.secret.trim()
            },
            error => {}
          );
        }
        this.loading = false;
        this.setAPIKey(this.apiKey.trim());
        this.setSecret(this.secret.trim());
        this.$router.push('main');
        this.updateWindow();
      });
    },
    updateWindow() {
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
    },
    clear() {
      this.secret = '';
      this.apiKey = '';
    }
  },
  created() {
    let self = this;
    storage.has('saved-login', (error, hasKey) => {
      if (error) {
        console.log(error);
      }
      if (hasKey) {
        storage.get('saved-login', function(error, data) {
          if (error) return;
          self.savedDataLoaded = true;
          self.apiKey = data.apiKey;
          self.secret = data.secret;
          console.log('key found');
        });
      } else {
        console.log('key not found');
      }
    });
  }
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

.test::selection {
  background-color: red;
}
</style>
