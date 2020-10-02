import Utils from "./utils";
import BigNumber from "bignumber.js";
import Types from "./types";

const $t = $('#translations').data();

const Index = {
  // ProfileManager handler methods
  pendingWithdrawn: async function () {
    window.Index.refreshData();
  },

  setup: async function () {
    console.log('%c index - setup', 'color: #00aa00');

    await window.ProfileManager.setUpdateHandler(this);
    await ProfileManager.update();
    await this.refreshData(); //  now

    // //  events
    window.NotificationManager.eventHandler = this;
    window.NotificationManager.subscribe_index();
  },

  onUnload: function () {
    console.log('%c index - onUnload', 'color: #00aa00');

    window.NotificationManager.eventHandler = null;
    window.NotificationManager.clearAll();
    window.window.ProfileManager.setUpdateHandler(null);
    hideTopBannerMessage();
  },

  refreshData: function () {
    console.log('%c index - refreshData', 'color: #1d34ff');

    // Why PlayMyCrypto
    window.Index.updateReferralFeesForAllGamesTotal();
    window.Index.updateRafflePrizesWonForAllGamesTotal(); //  now
    window.Index.updatePartnerFeesForAllGamesTotal();

    // Raffle
    window.Index.updateCurrentRaffleJackpot();

    window.Index.updateCryptoAmountPlayedOnSiteTotal();
    window.Index.updateRunningGameAmounts();
  },

  updateReferralFeesForAllGamesTotal: async function () {
    let referralTotalCF = await window.BlockchainManager.referralFeesUsedTotal(Types.Game.cf);
    let referralTotalRPS = await window.BlockchainManager.referralFeesUsedTotal(Types.Game.rps);
    let sumStr = Utils.weiToEtherFixed(referralTotalCF.plus(referralTotalRPS)).toString();
    // console.log("totalUsedReferralFees: ", sumStr);
    document.getElementById("totalUsedReferralFees").textContent = sumStr;
    document.getElementById("totalUsedFeeBeneficiary").textContent = sumStr;
  },

  updateRafflePrizesWonForAllGamesTotal: async function () {
    let raffleTotalCF = await window.BlockchainManager.rafflePrizesWonTotal(Types.Game.cf);
    let raffleTotalRPS = await window.BlockchainManager.rafflePrizesWonTotal(Types.Game.rps);
    document.getElementById("totalUsedRaffleFees").innerText = Utils.weiToEtherFixed(raffleTotalCF.plus(raffleTotalRPS)).toString();
  },

  updatePartnerFeesForAllGamesTotal: async function () {
    let partnerFeeUsedTotal_cf = new BigNumber(await window.BlockchainManager.partnerFeeUsedTotal(Types.Game.cf));
    // console.log("partnerFeeUsedTotal_cf: ", partnerFeeUsedTotal_cf.toString());

    let partnerFeeUsedTotal_rps = new BigNumber(await window.BlockchainManager.partnerFeeUsedTotal(Types.Game.rps));
    // console.log("partnerFeeUsedTotal_rps: ", partnerFeeUsedTotal_rps.toString());

    document.getElementById("totalUsedPartnerFees").textContent = Utils.weiToEtherFixed((partnerFeeUsedTotal_cf.plus(partnerFeeUsedTotal_rps)).toString());
  },

  updateCurrentRaffleJackpot: async function () {
    let currentRaffleJackpotCF = await window.BlockchainManager.currentRaffleJackpot(Types.Game.cf);
    // console.log("currentRaffleJackpot: ", currentRaffleJackpot.toString());
    document.getElementById("currentRaffleJackpotCoinFlip").textContent = Utils.weiToEtherFixed(currentRaffleJackpotCF.toString());
    
    let currentRaffleJackpotRPS = new BigNumber(await window.BlockchainManager.currentRaffleJackpot(Types.Game.rps));
    // console.log("currentRaffleJackpotRPS: ", currentRaffleJackpotRPS.toString());
    document.getElementById("currentRaffleJackpotRPS").innerText = Utils.weiToEtherFixed(currentRaffleJackpotRPS.toString());

    document.getElementById("currentRaffleJackpotTotal").innerText = Utils.weiToEtherFixed(currentRaffleJackpotCF.plus(currentRaffleJackpotRPS)).toString();
  },

  updateCryptoAmountPlayedOnSiteTotal: async function () {
    let total_cf = new BigNumber(await window.BlockchainManager.totalUsedInGame(Types.Game.cf));
    // console.log("total_cf: ", total_cf.toString());

    let total_rps = new BigNumber(await window.BlockchainManager.totalUsedInGame(Types.Game.rps));
    // console.log("total_rps: ", total_rps.toString());

    document.getElementById("cryptoAmountPlayedOnSiteTotal").rows[1].cells[1].innerHTML = Utils.weiToEtherFixed(total_cf.plus(total_rps)).toString();
  },

  updateRunningGameAmounts: async function () {
    //  created
    let created_cf = new BigNumber(await window.BlockchainManager.gamesCreatedAmount(Types.Game.cf));
    // console.log("created_cf: ", created_cf.toString());
    let created_rps = new BigNumber(await window.BlockchainManager.gamesCreatedAmount(Types.Game.rps));
    // console.log("created_rps: ", created_rps.toString());

    //  completed
    let completed_cf = new BigNumber(await window.BlockchainManager.gamesCompletedAmount(Types.Game.cf));
    // console.log("completed_cf: ", completed_cf.toString());
    let completed_rps = new BigNumber(await window.BlockchainManager.gamesCompletedAmount(Types.Game.rps));
    // console.log("completed_rps: ", completed_rps.toString());

    //  running
    let running_cf = parseInt(created_cf) - parseInt(completed_cf);
    document.getElementById("now_playing_coinflip").innerText = running_cf;

    let running_rps = parseInt(created_rps) - parseInt(completed_rps);
    document.getElementById("now_playing_rps").innerText = running_rps;
  },

  infoClicked: function (_idSuffix) {
    var popup = document.getElementById("myPopup_" + _idSuffix);
    popup.classList.toggle("show");
  },


  //  NOTIFICAtiON MNAGER EVENT HANDLERS
  onGameCreated: function (_gameType, _creator) {
    // console.log("onGameCreated - _gameType: ", _gameType, " _creator: ", _creator);
    if (_gameType == Types.Game.cf) {
      // console.log('%c index - onGameCreated_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c index - onGameCreated_RPS', 'color: #1d34ff');
    }

    window.Index.updateCryptoAmountPlayedOnSiteTotal();
    window.Index.updateRunningGameAmounts();

    if (_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      window.ProfileManager.update();
    }
  },

  onGameJoined: function (_gameType, _creator, _opponent) {
    console.log("onGameJoined - _gameType: ", _gameType, " _creator: ", _creator);

    window.Index.updateCryptoAmountPlayedOnSiteTotal();

    if (_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      window.ProfileManager.update(); // 1

      let message = "";
      if (_gameType == Types.Game.cf) {
        // console.log('%c index - onGameJoined_CF', 'color: #1d34ff');
        message = $t.cf_game_joined_pending_move;
      } else if (_gameType == Types.Game.rps) {
        // console.log('%c index - onGameJoined_RPS', 'color: #1d34ff');
        message = $t.rps_game_joined_pending_move;
      }
      showTopBannerMessage(message, null, false);
    } else if (_opponent.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      window.ProfileManager.update();
    }
  },

  onGameAddedToTop: function (_gameType) {
    if (_gameType == Types.Game.cf) {
      // console.log('%c index - onGameAddedToTop_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c index - onGameAddedToTop_RPS', 'color: #1d34ff');
    }

    window.Index.updateCryptoAmountPlayedOnSiteTotal();
  },

  onGameUpdated: function (_gameType, _creator) {
    if (_gameType == Types.Game.cf) {
      // console.log('%c index - onGameUpdated_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c index - onGameUpdated_RPS', 'color: #1d34ff');
    }

    window.Index.updateCryptoAmountPlayedOnSiteTotal();

    if (_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      window.ProfileManager.update();
    }
  },

  onGamePlayed: function (_gameType, _gameId, _creator, _opponent) {
    console.log('%c index - onGamePlayed_CF %s %s %s %s', 'color: #1d34ff', _gameType, _gameId, _creator, _opponent);

    window.Index.updateRunningGameAmounts();

    if (window.ProfileManager.isGameParticipant(_gameType, _gameId)) {
      window.ProfileManager.update();
      
      let message = "";
      switch (_gameType) {
        case Types.Game.cf:
          message = $t.your_game_finished_cf;
          break;

        case Types.Game.rps:
          message = $t.your_game_finished_rps;
          break;
      
        default:
          break;
      }
      showTopBannerMessage(message + " (id: " + _gameId + ")", null, true);
    }
  },

  onGameQuittedFinished: function (_gameType, _gameId, _creator, _opponent) {
    // console.log('%c index - onGameQuittedFinished %s %s %s %s', 'color: #1d34ff', _gameType, _gameId, _creator, _opponent);
    this.onGamePlayed(_gameType, _gameId, _creator, _opponent);
  },

  onGameExpiredFinished: function (_gameType, _gameId, _creator, _opponent) {
    // console.log('%c index - onGameExpiredFinished %s %s %s %s', 'color: #1d34ff', _gameType, _gameId, _creator, _opponent);
    this.onGamePlayed(_gameType, _gameId, _creator, _opponent);
  },

  onGamePrizesWithdrawn: function () {
    // console.log('%c index - onGamePrizesWithdrawn', 'color: #1d34ff');

    window.Index.updateCurrentRaffleJackpot();
    window.Index.updateReferralFeesForAllGamesTotal();
    window.Index.updatePartnerFeesForAllGamesTotal();
  },

  onGameRafflePlayed: function (_gameType, _winner) {
    if (_gameType == Types.Game.cf) {
      // console.log('%c index - onGameRafflePlayed_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c index - onGameRafflePlayed_RPS', 'color: #1d34ff');
    }

    window.Index.updateRafflePrizesWonForAllGamesTotal();
    window.Index.updateCurrentRaffleJackpot();
    
    if (Utils.addressesEqual(_winner, window.BlockchainManager.currentAccount())) {
      window.ProfileManager.update();
    }
  },











  // onGameOpponentMoved: function (_id, _nextMover) {
  //   // console.log('%c index - onGameRafflePlayed_RPS', 'color: #1d34ff');

  //   if (_nextMover.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
  //     showTopBannerMessage($t.rps_pending_move, null, false);
  //   }
  // },

  // onGameMovePlayed: function (_id, _nextMover) {
  //   // console.log('%c index - onGameMovePlayed_RPS', 'color: #1d34ff');

  //   if (_nextMover.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
  //     showTopBannerMessage($t.rps_pending_move, null, false);
  //   }
  // },

  // onGameFinished: async function (_id) {
  //   // console.log('%c index - onGameFinished_RPS, _id: %s', 'color: #1d34ff', _id);

  //   window.Index.updateRunningGameAmounts();

  //   if (ProfileManager.isGameParticipant(Types.Game.rps, _id)) {
  //     // console.log("YES participant");
  //     let gameInfo = await window.BlockchainManager.gameInfoPromise(Types.Game.rps, _id);

  //     let infoStr = "";
  //     switch (parseInt(gameInfo.state)) {
  //       case Types.GameState.winnerPresent:
  //         infoStr = (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount())) ? $t.won_ongoing_game : $t.lost_ongoing_game;
  //         break;

  //       case Types.GameState.draw:
  //         infoStr = $t.draw_ongoing_game;
  //         break;

  //       case Types.GameState.quitted:
  //         infoStr = (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount())) ? $t.won_ongoing_game_opponent_quitted : $t.lost_ongoing_game_you_quitted;
  //         break;

  //       case Types.GameState.expired:
  //         infoStr = (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount())) ? $t.won_ongoing_game_opponent_expired : $t.lost_ongoing_game_you_expired;
  //         break;
  //     }

  //     showTopBannerMessage(infoStr, null, false);
  //     setTimeout(function () {
  //       hideTopBannerMessage();
  //     }, 5000);

  //     await window.ProfileManager.update();
  //   } else {
  //     console.log("NOT participant");
  //   }
  // }
};

window.Index = Index;