<template>
  <div>

    <header>
      <div class="container">
        <div class="d-flex">
          <div class="mr-auto">
            <router-link to="/">
              <img src="/img/logo-oxo.svg" alt="Logo oxo" class="logo">
            </router-link>
          </div>
          <div class="row align-self-start">
            <div class="choose-crypto">
              Choose crypto:
            </div>
            <button class="currency-select" v-bind:class="{'is-active': currency === 'trx'}" @click="setCurrency('trx')">
              <img src="/img/icon-tron.svg" alt="Tron">
            </button>
            <button class="currency-select" v-bind:class="{'is-active': currency === 'eth'}" @click="setCurrency('eth')">
              <img src="/img/ethereum-logo.svg" alt="ETH">
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
                <img src="/img/icon-profile.svg" class="float-right pointer" @click="userPopupOpened = !userPopupOpened">
                <div class="pointer float-left mr-2">
                  <small>{{ $t('PROFILE') }}:</small>
                  <div class="profile-name" id="playerAccount" @click="userPopupOpened = !userPopupOpened">
                    0x7eb***62c
                  </div>
                </div>

                <ul class="user-dropdown" v-show="userPopupOpened">
                  <li>
                    <div class="user-table row">
                      <div class="col-3">
                        <h3>{{ $t('TOTAL_BALANCE') }}:</h3>
                      </div>
                      <div class="col-6">
                        <img src="/img/icon_amount-eth.svg" class="game-crypto-icon ml-2 mr-2" v-show="currency === 'eth'">
                        <img src="/img/icon_amount-trx.svg" class="game-crypto-icon ml-2 mr-2" v-show="currency === 'trx'">
                        <em id="currentAccountBalance">0</em>
                      </div>
                    </div>
                  </li>

                  <li>
                    <h3>{{ $t('CURRENTLY_PLAYING') }}:</h3>
                    <div id="listCurrentlyPlayingGames">
                      <img src="/img/icon-rock-paper-scissors-sm.svg">
                    </div>
                  </li>

                  <li>
                    <h3>{{ $t("TOTAL_PLAYINGS") }}:</h3>
                    <div class="user-table row">
                      <div class="col-4 pr-0">
                        <img src="/img/icon-coinflip-sm.svg" class="mr-2">
                        <em id="coinFlipPlayedTotalAmount">0</em>
                      </div>
                      <div class="col-4 pr-0">
                        <img src="/img/icon-rock-paper-scissors-sm.svg" class="mr-2">
                        <em id="rockPaperScissorsPlayedTotalAmount">0</em>
                      </div>
                      <div class="col-4 pr-0">
                        <img src="/img/icon-tic-tac-toe-sm.svg" class="mr-2">
                        <em id="oxoTotalAmount">0</em>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div class="user-table row mb-2">
                      <div class="col-sm-6 pr-0">
                        <h3 class="mt-2">{{ $t('GAMEPLAY_PROFIT') }}:</h3>
                      </div>
                      <div class="col-sm-5 pr-0">
                        <img src="/img/icon_amount-eth.svg" class="game-crypto-icon mr-3" v-show="currency === 'eth'">
                        <img src="/img/icon_amount-trx.svg" class="game-crypto-icon mr-3" v-show="currency === 'trx'">

                        <b id="profit_amount_gameplay">0</b>
                        <em id="updownpic_gameplay"><img src="/img/icon-trending-up.svg"></em>
                      </div>
                    </div>
                    <div class="user-table row">
                      <div class="col-sm-6 pr-0">
                        <h3 class="mt-2">{{ $t('TOTAL_PROFIT') }}:</h3>
                      </div>
                      <div class="col-sm-5 pr-0">
                        <img src="/img/icon_amount-eth.svg" class="game-crypto-icon mr-3" v-show="currency === 'eth'">
                        <img src="/img/icon_amount-trx.svg" class="game-crypto-icon mr-3" v-show="currency === 'trx'">

                        <b id="profit_amount_total">0</b>
                        <em id="updownpic_total"><img src="/img/icon-trending-up.svg"></em>
                      </div>
                    </div>
                  </li>

                  <li>
                    <h3>{{ $t('REFERRAL_FEE_RECEIVED') }}:</h3>
                    <div class="user-table row">
                      <div class="col-sm-6 mb-2">
                        <img src="/img/icon-coinflip-sm.svg" class="mr-2">
                        <em id="ReferralFeesWithdrawnCoinflip">0</em>
                        <img src="/img/icon_amount-eth.svg" width="24" class="ml-2" v-show="currency === 'eth'">
                        <img src="/img/icon_amount-trx.svg" width="24" class="ml-2" v-show="currency === 'trx'">
                      </div>
                      <div class="col-sm-6 mb-2">
                        <img src="/img/icon-rock-paper-scissors-sm.svg" class="mr-2">
                        <em id="ReferralFeesWithdrawnRPS">0</em>
                        <img src="/img/icon_amount-eth.svg" width="24" class="ml-2" v-show="currency === 'eth'">
                        <img src="/img/icon_amount-trx.svg" width="24" class="ml-2" v-show="currency === 'trx'">
                      </div>
                      <div class="col-sm-6">
                        <img src="/img/icon-tic-tac-toe-sm.svg" class="mr-2">
                        <em id="ReferralFeesWithdrawnOxo">0</em>
                        <img src="/img/icon_amount-eth.svg" width="24" class="ml-2" v-show="currency === 'eth'">
                        <img src="/img/icon_amount-trx.svg" width="24" class="ml-2" v-show="currency === 'trx'">
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

                      <div class="pt-3">
                        <div id="withdrawReferral" v-if="activeUserTab===1">
                          <button class="btn btn-animated">
                            <img src="/img/icon-coinflip-sm.svg" class="game-icon mr-3">
                          </button>
                        </div>

                        <div id="withdrawGamePrize" v-if="activeUserTab===2">
                          <button class="btn btn-animated">
                            <img src="/img/icon-rock-paper-scissors-sm.svg" class="game-icon mr-3">
                          </button>
                        </div>

                        <div id="withdrawRafflePrize" v-if="activeUserTab===3">
                          <button class="btn btn-animated">
                            <img src="/img/icon-tic-tac-toe-sm.svg" class="game-icon mr-3">
                          </button>
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
        Copyright ©
        <router-link to="/">OXO games</router-link>
        {{ $t('ALL_RIGHTS_RESERVED') }}.
      </div>
    </footer>

  </div>
</template>

<script>
  import ClickOutside from 'vue-click-outside'

  export default {
    data: function () {
      return {
        userPopupOpened: false,
        languagePopupOpened: false,
        activeUserTab: 1,
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
      setCurrency(currency) {
        this.$store.commit('setCurrency', currency);

        let selectedBlockChain = (currency === 'eth') ? 0 : 1;
        window.BlockchainManager.blockchainChanged(selectedBlockChain)
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
