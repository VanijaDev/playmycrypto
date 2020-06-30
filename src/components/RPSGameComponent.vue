<template>
  <div>
    <div class="row game-block" id="rpsstart">
      <div class="col-sm-4 f13 info-column inner-column">

        <div class="mt-1 pt-2 text-left">
          <div>
            <label for="Referal" class="f10 opacity-text text-left opacity-text mt-2 mb-1">{{ $t('ENTER_REFERRAL') }}:</label>
            <input type="text" id="Referal"/>
          </div>

          <div>
            <label for="SeedPhrase" class="f10 opacity-text text-left opacity-text mt-3 mb-1">{{ $t('ENTER_SEED') }}:</label>
            <input type="text" id="SeedPhrase"/>
          </div>

          <div>
            <label for="Bet" class="f10 text-left opacity-text mt-3 mb-1">
              {{ $t('BET') }} <span class="text-uppercase">({{ currency }})</span>:
            </label>
            <input type="number" step="0.01" min="0.01" id="Bet" class="bet-input" v-model="currentBet"/>
          </div>

          <button class="btn btn-start-game desktop-move" v-bind:class="{disabled: moveDisabled}" @click="startMove()">
            <img src="/img/icon-btn-start.svg" class="mr-2">
            {{ $t('MAKE_MOVE') }}
          </button>
        </div>
      </div>

      <div class="col-sm-8 border-left text-center inner-column second-inner-column">
        <h3 class="mt-sm-4 mb-sm-4 f18">{{ $t('START_NEW_GAME') }}</h3>
        <h2 class="f24">{{ $t('MAKE_FIRST_MOVE') }}</h2>

        <div class="no-value mt-4 mt-sm-5 mb-4 mb-sm-5">
          <img src="/img/game-icon-ask-big.svg" v-if="!gameValue">
          <img src="/img/game-icon-scissor-big.svg" v-if="gameValue===1">
          <img src="/img/game-icon-rock-big.svg" v-if="gameValue===2">
          <img src="/img/game-icon-paper-big.svg" v-if="gameValue===3">
        </div>

        <div class="mb-sm-0 mb-3">
          <button class="btn btn-link game-move-item mr-4 mr-sm-5 ml-sm-4" v-bind:class="{active: gameValue===1}" @click="selectValue(1)">
            <img src="/img/game-icon-scissor-big.svg" v-if="gameValue!==1">
            <img src="/img/game-icon-scissor-white.svg" v-if="gameValue===1">
          </button>
          <button class="btn btn-link game-move-item mr-4 ml-2 mr-sm-5 ml-sm-5" v-bind:class="{active: gameValue===2}" @click="selectValue(2)">
            <img src="/img/game-icon-rock-big.svg" v-if="gameValue!==2">
            <img src="/img/game-icon-rock-white.svg" v-if="gameValue===2">
          </button>
          <button class="btn btn-link game-move-item mr-1 ml-2 mr-sm-5 ml-sm-5" v-bind:class="{active: gameValue===3}" @click="selectValue(3)">
            <img src="/img/game-icon-paper-big.svg" v-if="gameValue!==3">
            <img src="/img/game-icon-paper-white.svg" v-if="gameValue===3">
          </button>
        </div>

        <button class="btn btn-start-game mb-3 mobile-move" v-bind:class="{disabled: moveDisabled}" @click="startMove()">
          <img src="/img/icon-btn-start.svg" class="mr-2">
          {{ $t('MAKE_MOVE') }}
        </button>

      </div>
    </div>


    <div class="row game-block hidden" id="rpswfopponent">
      rpswfopponent
    </div>
    <div class="row game-block hidden" id="rpsJoin">
      rpsJoin
    </div>
    <div class="row game-block hidden" id="rpswfopponentmove">
      rpswfopponentmove
    </div>
    <div class="row game-block hidden" id="rpsCreatorMove">
      rpsCreatorMove
    </div>
    <div class="row game-block hidden" id="rpsOpponentMove">
      rpsOpponentMove
    </div>
  </div>
</template>

<script>
  export default {
    name: "RPSGameComponent",
    data: function () {
      return {
        currentBet: 0,
        gameValue: null
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency
      },
      moveDisabled() {
        return parseFloat(this.currentBet) <= 0 || !this.gameValue;
      }
    },
    methods: {
      selectValue(value) {
        console.log(`Value selected: ${value}`);
        this.gameValue = value;
      },
      startMove() {
        console.log(`Move click. Selected value: ${this.gameValue}, bet: ${this.currentBet}`)
      },
    }
  };
</script>

<style scoped lang="scss">
  .no-value {
    width: 162px;
    height: 162px;
    background: #FFF;
    border-radius: 50%;
    text-align: center;
    line-height: 162px;
    margin: auto;
  }

  .game-move-item {
    width: 66px;
    height: 66px;
    padding: 0;
    border-radius: 50%;
    background: #FFF;
    text-align: center;
    line-height: 66px;
    box-shadow: 0 0 0 9px rgba(255, 255, 255, 0.5);
    transition: all ease .3s;

    &.active {
      background: #F2994A;
      box-shadow: 0 0 0 9px rgba(242, 153, 74, 0.5);
    }

    &:hover {
      opacity: .75;
    }

    img {
      width: 65%;
      height: 65%;
      object-fit: contain;
      margin-right: 3px;
      margin-bottom: 3px;
    }
  }

  .bet-input {
    width: 70px !important;
  }

  .game-area .btn-start-game {
    height: 54px;
    position: absolute;
    bottom: 50px;
    left: 35px;
    right: 35px;
    width: 220px;
    box-shadow: 0 0 1px 6px rgba(255, 255, 255, 0.25);
  }

  .game-area .inner-column {
    padding: .8rem 1rem .8rem 2rem !important;

    &.second-inner-column {
      padding: .8rem 1rem .8rem 1rem !important;
    }
  }

  .mobile-move {
    display: none;
  }

  @media all and (max-width: 480px) {
    .game-area {
      .inner-column {
        padding: .8rem 2rem .8rem 2rem !important;
      }

      .btn-start-game {
        position: relative;
        margin: auto;
        left: auto;
        right: auto;
        bottom: auto;
      }
    }

    .mobile-move {
      display: block;
    }
    .desktop-move {
      display: none;
    }
  }
</style>
