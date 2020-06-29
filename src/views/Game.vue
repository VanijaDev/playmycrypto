<template>
  <div class="pt-4">
    <div class="container">
      <div class="row">
        <div class="col-sm-8">
          <div class="shadow-block inner-padding game-block">
            <div class="game-area" id="gameBlock">
              <cf-game v-if="currentGame === 'cf'"></cf-game>
              <rps-game v-if="currentGame === 'rps'"></rps-game>
              <ttt-game v-if="currentGame === 'ttt'"></ttt-game>
            </div>
          </div>

          <div class="tmp-block">
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('cfstart')">Screen 1</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('joinGame')">Screen 2</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('waitingForOpponent')">Screen 3</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('pausedGame')">Screen 4</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('youWon')">Screen 5</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('youLost')">Screen 6</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('itsDraw')">Screen 7</button>
          </div>

          <div class="mt-5">
            <div class="raffle shadow-block" id="raffleBlock">
              <div class="header position-relative">
                <div>{{ $t('RAFFLE') }}</div>
                <div class="f13">{{ $t('IN_RAFFLE') }}:</div>

                <div class="raffle-amount">
                  <b id="cryptoForRaffle">0.00000</b>
                  <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'">
                  <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'">
                </div>
              </div>
              <div class="content">
                <div class="participants">
                  <img src="/img/game-icon-users.svg" class="mr-2">
                  <span class="f16"> {{ $t('PARTICIPANTS') }}:</span>
                  <b class="f18">
                    <span id="rafflePlayingAmount">0</span>
                    /
                    <span id="raffleActivationAmount">0</span>
                  </b>
                  <button id="raffleStartBtn" onclick="window.Game.startRaffle()" class="btn long-btn btn-primary rounded-button float-right" disabled>{{
                    $t('START')
                    }}
                  </button>
                </div>
                <div class="participants pt-3">
                  <img src="/img/game-icon-quality.svg" class="mr-2">
                  {{ $t('LAST_WINNER') }}:
                </div>
                <div class="scrollbar-inner list-no-style" id="BlockRaffle"></div>

              </div>
            </div>
            <div class="how-to-play shadow-block p20">
              <h2 class="text-primary mb-4">
                {{ $t('HOW_TO_PLAY') }}
              </h2>
              <div id="BlockHowToPlay" class="cards-pills-list scrollbar-inner" v-html="$t('HOW_TO_PLAY_TEXT')"></div>
            </div>
          </div>
        </div>

        <div class="col-sm-4">
          <div class="shadow-block">

            <div class="timer-block text-primary">
              <p class="mb-0">Join next game in</p>
              <p id="timerBack">
                00:00
              </p>
              <small>Suspended time was introduced to avoid spamming.</small>
            </div>

            <div class="position-relative">
              <h2 class="text-primary p20 mb-0 pb-0">
                {{ $t('TOP_GAMES') }}
              </h2>
              <div class="inner-padding scrollbar-inner list-no-style" id="BlockTopGames">
              </div>
            </div>

            <div class="bg-primary text-white mt-3 p-3">
              <img src="/img/game-icon-money.svg">
              {{ $t('LIST_OPENED_GAMES') }}:
            </div>

            <div class="position-relative" id="availableGamesBlock">
              <h2 class="text-primary p20 mb-0 pb-0">
                {{ $t('AVAILABLE_GAMES') }}
              </h2>

              <div class="inner-padding scrollbar-inner list-no-style" id="AvailableGames">
              </div>
            </div>

            <div class="inner-padding">
              <button class="btn long-btn btn-primary rounded-button full-width mt-2"
                      id="loadMoreAvailableGamesBtn" onclick="window.Game.loadMoreAvailableGames()">
                LOAD MORE
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Types from '../blockchain/types'

  export default {
    data: function () {
      return {
        currentGame: '',
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency;
      }
    },
    mounted() {
      let manager = window.BlockchainManager;

      this.currentGame = window.location.pathname.replace('/', '');
      console.log('Open game page. Current game:', this.currentGame);
      window.CommonManager.setCurrentGame((this.currentGame === "cf") ? Types.Game.cf : Types.Game.rps);

      let recaptchaScript = document.createElement('script');
      recaptchaScript.setAttribute('src', '/game.js');
      document.head.appendChild(recaptchaScript);

      let loadInterval = setInterval(function () {
        if (typeof window.Game !== 'undefined') {
          clearInterval(loadInterval);

          setTimeout(function () {
            if (manager) {
              window.BlockchainManager = manager;
            }

            window.Game.pageLoaded = true;
            window.Game.setup();
          }, 300);
        }
      }, 50);
    },
    beforeRouteLeave(to, from, next) {
      console.log('Leave game page');
      window.Game.gameType = -1;
      document.getElementById("gameName").innerHTML = "";
      next()
    },
  }
</script>
