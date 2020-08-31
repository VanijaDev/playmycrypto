import Utils from "../utils";
import BigNumber from "bignumber.js";
import Types from "../types";

const $t = $('#translations').data();

const CF = {
  gameId: 0,
  ownerAddress: "",
  coinSideChosen: 0,
  minBet: "",

  GameView: {
    start: "cfstart",
    waitingForOpponent: "cfwfopponent",
    join: "cfjoingame",
    finish: "cffinishgame",
    waitCreator: "cfwaitcreator",
    won: "cfWon",
    lost: "cfLost"
  },

  updateGameView: async function () {
    this.gameId = window.CommonManager.currentGameId;
    console.log('%c CF - updateGameView, %s', 'color: #00aa00', this.gameId);
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);

    this.ownerAddress = await window.BlockchainManager.gameOwner(Types.Game.cf);
    this.minBet = new BigNumber((await window.BlockchainManager.minBetForGame(Types.Game.cf)).toString());

    this.setPlaceholders();
    this.showGameViewForCurrentAccount();
  },

  setPlaceholders: function () {
    $('#cfstart_game_referral')[0].placeholder = this.ownerAddress;
    $('#cfstart_game_referral')[0].placeholder = this.ownerAddress;
    $('#cfstart_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);

    // $('#cf_update_bet_input')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
  },

  //  game view
  showGameViewForCurrentAccount: async function () {
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);

    let id = 0;
    if (this.gameId != 0) {
      id = this.gameId;
    } else {
      let createdId = parseInt(await window.BlockchainManager.ongoingGameAsCreator(Types.Game.cf, window.BlockchainManager.currentAccount()));
      if (createdId > 0) {
        id = createdId;
      } else {
        let joinedId = parseInt(await window.BlockchainManager.ongoingGameAsOpponent(Types.Game.cf, window.BlockchainManager.currentAccount()));
        if (createdId > 0) {
          id = joinedId;
        }
      }
    }
    console.log("cf - gameId: ", id);
    if (id > 0) {
      let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, id);
      this.showGameView(this.GameView.waitingForOpponent, gameInfo);
    } else {
      this.showGameView(this.GameView.start, null);
    }

    window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
  },

  showGameView: function (_viewName, _gameInfo) {
    console.log("showGameView: ", _viewName, _gameInfo);
    if (_viewName != this.GameView.won && _viewName != this.GameView.lost) {
      this.populateViewWithGameInfo(_viewName, _gameInfo);
    }

    this.clearGameView(_viewName);
    window.showGameBlock(_viewName)
  },
  
  populateViewWithGameInfo: async function (_viewName, _gameInfo) {
    console.log("populateWithGameInfo: ", _viewName, _gameInfo);

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

  clearGameView: function (_viewName) {
    switch (_viewName) {
      case this.GameView.start:
        selectMoveValue(null);

        $('#cfstart_game_referral')[0].value = "";
        $('#cfstart_seed')[0].value = "";
        $('#cfstart_bet')[0].value = "0x0";
        break;

      default:
        break;
    }
  },











  

  showJoinGame: function (_gameInfo) {
    // console.log("showJoinGame: ", _gameInfo);
    this.showGameView(this.GameView.join, _gameInfo);
  },

  startGame: async function () {
    let referral = document.getElementById("cf_game_referral_start").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral) || !referral.toLowerCase().localeCompare(window.BlockchainManager.currentAccount().toLowerCase())) {
        showTopBannerMessage($t.wrong_referral, null, true);
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let bet = document.getElementById("cf_bet_input").value;

    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      let str = $t.wrong_bet + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName();
      showTopBannerMessage(str, null, true);
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.createGame(this.coinSideChosen, referral).send({
        from: window.BlockchainManager.currentAccount(),
        value: Utils.etherToWei(bet)
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c CREATE GAME transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage($t.tx_create_game, hash);
      })
      .once('receipt', function (receipt) {
        CF.showGameViewForCurrentAccount();
        ProfileManager.update();
        hideTopBannerMessage();
      })
      .once('error', function (error, receipt) {
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

        if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
          showTopBannerMessage($t.err_create_game, null, true);
          throw new Error(error, receipt);
        }
      });
  },

  makeTopClicked: async function () {
    // console.log("makeTopClicked");

    if (parseInt(await window.BlockchainManager.getBalance()) < window.Game.minBet) {
      let str = $t.make_top_cost + Utils.weiToEtherFixed(window.Game.minBet) + '. ' + $t.not_enough_funds;
      showTopBannerMessage(str, null, true);
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    let gameId = document.getElementById("cf_gameId_makeTop").innerHTML;

    window.BlockchainManager.gameInst(Types.Game.cf).methods.addTopGame(gameId).send({
        from: window.BlockchainManager.currentAccount(),
        value: window.Game.minBet
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log("MAKE TOP: transactionHash");
        showTopBannerMessage($t.tx_make_top, hash);
      })
      .once('receipt', function (receipt) {
        CF.showGameViewForCurrentAccount();
        ProfileManager.update();
        hideTopBannerMessage();
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        // console.log("MAKE TOP: ERROR");
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

        if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
          showTopBannerMessage($t.err_make_top, null, true);
          throw new Error(error, receipt);
        }
      });
  },

  increaseBetClicked: async function () {
    let bet = document.getElementById("cf_update_bet_input").value;

    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      let str = $t.err_bet_increase_min + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName();
      showTopBannerMessage(str, null, true);
      return;
    }

    let gameId = document.getElementById("cf_gameId_makeTop").innerHTML;

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.increaseBetForGameBy(gameId).send({
        from: window.BlockchainManager.currentAccount(),
        value: Utils.etherToWei(bet).toString()
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c INCREASE BET transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage($t.tx_increase_bet, hash);
      })
      .once('receipt', function (receipt) {
        CF.showGameViewForCurrentAccount();
        ProfileManager.update();
        hideTopBannerMessage();
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

        if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
          showTopBannerMessage($t.err_increase_bet, null, true);
          throw new Error(error, receipt);
        }
      });
  },

  joinAndPlay: async function () {
    let referral = document.getElementById("cf_game_referral_join").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showTopBannerMessage($t.wrong_referral, null, true);
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.cf, document.getElementById("cf_game_id_join").innerHTML);
    let bet = gameInfo.bet;

    if (parseInt(await window.BlockchainManager.getBalance()) < bet) {
      showTopBannerMessage($t.not_enough_funds, null, true);
      return;
    }
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.joinAndPlayGame(document.getElementById("cf_game_id_join").innerHTML, referral).send({
        from: window.BlockchainManager.currentAccount(),
        value: bet
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c JOIN GAME transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage($t.tx_join_game, hash);
      })
      .once('receipt', function (receipt) {
        // console.log('%c JOIN GAME receipt: %s', 'color: #1d34ff', receipt);
        ProfileManager.update();
        hideTopBannerMessage();
        CF.showGamePlayed(receipt.events.CF_GamePlayed.returnValues);
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

        if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
          showTopBannerMessage($t.err_join_game, null, true);
          throw new Error(error, receipt);
        }
      });
  },

  showGamePlayed: function (_gameInfo) {
    // console.log("showGamePlayed: ", _gameInfo);
    window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    if (Utils.addressesEqual(_gameInfo.creator, window.BlockchainManager.currentAccount()) && !$("#" + this.GameView.waitingForOpponent)[0].classList.contains('hidden')) {
      (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount())) ? this.showGameView(this.GameView.won, null): this.showGameView(this.GameView.lost, null);
    } else if (!$("#" + this.GameView.join)[0].classList.contains('hidden')) {
      (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount())) ? this.showGameView(this.GameView.won, null): this.showGameView(this.GameView.lost, null);
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

export default CF;
