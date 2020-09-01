import Utils from "../utils";
import BigNumber from "bignumber.js";
import Types from "../types";

const $t = $('#translations').data();

const CF = {
  ownerAddress: "",
  coinSideChosen: 0,
  minBet: "",

  GameView: {
    start: "cfstart",
    waitingForOpponent: "cfwfopponent",
    join: "cfjoingame",
    finish: "cffinishgame",
    waitCreator: "cfwaitcreator",
    won: "youWon",
    lost: "youLost"
  },

  updateGameView: async function () {
    const gameId = window.CommonManager.currentGameId;
    window.CommonManager.resetCurrentGameId();
    console.log('%c CF - updateGameView, %s', 'color: #00aa00', gameId);

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    this.ownerAddress = await window.BlockchainManager.gameOwner(Types.Game.cf);
    this.minBet = new BigNumber((await window.BlockchainManager.minBetForGame(Types.Game.cf)).toString());

    this.setPlaceholders();
    this.showGameViewForCurrentAccount(gameId);
  },

  setPlaceholders: function () {
    $('#cfstart_game_referral')[0].placeholder = this.ownerAddress;
    $('#cfstart_seed')[0].placeholder = $t.enter_seed_phrase_save_it;
    $('#cfstart_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    $('#cfwfopponent_increase_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
  },

  //  game view
  showGameViewForCurrentAccount: async function (_gameId) {
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);

    let id = 0;
    if (_gameId != 0) {
      id = _gameId;
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
    
    this.clearGameView(_viewName);
    if (_viewName != this.GameView.won && _viewName != this.GameView.lost) {
      this.populateViewWithGameInfo(_viewName, _gameInfo);
    }

    window.showGameBlock(_viewName)
  },

  clearGameView: function (_viewName) {
    console.log("clearGameView: ", _viewName);
    selectMoveValue(null);

    switch (_viewName) {
      case this.GameView.start:
        $('#cfstart_game_referral')[0].value = "";
        $('#cfstart_seed')[0].value = "";
        $('#cfstart_bet')[0].value = "";
        break;

      case this.GameView.join:
        $("#cfjoingame_game_id")[0].innerHTML = 0;
        $("#cfjoingame_game_creator")[0].innerHTML = "0x0";
        $("#cfjoingame_game_bet")[0].innerHTML = "0";
        $('#cfjoingame_game_referral')[0].value = "";
        break;

      default:
        break;
    }
  },

  populateViewWithGameInfo: async function (_viewName, _gameInfo) {
    console.log("populateWithGameInfo: ", _viewName, _gameInfo);

    switch (_viewName) {
      case this.GameView.waitingForOpponent:
        $("#cfwfopponent_game_id")[0].textContent = _gameInfo.id;
        $("#cfwfopponent_game_creator")[0].textContent = _gameInfo.creator;
        $("#cfwfopponent_game_opponent")[0].textContent = "0x0";
        $("#cfwfopponent_game_bet")[0].textContent = Utils.weiToEtherFixed(_gameInfo.bet);
        $("#cfwfopponent_increase_bet")[0].value = "";

        // document.getElementById("fromt_coin_makeTop").src = (_gameInfo.creatorGuessCoinSide == 0) ? "/img/ethereum-orange.svg" : "/img/bitcoin-orange.svg";

        $("#cfwfopponent_makeTop_block").addClass('hidden');
        $("#cfwfopponent_paused_block").addClass('hidden');

        if (_gameInfo.paused) {
          $("#cfwfopponent_pause_btn")[0].textContent = $t.unpause_game;
          $("#cfwfopponent_paused_block").removeClass('hidden');
        } else {
          $("#cfwfopponent_pause_btn")[0].textContent = $t.pause_game;
          if (!(await BlockchainManager.isTopGame(Types.Game.cf, _gameInfo.id))) {
            $("#cfwfopponent_makeTop_block").removeClass('hidden');
          }
        }
        break;

      case this.GameView.join:
        document.getElementById("cfjoingame_game_id").innerHTML = _gameInfo.id;
        document.getElementById("cfjoingame_game_creator").innerHTML = _gameInfo.creator;
        document.getElementById("cfjoingame_game_bet").innerHTML = Utils.weiToEtherFixed(_gameInfo.bet);
        break;

      default:
        break;
    }
  },


  /** UI HANDLERS */

  startGame: async function () {
    console.log('%c startGame_cf', 'color: #e51dff');

    let bet = document.getElementById("cfstart_bet").value;
    let seedStr = document.getElementById("cfstart_seed").value;

    if (this.coinSideChosen == 0) {
      showTopBannerMessage($t.select_move, null, true);
      return;
    } else if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      let str = $t.wrong_bet + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName();
      showTopBannerMessage(str, null, true);
      return;
    } else if (new BigNumber(await window.BlockchainManager.getBalance()).comparedTo(new BigNumber(Utils.etherToWei(bet))) < 0) {
      showTopBannerMessage($t.not_enough_funds, null, true);
      return;
    } else if (seedStr.length == 0) {
      showTopBannerMessage($t.enter_seed_phrase, null, true);
      return;
    }

    let seedStrHash = web3.utils.soliditySha3(seedStr);
    // console.log("seedStrHash: ", seedStrHash);
    let seedHash = web3.utils.soliditySha3(this.coinSideChosen, seedStrHash);
    // console.log("seedHash:    ", seedHash);

    let referral = document.getElementById("cfstart_game_referral").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral) || !referral.toLowerCase().localeCompare(window.BlockchainManager.currentAccount().toLowerCase())) {
        showTopBannerMessage($t.wrong_referral, null, true);
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.createGame(seedHash, referral).send({
        from: window.BlockchainManager.currentAccount(),
        value: Utils.etherToWei(bet)
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c CREATE GAME transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage($t.tx_create_game, hash);
      })
      .once('receipt', function (receipt) {
        CF.showGameViewForCurrentAccount(0);
        window.ProfileManager.update();
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
    console.log('%c makeTopClicked', 'color: #e51dff');

    if (parseInt(await window.BlockchainManager.getBalance()) < window.Game.minBet) {
      let str = $t.make_top_cost + Utils.weiToEtherFixed(window.Game.minBet) + '. ' + $t.not_enough_funds;
      showTopBannerMessage(str, null, true);
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    let gameId = $("#cfwfopponent_game_id")[0].innerHTML;

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
        CF.showGameViewForCurrentAccount(0);
        window.ProfileManager.update();
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
    let increaseBet = $("#cfwfopponent_increase_bet")[0].value;

    if ((increaseBet.length == 0) || (new BigNumber(Utils.etherToWei(increaseBet)).comparedTo(this.minBet) < 0)) {
      let str = $t.err_bet_increase_min + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName();
      showTopBannerMessage(str, null, true);
      return;
    }

    let gameId = $("#cfwfopponent_game_id")[0].innerHTML;

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.increaseBetForGameBy(gameId).send({
        from: window.BlockchainManager.currentAccount(),
        value: Utils.etherToWei(increaseBet).toString()
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c INCREASE BET transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage($t.tx_increase_bet, hash);
      })
      .once('receipt', function (receipt) {
        CF.showGameViewForCurrentAccount(0);
        window.ProfileManager.update();
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

  pauseGameClicked: async function () {
    console.log('%c pauseGameClicked_cf', 'color: #e51dff');

    let gameId = $("#cfwfopponent_game_id")[0].innerHTML;
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);

    let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, gameId);
    gameInfo.paused ? this.unpauseGame(gameId) : this.pauseGame(gameId);
  },

  pauseGame: async function (_gameId) {
    // console.log('%c pauseGame_cf: %s', 'color: #e51dff', _gameId);

    window.BlockchainManager.gameInst(Types.Game.cf).methods.pauseGame(_gameId).send({
        from: window.BlockchainManager.currentAccount()
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c c oinflipMakeTop transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage($t.tx_pause_game, hash);
      })
      .once('receipt', function (receipt) {
        hideTopBannerMessage();
        window.ProfileManager.update();
        CF.showGameViewForCurrentAccount(0);
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        hideTopBannerMessage();
        window.ProfileManager.update();
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

        if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
          showTopBannerMessage($t.err_pause_game, null, true);
          throw new Error(error, receipt);
        }
      });
  },

  unpauseGame: async function (_gameId) {
    // console.log('%c unpauseGame_cf:', 'color: #e51dff');

    if (parseInt(await window.BlockchainManager.getBalance()) < window.Game.minBet) {
      let str = $t.err_unpause_game_cost + Utils.weiToEtherFixed(window.Game.minBet, 2) + '. ' + $t.not_enough_funds;
      showTopBannerMessage(str, null, true);
      return;
    }

    window.BlockchainManager.gameInst(Types.Game.cf).methods.unpauseGame(_gameId).send({
        from: window.BlockchainManager.currentAccount(),
        value: window.Game.minBet
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c increaseBetClicked transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage($t.tx_unpause_game, hash);
      })
      .once('receipt', function (receipt) {
        window.ProfileManager.update();
        hideTopBannerMessage();
        CF.showGameViewForCurrentAccount(0);
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        window.ProfileManager.update();
        hideTopBannerMessage();
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

        if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
          showTopBannerMessage($t.err_unpause_game, null, true);
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
        window.ProfileManager.update();
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
    this.showGameViewForCurrentAccount(0);
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
