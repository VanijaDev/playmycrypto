<template>
  <div class="row">
    <div class="col-sm-4 f13 info-column inner-column opacity-text">
      <p class="mb-1">{{ $t('GAME_ID') }}:</p>
      <span>{{ game.id }}</span>
      <p class="mb-1 mt-4">{{ $t('GAME_CREATOR') }}:</p>
      <span>{{ game.creator }}</span>
      <p class="mb-1 mt-4">{{ $t('GAME_OPPONENT') }}:</p>
      <span>{{ game.opponent }}</span>
      <p class="mb-1 mt-4">{{ $t('GAME_BET') }} <span class="text-uppercase">({{ currency }})</span>:</p>
      <span class="f16"><b>{{ game.bet }}</b></span>
    </div>

    <div class="col-sm-8 border-left text-center inner-column">
      <h3 class="mt-4 mb-4 f18">{{ $t('START_NEW_GAME') }}</h3>
      <h2 class="f24">{{ $t('CHOOSE_COIN_SIDE') }}:</h2>

      <button class="btn btn-link" @click="selectCoinSide(1)">
        <img src="../assets/img/ethereum-orange.svg" v-show="game.selectedSide === 1">
        <img src="../assets/img/ethereum-black.svg" v-show="game.selectedSide === 2">
      </button>
      <button class="btn btn-link" @click="selectCoinSide(2)">
        <img src="../assets/img/bitcoin-black.svg" v-show="game.selectedSide === 1">
        <img src="../assets/img/bitcoin-orange.svg" v-show="game.selectedSide === 2">
      </button>

      <form class="row mt-4 pt-2">
        <div class="col-8 offset-sm-2 col-sm-6 pr-sm-1 pr-0">
          <label for="referral" class="f10 opacity-text text-left">{{ $t('ENTER_REFERRAL') }}:</label>
          <input type="text" id="referral" v-model="game.referral"/>
        </div>
        <div class="col-4 col-sm-2">
          <label for="bet" class="f10 text-left opacity-text">
            {{ $t('BET') }} <span class="text-uppercase">({{ currency }})</span>:
          </label>
          <input type="text" id="bet" v-model="game.bet"/>
        </div>
      </form>

      <button class="btn btn-start-game" v-bind:class="{disabled: parseInt(game.bet)===0}" @click="startGame()">
        <img src="../assets/img/icon-btn-start.svg" class="mr-3">
        {{ $t('START_GAME') }}
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "CoinflipGameComponent",
    data: function () {
      return {
        game: {
          id: 0,
          creator: '0x0',
          opponent: '0x0',
          referral: '',
          bet: 0,
          selectedSide: 1
        }
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency
      }
    },
    methods: {
      selectCoinSide(side) {
        console.log(`Side selected: ${side}`);
        this.game.selectedSide = side;
      },
      startGame() {
        console.log(`Start Game click. Selected side: ${this.game.selectedSide}, bet: ${this.game.bet}`)
      },
    }
  };
</script>

<style scoped lang="scss">

</style>
