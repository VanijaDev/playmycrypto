import BlockchainManager from "./blockchainManager/blockchainManager";
import { PromiseManager } from "./promiseManager";
import { Utils } from "../utils";
import BigNumber from "bignumber.js";
import Types from "../types";

let ProfileManager = {
  GAMES_TOTAL_AMOUNT: 2,

  PendingWithdraw: {
    referral: "ReferralPicList",
    gamePrize: "GamePrizePicList",
    raffle: "RafflePrizePicList"
  },

  profileUpdateHandler: null,

  ongoingGameCF: new BigNumber("0"),
  ongoingGameRPS: new BigNumber("0"),

  setProfileUpdateHandler: function(_handler) {
    this.profileUpdateHandler = _handler;
    this.checkIfNextMover();
  },

  update: async function () {
    console.log('%c ProfileManager - update', 'color: #00aa00');
    
    hideTopBannerMessage();
    this.updateCurrentAccountUI();
    this.updateCurrentAccountBalanceUI();

    await this.updateCurrentlyPlayingGames();
    await this.updatePlayedGamesTotalAmounts();
    await this.updatePlayerGameplayProfit();
    // await this.updateReferralFeesWithdrawn();
    // await this.updatePlayerTotalProfit();
    // await this.updatePending();

    // this.profileUpdated();
  },

  updateAfterWithdrawal: async function () {
    console.log('%c updateAfterWithdrawal - update', 'color: #00aa00');
    
    this.updateCurrentAccountBalanceUI();

    await this.updatePlayerGameplayProfit();
    await this.updatePlayerTotalProfit();
    await this.updateReferralFeesWithdrawn();
    await this.updatePending();
  },

  profileUpdated: function() {
    if (this.profileUpdateHandler) {
      if (typeof(this.profileUpdateHandler.profileUpdated) == "function"){
        this.profileUpdateHandler.profileUpdated();
      }
    }
  },

  updateCurrentAccountUI: async function () {
    let account = window.BlockchainManager.currentAccount();
    document.getElementById("playerAccount").innerText = account.replace(/(0x[a-zA-Z0-9]{3})[a-zA-Z0-9]{34}/, "$1***");
  },

  updateCurrentAccountBalanceUI: async function () {
    let balance = (await window.BlockchainManager.getBalance()).toString();
    document.getElementById("currentAccountBalance").innerText = Utils.weiToEtherFixed(balance);
  },

  updateCurrentlyPlayingGames: async function () {
    Utils.clearElementIcons($('#listCurrentlyPlayingGames'));

    this.ongoingGameCF = new BigNumber(await PromiseManager.ongoingGameIdxForCreatorPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (this.ongoingGameCF.comparedTo(new BigNumber("0")) == 1) {
      Utils.addGameIconsToElement($('#listCurrentlyPlayingGames'), [Types.Game.cf]);
    }

    this.ongoingGameRPS = new BigNumber(await PromiseManager.ongoingGameIdxForPlayerPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (this.ongoingGameRPS.comparedTo(new BigNumber("0")) == 1) {
      Utils.addGameIconsToElement($('#listCurrentlyPlayingGames'), [Types.Game.rps]);
    }
  },

  updatePlayedGamesTotalAmounts: async function () {
    let cfResult = await PromiseManager.participatedGameIdxsForPlayerPromise(Types.Game.cf, window.BlockchainManager.currentAccount());
    document.getElementById("coinFlipPlayedTotalAmount").innerText = cfResult.length;

    let rpsResult = await PromiseManager.playedGameIdxsForPlayerPromise(Types.Game.rps, window.BlockchainManager.currentAccount());
    document.getElementById("rockPaperScissorsPlayedTotalAmount").innerText = rpsResult.length;
  },

  updatePlayerGameplayProfit: async function () {
    //  gameplay
    var profitAmountElement = document.getElementById("profit_amount_gameplay");
    profitAmountElement.classList.remove("red");
    profitAmountElement.classList.add("green");

    let cfBetResult = new BigNumber(await PromiseManager.addressBetTotalPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let rpsBetResult = new BigNumber(await PromiseManager.addressBetTotalPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    let totalBet = cfBetResult.plus(rpsBetResult);

    let cfPrizeResult = new BigNumber(await PromiseManager.addressPrizeTotalPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let rpsPrizeResult = new BigNumber(await PromiseManager.addressPrizeTotalPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    let prizeTotal = cfPrizeResult.plus(rpsPrizeResult);

    let profit = prizeTotal.minus(totalBet);
    profitAmountElement.innerText = Utils.weiToEtherFixed(profit.toString());

    if (profit.comparedTo(new BigNumber("0")) < 0) {
      document.getElementById("updownpic_gameplay").innerHTML = '<img src="/images/icon-trending-down.svg">';
      profitAmountElement.classList.remove("green");
      profitAmountElement.classList.add("red");
    } else {
      document.getElementById("updownpic_gameplay").innerHTML = '<img src="/images/icon-trending-up.svg">';
    }
  },

  updateReferralFeesWithdrawn: async function () {
    let cfResult = new BigNumber(await PromiseManager.referralFeesWithdrawnPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    document.getElementById('ReferralFeesWithdrawnCoinflip').innerHTML = Utils.weiToEtherFixed(cfResult.toString());

    let rpsResult = new BigNumber(await PromiseManager.referralFeesWithdrawnPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    document.getElementById('ReferralFeesWithdrawnRPS').innerHTML = Utils.weiToEtherFixed(rpsResult.toString());
  },

  updatePlayerTotalProfit: async function () {
    // console.log("updatePlayerTotalProfit");

    //  raffle
    //  cf
    let totalProfit = new BigNumber("0");
    
    let raffleResults = await PromiseManager.raffleResultCountPromise(Types.Game.cf);
    for (let i = 0; i < raffleResults; i ++) {
      let resultInfo = await PromiseManager.raffleResultInfoPromise(Types.Game.cf, i);
      // console.log("raffleResults cf ", i, resultInfo);
      if (Utils.addressesEqual(resultInfo.winner, window.BlockchainManager.currentAccount())) {
        totalProfit = totalProfit.plus(resultInfo.prize);
      }
    }
    // console.log("raffleResults cf: ", totalProfit.toString());
    //  rps
    raffleResults = await PromiseManager.raffleResultCountPromise(Types.Game.rps);
    for (let i = 0; i < raffleResults; i ++) {
      let resultInfo = await PromiseManager.raffleResultInfoPromise(Types.Game.rps, i);
      // console.log("raffleResults rps ", i, resultInfo);
      if (Utils.addressesEqual(resultInfo.winner, window.BlockchainManager.currentAccount())) {
        totalProfit = totalProfit.plus(resultInfo.prize);
      }
    }
    // console.log("raffleResults totalProfit after rps: ", totalProfit.toString());

    //  referral
    let cfReferralResult = new BigNumber(await PromiseManager.referralFeesWithdrawnPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("cfReferralResult: ", cfReferralResult.toString());
    let rpsReferralResult = new BigNumber(await PromiseManager.referralFeesWithdrawnPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // console.log("rpsReferralResult: ", rpsReferralResult.toString());
    totalProfit = totalProfit.plus(cfReferralResult).plus(rpsReferralResult);
    // console.log("totalProfit: ", totalProfit.toString());
    // console.log("totalProfit: raffle + referral: ", totalProfit.toString());
    // console.log("totalProfit raffle + referral: ", new BigNumber(Utils.weiToEtherFixed(totalProfit).toString()).toString());

    let gameplayProfit = new BigNumber(profit_amount_gameplay.innerText);
    // console.log("gameplayProfit: ", gameplayProfit.toString());

    totalProfit = new BigNumber(Utils.weiToEtherFixed(totalProfit).toString()).plus(gameplayProfit);
    // console.log("totalProfit: ", totalProfit.toString());

    var profitAmountTotalElement = document.getElementById("profit_amount_total");
    let totalProfitLengthCorrect = parseFloat(totalProfit).toFixed(5);
    profitAmountTotalElement.innerHTML = totalProfitLengthCorrect.toString();

    if (totalProfit.comparedTo(new BigNumber("0")) < 0) {
      document.getElementById("updownpic_total").innerHTML = '<img src="/images/icon-trending-down.svg">';
      profitAmountTotalElement.classList.remove("green");
      profitAmountTotalElement.classList.add("red");
    } else {
      document.getElementById("updownpic_total").innerHTML = '<img src="/images/icon-trending-up.svg">';
      profitAmountTotalElement.classList.remove("red");
      profitAmountTotalElement.classList.add("green");
    }
  },

  updatePending: async function () {
    this.updatePendingReferral();
    this.updatePendingGamePrize();
    this.updatePendingRafflePrize();
  },

  updatePendingReferral: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await PromiseManager.referralFeesPendingPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (cfResult.comparedTo(new BigNumber("0")) > 0) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }

    let rpsResult = new BigNumber(await PromiseManager.referralFeesPendingPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (rpsResult.comparedTo(new BigNumber("0")) > 0) {
      pendingGames.push(Types.Game.rps);
      pendingValues.push(rpsResult);
    }

    this.updatePendingPictures(this.PendingWithdraw.referral, pendingGames, pendingValues);
  },

  updatePendingGamePrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResultGames = await PromiseManager.gamesWithPendingPrizeWithdrawalForAddressPromise(Types.Game.cf, window.BlockchainManager.currentAccount());
    if (new BigNumber(cfResultGames.length.toString()).comparedTo(new BigNumber("0"))) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResultGames.length);
    }

    let rpsResultGames = await PromiseManager.gamesWithPendingPrizeWithdrawalForAddressPromise(Types.Game.rps, window.BlockchainManager.currentAccount());
    if (new BigNumber(rpsResultGames.length.toString()).comparedTo(new BigNumber("0"))) {
      pendingGames.push(Types.Game.rps);
      pendingValues.push(rpsResultGames.length);
    }

    this.updatePendingPictures(this.PendingWithdraw.gamePrize, pendingGames, pendingValues);
  },

  updatePendingRafflePrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await PromiseManager.rafflePrizePendingForAddressPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (cfResult.comparedTo(new BigNumber("0")) > 0) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }

    let rpsResult = new BigNumber(await PromiseManager.rafflePrizePendingForAddressPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (rpsResult.comparedTo(new BigNumber("0")) > 0) {
      pendingGames.push(Types.Game.rps);
      pendingValues.push(rpsResult);
    }
    
    this.updatePendingPictures(this.PendingWithdraw.raffle, pendingGames, pendingValues);
  },























  // updatePendingPrizesForGames: async function (_gameInst, _gameIds) {
  //   let totalPrize = 0;
  //   await Utils.asyncForEach( _gameIds, async id => {
  //     let gameInfo = await PromiseManager.getGameInfoPromise(_gameInst, id);
  //     totalPrize += gameInfo.bet * 2 * 0.95;
  //   });
  //   return totalPrize;
  // },

  isGameParticipant: function(_gameType, _id) {
    if (_gameType == Types.Game.cf) {
      return this.ongoingGameCF.comparedTo(new BigNumber(_id)) == 0;
    } else if (_gameType == Types.Game.rps) {
      return this.ongoingGameRPS.comparedTo(new BigNumber(_id)) == 0;
    } else {
      throw("ERROR: " + _gameType + _id);
    }
  },

  checkIfNextMover: async function() {
    if (this.ongoingGameRPS.comparedTo(new BigNumber("0")) == 1) {
      let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.rps, this.ongoingGameRPS);
      if (Utils.addressesEqual(gameInfo.nextMover, window.BlockchainManager.currentAccount())) {
        showTopBannerMessage("Rock Paper Scissors: you have pending move.");
      }
    }
  },

  /**
   * HELPERS
   */
  updatePendingPictures: function (_pendingTarget, _gamesWithPendingPrize, _pendingValues) {
    // console.log("updatePendingPictures: ", _pendingTarget, _gamesWithPendingPrize, _pendingValues.toString());
    $('#' + _pendingTarget).empty();
    this.showPendingDot(false, _pendingTarget);

    if (_gamesWithPendingPrize.length > 0) {
      this.showPendingDot(true, _pendingTarget);

      _gamesWithPendingPrize.map((value, idx) => {
        let pendingValue = Utils.weiToEtherFixed(_pendingValues[idx]);
        let tooltipSuffix = " ETH";
        
        if (_pendingTarget == this.PendingWithdraw.gamePrize) {
          pendingValue = _pendingValues[idx];
          tooltipSuffix = " games";
        }
        var pictureTemplate = '<li><button class="pendingWithdraw pending_btn" style="background: url(/images/' + Utils.gameIconSmallForGame(value) + '.svg) no-repeat center transparent;" onclick="ProfileManager.pendingClicked(this, ' + _pendingTarget + ', ' + value + ')"> <span class="tooltiptext">' + pendingValue + tooltipSuffix + '</span> </button></li>';
        $('#' + _pendingTarget).append(pictureTemplate);
      });
    }
  },

  showPendingDot: function (_isShow, _pendingTarget) {
    switch (_pendingTarget) {
      case this.PendingWithdraw.gamePrize:
        _isShow ? $('#GamePrizePointer').addClass('blue') : $('#GamePrizePointer').removeClass('blue');
        break;
      case this.PendingWithdraw.referral:
        _isShow ? $('#ReferralPointer').addClass('blue') : $('#ReferralPointer').removeClass('blue');
        break;
      case this.PendingWithdraw.raffle:
        _isShow ? $('#RafflePrizePointer').addClass('blue') : $('#RafflePrizePointer').removeClass('blue');
        break;

      default:
        break;
    }
  },

  pendingClicked: async function(_btn, _pendingTarget, _gameType) {
    // console.log("_gameType: ", _gameType);
    let gameContract = window.BlockchainManager.gameContractForGameType(_gameType);
    // console.log("gameContract: ", gameContract);

    _btn.classList.add('disabled');

    switch (_pendingTarget.id) {
      case this.PendingWithdraw.referral:
        // console.log('%c pendingClicked - ReferralPicList', 'color: #000baa');

        gameContract.methods.withdrawReferralFees().send({
          from: window.BlockchainManager.currentAccount,
          gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
        })
        .on('transactionHash', function(hash){
          // console.log('%c ReferralPicList on transactionHash event: %s', 'color: #1d34ff', hash);
          showTopBannerMessage("REFERRAL FEE WITHDRAW transaction ", hash);
        })
        .once('receipt', function(receipt){
          hideTopBannerMessage();
          ProfileManager.updateAfterWithdrawal();
        })
        .once('error', function (error, receipt) {
          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showAlert('error', "Error on withdraw referral fees transaction");
          }

          hideTopBannerMessage();
        });
        break;

      case this.PendingWithdraw.gamePrize:
        // console.log('pendingClicked - GamePrizePicList');
        
        let cfResultGames = await PromiseManager.getGamesWithPendingPrizeWithdrawalForAddressPromise(gameContract, window.BlockchainManager.currentAccount());
        let loopAmount = Math.min(cfResultGames.length, 10);
        
        gameContract.methods.withdrawGamePrizes(loopAmount).send({
          from: window.BlockchainManager.currentAccount,
          gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
        })
        .on('transactionHash', function(hash){
          // console.log('%c GamePrizePicList on transactionHash event: %s', 'color: #1d34ff', hash);
          showTopBannerMessage("GAME PRIZE WITHDRAW transaction ", hash);
        })
        .once('receipt', function(receipt){
          hideTopBannerMessage();
          ProfileManager.updateAfterWithdrawal();
        })
        .once('error', function (error, receipt) {
          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showAlert('error', "Error on withdraw game prizes transaction");
          }
          hideTopBannerMessage();
        });
        break;

      case this.PendingWithdraw.raffle:
        // console.log('%c pendingClicked - RafflePrizePicList', 'color: #000baa');

        gameContract.methods.withdrawRafflePrizes().send({
          from: window.BlockchainManager.currentAccount,
          gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
        })
        .on('transactionHash', function(hash){
          // console.log('%c RafflePrizePicList on transactionHash event: %s', 'color: #1d34ff', hash);
          showTopBannerMessage("RAFFLE FEE WITHDRAW transaction ", hash);
        })
        .once('receipt', function(receipt){
          hideTopBannerMessage();
          ProfileManager.updateAfterWithdrawal;
        })
        .once('error', function (error, receipt) {
          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showAlert('error', "Error on withdraw raffle prize transaction");
          }
          hideTopBannerMessage();
        });
        break;

      default:
        break;
    }
  },

}

window.ProfileManager = ProfileManager;

export {
  ProfileManager
};
