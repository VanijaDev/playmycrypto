<template>
  <div>

    <header>
      <div class="container">
        <div class="d-flex">
          <div class="mr-auto">
            <router-link to="/">
              <img src="./assets/img/logo-oxo.svg" alt="Logo oxo" class="logo">
            </router-link>
          </div>
          <div class="row align-self-start">
            <div class="choose-crypto">
              Choose crypto:
            </div>
            <button class="currency-select" v-bind:class="{'is-active': currency === 'trx'}" @click="setCurrency('trx')">
              <img src="./assets/img/icon-tron.svg" alt="Tron">
            </button>
            <button class="currency-select" v-bind:class="{'is-active': currency === 'eth'}" @click="setCurrency('eth')">
              <img src="./assets/img/ethereum-logo.svg" alt="ETH">
            </button>

            <div class="user-profile position-relative">
              <div class="languages-menu" @click="languagePopupOpened = !languagePopupOpened" v-click-outside="hideLanguagePopup">
                <div class="flag" v-bind:class="getCurrentFlag()"></div>

                <div class="languages-dropdown" v-show="languagePopupOpened">
                  <button class="flag flag-en" v-show="language!=='en'" @click="setLocale('en')"></button>
                  <button class="flag flag-ua" v-show="language!=='ua'" @click="setLocale('ua')"></button>
                  <button class="flag flag-jp" v-show="language!=='jp'" @click="setLocale('jp')"></button>
                  <button class="flag flag-kr" v-show="language!=='kr'" @click="setLocale('kr')"></button>
                </div>
              </div>

              <div class="profile-info position-relative" v-click-outside="hideUserPopup">
                <img src="./assets/img/icon-profile.svg" class="float-right pointer" @click="userPopupOpened = !userPopupOpened">
                <div class="pointer float-left mr-2">
                  <small>{{ $t('PROFILE') }}:</small>
                  <div class="profile-name" id="profileName" @click="userPopupOpened = !userPopupOpened">
                    {{ user.name }}
                  </div>
                </div>

                <ul class="user-dropdown" v-show="userPopupOpened">
                  <li>
                    <div class="user-table row">
                      <div class="col-3">
                        <h3>{{ $t('TOTAL_BALANCE') }}:</h3>
                      </div>
                      <div class="col-6">
                        <img src="./assets/img/icon_amount-eth.svg" class="game-crypto-icon ml-2 mr-2" v-show="currency === 'eth'">
                        <img src="./assets/img/icon_amount-trx.svg" class="game-crypto-icon ml-2 mr-2" v-show="currency === 'trx'">
                        <em id="currentAccountBalance">{{ user.totalBalance }}</em>
                      </div>
                    </div>
                  </li>

                  <li>
                    <h3>{{ $t('CURRENTLY_PLAYING') }}:</h3>
                    <div id="listCurrentlyPlayingGames">
                      <img src="./assets/img/icon-rock-paper-scissors-sm.svg">
                    </div>
                  </li>

                  <li>
                    <h3>{{ $t("TOTAL_PLAYINGS") }}:</h3>
                    <div class="user-table row">
                      <div class="col-4 pr-0">
                        <img src="./assets/img/icon-coinflip-sm.svg" class="mr-2">
                        <em id="coinFlipPlayedTotalAmount">{{ user.totalPlaying.coinFlip }}</em>
                      </div>
                      <div class="col-4 pr-0">
                        <img src="./assets/img/icon-rock-paper-scissors-sm.svg" class="mr-2">
                        <em id="rockPaperScissorsPlayedTotalAmount">{{ user.totalPlaying.rps }}</em>
                      </div>
                      <div class="col-4 pr-0">
                        <img src="./assets/img/icon-tic-tac-toe-sm.svg" class="mr-2">
                        <em id="oxoTotalAmount">{{ user.totalPlaying.ttt }}</em>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div class="user-table row mb-2">
                      <div class="col-sm-6 pr-0">
                        <h3 class="mt-2">{{ $t('GAMEPLAY_PROFIT') }}:</h3>
                      </div>
                      <div class="col-sm-5 pr-0">
                        <img src="./assets/img/icon_amount-eth.svg" class="game-crypto-icon mr-3" v-show="currency === 'eth'">
                        <img src="./assets/img/icon_amount-trx.svg" class="game-crypto-icon mr-3" v-show="currency === 'trx'">

                        <b id="profit_amount_gameplay">{{ user.gamePlayProfit }}</b>
                        <em id="updownpic_gameplay"><img src="./assets/img/icon-trending-up.svg"></em>
                      </div>
                    </div>
                    <div class="user-table row">
                      <div class="col-sm-6 pr-0">
                        <h3 class="mt-2">{{ $t('TOTAL_PROFIT') }}:</h3>
                      </div>
                      <div class="col-sm-5 pr-0">
                        <img src="./assets/img/icon_amount-eth.svg" class="game-crypto-icon mr-3" v-show="currency === 'eth'">
                        <img src="./assets/img/icon_amount-trx.svg" class="game-crypto-icon mr-3" v-show="currency === 'trx'">

                        <b id="profit_amount_total">{{ user.totalProfit }}</b>
                        <em id="updownpic_total"><img src="./assets/img/icon-trending-up.svg"></em>
                      </div>
                    </div>
                  </li>

                  <li>
                    <h3>{{ $t('REFERRAL_FEE_RECEIVED') }}:</h3>
                    <div class="user-table row">
                      <div class="col-sm-6 mb-2">
                        <img src="./assets/img/icon-coinflip-sm.svg" class="mr-2">
                        <em id="ReferralFeesWithdrawnCoinflip">{{ user.referralFee.coinFlip }}</em>
                        <img src="./assets/img/icon_amount-eth.svg" width="24" class="ml-2" v-show="currency === 'eth'">
                        <img src="./assets/img/icon_amount-trx.svg" width="24" class="ml-2" v-show="currency === 'trx'">
                      </div>
                      <div class="col-sm-6 mb-2">
                        <img src="./assets/img/icon-rock-paper-scissors-sm.svg" class="mr-2">
                        <em id="ReferralFeesWithdrawnRPS">{{ user.referralFee.rps }}</em>
                        <img src="./assets/img/icon_amount-eth.svg" width="24" class="ml-2" v-show="currency === 'eth'">
                        <img src="./assets/img/icon_amount-trx.svg" width="24" class="ml-2" v-show="currency === 'trx'">
                      </div>
                      <div class="col-sm-6">
                        <img src="./assets/img/icon-tic-tac-toe-sm.svg" class="mr-2">
                        <em id="ReferralFeesWithdrawnOxo">{{ user.referralFee.ttt }}</em>
                        <img src="./assets/img/icon_amount-eth.svg" width="24" class="ml-2" v-show="currency === 'eth'">
                        <img src="./assets/img/icon_amount-trx.svg" width="24" class="ml-2" v-show="currency === 'trx'">
                      </div>
                    </div>
                  </li>
                  <li>
                    <h3>{{ $t('WITHDRAW_PENDING') }}:</h3>
                    <!--CartTabs-->
                    <div class="user-tabs">
                      <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <button class="btn btn-outline-primary" v-bind:class="{active:activeUserTab===1}" @click="activeUserTab=1">
                          {{ $t('REFERRAL') }}
                        </button>
                        <button class="btn btn-outline-primary" v-bind:class="{active:activeUserTab===2}" @click="activeUserTab=2">
                          {{ $t('GAME_PRIZE') }}
                        </button>
                        <button class="btn btn-outline-primary" v-bind:class="{active:activeUserTab===3}" @click="activeUserTab=3">
                          {{ $t('RAFFLE_PRIZE') }}
                        </button>
                      </div>

                      <div>
                        <div class="pt-3" id="withdrawReferral" v-if="activeUserTab===1">
                          <img src="./assets/img/icon-coinflip-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.referral.indexOf('coinFlip') !== -1">
                          <img src="./assets/img/icon-rock-paper-scissors-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.referral.indexOf('rps') !== -1">
                          <img src="./assets/img/icon-tic-tac-toe-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.referral.indexOf('ttt') !== -1">
                        </div>
                        <div class="pt-3" id="withdrawGamePrize" v-if="activeUserTab===2">
                          <img src="./assets/img/icon-coinflip-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.gamePrize.indexOf('coinFlip') !== -1">
                          <img src="./assets/img/icon-rock-paper-scissors-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.gamePrize.indexOf('rps') !== -1">
                          <img src="./assets/img/icon-tic-tac-toe-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.gamePrize.indexOf('ttt') !== -1">
                        </div>
                        <div class="pt-3" id="withdrawRafflePrize" v-if="activeUserTab===3">
                          <img src="./assets/img/icon-coinflip-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.rafflePrize.indexOf('coinFlip') !== -1">
                          <img src="./assets/img/icon-rock-paper-scissors-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.rafflePrize.indexOf('rps') !== -1">
                          <img src="./assets/img/icon-tic-tac-toe-sm.svg" class="game-icon mr-3"
                               v-show="user.withdrawPending.rafflePrize.indexOf('ttt') !== -1">
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="top-message" v-html="topBannerMessage" v-bind:class="{visible: topBannerMessage}"></div>
    </header>

    <!-- Begin page content -->
    <main role="main">
      <router-view/>
    </main>

    <footer class="footer">
      <div class="container">
        <button onclick="window.changeMe()">Change me!</button>

        Copyright ©
        <router-link to="/">OXO games</router-link>
        {{ $t('ALL_RIGHTS_RESERVED') }}.
      </div>
    </footer>

  </div>
