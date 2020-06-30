import BlockchainManager from "./managers/blockchainManager/blockchainManager";
import {NotificationManager} from "./managers/notificationManager";
import {Utils} from "./utils";
import BigNumber from "bignumber.js";
import {ProfileManager} from "./managers/profileManager";
import {PromiseManager} from "./managers/promiseManager";
import Types from "./types";


const Index = {
  version: "1.0.0",

  pageLoaded: false,
  initialSetupDone: false,
  networkId: 0,

  //  ProfileManager callback
  profileUpdated: function () {
    ProfileManager.checkIfNextMover();
  },

  setup: async function () {
    console.log('%c index - setup', 'color: #00aa00');

    window.CommonManager.setCurrentView(Types.View.index);

    await window.BlockchainManager.init();
    ProfileManager.profileUpdateHandler = this;
    await this.refreshData();

    this.setupOnce();
  },

  setupOnce: function () {
    console.log('%c index - setupOnce', 'color: #00aa00');
    if (!this.initialSetupDone) {
      this.initialSetupDone = true;

      NotificationManager.eventHandler = this;
      NotificationManager.subscribeAll();
    }
  },

  onUnload: function () {
    ProfileManager.profileUpdateHandler = null;
    NotificationManager.eventHandler = null;
    NotificationManager.clearAll();
  },

  refreshData: function () {
    console.log('%c index - refreshData', 'color: #1d34ff');

    // Advantages
    Index.updateReferralFeesForAllGamesTotal();
    Index.updateOngoinRafflePrize();
    Index.updatePartnerFeesForAllGamesTotal();

    // // Raffle
    Index.updateRafflePrizesWonTotal();

    Index.updateCryptoAmountPlayedOnSiteTotal();
    Index.updateRunningGameAmounts();
  },

  updateReferralFeesForAllGamesTotal: async function () {
    let totalUsedReferralFees = await window.BlockchainManager.totalUsedReferralFees();
    // console.log("totalUsedReferralFees: ", totalUsedReferralFees.toString());
    document.getElementById("totalUsedReferralFees").textContent = Utils.weiToEtherFixed(totalUsedReferralFees.toString());
  },

  updateOngoinRafflePrize: async function () {
    let ongoinRafflePrize = await window.BlockchainManager.ongoinRafflePrize();
    // console.log("ongoinRafflePrize: ", ongoinRafflePrize.toString());
    document.getElementById("ongoinRafflePrize").textContent = Utils.weiToEtherFixed(ongoinRafflePrize.toString());
  },

  updatePartnerFeesForAllGamesTotal: async function () {
    let partnerFeeUsedTotal_cf = new BigNumber(await window.BlockchainManager.partnerFeeUsedTotal(Types.Game.cf));
    // console.log("partnerFeeUsedTotal_cf: ", partnerFeeUsedTotal_cf.toString());

    let partnerFeeUsedTotal_rps = new BigNumber(await window.BlockchainManager.partnerFeeUsedTotal(Types.Game.rps));
    // console.log("partnerFeeUsedTotal_rps: ", partnerFeeUsedTotal_rps.toString());

    document.getElementById("totalUsedPartnerFees").textContent = Utils.weiToEtherFixed((partnerFeeUsedTotal_cf.plus(partnerFeeUsedTotal_rps)).toString());
  },

  updateRafflePrizesWonTotal: async function () {
    let raffled_cf = new BigNumber(await window.BlockchainManager.rafflePrizesWonTotal(Types.Game.cf));
    // console.log("raffled_cf: ", raffled_cf.toString());
    document.getElementById("rafflePrizesWonTotalGameCoinFlip").innerText = Utils.weiToEtherFixed(raffled_cf.toString());

    let raffled_rps = new BigNumber(await window.BlockchainManager.rafflePrizesWonTotal(Types.Game.rps));
    // console.log("raffled_rps: ", raffled_rps.toString());
    document.getElementById("rafflePrizesWonTotalGameRPS").innerText = Utils.weiToEtherFixed(raffled_rps.toString());

    document.getElementById("rafflePrizesWonTotal").innerText = Utils.weiToEtherFixed(raffled_cf.plus(raffled_rps)).toString();
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
    console.log("onGameCreated - _gameType: ", _gameType, " _creator: ", _creator);
    if (_gameType == Types.Game.cf) {
      console.log('%c index - onGameCreated_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      console.log('%c index - onGameCreated_RPS', 'color: #1d34ff');
    }

    Index.updateCryptoAmountPlayedOnSiteTotal();
    Index.updateRunningGameAmounts();

    if (_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      ProfileManager.update();
    }
  },

  onGamePlayed: function (_gameId) {
    console.log('%c index - onGamePlayed_CF %s', 'color: #1d34ff', _gameId);

    Index.updateCryptoAmountPlayedOnSiteTotal();
    Index.updateRunningGameAmounts();

    if (ProfileManager.isGameParticipant(Types.Game.cf, _gameId)) {
      ProfileManager.update();
    }
  },

  onGameUpdated: function (_gameType, _creator) {
    if (_gameType == Types.Game.cf) {
      console.log('%c index - onGameUpdated_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      console.log('%c index - onGameUpdated_RPS', 'color: #1d34ff');
    }

    Index.updateCryptoAmountPlayedOnSiteTotal();

    if (_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      ProfileManager.update();
    }
  },

  onGamePrizesWithdrawn: function (_gameType) {
    if (_gameType == Types.Game.cf) {
      console.log('%c index - onGamePrizesWithdrawn_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      console.log('%c index - onGamePrizesWithdrawn_RPS', 'color: #1d34ff');
    }

    Index.updateReferralFeesForAllGamesTotal();
    Index.updateOngoinRafflePrize();
    Index.updatePartnerFeesForAllGamesTotal();
  },

  onGameRafflePlayed: function (_gameType, _winner) {
    if (_gameType == Types.Game.cf) {
      console.log('%c index - onGameRafflePlayed_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      console.log('%c index - onGameRafflePlayed_RPS', 'color: #1d34ff');
    }

    Index.updateRafflePrizesWonTotal();
    Index.updateOngoinRafflePrize();

    if (_winner.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      ProfileManager.update();
    }
  },

  onGameOpponentMoved: function (_id, _nextMover) {
    console.log('%c index - onGameRafflePlayed_RPS', 'color: #1d34ff');

    if (_nextMover.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      showTopBannerMessage("Rock Paper Scissors: you have pending move");
    }
  },

  onRafflePrizeWithdrawn: function (_gameType, _winner) {
    if (_gameType == Types.Game.cf) {
      console.log('%c index - onRafflePrizeWithdrawn_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      console.log('%c index - onRafflePrizeWithdrawn_RPS', 'color: #1d34ff');
    }

    Index.updateReferralFeesForAllGamesTotal();
    Index.updatePartnerFeesForAllGamesTotal();
    Index.updateOngoinRafflePrize();

    if (_winner.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      ProfileManager.update();
    }
  },

  onGameReferralWithdrawn: function (_gameType, _address) {
    if (_gameType == Types.Game.cf) {
      console.log('%c index - onGameReferralWithdrawn_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      console.log('%c index - onGameReferralWithdrawn_RPS', 'color: #1d34ff');
    }

    if (_address.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      ProfileManager.update();
    }
  },

  onGameJoined: function (_gameType, _creator, _opponent) {
    if (_gameType == Types.Game.cf) {
      console.log('%c index - onGameJoined_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      console.log('%c index - onGameJoined_RPS', 'color: #1d34ff');
    }

    Index.updateCryptoAmountPlayedOnSiteTotal();

    if (_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      showTopBannerMessage("Rock Paper Scissors: game was joined, you have pending move.");
    } else if (_opponent.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      ProfileManager.update();
    }
  },

  onGameFinished: async function (_id) {
    console.log('%c index - onGameFinished_RPS, _id: %s', 'color: #1d34ff', _id);

    Index.updateRunningGameAmounts();

    if (ProfileManager.isGameParticipant(Types.Game.rps, _id)) {
      // console.log("YES participant");
      let gameInfo = await PromiseManager.gameInfoPromise(window.BlockchainManager.rockPaperScissorsContract, _id);

      let infoStr = "";
      switch (parseInt(gameInfo.state)) {
        case Utils.GameState.winnerPresent:
          infoStr = (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount)) ? "Congrats! You WON ongoing game." : "Oh, you LOST ongoing game.";
          break;

        case Utils.GameState.draw:
          infoStr = "Ongoing game has just ended in a DRAW.";
          break;

        case Utils.GameState.quitted:
          infoStr = (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount)) ? "Congrats! You WON ongoing game, opponent quitted." : "Oh, you LOST ongoing game, you quitted.";
          break;

        case Utils.GameState.expired:
          infoStr = (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount)) ? "Congrats! You WON ongoing game, opponent's move expired." : "Oh, you LOST ongoing game, your move expired.";
          break;
      }

      showTopBannerMessage(infoStr, null);
      setTimeout(function () {
        hideAndClearNotifView();
      }, 5000);

      ProfileManager.update();
    } else {
      console.log("NOT participant");
    }
  }
};

window.Index = Index;

// window.addEventListener('load', async () => {
//   console.log('%c index - load', 'color: #00aa00');

//   Index.pageLoaded = true;
//   await Index.setup();
// });

// window.addEventListener('onunload', async () => {
//   console.log('%c index - onunload', 'color: #00aa00');

//   Index.onUnload();
// });


// ethereum.on('accountsChanged', function (accounts) {
//   if (!Index.pageLoaded) {
//     return;
//   }

//   console.log('%c index - accountsChanged', 'color: #00aa00');
//   window.BlockchainManager.accountChanged();
// });

// ethereum.on('networkChanged', function (accounts) {
//   if (!Index.pageLoaded) {
//     return;
//   }

//   console.log('%c index - networkChanged', 'color: #00aa00');
//   window.BlockchainManager.setup();
// });
