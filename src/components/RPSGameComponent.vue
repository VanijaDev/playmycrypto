<template>
  <div class="row">
    <div class="col-sm-4 f13 info-column inner-column">

      <div class="mt-1 pt-2 text-left">
        <div>
          <label for="referral" class="f10 opacity-text text-left opacity-text mt-2 mb-1">{{ $t('ENTER_REFERRAL') }}:</label>
          <input type="text" id="referral" v-model="game.referral"/>
        </div>

        <div>
          <label for="seed" class="f10 opacity-text text-left opacity-text mt-3 mb-1">{{ $t('ENTER_SEED') }}:</label>
          <input type="text" id="seed" v-model="game.seed"/>
        </div>

        <div>
          <label for="bet" class="f10 text-left opacity-text mt-3 mb-1">
            {{ $t('BET') }} <span class="text-uppercase">({{ currency }})</span>:
          </label>
          <input type="text" id="bet" class="bet-input" v-model="game.bet"/>
        </div>

        <button class="btn btn-start-game desktop-move" v-bind:class="{disabled: parseInt(game.bet)===0}" @click="startMove()">
          <img src="../assets/img/icon-btn-start.svg" class="mr-2">
          {{ $t('MAKE_MOVE') }}
        </button>
      </div>
    </div>

    <div class="col-sm-8 border-left text-center inner-column">
      <h3 class="mt-sm-4 mb-sm-4 f18">{{ $t('START_NEW_GAME') }}</h3>
      <h2 class="f24">{{ $t('MAKE_FIRST_MOVE') }}</h2>

      <div class="no-value mt-4 mt-sm-5 mb-4 mb-sm-5">
        <img src="../assets/img/game-icon-ask-big.svg" v-if="!game.value">
        <img src="../assets/img/game-icon-scissor-big.svg" v-if="game.value===1">
        <img src="../assets/img/game-icon-rock-big.svg" v-if="game.value===2">
        <img src="../assets/img/game-icon-paper-big.svg" v-if="game.value===3">
      </div>

      <div class="mb-sm-0 mb-3">
        <button class="btn btn-link game-move-item mr-4 mr-sm-5" v-bind:class="{active: game.value===1}" @click="selectValue(1)">
          <img src="../assets/img/game-icon-scissor-big.svg" v-if="game.value!==1">
          <img src="../assets/img/game-icon-scissor-white.svg" v-if="game.value===1">
        </button>
        <button class="btn btn-link game-move-item mr-4 ml-2 mr-sm-5 ml-sm-5" v-bind:class="{active: game.value===2}" @click="selectValue(2)">
          <img src="../assets/img/game-icon-rock-big.svg" v-if="game.value!==2">
          <img src="../assets/img/game-icon-rock-white.svg" v-if="game.value===2">
        </button>
        <button class="btn btn-link game-move-item mr-1 ml-2 mr-sm-5 ml-sm-5" v-bind:class="{active: game.value===3}" @click="selectValue(3)">
          <img src="../assets/img/game-icon-paper-big.svg" v-if="game.value!==3">
          <img src="../assets/img/game-icon-paper-white.svg" v-if="game.value===3">
        </button>
      </div>

      <button class="btn btn-start-game mb-3 mobile-move" v-bind:class="{disabled: parseInt(game.bet)===0}" @click="startMove()">
        <img src="../assets/img/icon-btn-start.svg" class="mr-2">
        {{ $t('MAKE_MOVE') }}
      </button>

    </div>
  </div>
</template>

<script>
  export default {
    name: "RPSGameComponent",
    data: function () {
      return {
        game: {
          id: 0,
          creator: '0x0',
          opponent: '0x0',
          referral: '',
          seed: '',
          bet: 0,
          value: null
        }
      }
    },
    computed: {
      currency() {
        return this.$store.state.currency
      }
    },
    methods: {
      selectValue(value) {
        console.log(`Value selected: ${value}`);
        this.game.value = value;
      },
      startMove() {
        console.log(`Move click. Selected value: ${this.game.value}, bet: ${this.game.bet}`)
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

    &.active {
      background: #F2994A;
      box-shadow: 0 0 0 9px rgba(242, 153, 74, 0.5);
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
    width: 50px !important;
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