</template>

<script>
  import ClickOutside from 'vue-click-outside'
  // import axios from "axios";

  export default {
    data: function () {
      return {
        userPopupOpened: false,
        languagePopupOpened: false,
        activeUserTab: 1,
        user: {
          name: '0xE4Cf...2dEf',
          totalBalance: 0,
          gamePlayProfit: 0.12411,
          totalProfit: 0.13411,
          totalPlaying: {
            coinFlip: 100,
            rps: 10,
            ttt: 10,
          },
          referralFee: {
            coinFlip: 0.01231,
            rps: 0,
            ttt: 0,
          },
          withdrawPending: {
            referral: [],
            gamePrize: [],
            rafflePrize: [],
          }
        }
      };
    },
    computed: {
      currency() {
        return this.$store.state.currency
      },
      language() {
        return this.$store.state.language
      },
      topBannerMessage() {
        return this.$store.state.topBannerMessage
      }
    },
    mounted() {
      this.addWithdrawPending()
      // axios.get("https://jsonplaceholder.typicode.com/todos/").then(
      //   response => {
      //     console.log(response);
      //   }
      // )
    },
    methods: {
      hideUserPopup() {
        this.userPopupOpened = false;
      },
      hideLanguagePopup() {
        this.languagePopupOpened = false;
      },
      setLocale(lang) {
        this.$store.commit('setLanguage', lang);

        // this.$store.commit('showTopBannerMessage', {
        //   textBefore: 'before',
        //   hash: 'hash'
        // });
      },
      addWithdrawPending() {
        this.user.withdrawPending.referral.push('ttt');
        // this.user.withdrawPending.referral.push('coinFlip');
      },
      setCurrency(currency) {
        this.$store.commit('setCurrency', currency);
      },
      getCurrentFlag() {
        return 'flag-' + this.language;
      },
    },
    directives: {
      ClickOutside
    }
  }
</script>

<style lang="scss">
  @import "assets/scss/bootstrap.min.css";
  @import "assets/scss/styles.scss";
</style>
