import BlockchainManager from "../managers/blockchainManager/blockchainManager";
import { PromiseManager } from "../managers/promiseManager";
import {  Game } from "../game";
import { Utils } from "../utils";
import BigNumber from "bignumber.js";
import { ProfileManager } from "../managers/profileManager";
import Types from "../types";

const CoinFlip = {
  ownerAddress: "",
  coinSideChosen: 0,
  minBet: "",

  updateGameView: async function() {
    console.log('%c CoinFlip - updateGameView', 'color: #00aa00');

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    this.ownerAddress = await PromiseManager.ownerPromise(Types.Game.cf);
    this.minBet = new BigNumber((await PromiseManager.minBetForGamePromise(Types.Game.cf)).toString());

    this.setPlaceholders();
    this.showGameViewForCurrentAccount();
  },

  setPlaceholders: function () {
    $('#cf_game_referral_start')[0].placeholder = this.ownerAddress;
    $('#cf_bet_input')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);

    $('#cf_game_referral_join')[0].placeholder = this.ownerAddress;
    $('#cf_update_bet_input')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
  },

  //  game view
  showGameViewForCurrentAccount: async function () {
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);

    let id = parseInt(await PromiseManager.createdGameIdForAccountPromise(Types.Game.cf, window.BlockchainManager.currentAccount()));
    console.log("showGameViewForCurrentAccount id: ", id);

    if (id == 0) {
      this.showGameView("cfstart", null);
    } else {
      let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.cf, id);
      this.showGameView("cfmaketop", gameInfo);
    }

    window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
  },

  showJoinGame: function (_gameInfo) {
    // console.log("showJoinGame: ", _gameInfo);
    this.showGameView("cfjoin", _gameInfo);
  },

  showGameView: function (_viewName, _gameInfo){
    // console.log("showGameView: ", _viewName, _gameInfo);
    if (_viewName != "youWon" && _viewName != "youLost") {
      this.populateViewWithGameInfo(_viewName, _gameInfo);
    }

    this.clearAllGameViews();
    window.showGameBlock(_viewName)
  },

  clearAllGameViews: function (){
      document.getElementById("cf_game_referral_start").value = "";
      document.getElementById("cf_game_referral_join").value = "";
      document.getElementById("cf_update_bet_input").value = "";
  },

  populateViewWithGameInfo: async function (_viewName, _gameInfo) {
    // console.log("populateWithGameInfo: ", _viewName, _gameInfo);

    switch (_viewName) {
      case "cfmaketop":
        document.getElementById("cf_update_bet_input").value = "";
        document.getElementById("cf_gameId_makeTop").innerHTML = (_gameInfo && _gameInfo.id) ? _gameInfo.id : "0";
        document.getElementById("gameCreator_makeTop").innerHTML = (_gameInfo && _gameInfo.creator) ? _gameInfo.creator : "0";
        document.getElementById("gameOpponent_makeTop").innerHTML = "0x0";
        document.getElementById("gameBet_makeTop").innerHTML = (_gameInfo && _gameInfo.bet) ? Utils.weiToEtherFixed(_gameInfo.bet) : "0";
        document.getElementById("fromt_coin_makeTop").src = (_gameInfo.creatorGuessCoinSide == 0) ? "/img/ethereum-orange.svg" : "/img/bitcoin-orange.svg";
        document.getElementById("make_top_block_makeTop").style.display = (await PromiseManager.isTopGamePromise(Types.Game.cf, _gameInfo.id)) ? "none" : "block";
        break;

      case "cfjoin":
        document.getElementById("cf_game_id_join").innerHTML = (_gameInfo && _gameInfo.id) ? _gameInfo.id : "0";
        document.getElementById("cf_game_creator_join").innerHTML = (_gameInfo && _gameInfo.creator) ? _gameInfo.creator : "0";
        document.getElementById("cf_game_bet_join").innerHTML = (_gameInfo && _gameInfo.bet) ? Utils.weiToEtherFixed(_gameInfo.bet) : "0";
        document.getElementById("cf_coin_join").src = (_gameInfo.creatorGuessCoinSide == 0) ? "/img/bitcoin-orange.svg" : "/img/ethereum-orange.svg";
        break;

      default:
        break;
    }
  },


  //  HANDLE UI ELEMENT ACTIONS
  startGame: async function () {

    window.showGameBlock("youLost")
    return;

    let referral = document.getElementById("cf_game_referral_start").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }

      if (Utils.addressesEqual(BlockchainManager.currentAccount(), referral)) {
        showAlert("error", "Wrong referral address. Cannot be same as creator");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let bet = document.getElementById("cf_bet_input").value;

    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      showAlert("error", "Wrong bet. Min bet: " + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName());
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.createGame(this.coinSideChosen, referral).send({
      from: window.BlockchainManager.currentAccount(),
      value: Utils.etherToWei(bet),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c startGame transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("CREATE GAME transaction: ", hash);
    })
    .once('receipt', function(receipt){
      CoinFlip.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideTopBannerMessage();
    })
    .once('error', function (error, receipt) {
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "CREATE GAME error...");
        throw new Error(error, receipt);
      }
    });
  },

  makeTopClicked: async function () {
    console.log("makeTopClicked");

    if (parseInt(await window.BlockchainManager.getBalance()) < Game.minBet) {
      showAlert('error', 'Make Top Game costs ' + Utils.weiToEtherFixed(Game.minBet) + '. Not enough crypto.');
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    let gameId = document.getElementById("cf_gameId_makeTop").innerHTML;

    window.BlockchainManager.gameInst(Types.Game.cf).methods.addTopGame(gameId).send({
      from: window.BlockchainManager.currentAccount(),
      value: Game.minBet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      console.log("MAKE TOP: transactionHash");
      showTopBannerMessage("MAKE TOP GAME transaction: ", hash);
    })
    .once('receipt', function(receipt){
      CoinFlip.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideTopBannerMessage();
    })
    .once('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log("MAKE TOP: ERROR");
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "MAKE TOP GAME error...");
        throw new Error(error, receipt);
      }
    });
  },

  increaseBetClicked: async function () {
    let bet = document.getElementById("cf_update_bet_input").value;

    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      showAlert("error", "Min bet increase: " + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName() + ".");
      return;
    }

    let gameId = document.getElementById("cf_gameId_makeTop").innerHTML;

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.increaseBetForGameBy(gameId).send({
      from: window.BlockchainManager.currentAccount(),
      value: Utils.etherToWei(bet).toString(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c increaseBetClicked transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("INCREASE BET transaction ", hash);
    })
    .once('receipt', function(receipt){
      CoinFlip.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideTopBannerMessage();
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Increase bet error...");
        throw new Error(error, receipt);
      }
    });
  },

  coinflipJoinAndPlay: async function () {
    console.log('%c coinflipJoinAndPlay', 'color: #e51dff');

    let referral = document.getElementById("cf_game_referral_join").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.cf, document.getElementById("cf_game_id_join").innerHTML);
    let bet = gameInfo.bet;

    if (parseInt(await window.BlockchainManager.getBalance()) < bet) {
      showAlert('error', 'Not enough balance to join game.');
      return;
    }
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.joinAndPlayGame(document.getElementById("cf_game_id_join").innerHTML, referral).send({
      from: window.BlockchainManager.currentAccount(),
      value: bet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c startGame transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("JOIN GAME transaction: ", hash);
    })
    .once('receipt', function(receipt){
      // console.log("receipt: ", receipt.events.GamePlayed.returnValues);
      ProfileManager.update();
      hideTopBannerMessage();
      CoinFlip.showGamePlayed(receipt.events.GamePlayed.returnValues);
    })
    .once('error', function (error, receipt) {
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "JOIN GAME error...");
        throw new Error(error, receipt);
      }
    });
  },

  showGamePlayed: function (_gameInfo) {
    console.log("showGamePlayed: ", _gameInfo);
    window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    if (Utils.addressesEqual(_gameInfo.creator, window.BlockchainManager.currentAccount()) && $("#cfmaketop").css("display") !== "none") {
      (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount())) ? this.showGameView("youWon", _gameInfo) : this.showGameView("youLost", _gameInfo);
    } else if ($("#cfjoin").css("display") !== "none") {
      (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount())) ? this.showGameView("youWon", _gameInfo) : this.showGameView("youLost", _gameInfo);
    }
  },

  closeResultView: function () {
    this.showGameViewForCurrentAccount();
  },

  coinSideChanged: function (_side) {
    this.coinSideChosen = _side;

    switch (_side) {
      case 0:
        $("#bitcoinFlip").html('<img src="/img/bitcoin-black.svg">');
        $("#ethereumFlip").html('<img src="/img/ethereum-orange.svg">');
        break;

      case 1:
        $("#bitcoinFlip").html('<img src="/img/bitcoin-orange.svg">');
        $("#ethereumFlip").html('<img src="/img/ethereum-black.svg">');
        break;

      default:
        break;
    }
  }
};

window.CoinFlip = CoinFlip;

export {
  CoinFlip
};
