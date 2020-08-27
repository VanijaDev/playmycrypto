<template>
  <div>
    <div class="row game-block hidden" id="cfstart">
      <div class="col-sm-4 f13 info-column inner-column opacity-text">
        <div class="mt-1 pt-2 text-left">
          <div>
            <label for="cfstart_game_referral"
                   class="f10 opacity-text text-left opacity-text mt-2 mb-1"
            >{{ $t('ENTER_REFERRAL') }}:</label>
            <input type="text" id="cfstart_game_referral" class="game_view-value referral-addr"/>
          </div>
          <div>
            <label
                for="cfstart_seed"
                class="f10 opacity-text text-left opacity-text mt-3 mb-1"
            >{{ $t('ENTER_SEED') }}:</label>
            <input
                type="text"
                id="cfstart_seed"
                class="game_view-value referral-addr"
                v-model="currentSeedPhrase"
            />
          </div>
          <div>
            <label for="cfstart_bet" class="f10 text-left opacity-text mt-3 mb-1">
              {{ $t('BET') }}
              <img
                  src="/img/icon_amount-eth.svg"
                  class="money-icon"
                  v-show="currency === 'eth'"
              />
              <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'"/>
            </label>
            <input
                type="number"
                step="0.01"
                min="0.01"
                id="cfstart_bet"
                class="bet-input"
                v-model="currentBet"
            />
          </div>

          <button
              class="btn btn-start-game desktop-move"
              v-bind:class="{disabled: moveDisabled}"
              onclick="window.Game.startGameClicked()"
          >
            <img src="/img/icon-btn-start.svg" class="mr-2"/>
            {{ $t('START_GAME') }}
          </button>
        </div>
      </div>

      <div class="col-sm-8 border-left text-center inner-column second-inner-column">
        <h3 class="mt-sm-4 mb-sm-4 f18">{{ $t('START_NEW_GAME') }}</h3>
        <h2 class="f24">{{ $t('CHOOSE_COIN_SIDE') }}:</h2>

        <div class="mt-4 mt-sm-5 mb-4 mb-sm-5" v-bind:class="{'no-value': !gameValue, 'selected-value':gameValue}">
          <img src="/img/game-icon-ask-big.svg" v-if="!gameValue"/>
          <img src="/img/ethereum-orange.svg" v-if="gameValue===1"/>
          <img src="/img/bitcoin-orange.svg" v-if="gameValue===2"/>
        </div>

        <div class="mb-sm-0 mb-3">
          <button
              class="btn btn-link coin-side mr-3 mr-sm-4 ml-sm-5 p-0"
              v-bind:class="{active: gameValue===1}"
              @click="selectMoveValue(1)"
          >
            <img src="/img/ethereum-black.svg" v-if="gameValue!==1"/>
            <img src="/img/ethereum-orange.svg" v-if="gameValue===1"/>
          </button>
          <button
              class="btn btn-link coin-side mr-4 ml-2 mr-sm-5 ml-sm-5 p-0"
              v-bind:class="{active: gameValue===2}"
              @click="selectMoveValue(2)"
          >
            <img src="/img/bitcoin-black.svg" v-if="gameValue!==2"/>
            <img src="/img/bitcoin-orange.svg" v-if="gameValue===2"/>
          </button>
        </div>

        <button
            class="btn btn-start-game mb-3 mobile-move"
            v-bind:class="{disabled: moveDisabled}"
        >
          <img src="/img/icon-btn-start.svg" class="mr-2"/>
          {{ $t('MAKE_MOVE') }}
        </button>
      </div>
    </div>

    <div class="row game-block hidden" id="cfwfopponent">
      <div class="col-sm-4 f13 info-column inner-column opacity-text">
        <div class="mt-0 pt-2 text-left opacity-text">
          <p class="mb-0 f10">{{ $t('GAME_ID') }}:</p>
          <span id="cfwfopponent_game_id" class="f10">0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_CREATOR') }}:</p>
          <span id="cfwfopponent_game_creator" class="f10">0x0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_OPPONENT') }}:</p>
          <span id="cfwfopponent_game_opponent" class="f10">0x0</span>

          <div class="row">
            <div class="col-sm-4 pr-0">
              <p class="mb-2 mt-4 f10">{{ $t('GAME_BET') }}:</p>
              <b id="cfwfopponent_game_bet">{{ currentBet ? currentBet : 0 }}</b>
            </div>
            <div class="col-sm-8 pr-0">
              <label class="text-center pt-sm-4 f10">
                {{ $t('UPDATE_BET') }}
                <img
                    src="/img/icon_amount-eth.svg"
                    class="money-icon"
                    v-show="currency === 'eth'"
                />
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'"/>
              </label>
              <input
                  id="cfwfopponent_increase_bet"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="col-5 offset-3 mr-1 offset-sm-0 bet-input"
                  v-model="currentBet"
              />
              <button
                  class="btn btn-small-orange"
                  onclick="window.Game.increaseBetClicked()"
              >{{ $t('UPDATE') }}
              </button>
            </div>
          </div>
        </div>

        <div class="bottom-buttons row">
          <div class="col-5 offset-1">
            <button
                id="cfwfopponent_quit_btn"
                class="btn btn-small-orange"
                onclick="window.Game.cf_quitGameClicked()"
            >{{ $t('QUIT_GAME') }}
            </button>
          </div>
          <div class="col-5 pr-2 button-border-left">
            <button
                id="cfwfopponent_pause_btn"
                class="btn btn-small-orange"
                onclick="window.Game.cf_pauseGameClicked()"
            >{{ $t('PAUSE_GAME') }}
            </button>
          </div>
        </div>
      </div>

      <div class="col-sm-8 border-left text-center inner-column">
        <h3 class="mt-4 mb-4 f18">{{ $t('WAITING_FOR_OPPONENT') }}</h3>
        <h3 class="coin-side-selected">Your Coin Side:</h3>
        <div class="mt-4 mt-sm-3 mb-4 mb-sm-5 small-selected-value">
          <img src="/img/ethereum-orange.svg" v-if="gameValue===1"/>
          <img src="/img/bitcoin-orange.svg" v-if="gameValue===2"/>
        </div>

        <div
            id="cfwfopponent_makeTop_block"
            class="mt-5 pt-5 hidden"
            data-group="cfwfopponent_make_top"
        >
          <button
              id="make_top_btc_makeTop"
              class="btn btn-start-game btn-make-top"
              onclick="window.Game.makeTopClicked()"
          >
            <img src="/img/icon-btn-start.svg" class="mr-3"/>
            {{ $t('MAKE_TOP_GAME') }}
          </button>
        </div>

        <div
            id="cfwfopponent_paused_block"
            class="mt-5 pt-5 hidden"
            data-group="cfwfopponent_paused"
        >
          <h2 class="paused-game mb-0">{{ $t('GAME_PAUSED') }}</h2>
          <p class="f18">
            {{ $t('UNPAUSE_COST') }}
            <img
                src="/img/icon_amount-eth.svg"
                class="money-icon"
                v-show="currency === 'eth'"
            />
            <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'"/>
          </p>
        </div>
      </div>
    </div>

    <div class="row game-block hidden" id="cfjoingame">
      <div class="col-sm-4 f13 info-column inner-column opacity-text">
        <div class="mt-0 pt-2 text-left opacity-text">
          <p class="mb-0 f10">{{ $t('GAME_ID') }}:</p>
          <span id="cfjoingame_game_id" class="f10">0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_CREATOR') }}:</p>
          <span id="cfjoingame_game_creator" class="f10">0x0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_OPPONENT') }}:</p>
          <span id="cfjoingame_game_opponent" class="f10">0x0</span>

          <div class="row">
            <div class="col-6 pr-0">
              <p class="mb-0 mt-4 f10">
                {{ $t('GAME_BET') }}
                <img
                    src="/img/icon_amount-eth.svg"
                    class="money-icon"
                    v-show="currency === 'eth'"
                />
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'"/>
              </p>
              <b id="cfjoingame_game_bet">{{ currentBet ? currentBet : 0 }}</b>
            </div>
          </div>

          <div>
            <label
                for="Referal"
                class="f10 opacity-text text-left opacity-text mt-2 mb-1"
            >{{ $t('ENTER_REFERRAL') }}:</label>
            <input type="text" id="cfjoingame_game_referral" class="game_view-value referral-addr"/>
          </div>

          <button
              class="btn btn-start-game desktop-move"
              v-bind:class="{disabled: moveJoinDisabled}"
              onclick="window.Game.cf_joinGameClicked()"
          >
            <img src="/img/icon-btn-start.svg" class="mr-2"/>
            {{ $t('JOIN_GAME') }}
          </button>
        </div>
      </div>

      <div class="col-sm-8 border-left text-center inner-column second-inner-column">
        <h3 class="mt-sm-4 mb-sm-4 f18">{{ $t('JOIN_GAME') }}</h3>
        <h2 class="f24">{{ $t('CHOOSE_COIN_SIDE') }}:</h2>

        <div class="mt-4 mt-sm-5 mb-4 mb-sm-5" v-bind:class="{'no-value': !gameValue, 'selected-value':gameValue}">
          <img src="/img/game-icon-ask-big.svg" v-if="!gameValue"/>
          <img src="/img/ethereum-orange.svg" v-if="gameValue===1"/>
          <img src="/img/bitcoin-orange.svg" v-if="gameValue===2"/>
        </div>

        <div class="mb-sm-0 mb-3">
          <button
              class="btn btn-link coin-side mr-3 mr-sm-4 ml-sm-5 p-0"
              v-bind:class="{active: gameValue===1}"
              @click="selectMoveValue(1)"
          >
            <img src="/img/ethereum-black.svg" v-if="gameValue!==1"/>
            <img src="/img/ethereum-orange.svg" v-if="gameValue===1"/>
          </button>
          <button
              class="btn btn-link coin-side mr-4 ml-2 mr-sm-5 ml-sm-5 p-0"
              v-bind:class="{active: gameValue===2}"
              @click="selectMoveValue(2)"
          >
            <img src="/img/bitcoin-black.svg" v-if="gameValue!==2"/>
            <img src="/img/bitcoin-orange.svg" v-if="gameValue===2"/>
          </button>
        </div>

        <button
            class="btn btn-start-game mb-3 mobile-move"
            v-bind:class="{disabled: moveDisabled}"
            @click="startMove()"
        >
          <img src="/img/icon-btn-start.svg" class="mr-2"/>
          {{ $t('MAKE_MOVE') }}
        </button>
      </div>
    </div>

    <div class="row game-block" id="cfwaitcreator">
      <div class="col-sm-4 f13 info-column inner-column opacity-text">
        <div class="mt-0 pt-2 text-left opacity-text">
          <p class="mb-0 f10">{{ $t('GAME_ID') }}:</p>
          <span id="cfjoingame_game_id" class="f10">0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_CREATOR') }}:</p>
          <span id="cfjoingame_game_creator" class="f10">0x0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_OPPONENT') }}:</p>
          <span id="cfjoingame_game_opponent" class="f10">0x0</span>

          <div class="row">
            <div class="col-6 pr-0">
              <p class="mb-0 mt-4 f10">
                {{ $t('GAME_BET') }}
                <img
                    src="/img/icon_amount-eth.svg"
                    class="money-icon"
                    v-show="currency === 'eth'"
                />
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'"/>
              </p>
              <b id="cfjoingame_game_bet">{{ currentBet ? currentBet : 0 }}</b>
            </div>
          </div>

          <div class="row mt-4 f10">
            <div class="col-6 pr-0">
              <p class="mb-0">{{ $t('MOVE_EXPIRES_IN') }}:</p>
              <p class="mt-1">
                <img src="/img/clock.svg" class="mr-1 clock-icon"/>
                <span id="rpswfopponentmove_move_remain_min" class="f13">0</span>
                <span class="date mr-2 text-white-50">{{ $t('MIN') }}</span>
                <span id="rpswfopponentmove_move_remain_sec" class="f13">0</span>
                <span class="date mr-2 text-white-50">{{ $t('SEC') }}</span>
              </p>
            </div>
          </div>

          <div class="bottom-buttons row">
            <div class="bottom-buttons row">
              <div class="col-5 offset-1">
                <button
                    id="rpswfopponent_quit_btn"
                    class="btn btn-small-orange"
                    onclick="window.Game.rps_quitGameClicked()"
                >{{ $t('QUIT_GAME') }}
                </button>
              </div>
              <div class="col-5 pr-3 button-border-left">
                <button
                    id="rpswfopponent_pause_btn"
                    class="btn btn-small-orange disabled"
                    onclick="window.Game.rps_pauseGameClicked()"
                >{{ $t('CLAIM_EXPIRED') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-8 border-left text-center inner-column second-inner-column">
        <h3 class="mt-sm-4 mb-sm-4 f18">{{ $t('CREATOR_FINISH_WAIT') }}</h3>

        <div
            id="cf_move_expired"
            class="mt-5 pt-5 hidden"
            data-group="cfwfopponentmove"
        >
          <h2 class="paused-game mb-0">{{ $t('MOVE_EXPIRED') }}</h2>
          <p class="f18">{{ $t('CLAIM_PRIZE') }}</p>
        </div>
      </div>
    </div>

    <div class="row game-block hidden" id="cffinishgame">
      <div class="col-sm-4 f13 info-column inner-column opacity-text">
        <div class="mt-0 pt-2 text-left opacity-text">
          <p class="mb-0 f10">{{ $t('GAME_ID') }}:</p>
          <span id="cfjoingame_game_id" class="f10">0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_CREATOR') }}:</p>
          <span id="cfjoingame_game_creator" class="f10">0x0</span>
          <p class="mb-0 mt-4 f10">{{ $t('GAME_OPPONENT') }}:</p>
          <span id="cfjoingame_game_opponent" class="f10">0x0</span>

          <div class="row">
            <div class="col-6 pr-0">
              <p class="mb-0 mt-4 f10">
                {{ $t('GAME_BET') }}
                <img
                    src="/img/icon_amount-eth.svg"
                    class="money-icon"
                    v-show="currency === 'eth'"
                />
                <img src="/img/icon_amount-trx.svg" class="money-icon" v-show="currency === 'trx'"/>
              </p>
              <b id="cfjoingame_game_bet">{{ currentBet ? currentBet : 0 }}</b>
            </div>
          </div>

          <div class="row mt-4 f10">
            <div class="col-6 pr-0">
              <p class="mb-0">{{ $t('MOVE_EXPIRES_IN') }}:</p>
              <p class="mt-1">
                <img src="/img/clock.svg" class="mr-1 clock-icon"/>
                <span id="rpswfopponentmove_move_remain_min" class="f13">0</span>
                <span class="date mr-2 text-white-50">{{ $t('MIN') }}</span>
                <span id="rpswfopponentmove_move_remain_sec" class="f13">0</span>
                <span class="date mr-2 text-white-50">{{ $t('SEC') }}</span>
              </p>
            </div>
            <!-- <div class="col-6">
              <p class="mb-0">Can claim at:</p>
              <p class="mt-1">
                <img src="/img/clock.svg" class="mr-1 clock-icon">
                <span class="date mr-2 text-white-50">30.01.20</span>
                <span>12:31</span>
              </p>
            </div>-->
          </div>

          <button
              class="btn btn-start-game desktop-move"
              v-bind:class="{disabled: moveFinishDisabled}"
              onclick="window.Game.cf_joinGameClicked()"
          >
            <img src="/img/icon-btn-start.svg" class="mr-2"/>
            {{ $t('FINISH_GAME') }}
          </button>

          <div class="bottom-buttons row">
            <div class="col-5 offset-1">
              <button
                  id="cfwfopponent_quit_btn"
                  class="btn btn-small-orange"
                  onclick="window.Game.cf_quitGameClicked()"
              >{{ $t('QUIT_GAME') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-8 border-left text-center inner-column second-inner-column">
        <h3 class="mt-sm-4 mb-sm-4 f18">{{ $t('FINISH_GAME') }}</h3>

        <div id="cffinishseed">
          <h2 class="f20 text-left ml-2 mb-4 pb-2 chosen-side">{{ $t('COIN_SIDE_CREATION') }}:</h2>
          <div class="mb-sm-0 mb-3">
            <button
                class="btn btn-link coin-side mr-3 mr-sm-4 ml-sm-5 p-0"
                v-bind:class="{active: gameValue===1}"
                @click="selectMoveValue(1)"
            >
              <img src="/img/ethereum-black.svg" v-if="gameValue!==1"/>
              <img src="/img/ethereum-orange.svg" v-if="gameValue===1"/>
            </button>
            <button
                class="btn btn-link coin-side mr-4 ml-2 mr-sm-5 ml-sm-5 p-0"
                v-bind:class="{active: gameValue===2}"
                @click="selectMoveValue(2)"
            >
              <img src="/img/bitcoin-black.svg" v-if="gameValue!==2"/>
              <img src="/img/bitcoin-orange.svg" v-if="gameValue===2"/>
            </button>
          </div>

          <div class="mr-3 mt-3 opacity-text">
            <p class="text-left f13 mb-2">Enter seed phrase to finish game:</p>
            <input type="text" id="finishSeedPhrase" v-model="finishSeedPhrase"/>
          </div>
        </div>

        <div
            id="rpswfopponentmove_move_expired"
            class="mt-5 pt-5 hidden"
            data-group="cfwfopponentmove"
        >
          <h2 class="paused-game mb-0">{{ $t('MOVE_EXPIRED') }}</h2>
          <p class="f18">{{ $t('MOVE_EXPIRED_LOST') }}</p>
        </div>
      </div>
    </div>

    <div class="row hidden game-block" id="youWon">
      <div class="inner-column game-image-padding text-center">
        <img src="/img/icon-big-won.svg" alt/>
        <h2 class="mt-4 mb-4">{{ $t('YOU_WON') }}!</h2>
        <button
            class="btn btn-medium-orange"
            onclick="window.Game.closeResultView()"
        >{{ $t('CLOSE') }}
        </button>
      </div>
    </div>

    <div class="row hidden game-block" id="youLost">
      <div class="inner-column game-image-padding text-center">
        <img src="/img/icon-big-lose.svg" alt/>
        <h2 class="mt-4 mb-4">{{ $t('YOU_LOST') }}...</h2>
        <button
            class="btn btn-medium-orange"
            onclick="window.Game.closeResultView()"
        >{{ $t('CLOSE') }}
        </button>
      </div>
    </div>

    <div class="image-cache hidden">
      <img src="/img/ethereum-orange.svg"/>
      <img src="/img/bitcoin-black.svg"/>
      <img src="/img/ethereum-black.svg"/>
      <img src="/img/bitcoin-orange.svg"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: "CFGameComponent",
    data: function () {
      return {
        currentBet: 0.01,
        gameValue: null,
        prevGameValue: null,
        currentSeedPhrase: "",
        prevSeedPhrase: "",
        finishSeedPhrase: "",
      };
    },
    computed: {
      currency() {
        return this.$store.state.currency;
      },
      moveDisabled() {
        return (
          parseFloat(this.currentBet) <= 0 ||
          !this.gameValue ||
          this.currentSeedPhrase.length === 0
        );
      },
      moveJoinDisabled() {
        return this.gameValue === null;
      },
      moveFinishDisabled() {
        return this.gameValue === null || !this.finishSeedPhrase.length;
      },
      playMoveDisabled() {
        return false; // !this.gameValue || !this.prevGameValue || this.currentSeedPhrase.length || this.prevSeedPhrase.length === 0;
      },
    },
    mounted() {
      window.selectMoveValue = this.selectMoveValue;
      window.selectPreviousValue = this.selectPreviousValue;
    },
    methods: {
      selectMoveValue(value) {
        // console.log(`Value selected: ${value}`);
        this.gameValue = value;
        // window.Game.cf_moveClicked(value);
      },
      selectPreviousValue(value) {
        // console.log(`Previous value selected: ${value}`);
        this.prevGameValue = value;
        // window.Game.cf_moveClicked(value);
      },
    },
  };
</script>
