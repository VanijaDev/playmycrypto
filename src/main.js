import Vue from "vue";
import Vuex from 'vuex';
import App from "./App.vue";
import router from "./router";
import i18n from "./locales";
import CoinflipGameComponent from './components/CoinflipGameComponent';
import RPSGameComponent from './components/RPSGameComponent';
import TTTGameComponent from './components/TTTGameComponent';
import VModal from 'vue-js-modal'

Vue.config.productionTip = false;
Vue.use(Vuex);
Vue.use(VModal)

let currency = localStorage.getItem('currency');
let language = localStorage.getItem('language');
if (!currency) {
  currency = 'eth';
}
if (!language) {
  // detect language
  const countryCode = window.geoplugin_countryCode();
  if (countryCode && ['UA', 'JP', 'KR'].indexOf(countryCode) !== -1) {
    language = countryCode.toLowerCase();
  }
  if (!language) {
    language = 'en';
  }
}
i18n.locale = language;

let store = new Vuex.Store({
  state: {
    currency: currency,
    language: language,
  },
  mutations: {
    setCurrency(state, currency) {
      if (state.currency !== currency) {
        localStorage.currency = state.currency = currency;
        console.log('Currency changed')
      }
    },
    setLanguage(state, lang) {
      localStorage.language = state.language = lang;
      i18n.locale = lang;
    },
  }
});

Vue.component('cf-game', CoinflipGameComponent);
Vue.component('rps-game', RPSGameComponent);
Vue.component('ttt-game', TTTGameComponent);

new Vue({
  router,
  i18n,
  store: store,
  render: (h) => h(App),
}).$mount("#app");
