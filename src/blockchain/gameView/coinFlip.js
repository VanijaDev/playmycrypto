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

    showSpinner(Spinner.gameView);
    // this.ownerAddress = await PromiseManager.ownerPromise(Types.Game.cf);
    // this.minBet = new BigNumber((await PromiseManager.minBetForGamePromise(Types.Game.cf)).toString());

    // this.setPlaceholders();
    // this.showGameViewForCurrentAccount();
  },

  setPlaceholders: function () {
    $('#gameReferral_start')[0].placeholder = this.ownerAddress;
    $('#gameReferral_join')[0].placeholder = this.ownerAddress;
    $('#gameBet_start')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    $('#gameBetNew_makeTop')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
  },

  //  game view
  showGameViewForCurrentAccount: async function () {
    showSpinner(Spinner.gameView);

    let id = parseInt(await PromiseManager.createdGameIdForAccountPromise(Types.Game.cf, BlockchainManager.currentAccount()));
    // console.log("showGameViewForCurrentAccount id: ", id);

    if (id == 0) {
      this.showGameView("cfstart", null);
    } else {
      let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.cf, id);
      this.showGameView("cfmaketop", gameInfo);
    }

    hideSpinner(Spinner.gameView);
  },

  showGameView: function (_viewName, _gameInfo){
    // console.log("showGameView: ", _viewName, _gameInfo);
    if (_viewName != "youwon" && _viewName != "youlost") {
      this.populateViewWithGameInfo(_viewName, _gameInfo);
    }

    this.hideAllGameViews();
    $("#" + _viewName).css("display","block");
  },

  hideAllGameViews: function (){
      $("#cfstart").css("display","none");
      document.getElementById("gameReferral_start").value = "";
      document.getElementById("gameReferral_join").value = "";
      document.getElementById("gameBet_start").value = "";

      $("#cfjoin").css("display","none");
      document.getElementById("gameReferral_join").value = "";

      $("#cfmaketop").css("display","none");
      document.getElementById("gameBetNew_makeTop").value = "";

      $("#cfpaused").css("display","none");
      $("#youwon").css("display","none");
      $("#youlost").css("display","none");
  },

  populateViewWithGameInfo: async function (_viewName, _gameInfo) {
    // console.log("populateWithGameInfo: ", _viewName, _gameInfo);

    switch (_viewName) {
      case "cfmaketop":
        document.getElementById("gameBetNew_makeTop").value = "";
        document.getElementById("gameId_makeTop").innerHTML = (_gameInfo && _gameInfo.id) ? _gameInfo.id : "0";
        document.getElementById("gameCreator_makeTop").innerHTML = (_gameInfo && _gameInfo.creator) ? _gameInfo.creator : "0";
        document.getElementById("gameOpponent_makeTop").innerHTML = "0x0";
        document.getElementById("gameBet_makeTop").innerHTML = (_gameInfo && _gameInfo.bet) ? Utils.weiToEtherFixed(_gameInfo.bet) : "0";
        document.getElementById("frontCoinMakeTop").src = (_gameInfo.creatorGuessCoinSide == 0) ? "/img/ethereum-orange.svg" : "/img/bitcoin-orange.svg";
        document.getElementById("makeTop").style.display = (await PromiseManager.isTopGamePromise(Types.Game.cf, _gameInfo.id)) ? "none" : "block";
        break;

      case "cfjoin":
        document.getElementById("gameId_join").innerHTML = (_gameInfo && _gameInfo.id) ? _gameInfo.id : "0";
        document.getElementById("gameCreator_join").innerHTML = (_gameInfo && _gameInfo.creator) ? _gameInfo.creator : "0";
        document.getElementById("gameBet_join").innerHTML = (_gameInfo && _gameInfo.bet) ? Utils.weiToEtherFixed(_gameInfo.bet) : "0";
        document.getElementById("frontCoinJoin").src = (_gameInfo.creatorGuessCoinSide == 0) ? "/img/bitcoin-orange.svg" : "/img/ethereum-orange.svg";
      break;

      default:
        break;
    }
  },










  showJoinGame: function (_gameInfo) {
    // console.log("showJoinGame: ", _gameInfo);
    this.showGameView("cfjoin", _gameInfo);
  },

  showGamePlayed: function (_gameInfo) {
    // console.log("showGamePlayed: ", _gameInfo);
    hideSpinner(Spinner.gameView);
    hideAndClearNotifView();
    if (Utils.addressesEqual(_gameInfo.creator, BlockchainManager.currentAccount) && $("#cfmaketop").css("display") !== "none") {
      (Utils.addressesEqual(_gameInfo.winner, BlockchainManager.currentAccount)) ? this.showGameView("youwon", _gameInfo) : this.showGameView("youlost", _gameInfo);
    } else if ($("#cfjoin").css("display") !== "none") {
      (Utils.addressesEqual(_gameInfo.winner, BlockchainManager.currentAccount)) ? this.showGameView("youwon", _gameInfo) : this.showGameView("youlost", _gameInfo);
    }
  },

  //  HANDLE UI ELEMENT ACTIONS

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
  },

  makeTopClicked: async function () {
    // console.log("makeTopClicked");
    if (parseInt(await BlockchainManager.getBalance()) < Game.minBet) {
      showAlert('error', 'Make Top Game costs ' + Utils.weiToEtherFixed(Game.minBet) + '. Not enough crypto.');
      return;
    }

    showSpinner(Spinner.gameView);
    let gameId = document.getElementById("gameId_makeTop").innerHTML;
    BlockchainManager.coinFlipContract.methods.addTopGame(gameId).send({
      from: BlockchainManager.currentAccount,
      value: Game.minBet,
      gasPrice: await BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c c oinflipMakeTop transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("MAKE TOP GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      hideAndClearNotifView();
      document.getElementById("makeTop").style.display = "none";
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      hideSpinner(Spinner.gameView);

      if (error.code != BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "MAKE TOP GAME error...");
        throw new Error(error, receipt);
      }
    })
  },

  increaseBetClicked: async function () {
    let bet = document.getElementById("gameBetNew_makeTop").value;

    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      showAlert("error", "Min bet increase: " + Utils.weiToEtherFixed(this.minBet, 2) + " " + BlockchainManager.currentCryptoName() + ".");
      return;
    }

    let gameId = document.getElementById("gameId_makeTop").innerHTML;

    showSpinner(Spinner.gameView);
    BlockchainManager.coinFlipContract.methods.increaseBetForGameBy(gameId).send({
      from: BlockchainManager.currentAccount,
      value: Utils.etherToWei(bet).toString(),
      gasPrice: await BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c increaseBetClicked transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("INCREASE BET transaction ", hash);
    })
    .once('receipt', function(receipt){
      CoinFlip.showGameViewForCurrentAccount();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      hideSpinner(Spinner.gameView);

      if (error.code != BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Increase bet error...");
        throw new Error(error, receipt);
      }
    });
  },

  startGame: async function () {
    let referral = document.getElementById("gameReferral_start").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let bet = document.getElementById("gameBet_start").value;

    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      showAlert("error", "Wrong bet. Min bet: " + Utils.weiToEtherFixed(this.minBet, 2) + " " + BlockchainManager.currentCryptoName() + ".");
      return;
    }

    showSpinner(Spinner.gameView);
    BlockchainManager.coinFlipContract.methods.createGame(this.coinSideChosen, referral).send({
      from: BlockchainManager.currentAccount,
      value: Utils.etherToWei(bet),
      gasPrice: await BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c startGame transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("CREATE GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      CoinFlip.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideAndClearNotifView();
    })
    .once('error', function (error, receipt) {
      hideSpinner(Spinner.gameView);

      if (error.code != BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "CREATE GAME error...");
        throw new Error(error, receipt);
      }
    });
  },

  coinflipJoinAndPlay: async function () {
    console.log('%c coinflipJoinAndPlay', 'color: #e51dff');

    let referral = document.getElementById("gameReferral_join").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let gameInfo = await PromiseManager.getGameInfoPromise(BlockchainManager.coinFlipContract, document.getElementById("gameId_join").innerHTML);
    let bet = gameInfo.bet;
    if (parseInt(await BlockchainManager.getBalance()) < bet) {
      showAlert('error', 'Not enough balance to join game.');
      return;
    }

    showSpinner(Spinner.gameView);
    BlockchainManager.coinFlipContract.methods.joinAndPlayGame(document.getElementById("gameId_join").innerHTML, referral).send({
      from: BlockchainManager.currentAccount,
      value: bet,
      gasPrice: await BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c startGame transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("JOIN GAME transaction ", hash);
    })
    // .once('receipt', function(receipt){
    //   console.log("receipt: ", receipt.events.GamePlayed.returnValues);

    //   hideAndClearNotifView();
    //   CoinFlip.showGamePlayed(receipt.events.GamePlayed.returnValues);
    // })
    .once('error', function (error, receipt) {
      hideSpinner(Spinner.gameView);

      if (error.code != BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "JOIN GAME error...");
        throw new Error(error, receipt);
      }
    });
  }
};

window.CoinFlip = CoinFlip;

export {
  CoinFlip
};
