<template>
  <div class="pt-4">
    <div class="container">
      <div class="row">
        <div class="col-sm-8">
          <div class="shadow-block inner-padding game-block">
            <div class="game-area">
              <cf-game v-if="currentGame === 'coinflip'"></cf-game>
              <rps-game v-if="currentGame === 'rps'"></rps-game>
              <ttt-game v-if="currentGame === 'ttt'"></ttt-game>
            </div>
          </div>

          <div class="mt-5">
            <div class="raffle shadow-block">
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
                  <button id="raffleStartBtn" onclick="window.Game.startRaffle()" class="btn long-btn btn-primary rounded-button float-right">{{ $t('START') }}</button>
                </div>
                <div class="participants pt-3">
                  <img src="/img/game-icon-quality.svg" class="mr-2">
                  {{ $t('LAST_WINNER') }}:
                </div>
                <div class="scrollbar-inner" id="BlockRaffle">
                  <div class="bordered mt-1">
                    <p>0xKDJFKSDFSDJHFKDSKJFHKSDFKHDSHKFFDFSDF</p>
                    <p>
                      <span class="text-primary">
                        <b>0.00000</b>
                        <img src="/img/icon_amount-eth.svg" class="money-icon ml-2">
                      </span>
                      <span class="float-right text-black-50">00.00.0000</span>
                    </p>
                  </div>
                </div>

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
            <h2 class="text-primary p20 mb-0 pb-0">
              {{ $t('TOP_GAMES') }}
            </h2>
            <div id="BlockTopGames" class="inner-padding scrollbar-inner">
              <div class="bordered blue-border mt-1">
                <p>
                  <img src="/img/game-icon-wallet.svg" class="creator">
                  <span class="pl-2 pr-2 text-black-50 creator-title">{{ $t('CREATOR') }}:</span>
                  <span class="one-line">0xKDJFKSDFSDJHFKDSKJFHKSDFKHDSHKFFDFSDF</span>
                </p>
                <p>
                  <img src="/img/game-icon-bet.svg" class="creator">
                  <span class="pl-2 pr-2 text-black-50 creator-title">{{ $t('BET') }}:</span>
                  <span class="text-primary"><b>0.00000</b></span>

                  <img src="/img/icon_amount-eth.svg" class="money-icon">
                </p>
              </div>
            </div>

            <div class="bg-primary text-white mt-3 p-3">
              <img src="/img/game-icon-money.svg">
              {{ $t('LIST_OPENED_GAMES') }}:
            </div>

            <div>
              <h2 class="text-primary p20 mb-0 pb-0">
                {{ $t('AVAILABLE_GAMES') }}:
              </h2>

              <div class="inner-padding scrollbar-inner" id="AvailableGames">
                <div class="bordered mt-1">
                  <p>
                    <img src="/img/game-icon-wallet.svg" class="creator">
                    <span class="pl-2 pr-2 text-black-50 creator-title">Creator:</span>
                    <span class="one-line">0xKDJFKSDFSDJHFKDSKJFHKSDFKHDSHKFFDFSDF</span>
                  </p>
                  <p>
                    <img src="/img/game-icon-bet.svg" class="creator">
                    <span class="pl-2 pr-2 text-black-50 creator-title">{{ $t('BET') }}:</span>
                    <span class="text-primary"><b>0.00000</b></span>
                    <img src="/img/icon_amount-eth.svg" class="money-icon">
                  </p>
                </div>
              </div>
            </div>

            <div class="inner-padding">
              <button class="btn long-btn btn-primary rounded-button full-width mt-4"
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
  export default {
    data: function () {
      return {
        currentGame: '',
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency
      }
    },
    mounted() {
      this.currentGame = window.location.pathname.replace('/', '');
    }
  }
</script>
