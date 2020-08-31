<template>
  <div class="pt-4">
    <div class="container">
      <div class="row">
        <div class="col-sm-8">
          <div class="shadow-block inner-padding">
            <div class="game-area" id="gameBlock">
              <cf-game v-if="currentGame === 'cf'" ref="cfGame"></cf-game>
              <rps-game v-if="currentGame === 'rps'" ref="rpsGame"></rps-game>
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
          </div>-->

          <!-- <div class="tmp-block" v-if="currentGame === 'rps'">
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpsstart')">Start</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpswfopponent')">Waiting Opponent</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpsjoingame')">Join</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpswfopponentmove')">Waiting Move</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpscreatormove')">Creator Move</button>
            <button class="btn btn-primary mr-2" onclick="window.showGameBlock('rpsopponentmove')">Opponent Move</button>
          </div>-->

          <div class="mt-4">
            <h3 class="info-title mr-5 ml-5" @click="$modal.show('how-to-play-popup')">How to play?</h3>
            <h3 class="info-title" @click="$modal.show('faq-popup')">FAQ</h3>

            <modal name="how-to-play-popup" :height="600" :width="600">
              <h2 slot class="text-primary text-center pt-3">
                How to Play
              </h2>
              <div
                id="BlockHowToPlayCF"
                class="cards-pills-list scrollbar-popup-inner p20"
                v-if="currentGame === 'cf'"
                v-html="$t('HOW_TO_PLAY_CF')"
              ></div>
              <div
                id="BlockHowToPlayRPS"
                class="cards-pills-list scrollbar-popup-inner p20"
                v-if="currentGame === 'rps'"
                v-html="$t('HOW_TO_PLAY_RPS')"
              ></div>
            </modal>

            <modal name="faq-popup" :height="600" :width="600">
              <h2 slot class="text-primary text-center pt-3">
                FAQ
              </h2>
              <div
                id="BlockFAQCF"
                class="cards-pills-list scrollbar-popup-inner p20"
                v-if="currentGame === 'cf'"
                v-html="$t('FAQ')"
              ></div>
              <div
                id="BlockFAQRPS"
                class="cards-pills-list scrollbar-popup-inner p20"
                v-if="currentGame === 'rps'"
                v-html="$t('FAQ')"
              ></div>
            </modal>
          </div>

          <div class="mt-3">
            <div class="raffle shadow-block" id="raffleBlock">
              <div class="header position-relative">
                <div>{{ $t("RAFFLE") }}</div>
                <div class="f13">{{ $t("IN_RAFFLE") }}:</div>

                <div class="raffle-amount">
                  <b id="cryptoForRaffle">0.00000</b>
                  <img
                    src="/img/icon_amount-eth.svg"
                    class="money-icon"
                    v-show="currency === 'eth'"
                  />
                  <img
                    src="/img/icon_amount-trx.svg"
                    class="money-icon"
                    v-show="currency === 'trx'"
                  />
                </div>
              </div>
              <div class="content">
                <div class="participants">
                  <img src="/img/game-icon-users.svg" class="mr-2" />
                  <span class="f16">{{ $t("PARTICIPANTS") }}:</span>
                  <b class="f18">
                    <span id="rafflePlayingAmount">0</span>
                    /
                    <span id="raffleActivationAmount">0</span>
                  </b>
                  <button
                    id="raffleStartBtn"
                    onclick="window.Game.startRaffle()"
                    class="btn long-btn btn-primary rounded-button float-right"
                    disabled
                  >{{ $t("START") }}
                  </button>
                </div>
                <div class="participants pt-3">
                  <img src="/img/game-icon-quality.svg" class="mr-2" />
                  {{ $t("LAST_WINNER") }}:
                </div>
                <div class="scrollbar-inner list-no-style" id="BlockRaffle"></div>
              </div>
            </div>

            <div id="beneficiaryBlock" class="how-to-play shadow-block">
              <div class="header position-relative">
                <div>{{ $t("BENEFICIARY_FEE") }}</div>
                <div class="f13">{{ $t("BENEFICIARY_PROFIT") }}:</div>

                <div class="raffle-amount">
                  <b id="beneficiaryAmount">0.00000</b>
                  <img
                    src="/img/icon_amount-eth.svg"
                    class="money-icon"
                    v-show="currency === 'eth'"
                  />
                  <img
                    src="/img/icon_amount-trx.svg"
                    class="money-icon"
                    v-show="currency === 'trx'"
                  />
                </div>
              </div>
              <div class="content">
                <b class="f18">{{ $t("BENEFICIARY_CURRENT") }}:</b>
                <div class="ml-5">
                  <small id="beneficiaryUser">0x0</small>
                </div>
                <div class="ml-5">
                  {{ $t("BENEFICIARY_TRANSFERRED") }}:
                  <b id="beneficiaryTransferred">0.00000</b>
                  <img
                    src="/img/icon_amount-eth.svg"
                    class="money-icon"
                    v-show="currency === 'eth'"
                  />
                  <img
                    src="/img/icon_amount-trx.svg"
                    class="money-icon"
                    v-show="currency === 'trx'"
                  />
                </div>

                <div class="mt-4 hidden beneficiary-block" id="beneficiaryProfit">
                  <b class="f18">{{ $t("BENEFICIARY_PROFIT") }}:</b>
                  <h3 class="text-center current-profit-block">
                    <span class="text-primary current-profit" id="beneficiaryCurrentAmount">0.00000</span>
                    <img
                      src="/img/icon_amount-eth.svg"
                      class="money-icon"
                      v-show="currency === 'eth'"
                    />
                    <img
                      src="/img/icon_amount-trx.svg"
                      class="money-icon"
                      v-show="currency === 'trx'"
                    />
                  </h3>
                </div>

                <div class="mt-4 beneficiary-block" id="makeBeneficiary">
                  <h3 class="text-center text-primary mb-3">{{ $t("BENEFICIARY_NEXT") }}</h3>
                  <div class="text-center transfer-block">
                    {{ $t("BENEFICIARY_TRANSFER") }}:
                    <input type="number" class="ml-2 mr-1" step="0.01" min="0.01" id="beneficiaryTransferAmount" />
                    <img
                      src="/img/icon_amount-eth.svg"
                      class="money-icon"
                      v-show="currency === 'eth'"
                    />
                    <img
                      src="/img/icon_amount-trx.svg"
                      class="money-icon"
                      v-show="currency === 'trx'"
                    />
                  </div>

                  <div class="text-center mt-1">
                    <button class="btn withdraw-btn" onclick="Game.makeBeneficiaryClicked()"> {{ $t("MAKE_ME_BENEFICIARY") }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-sm-4">
          <div class="shadow-block">
            <div class="position-relative">
              <h2 class="text-primary p20 mb-0 pb-0">{{ $t("TOP_GAMES") }}</h2>
              <div class="inner-padding scrollbar-inner list-no-style" id="TopGames"></div>
            </div>

            <div class="bg-primary text-white mt-3 p-3">
              <img src="/img/game-icon-money.svg" />
              {{ $t("LIST_OPENED_GAMES") }}:
            </div>

            <div class="position-relative" id="availableGamesBlock">
              <h2 class="text-primary p20 mb-0 pb-0">{{ $t("AVAILABLE_GAMES") }}</h2>

              <div id="AvailableGames" class="inner-padding scrollbar-inner list-no-style"></div>
            </div>

            <div class="inner-padding">
              <button
                class="btn long-btn btn-primary rounded-button full-width mt-2"
                id="loadMoreAvailableGamesBtn"
                onclick="window.Game.loadMoreAvailableGames()"
              >{{ $t("LOAD_MORE") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Types from "../blockchain/types";

  export default {
    data: function () {
      return {
        currentGame: "",
      };
    },
    computed: {
      currency() {
        return this.$store.state.currency;
      },
    },
    mounted() {
      this.currentGame = window.location.pathname.replace("/", "");
      console.log("----------- Open Game page for:", this.currentGame);

      window.CommonManager.setCurrentView(Types.View.game);

      let recaptchaScript = document.createElement("script");
      recaptchaScript.setAttribute("src", "/game.js");
      document.head.appendChild(recaptchaScript);

      let currentGameTmp = this.currentGame;
      let loadInterval = setInterval(function () {
        if (typeof window.Game !== "undefined") {
          if (window.BlockchainManager.isInitted()) {
            clearInterval(loadInterval);
            window.Game.setup(currentGameTmp);
          }
        }
      }, 100);
    },
    beforeRouteLeave(to, from, next) {
      console.log("Leave Game page");
      window.Game.gameType = -1;
      window.Game.onUnload();
      document.getElementById("gameName").innerHTML = "";

      next();
    },
  };
</script>
