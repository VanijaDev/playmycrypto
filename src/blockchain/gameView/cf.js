import Utils from "../utils";
import BigNumber from "bignumber.js";
import Types from "../types";

const $t = $('#translations').data();

const CF = {
  ownerAddress: "",
  coinSideChosen: 0,
  minBet: "",
  currentGameView: "",
  countdown: null,

  GameView: {
    start: "cfstart",
    waitingForOpponent: "cfwfopponent",
    join: "cfjoingame",
    waitCreator: "cfwaitcreator",
    finish: "cffinishgame",
    won: "youWon",
    lost: "youLost"
  },

  onUnload: function() {
    clearInterval(CF.countdown);
  },

  closeResultView: async function () {
    await this.showGameViewForCurrentAccount(null);
  },

  updateGameView: async function () {
    const storedGameId = window.CommonManager.currentGameId;

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    this.ownerAddress = await window.BlockchainManager.gameOwner(Types.Game.cf);
    this.minBet = new BigNumber((await window.BlockchainManager.minBetForGame(Types.Game.cf)).toString());

    this.setPlaceholders();
    await this.showGameViewForCurrentAccount(null);
  },

  setPlaceholders: function () {
    $('#cfstart_game_referral')[0].placeholder = this.ownerAddress;
    $('#cfstart_seed')[0].placeholder = $t.enter_seed_phrase_save_it;
    $('#cfstart_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    $('#cfwfopponent_increase_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    $('#cffinishgame_finishSeedPhrase')[0].placeholder = $t.enter_seed_phrase;
  },

  showGameViewForCurrentAccount: async function (_priorityView) {
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    
    const storedGameId = window.CommonManager.currentGameId;
    
    if (_priorityView) {
      let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, storedGameId);
      window.CommonManager.resetCurrentGameId();
      this.showGameView(_priorityView, gameInfo);
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
      return;
    }

    if (storedGameId > 0) {
      window.CommonManager.resetCurrentGameId();

      let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, storedGameId);
      let viewType = this.gameViewTypeForGameInfo(gameInfo);
      this.showGameView(viewType, gameInfo);
    } else {
      let createdId = parseInt(await window.BlockchainManager.ongoingGameAsCreator(Types.Game.cf, window.BlockchainManager.currentAccount()));
      if (createdId > 0) {
        let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, createdId);
        let viewType = this.gameViewTypeForGameInfo(gameInfo);
        this.showGameView(viewType, gameInfo);
      } else {
        let joinedId = parseInt(await window.BlockchainManager.ongoingGameAsOpponent(Types.Game.cf, window.BlockchainManager.currentAccount()));
        if (joinedId > 0) {
          let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, joinedId);
          let viewType = this.gameViewTypeForGameInfo(gameInfo);
          this.showGameView(viewType, gameInfo);
        } else {
          this.showGameView(this.GameView.start, null);
        }
      }
    }

    window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
  },

  gameViewTypeForGameInfo: function (_gameInfo) {
    let viewType = this.GameView.waitCreator; //  if opponent
    if (Utils.addressesEqual(_gameInfo.creator, window.BlockchainManager.currentAccount())) {
      if (Utils.zeroAddress(_gameInfo.opponent)) {
        viewType = this.GameView.waitingForOpponent;
      } else {
        viewType = this.GameView.finish;
      }
    }

    return viewType;
  },

  showGameView: function (_viewName, _gameInfo) {
    console.log("showGameView: ", _viewName, _gameInfo);

    if (_viewName == this.currentGameView) {
      console.log("CF showGameView: Same view - return");
      return;
    }

    this.currentGameView = _viewName;
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
        console.log("clearGameView: start");
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

      case this.GameView.waitCreator:
        $("#cfwaitcreator_game_id")[0].innerHTML = 0;
        $("#cfwaitcreator_game_creator")[0].innerHTML = "0x0";
        $("#cfwaitcreator_game_opponent")[0].innerHTML = "0x0";
        $('#cfwaitcreator_game_bet')[0].innerHTML = "0";
        $("#cfwaitcreator_move_remain_hour")[0].innerHTML = 0;
        $("#cfwaitcreator_move_remain_min")[0].innerHTML = 0;
        $("#cfwaitcreator_move_remain_sec")[0].innerHTML = 0;
        break;

      case this.GameView.finish:
        $("#cffinishgame_game_id")[0].innerHTML = 0;
        $("#cffinishgame_game_creator")[0].innerHTML = "0x0";
        $("#cffinishgame_game_opponent")[0].innerHTML = "0x0";
        $('#cffinishgame_game_bet')[0].innerHTML = "0";
        $("#cffinishgame_move_remain_hour")[0].innerHTML = 0;
        $("#cffinishgame_move_remain_min")[0].innerHTML = 0;
        $("#cffinishgame_move_remain_sec")[0].innerHTML = 0;
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

        $("#cfwfopponent_isTop_block")[0].classList.add('hidden');
        $("#cfwfopponent_makeTop_block")[0].classList.add('hidden');
        $("#cfwfopponent_paused_block")[0].classList.add('hidden');

        if (_gameInfo.paused) {
          $("#cfwfopponent_pause_btn")[0].textContent = $t.unpause_game;
          $("#cfwfopponent_paused_block")[0].classList.remove('hidden');
        } else {
          $("#cfwfopponent_pause_btn")[0].textContent = $t.pause_game;
          if ((await window.BlockchainManager.isTopGame(Types.Game.cf, _gameInfo.id))) {
            $("#cfwfopponent_isTop_block")[0].classList.remove('hidden');
          } else {
            $("#cfwfopponent_makeTop_block")[0].classList.remove('hidden');
          }
        }
        break;

      case this.GameView.join:
        $("#cfjoingame_game_id")[0].innerHTML = _gameInfo.id;
        $("#cfjoingame_game_creator")[0].innerHTML = _gameInfo.creator;
        $("#cfjoingame_game_bet")[0].innerHTML = Utils.weiToEtherFixed(_gameInfo.bet);
        break;

      case this.GameView.waitCreator:
        $("#cfwaitcreator_game_id")[0].innerHTML = _gameInfo.id;
        $("#cfwaitcreator_game_creator")[0].innerHTML = _gameInfo.creator;
        $("#cfwaitcreator_game_opponent")[0].innerHTML = _gameInfo.opponent;
        $("#cfwaitcreator_game_bet")[0].innerHTML = Utils.weiToEtherFixed(_gameInfo.bet);

        this.updateExpiredUIFor(_viewName, _gameInfo);
        break;

      case this.GameView.finish:
        $("#cffinishgame_game_id")[0].innerHTML = _gameInfo.id;
        $("#cffinishgame_game_creator")[0].innerHTML = _gameInfo.creator;
        $("#cffinishgame_game_opponent")[0].innerHTML = _gameInfo.opponent;
        $("#cffinishgame_game_bet")[0].innerHTML = Utils.weiToEtherFixed(_gameInfo.bet);

        this.updateExpiredUIFor(_viewName, _gameInfo);
        break;

      default:
        break;
    }
  },

  //  gameExpired UI vvv
  updateExpiredUIFor: async function (_viewName, _gameInfo) {
    const isMoveExpired = await window.BlockchainManager.isGameMoveExpired(Types.Game.cf, _gameInfo.id);

    this.updateExpiredUIFunctional(_viewName, isMoveExpired);

    if (isMoveExpired) {
      $("#"+_viewName + "_move_remain_hour")[0].innerHTML = 0;
      $("#"+_viewName + "_move_remain_min")[0].innerHTML = 0;
      $("#"+_viewName + "_move_remain_sec")[0].innerHTML = 0;
    } else {
      this.updateMoveExpirationCountdown(_viewName, _gameInfo);
    }
  },

  updateExpiredUIFunctional: function (_viewName, _isExpired) {
    switch (_viewName) {
      case this.GameView.waitCreator:
        if (_isExpired) {
          $("#"+_viewName + "_claim_expired_btn")[0].classList.remove("disabled");
          $("#"+_viewName + "_move_expired")[0].classList.remove("hidden");
        } else {
          $("#"+_viewName + "_quit_btn")[0].classList.remove("disabled");
          $("#"+_viewName + "_claim_expired_btn")[0].classList.add("disabled");
          $("#"+_viewName + "_move_expired")[0].classList.add("hidden");
        }
        break;

      case this.GameView.finish:
        if (_isExpired) {
          $("#"+_viewName + "_move_expired")[0].classList.remove("hidden");
          $("#"+_viewName + "_finish")[0].classList.add("hidden");
        } else {
          $("#"+_viewName + "_move_expired")[0].classList.add("hidden");
          $("#"+_viewName + "_finish")[0].classList.remove("hidden");
        }
        break;

      default:
        throw("updateExpiredUIFunctional - no view: " + _viewName);
    }
  },

  updateMoveExpirationCountdown: async function (_viewName, _gameInfo) {
    let lastMoveTime = new BigNumber(_gameInfo.opponentJoinedAt);
    let moveDuration = new BigNumber(await window.BlockchainManager.moveDuration(Types.Game.cf));
    let endTime = parseInt(lastMoveTime.plus(moveDuration));

    this.countdown = setInterval(function () {
      let remain = Utils.getTimeRemaining(endTime);

      if (!$("#"+_viewName + "_move_remain_hour")[0]) {
        //  if moved to another page
        clearInterval(CF.countdown);
        return;
      }

      $("#"+_viewName + "_move_remain_hour")[0].innerHTML = remain.hours;
      $("#"+_viewName + "_move_remain_min")[0].innerHTML = remain.minutes;
      $("#"+_viewName + "_move_remain_sec")[0].innerHTML = remain.seconds;

      if (remain.total <= 0) {
        $("#"+_viewName + "_move_remain_hour")[0].innerHTML = "0";
        $("#"+_viewName + "_move_remain_min")[0].innerHTML = "0";
        $("#"+_viewName + "_move_remain_sec")[0].innerHTML = "0";
      }

      if (remain.total <= 0) {
        clearInterval(CF.countdown);
        CF.updateExpiredUIFunctional(_viewName, true);
      }
    }, 1000);
  },
  //  gameExpired UI ^^^


  /** UI HANDLERS */

  startGame: async function () {
    console.log('%c startGame_cf', 'color: #e51dff');

    let bet = $("#cfstart_bet")[0].value;
    let seedStr = $("#cfstart_seed")[0].value;

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

    let referral = $("#cfstart_game_referral")[0].value;
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
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_create_game, hash, false);
        }
        
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          CF.showGameViewForCurrentAccount(null);
          window.ProfileManager.update();
          hideTopBannerMessage();
        }
      })
      .once('error', function (error, receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_create_game, null, true);
            throw new Error(error, receipt);
          }
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
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_make_top, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          CF.showGameViewForCurrentAccount(null);
          window.ProfileManager.update();
          hideTopBannerMessage();
        }
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        // console.log("MAKE TOP: ERROR");
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_make_top, null, true);
            throw new Error(error, receipt);
          }
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
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_increase_bet, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          CF.showGameViewForCurrentAccount(null);
          window.ProfileManager.update();
          hideTopBannerMessage();
        }
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_increase_bet, null, true);
            throw new Error(error, receipt);
          }
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
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_pause_game, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          hideTopBannerMessage();
          window.ProfileManager.update();
          CF.showGameViewForCurrentAccount(null);
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
        }
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          hideTopBannerMessage();
          window.ProfileManager.update();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_pause_game, null, true);
            throw new Error(error, receipt);
          }
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
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_unpause_game, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();
          hideTopBannerMessage();
          CF.showGameViewForCurrentAccount(null);
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
        }
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();
          hideTopBannerMessage();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_unpause_game, null, true);
            throw new Error(error, receipt);
          }
        }
      });
  },
  
  joinGameClicked: async function () {
    console.log('%c joinGameClicked_CF', 'color: #e51dff');

    let ongoingGameId = parseInt(await window.BlockchainManager.ongoingGameAsOpponent(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (ongoingGameId != 0) {
      let str = $t.err_only_single_game_as_opponent + ongoingGameId;
      showTopBannerMessage(str, null, true);
      return;
    }

    if (this.selectedMove == 0) {
      showTopBannerMessage($t.choose_coin_side, null, true);
      return;
    }

    let referral = $("#cfjoingame_game_referral")[0].value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral) || !referral.toLowerCase().localeCompare(window.BlockchainManager.currentAccount().toLowerCase())) {
        showTopBannerMessage($t.wrong_referral, null, true);
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let gameId = $("#cfjoingame_game_id")[0].innerHTML;
    let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, gameId);

    let bet = gameInfo.bet;
    if (parseInt(await window.BlockchainManager.getBalance()) < bet) {
      showTopBannerMessage($t.not_enough_funds, null, true);
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.joinGame(gameId, this.coinSideChosen-1, referral).send({
        from: window.BlockchainManager.currentAccount(),
        value: bet
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c joinGame transactionHash: %s', 'color: #1d34ff', hash);
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_join_game, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.CommonManager.setCurrentGameId(gameId);
          CF.showGameViewForCurrentAccount(CF.GameView.waitCreator);
          window.ProfileManager.update();
          hideTopBannerMessage();
        }
      })
      .once('error', function (error, receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();
          hideTopBannerMessage();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_join_game, null, true);
            throw new Error(error, receipt);
          }
        }
      });
  },

  playMoveClicked: async function () {
    console.log('%c playMoveClicked_CF', 'color: #e51dff');

    if (!this.coinSideChosen || this.coinSideChosen == 0) {
      showTopBannerMessage($t.select_prev_move, null, true);
      return;
    }

    let seedStrPrev = $("#cffinishgame_finishSeedPhrase")[0].value;
    if (seedStrPrev.length == 0) {
      showTopBannerMessage($t.enter_prev_seed, null, true);
      return;
    }

    let gameId = $("#cffinishgame_game_id")[0].innerHTML;
    const prevSeedHash = web3.utils.soliditySha3(seedStrPrev);
    // console.log("prevSeedHash: ", prevSeedHash);

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.playGame(gameId, this.coinSideChosen, prevSeedHash).send({
      from: window.BlockchainManager.currentAccount()
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c playMoveClicked transactionHash: %s', 'color: #1d34ff', hash);
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_play_move, hash, false);
        }
      })
      .once('receipt', async function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();
          hideTopBannerMessage();

          const gameInfo = await BlockchainManager.gameInfo(Types.Game.cf, gameId);
          (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount())) ? CF.showGameView(CF.GameView.won, null) : CF.showGameView(CF.GameView.lost, null);;
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
        }
      })
      .once('error', function (error, receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();
          hideTopBannerMessage();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_play_move, null, true);
            throw new Error(error, receipt);
          }
        }
      });
  },

  claimExpiredGameClicked: async function () {
    console.log('%c claimExpiredGameClicked_CF: %s', 'color: #e51dff', this.currentGameView);

    let gameId = $("#"+this.currentGameView + "_game_id")[0].innerHTML;
    // console.log("gameId: ", gameId);

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.finishExpiredGame(gameId).send({
        from: window.BlockchainManager.currentAccount()
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c claimExpiredGamePrize transactionHash: %s', 'color: #1d34ff', hash);
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_claim_expired, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          CF.showGameView(CF.GameView.won, null);
          window.ProfileManager.update();
          hideTopBannerMessage();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
        }
      })
      .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();
          hideTopBannerMessage();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_claim_expired, null, true);
            throw new Error(error, receipt);
          }
        }
      });
  },

  quitGameClicked: async function () {
    console.log('%c quitGameClicked_CF', 'color: #e51dff');

    let gameId = $("#" + this.currentGameView + "_game_id")[0].innerHTML;
    // console.log("gameId: ", gameId);

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.cf).methods.quitGame(gameId).send({
        from: window.BlockchainManager.currentAccount()
        // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c quitGame transactionHash: %s', 'color: #1d34ff', hash);
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_quit_game, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          CF.showGameView(CF.GameView.lost, null);
          window.ProfileManager.update();
          hideTopBannerMessage();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
        }
      })
      .once('error', function (error, receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();
          hideTopBannerMessage();
          window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

          if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
            showTopBannerMessage($t.err_quit_game, null, true);
            throw new Error(error, receipt);
          }
        }
      });
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




  // showGamePlayed: function (_gameInfo) {
  //   // console.log("showGamePlayed: ", _gameInfo);
  //   window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
  //   if (Utils.addressesEqual(_gameInfo.creator, window.BlockchainManager.currentAccount()) && !$("#" + this.GameView.waitingForOpponent)[0].classList.contains('hidden')) {
  //     (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount())) ? this.showGameView(this.GameView.won, null): this.showGameView(this.GameView.lost, null);
  //   } else if (!$("#" + this.GameView.join)[0].classList.contains('hidden')) {
  //     (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount())) ? this.showGameView(this.GameView.won, null): this.showGameView(this.GameView.lost, null);
  //   }
  // }
};

export default CF;
