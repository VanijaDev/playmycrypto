<template>
  <div>
    <div class="row game-block" id="cfstart">
      <div class="col-sm-4 f13 info-column inner-column opacity-text">
        <p class="mb-1">{{ $t('GAME_ID') }}:</p>
        <span id="gameId_start">0</span>
        <p class="mb-1 mt-4">{{ $t('GAME_CREATOR') }}:</p>
        <span id="gameCreator_start">0x0</span>
        <p class="mb-1 mt-4">{{ $t('GAME_OPPONENT') }}:</p>
        <span id="gameOpponent_start">0x0</span>
        <p class="mb-1 mt-4">
          {{ $t('GAME_BET') }}
          <img
            src="/img/icon_amount-eth.svg"
            class="money-icon"
            v-show="currency === 'eth'"
          />
          <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'" />
        </p>
        <span class="f16">
          <b id="gameBetCurrent_start">{{ currentBet ? currentBet : 0 }}</b>
        </span>
      </div>

      <div class="col-sm-8 border-left text-center inner-column">
        <h3 class="mt-4 mb-4 f18">{{ $t('START_NEW_GAME') }}</h3>
        <h2 class="f24">{{ $t('CHOOSE_COIN_SIDE') }}:</h2>

        <button id="ethereumFlip" class="btn btn-link" onclick="window.Game.cf_coinSideChanged(0)">
          <img src="/img/ethereum-orange.svg" />
        </button>
        <button id="bitcoinFlip" class="btn btn-link" onclick="window.Game.cf_coinSideChanged(1)">
          <img src="/img/bitcoin-black.svg" />
        </button>

        <form class="row mt-4 pt-2">
          <div class="col-8 offset-sm-2 col-sm-6 pr-0">
            <label
              for="cf_game_referral_start"
              class="f10 opacity-text text-left"
            >{{ $t('ENTER_REFERRAL') }}:</label>
            <input type="text" id="cf_game_referral_start" class="game_view-value referral-addr" />
          </div>
          <div class="col-4 col-sm-2">
            <label for="bet" class="f10 text-left opacity-text">
              {{ $t('BET') }}
              <img
                src="/img/icon_amount-eth.svg"
                class="money-icon"
                v-show="currency === 'eth'"
              />
              <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'" />
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              class="form-bet game_view-value"
              id="cf_bet_input"
              v-model="currentBet"
            />
          </div>
        </form>

        <button
          id="start_btn_start"
          class="btn btn-start-game"
          v-bind:class="{'disabled': isStartGameDisabled()}"
          onclick="window.Game.startGame()"
        >
          <img src="/img/icon-btn-start.svg" class="mr-3" />
          {{ $t('START_GAME') }}
        </button>
      </div>
    </div>

    <div class="row hidden game-block" id="cfjoin">
      <div class="col-sm-4 f13 info-column inner-column opacity-text">
        <p class="mb-1">{{ $t('GAME_ID') }}:</p>
        <span id="cf_game_id_join">0</span>
        <p class="mb-1 mt-4">{{ $t('GAME_CREATOR') }}:</p>
        <span id="cf_game_creator_join" class="f10">0x0</span>
        <p class="mb-1 mt-4">{{ $t('GAME_OPPONENT') }}:</p>
        <span id="gameOpponent_start">0x0</span>
        <p class="mb-1 mt-4">
          {{ $t('GAME_BET') }}
          <img
            src="/img/icon_amount-eth.svg"
            class="money-icon"
            v-show="currency === 'eth'"
          />
          <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'" />
        </p>
        <span class="f16">
          <b id="cf_game_bet_join">{{ currentBet ? currentBet : 0 }}</b>
        </span>
      </div>

      <div class="col-sm-8 border-left text-center inner-column">
        <h3 class="mt-4 mb-4 f18">{{ $t('JOIN_GAME') }}</h3>
        <h2 class="f24">{{ $t('COIN_SIDE') }}:</h2>

        <button id="ethereumFlip" class="btn btn-link">
          <img id="cf_coin_join" src="/img/ethereum-orange.svg" />
        </button>

        <form class="row mt-4 pt-2">
          <div class="col-8 offset-sm-2 col-sm-6 pr-0">
            <label
              for="cf_game_referral_start"
              class="f10 opacity-text text-left"
            >{{ $t('ENTER_REFERRAL') }}:</label>
            <input type="text" id="cf_game_referral_join" class="game_view-value referral-addr" />
          </div>
        </form>

        <button class="btn btn-start-game" onclick="window.Game.cf_joinAndPlay()">
          <img src="/img/icon-btn-start.svg" class="mr-3" />
          {{ $t('JOIN_GAME') }}
        </button>
      </div>
    </div>

    <div class="row hidden game-block" id="cfmaketop">
      <div class="col-sm-4 f13 info-column inner-column opacity-text position-relative">
        <p class="mb-1">{{ $t('GAME_ID') }}:</p>
        <span id="cf_gameId_makeTop" class="f10">0</span>
        <p class="mb-1 mt-4">{{ $t('GAME_CREATOR') }}:</p>
        <span id="gameCreator_makeTop" class="f10">0x0</span>
        <p class="mb-1 mt-4">{{ $t('GAME_OPPONENT') }}:</p>
        <span id="gameOpponent_makeTop" class="f10">0x0</span>

        <div class="row">
          <div class="col-4 pr-0">
            <p class="mb-1 mt-4">{{ $t('GAME_BET') }}:</p>
            <span class="f16">
              <b id="gameBet_makeTop">{{ currentBet ? currentBet : 0 }}</b>
            </span>
          </div>
          <div class="col-8 pr-0">
            <label class="pt-4">
              {{ $t('UPDATE_BET') }}
              <img
                src="/img/icon_amount-eth.svg"
                class="money-icon"
                v-show="currency === 'eth'"
              />
              <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'" />
            </label>
            <input
              id="cf_update_bet_input"
              type="number"
              step="0.01"
              min="0.01"
              class="col-5 bet-input"
              v-model="currentBet"
            />
            <button
              class="btn btn-small-orange"
              onclick="window.Game.increaseBetClicked()"
            >{{ $t('UPDATE') }}</button>
          </div>
        </div>

        <!-- <div class="bottom-buttons row">
          <div class="col-5 offset-1">
            <button class="btn btn-small-orange">{{ $t('QUIT_GAME') }}</button>
          </div>
          <div class="col-5 button-border-left">
            <button class="btn btn-small-orange">{{ $t('PAUSE_GAME') }}</button>
          </div>
        </div>-->
      </div>

      <div class="col-sm-8 border-left text-center inner-column">
        <h3 class="mt-4 mb-4 f18">{{ $t('WAITING_FOR_OPPONENT') }}</h3>
        <h2 class="f24">{{ $t('COIN_SIDE') }}:</h2>

        <button id="ethereumFlip" class="btn btn-link">
          <img id="fromt_coin_makeTop" src="/img/ethereum-orange.svg" />
        </button>

        <div class="row mt-5 pt-4"></div>

        <div id="make_top_block_makeTop" class="make_top_block_makeTop">
          <p class="f18 font-weight-bold">
            {{ $t('MAKE_TOP_COST') }}
            <span id="unpausedCost">0.01</span>
            <img src="/img/icon_amount-eth.svg" class="money-icon" v-show="currency === 'eth'" />
            <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'" />
          </p>
          <button
            id="make_top_btc_makeTop"
            class="btn btn-start-game btn-make-top"
            onclick="window.Game.makeTopClicked()"
          >
            <img src="/img/icon-btn-start.svg" class="mr-3" />
            {{ $t('MAKE_TOP_GAME') }}
          </button>
        </div>
      </div>
    </div>

    <div class="row hidden game-block" id="cfWon">
      <div class="inner-column game-image-padding text-center">
        <img src="/img/icon-big-won.svg" alt />
        <h2 class="mt-4 mb-4">{{ $t('YOU_WON') }}!</h2>
        <button
          class="btn btn-medium-orange"
          onclick="window.Game.closeResultView()"
        >{{ $t('CLOSE') }}</button>
      </div>
    </div>

    <div class="row hidden game-block" id="cfLost">
      <div class="inner-column game-image-padding text-center">
        <img src="/img/icon-big-lose.svg" alt />
        <h2 class="mt-4 mb-4">{{ $t('YOU_LOST') }}...</h2>
        <button
          class="btn btn-medium-orange"
          onclick="window.Game.closeResultView()"
        >{{ $t('CLOSE') }}</button>
      </div>
    </div>

    <div class="image-cache hidden">
      <img src="/img/ethereum-orange.svg" />
      <img src="/img/bitcoin-black.svg" />
      <img src="/img/ethereum-black.svg" />
      <img src="/img/bitcoin-orange.svg" />
    </div>
  </div>
</template>

<script>
export default {
  name: "CoinflipGameComponent",
  data: function () {
    return {
      currentBet: 0.01,
    };
  },
  computed: {
    currency() {
      return this.$store.state.currency;
    },
  },
  methods: {
    isStartGameDisabled() {
      return this.currentBet <= 0;
    },
  },
  mounted() {
    let recaptchaScript = document.createElement("script");
    recaptchaScript.setAttribute("src", "/cf.js");
    document.head.appendChild(recaptchaScript);
  },
};
</script>
