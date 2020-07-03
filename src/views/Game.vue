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

          <!-- <div class="tmp-block" v-if="currentGame === 'cf'">
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('cfstart')">Start</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('cfjoin')">Join</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('cfmaketop')">Make Top</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('pausedGame')">Pause</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('youWon')">Won</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('youLost')">Lost</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('itsDraw')">Draw</button>
          </div> -->

          <div class="tmp-block" v-if="currentGame === 'rps'">
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpsstart')">Start</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpswfopponent')">Waiting Opponent</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpsjoingame')">Join</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpswfopponentmove')">Waiting Move</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpscreatormove')">Creator Move</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpsopponentmove')">Opponent Move</button>
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
            <div class="how-to-play shadow-block">
              <div class="header position-relative">
                <h2 class="text-uppercase f22 text-center pt-2">{{ $t('HOW_TO_PLAY') }}</h2>
              </div>
              <div id="BlockHowToPlayCF" class="cards-pills-list scrollbar-inner p20" v-if="currentGame === 'cf'" v-html="$t('HOW_TO_PLAY_CF')"></div>
              <div id="BlockHowToPlayRPS" class="cards-pills-list scrollbar-inner p20" v-if="currentGame === 'rps'" v-html="$t('HOW_TO_PLAY_RPS')"></div>
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
              <div class="inner-padding scrollbar-inner list-no-style" id="topGamesBlock">
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

    <div id="translations"
         v-bind:data-CREATOR="$t('CREATOR')"
         v-bind:data-BET="$t('BET')"
         v-bind:data-WINNER="$t('WINNER')"
         v-bind:data-PRIZE="$t('PRIZE')"
    ></div>
  </div>
</template>

<script>
  import Types from '../blockchain/types'

  export default {
    data: function () {
      return {
        currentGame: '',
        managerInterval: null
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency;
      }
    },
    mounted() {
      let manager = window.BlockchainManager;
      if (manager) {
        this.managerInterval = setInterval(function () {
          if (!window.BlockchainManager.initted) {
            window.BlockchainManager = manager;
            clearInterval(this.managerInterval);
          }
        }, 50);
      }

      this.currentGame = window.location.pathname.replace('/', '');
      console.log('Open game page. Current game:', this.currentGame);
      window.CommonManager.setCurrentGame((this.currentGame === Types.Game.cf) ? Types.Game.cf : Types.Game.rps);

      let recaptchaScript = document.createElement('script');
      recaptchaScript.setAttribute('src', '/game.js');
      document.head.appendChild(recaptchaScript);

      let loadInterval = setInterval(function () {
        if (typeof window.Game !== 'undefined') {
          clearInterval(loadInterval);
          setTimeout(function () {
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

      if (this.managerInterval) {
        clearInterval(this.managerInterval);
      }
      next()
    },
  }
</script>
