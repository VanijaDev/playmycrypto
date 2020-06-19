<template>
  <div class="row">
    <div class="col-sm-4 f13 info-column inner-column opacity-text">
      <p class="mb-1">{{ $t('GAME_ID') }}:</p>
      <span id="gameId_start">0</span>
      <p class="mb-1 mt-4">{{ $t('GAME_CREATOR') }}:</p>
      <span id="gameCreator_start">0x0</span>
      <p class="mb-1 mt-4">{{ $t('GAME_OPPONENT') }}:</p>
      <span id="gameOpponent_start">0x0</span>
      <p class="mb-1 mt-4">{{ $t('GAME_BET') }} <span class="text-uppercase">({{ currency }})</span>:</p>
      <span class="f16"><b id="gameBetCurrent_start">0</b></span>
    </div>

    <div class="col-sm-8 border-left text-center inner-column">
      <h3 class="mt-4 mb-4 f18">{{ $t('START_NEW_GAME') }}</h3>
      <h2 class="f24">{{ $t('CHOOSE_COIN_SIDE') }}:</h2>

      <button id="ethereumFlip" class="btn btn-link" onclick="window.CoinFlip.coinSideChanged(0)">
        <img src="/img/ethereum-orange.svg">
      </button>
      <button class="btn btn-link" id="bitcoinFlip" onclick="window.CoinFlip.coinSideChanged(1)">
        <img src="/img/bitcoin-black.svg">
      </button>

      <form class="row mt-4 pt-2">
        <div class="col-8 offset-sm-2 col-sm-6 pr-sm-1 pr-0">
          <label for="gameReferral_start" class="f10 opacity-text text-left">{{ $t('ENTER_REFERRAL') }}:</label>
          <input type="text" id="gameReferral_start"/>
        </div>
        <div class="col-4 col-sm-2">
          <label for="bet" class="f10 text-left opacity-text">
            {{ $t('BET') }} <span class="text-uppercase">({{ currency }})</span>:
          </label>
          <input type="number" step="0.01" min="0.01" placeholder="0.01" class="form-bet" id="gameBet_start">
        </div>
      </form>

      <button class="btn btn-start-game disabled" onclick="window.CoinFlip.startGame()">
        <img src="/img/icon-btn-start.svg" class="mr-3">
        {{ $t('START_GAME') }}
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "CoinflipGameComponent",
    computed: {
      currency() {
        return this.$store.state.currency
      }
    },
    mounted(){
      let recaptchaScript = document.createElement('script');
      recaptchaScript.setAttribute('src', '/coinFlip.js');
      document.head.appendChild(recaptchaScript);
    }
  };
</script>
