<template>
  <div class="home">
    <div class="our-advantages-line">
      <div class="container">
        <h1>{{ $t("OUR_ADVANTAGES") }}</h1>

        <div class="row our-advantages-list">
          <div class="col" style="width: 170px;">
            <b>90%</b>
            <p class="pl-5 pr-5">{{ $t("ADVANTAGES.TEXT_1") }}</p>
          </div>
          <div class="col">
            <b>2%</b>
            <p class="pl-4 pr-4">{{ $t("ADVANTAGES.TEXT_2") }}</p>
          </div>
          <div class="col">
            <b>2%</b>
            <img class="info_icon" src="/img/icon_info.svg" @click.stop="showInfoTooltip(1)" v-click-outside="hideInfoTooltip">
            <p class="show-tooltip pl-4 pr-4">{{ $t("ADVANTAGES.TEXT_3") }}</p>
            <span class="tooltip-info" v-show="visibleInfoTooltip===1">{{ $t("ADVANTAGES.TOOLTIP_3") }}</span>
          </div>
          <div class="col">
            <b>2%</b>
            <img class="info_icon" src="/img/icon_info.svg" @click.stop="showInfoTooltip(2)" v-click-outside="hideInfoTooltip">
            <p class="show-tooltip pl-4 pr-4">{{ $t("ADVANTAGES.TEXT_4") }}</p>
            <span class="tooltip-info" v-show="visibleInfoTooltip===2">
              <a href="https://onigiribank.com" target="blank">OnigiriBank</a> {{ $t("ADVANTAGES.TOOLTIP_4") }}
            </span>
          </div>
          <div class="col">
            <b>2%</b>
            <p class="pl-5 pr-5">{{ $t("ADVANTAGES.TEXT_6") }}</p>
          </div>
          <div class="col">
            <b>100%</b>
            <img class="info_icon" src="/img/icon_info.svg" @click.stop="showInfoTooltip(3)" v-click-outside="hideInfoTooltip">
            <p class="show-tooltip pl-4 pr-4">{{ $t("ADVANTAGES.TEXT_5") }}</p>
            <span class="tooltip-info" v-show="visibleInfoTooltip===3">{{ $t("ADVANTAGES.TOOLTIP_5") }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm-9 pr-0">
          <div class="row">
            <h1 class="col-sm-2 pt-1 total-amount-title">{{ $t("TOTAL") }}:</h1>

            <div class="col-sm-10 text-right total-amounts">
              <div class="total-item d-inline-block">
                <img src="/img/bg-hand-money.svg" class="hand-money">
                <span id="totalUsedReferralFees">0.00000</span>
                <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
              </div>
              <div class="total-item d-inline-block">
                <img src="/img/bg-hand-money.svg" class="hand-money">
                <span id="ongoinRafflePrize">0.00000</span>
                <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
              </div>
              <div class="total-item d-inline-block">
                <img src="/img/bg-hand-money.svg" class="hand-money">
                <span id="totalUsedPartnerFees">0.00000</span>
                <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
              </div>
            </div>
          </div>

          <div class="pt-4 mt-3">
            <h1 class="mb-4 available-games-title">{{ $t("AVAILABLE_GAMES") }}</h1>
            <div>
              <div class="one-game">
                <router-link to="/cf">
                  <span class="play-now">
                    {{ $t("NOW_PLAYING") }}
                    <b id="now_playing_coinflip">0</b>
                  </span>
                  <img src="/img/icon-coinflip.svg" class="game-icon">
                  <span class="title">Coin Flip</span>
                </router-link>
              </div>

              <div class="one-game">
                <router-link to="/rps">
                <span class="play-now">
                  {{ $t("NOW_PLAYING") }}
                  <b id="now_playing_rps">0</b>
                </span>
                  <img src="/img/icon-rock-paper-scissors.svg" class="game-icon">
                  <span class="title">Rock Paper Scissors</span>
                </router-link>
              </div>

              <div class="one-game">
                <router-link to="/ttt">
                <span class="play-now">
                  {{ $t("NOW_PLAYING") }}
                  <b id="now_playing_ttt">0</b>
                </span>
                  <img src="/img/icon-tic-tac-toe.svg" class="game-icon">
                  <span class="title">Tic-Tac-Toe</span>
                </router-link>
              </div>

              <div class="one-game new-game">
                <img src="/img/icon-coming-soon.svg" class="game-icon">
                <span class="new-game-title">{{ $t("NEW_GAME") }}</span>
                <span class="title">{{ $t("COMING_SOON") }}...</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-sm-3 pl-5 raffle-block">
          <h1>{{ $t("RAFFLE") }}</h1>

          <div class="border-block">
            <div class="header">
              {{ $t("TOTAL_WON") }}: <b id="rafflePrizesWonTotal">0.00000</b>
              <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
              <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
            </div>
            <div class="content">

              <div class="total-won">
                <img src="/img/icon-coinflip-sm.svg" class="game-sm-icon">
                <span id="rafflePrizesWonTotalGameCoinFlip">0.00000</span>
                <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
              </div>
              <div class="total-won">
                <img src="/img/icon-rock-paper-scissors-sm.svg" class="game-sm-icon">
                <span id="rafflePrizesWonTotalGameRPS">0.00000</span>
                <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
              </div>
              <div class="total-won">
                <img src="/img/icon-tic-tac-toe-sm.svg" class="game-sm-icon">
                <span id="rafflePrizesWonTotalGameTTT">0.00000</span>
                <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
              </div>
            </div>
          </div>

          <div class="text-center mb-4 more-play">
            <img src="/img/icon-motivation.svg">
          </div>

          <div class="border-block">
            <div class="header f13">
              {{ $t("TOTAL_CRYPT_AMOUNT") }}
            </div>
            <table id="cryptoAmountPlayedOnSiteTotal">
              <tbody>
              <tr>
              </tr>
              <tr>
                <td class="total-column total-column-1">ETH</td>
                <td class="total-column total-column-2">0.00000</td>
              </tr>
              <tr>
                <td class="total-column total-column-1">TRX</td>
                <td class="total-column total-column-2">0.00000</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import ClickOutside from 'vue-click-outside'

  export default {
    data: function () {
      return {
        visibleInfoTooltip: 0,
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency
      }
    },
    methods: {
      showInfoTooltip(num) {
        this.visibleInfoTooltip = num;
      },
      hideInfoTooltip() {
        this.visibleInfoTooltip = 0;
      },
    },
    mounted() {
      let recaptchaScript = document.createElement('script');
      recaptchaScript.setAttribute('src', '/index.js');
      document.head.appendChild(recaptchaScript);

      console.log('Open home page');

      let loadInterval = setInterval(function () {
        if (typeof window.Index !== 'undefined') {
          window.Index.pageLoaded = true;
          window.Index.setup();
          clearInterval(loadInterval);
        }
      }, 50);
    },
    beforeRouteLeave(to, from, next) {
      console.log('Leave home page');

      window.Index.onUnload();
      next()
    },
    directives: {
      ClickOutside
    }
  }
</script>
