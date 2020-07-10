import BlockchainManager from "../managers/blockchainManager/blockchainManager";
import { PromiseManager } from "../managers/promiseManager";
import {  Game } from "../game";
import { Utils } from "../utils";
import BigNumber from "bignumber.js";
import { ProfileManager } from "../managers/profileManager";
import Types from "../types";

var $t = $('#translations').data();

const RPS = {
  // ownerAddress: "",
  // minBet: 0,
  currentGameView: "",

  selectedMove: 0,
  selectedPrevMove: 0,
  // skipNextMove: false,
  countdown: null,

  Move: {
    none: 0,
    rock: 1,
    paper: 2,
    scissors: 3
  },

  // MoveWinner: {
  //   draw: 0,
  //   creator: 1,
  //   opponent: 2
  // },

  GameView: {
    startNew: "rpsstart",
    waitingForOpponent: "rpswfopponent",
    waitingForOpponentMove: "rpswfopponentmove",
    join: "rpsjoingame",
    // creatorMove: "rpscreatormove",
    // opponentMove: "rpsopponentmove",
    playMove: "rpscreatormove",
    // makeMove: "rpsmakemove",
    won: "youWon",
    lost: "youLost",
    draw: "itsDraw",
  },

  // InnerGameViews: {
  //   waitingForOpponent: {
  //     gamePaused: 'gamePaused',
  //     makeTop: 'make_top_block_makeTop'
  //   },
  //   waitingForOpponentMove: {
  //     moveExpired: 'moveExpired'
  //   },
  //   creatorMove: {
  //     playMove: 'creatorPlayMoveButton',
  //     previousNextMove: 'previousNextMoveCreator',
  //     moveExpired: 'moveExpiredCreator'
  //   },
  //   opponentMove: {
  //     playMove: 'opponentPlayMoveButton',
  //     claimExpired: 'claimExpiredButton',
  //     opponentMove: 'opponentMoveBlock',
  //     moveExpired: 'moveExpiredOpponent',
  //   }

  // },

  // $('[data-group="waitingForOpponent"]')

  updateGameView: async function () {
    console.log("RPS - updateGameView");

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    this.ownerAddress = await PromiseManager.ownerPromise(Types.Game.cf);
    this.minBet = new BigNumber((await PromiseManager.minBetForGamePromise(Types.Game.cf)).toString());

    this.setPlaceholders();
    this.showGameViewForCurrentAccount();
  },

  setPlaceholders: function () {
    $('#rpsstart_game_referral')[0].placeholder = this.ownerAddress;
    $('#rpsstart_seed')[0].placeholder = "Any string, but MEMORIZE it !";
    $('#rpsstart_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    $('#rpswfopponent_increase_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    $('#rpsjoingame_game_referral')[0].placeholder = this.ownerAddress;
    $('#rpscreatormove_previous_move_seed')[0].placeholder = "String from previous move";
    $('#rpscreatormove_next_move_seed')[0].placeholder = "Any string, but MEMORIZE it !";
    // $('#seed_start_rps')[0].placeholder = "Any string, but MEMORIZE it !";
    // $('#cf_update_bet_input_rps')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    // $('#rpswfopponent_increase_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
  },

  showGameViewForCurrentAccount: async function () {
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
  
    let gameId = parseInt(await PromiseManager.ongoingGameIdxForPlayerPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    console.log("showGameViewForCurrentAccount gameId: ", gameId);
    
    if (gameId == 0) {
      this.showGameView(this.GameView.startNew, null);
    } else {
      let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.rps, gameId);
      // console.log("gameInfo: ", gameInfo);

      switch (parseInt(gameInfo.state)) {
        case Types.GameState.waitingForOpponent:
          (this.currentGameView == this.GameView.waitingForOpponent) ? this.updateGameViewInfo(this.GameView.waitingForOpponent, gameInfo) : this.showGameView(this.GameView.waitingForOpponent, gameInfo);
          break;

        case Types.GameState.started:
          let isNextMover = Utils.addressesEqual(window.BlockchainManager.currentAccount(), gameInfo.nextMover);
          if (isNextMover) {
            let isGameCreator = Utils.addressesEqual(window.BlockchainManager.currentAccount(), gameInfo.creator);
            if (isGameCreator) {
              this.showGameView(this.GameView.playMove, gameInfo);  //  DOING
            } else {
              this.showGameView(this.GameView.makeMove, gameInfo);  //  TODO
            }
          } else {
            this.showGameView(this.GameView.waitingForOpponentMove, gameInfo);
          }
          break;

        default:
          console.error("showGameViewForCurrentAccount - gameInfo.state");
          break;
      }
    }

    window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
  },

  showGameView: function (_viewName, _gameInfo) {
    console.log("showGameView: ", _viewName, _gameInfo);

    if (!this.currentGameView.localeCompare(_viewName)) {
      if (_viewName.localeCompare(this.GameView.join)) {
        return;
      }
    }

    this.selectedMove = this.Move.none;
    this.selectedPrevMove = this.Move.none;
    this.currentGameView = _viewName;

    this.clearView(_viewName);
    window.showGameBlock(_viewName);
    // this.hideAllGameViews(); //  TODO: remove
    this.populateViewWithGameInfo(_viewName, _gameInfo);
  },

  populateViewWithGameInfo: async function (_viewName, _gameInfo) {
    // console.log("populateWithGameInfo: ", _viewName, _gameInfo);

    this.clearView(_viewName);

    if (!_gameInfo) {
      return;
    }

    const isMoveExpired = await PromiseManager.gameMoveExpiredPromise(Types.Game.rps, _gameInfo.id);
    const isGameCreator = Utils.addressesEqual(window.BlockchainManager.currentAccount(), _gameInfo.creator);
    const gameMoveResults = await this.gameMoveResults(_gameInfo.id);
    console.log("gameMoveResults: ", gameMoveResults);
    switch (_viewName) {
      case this.GameView.waitingForOpponent:
        document.getElementById(this.GameView.waitingForOpponent + "_game_id").innerHTML = _gameInfo.id;
        document.getElementById(this.GameView.waitingForOpponent + "_game_creator").innerHTML = _gameInfo.creator;
        document.getElementById(this.GameView.waitingForOpponent + "_game_opponent").innerHTML = "0x";
        document.getElementById(this.GameView.waitingForOpponent + "_game_bet").innerHTML = Utils.weiToEtherFixed(_gameInfo.bet, 5);

        if (_gameInfo.paused) {
          $('#'+_viewName+'_paused_block')[0].classList.remove("hidden");
          $('#'+_viewName+'_pause_btn')[0].innerHTML = "UNPAUSE GAME";  //  TODO: ask Vova how to change text

          $('#'+_viewName+'_makeTop_block')[0].classList.add("hidden");
        } else {
          $('#'+_viewName+'_paused_block')[0].classList.add("hidden");
          $('#'+_viewName+'_pause_btn')[0].innerHTML = "PAUSE GAME";  //  TODO: ask Vova how to change text

          (await PromiseManager.isTopGamePromise(Types.Game.rps, _gameInfo.id)) ? $('#'+_viewName+'_makeTop_block')[0].classList.add("hidden") : $('#'+_viewName+'_makeTop_block')[0].classList.remove("hidden");
        }
        break;

      case this.GameView.waitingForOpponentMove:
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_id").innerHTML = _gameInfo.id;
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_creator").innerHTML = _gameInfo.creator;
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_opponent").innerHTML = _gameInfo.opponent;
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_bet").innerHTML = Utils.weiToEtherFixed(_gameInfo.bet, 5);

        document.getElementById(this.GameView.waitingForOpponentMove + "_score_you").innerHTML = isGameCreator ? gameMoveResults[0] : gameMoveResults[1];
        document.getElementById(this.GameView.waitingForOpponentMove + "_score_opponent").innerHTML = isGameCreator ? gameMoveResults[1] : gameMoveResults[0];

        this.updateExpiredUIFor(this.GameView.waitingForOpponentMove, isMoveExpired, _gameInfo.prevMoveTimestamp);
        break;

      case this.GameView.join:
        document.getElementById(this.GameView.join + "_game_id").innerHTML = _gameInfo.id;
        document.getElementById(this.GameView.join + "_game_creator").innerHTML = _gameInfo.creator;
        document.getElementById(this.GameView.join + "_game_opponent").innerHTML = "0x0";
        document.getElementById(this.GameView.join + "_game_bet").innerHTML = Utils.weiToEtherFixed(_gameInfo.bet, 5);
        break;

      case this.GameView.makeMove:
        document.getElementById(this.GameView.makeMove + "_game_id").innerHTML = _gameInfo.id;
        document.getElementById(this.GameView.makeMove + "_game_creator").innerHTML = _gameInfo.creator;
        document.getElementById(this.GameView.makeMove + "_game_opponent").innerHTML = _gameInfo.opponent;
        document.getElementById(this.GameView.makeMove + "_game_bet").innerHTML = Utils.weiToEtherFixed(_gameInfo.bet, 5);

        document.getElementById(this.GameView.makeMove + "_score_you").innerHTML = gameMoveResults[1];
        document.getElementById(this.GameView.makeMove + "_score_opponent").innerHTML = gameMoveResults[0];

        this.updateExpiredUIFor(this.GameView.makeMove, isMoveExpired, _gameInfo.prevMoveTimestamp);
        break;

      case this.GameView.playMove:
        document.getElementById(this.GameView.playMove + "_game_id").innerHTML = _gameInfo.id;
        document.getElementById(this.GameView.playMove + "_game_creator").innerHTML = _gameInfo.creator;
        document.getElementById(this.GameView.playMove + "_game_opponent").innerHTML = _gameInfo.opponent;
        document.getElementById(this.GameView.playMove + "_game_bet").innerHTML = Utils.weiToEtherFixed(_gameInfo.bet, 5);

        document.getElementById(this.GameView.playMove + "_score_you").innerHTML = gameMoveResults[0];
        document.getElementById(this.GameView.playMove + "_score_opponent").innerHTML = gameMoveResults[1];

        this.updateExpiredUIFor(this.GameView.playMove, isMoveExpired, _gameInfo.prevMoveTimestamp);

        // let creatorMoveHashes = await PromiseManager.getCreatorMoveHashesForGamePromise(Types.Game.rps, _gameInfo.id);
        // if (!(new BigNumber(creatorMoveHashes[2]).comparedTo(new BigNumber("0")))) {
        //   document.getElementById(this.GameView.playMove + "_move_action").children[1].classList.remove("hidden");
        //   this.skipNextMove = false;
        // } else {
        //   document.getElementById(this.GameView.playMove + "_move_action").children[1].classList.add("hidden");
        //   this.skipNextMove = true;
        // }
        break;

      default:
        console.error("populateViewWithGameInfo - no view: " + _viewName);
        break;
    }
  },

  clearView: function (_viewName) {
    console.log("clearView: ", _viewName);

    if (this.countdown) {
      clearInterval(this.countdown);
    }
    selectMoveValue(null);

    switch (_viewName) {
      case this.GameView.startNew:
        document.getElementById(this.GameView.startNew + "_game_referral").value = "";
        document.getElementById(this.GameView.startNew + "_seed").value = "";
        document.getElementById(this.GameView.startNew + "_bet").value = "0.01";
        // this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
        break;

      case this.GameView.waitingForOpponent:
        document.getElementById(this.GameView.waitingForOpponent + "_increase_bet").value = "";
        break;

      case this.GameView.waitingForOpponentMove:
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_id").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_creator").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_opponent").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_bet").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_score_you").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_score_opponent").innerHTML = "...";

        document.getElementById(this.GameView.waitingForOpponentMove + "_move_remain_min").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_move_remain_sec").innerHTML = "...";

        document.getElementById(this.GameView.waitingForOpponentMove + "_move_expired").classList.add("hidden");

        document.getElementById(this.GameView.waitingForOpponentMove + "_claim_expired_btn").classList.add("disabled");
        document.getElementById(this.GameView.waitingForOpponentMove + "_quit_btn").classList.add("disabled");
        break;

      case this.GameView.join:
        document.getElementById("rpsjoingame_game_referral").value = "";
        // this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
        break;

      case this.GameView.makeMove:
        document.getElementById(this.GameView.makeMove + "_game_id").value = "";
        document.getElementById(this.GameView.makeMove + "_game_creator").value = "";
        document.getElementById(this.GameView.makeMove + "_game_opponent").value = "";
        document.getElementById(this.GameView.makeMove + "_game_bet").innerHTML = "...";
        document.getElementById(this.GameView.makeMove + "_move_remain_min").innerHTML = "...";
        document.getElementById(this.GameView.makeMove + "_move_remain_sec").innerHTML = "...";

        document.getElementById(this.GameView.makeMove + "_score_you").innerHTML = "...";
        document.getElementById(this.GameView.makeMove + "_score_opponent").innerHTML = "...";

        document.getElementById(this.GameView.makeMove + "_move_action").classList.add("hidden");
        document.getElementById(this.GameView.makeMove + "_move_expired").classList.add("hidden");

        document.getElementById(this.GameView.makeMove + "_claim_expired_btn").classList.add("disabled");
        // this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
        break;

      case this.GameView.playMove:
        document.getElementById(this.GameView.playMove + "_game_id").value = "";
        document.getElementById(this.GameView.playMove + "_game_creator").value = "";
        document.getElementById(this.GameView.playMove + "_game_opponent").value = "";
        document.getElementById(this.GameView.playMove + "_game_bet").innerHTML = "...";
        document.getElementById(this.GameView.playMove + "_move_remain_min").innerHTML = "...";
        document.getElementById(this.GameView.playMove + "_move_remain_sec").innerHTML = "...";

        document.getElementById(this.GameView.playMove + "_score_you").innerHTML = "...";
        document.getElementById(this.GameView.playMove + "_score_opponent").innerHTML = "...";

        document.getElementById(this.GameView.playMove + "_previous_move_seed").value = "";
        document.getElementById(this.GameView.playMove + "_next_move_seed").value = "";

        // document.getElementById(this.GameView.playMove + "_move_action").classList.add("hidden");
        // document.getElementById(this.GameView.playMove + "_move_expired").classList.add("hidden");

        document.getElementById(this.GameView.playMove + "_claim_expired_btn").classList.add("disabled");

        // this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
        // this.updateSelectedMoveImgs(_viewName, this.Move.none, true);
        break;

      case this.GameView.won:
      case this.GameView.lost:
      case this.GameView.draw:
        break;

      default:
        console.error("clearView: ", _viewName);
        break;
    }
  },

  updateExpiredUIFor: async function (_viewName, _isExpired, _prevMoveTimestamp) {
    console.log('%c updateExpiredUIFor: %s %s %s', 'color: #1d59ff', _viewName, _isExpired, _prevMoveTimestamp);
    this.updateExpiredUIFunctional(_viewName, _isExpired);
    
    if (_isExpired) {
      document.getElementById(_viewName + "_move_remain_min").innerHTML = 0;
      document.getElementById(_viewName + "_move_remain_sec").innerHTML = 0;
    } else {
      this.updateMoveExpirationCountdown(_viewName, _prevMoveTimestamp);
    }
  },

  updateExpiredUIFunctional: function (_viewName, _isExpired) {
    switch (_viewName) {
      case this.GameView.waitingForOpponentMove:
        if (_isExpired) {
          document.getElementById(_viewName + "_quit_btn").classList.add("disabled");
          document.getElementById(_viewName + "_claim_expired_btn").classList.remove("disabled");
          document.getElementById(_viewName + "_move_expired").classList.remove("hidden");
        } else {
          document.getElementById(_viewName + "_quit_btn").classList.remove("disabled");
          document.getElementById(_viewName + "_claim_expired_btn").classList.add("disabled");
          document.getElementById(_viewName + "_move_expired").classList.add("hidden");
        }
        break;

      case this.GameView.makeMove:
        if (_isExpired) {
          document.getElementById(_viewName + "_quit_btn").classList.add("disabled");
          document.getElementById(_viewName + "_claim_expired_btn").classList.add("disabled");
          document.getElementById(_viewName + "_move_action").classList.add("hidden");
          document.getElementById(_viewName + "_move_expired").classList.remove("hidden");
          document.getElementById(_viewName + "_make_move_btn").classList.add("disabled");
        } else {
          document.getElementById(_viewName + "_quit_btn").classList.remove("disabled");
          document.getElementById(_viewName + "_claim_expired_btn").classList.add("disabled");
          document.getElementById(_viewName + "_move_action").classList.remove("hidden");
          document.getElementById(_viewName + "_move_expired").classList.add("hidden");
          document.getElementById(_viewName + "_make_move_btn").classList.remove("disabled");
        }
        break;

      case this.GameView.playMove:
        if (_isExpired) {
          document.getElementById(_viewName + "_play_move_btn").classList.add("disabled");
          document.getElementById(_viewName + "_prev_next_move_creator_block").classList.add("hidden");
          document.getElementById(_viewName + "_move_expired").classList.remove("hidden");
          document.getElementById(_viewName + "_quit_btn").classList.add("disabled");
          document.getElementById(_viewName + "_claim_expired_btn").classList.add("disabled");
        } else {
          document.getElementById(_viewName + "_play_move_btn").classList.remove("disabled");
          document.getElementById(_viewName + "_prev_next_move_creator_block").classList.remove("hidden");
          document.getElementById(_viewName + "_move_expired").classList.add("hidden");
          document.getElementById(_viewName + "_quit_btn").classList.remove("disabled");
          document.getElementById(_viewName + "_claim_expired_btn").classList.add("disabled");
        }
        break;

      default:
        console.error("updateExpiredUIFunctional - no view: " + _viewName);
        break;
    }
  },

  updateMoveExpirationCountdown: async function (_viewName, _prevMoveTimestamp) {
    console.log('%c updateMoveExpirationCountdown: %s %s', 'color: #1d59ff', _viewName, _prevMoveTimestamp);
    
    let lastMoveTime = new BigNumber(_prevMoveTimestamp);
    let moveDuration = new BigNumber(await PromiseManager.moveDurationPromise(Types.Game.rps));
    let endTime = parseInt(lastMoveTime.plus(moveDuration));

    this.countdown = setInterval(function () {
      let remain = Utils.getTimeRemaining(endTime);

      document.getElementById(_viewName + "_move_remain_min").innerHTML = remain.minutes;
      document.getElementById(_viewName + "_move_remain_sec").innerHTML = remain.seconds;

      if (remain.total <= 0) {
        document.getElementById(_viewName + "_move_remain_min").innerHTML = "0";
        document.getElementById(_viewName + "_move_remain_sec").innerHTML = "0";
      }

      if (remain.total <= 0) {
        clearInterval(RPS.countdown);
        RPS.updateExpiredUIFunctional(_viewName, true);
      }
    }, 1000);
  },

  // updateSelectedMoveImgs: function (_viewName, _move, _isPrevMove) {
  //   console.log('%c updateSelectedMoveImgs_RPS: %s %s', 'color: #e51dff', _viewName, _move);
  //   let prefix = "";
  //   if (!_viewName.localeCompare(this.GameView.startNew)) {
  //     prefix = "start_";
  //   } else if (!_viewName.localeCompare(this.GameView.join)) {
  //     prefix = "rpsjoingame_";
  //   } else if (!_viewName.localeCompare(this.GameView.makeMove)) {
  //     prefix = "rpsmakemove_";
  //   } else if (!_viewName.localeCompare(this.GameView.playMove)) {
  //     prefix = "rpscreatormove_";
  //   }

  //   const suffix = _isPrevMove ? "_prev" : "";

  //   switch (_move) {
  //     case this.Move.none:
  //       if (_viewName.localeCompare(this.GameView.playMove)) {
  //         document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-ask-big.svg";
  //       }
  //       document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       break;

  //     case this.Move.rock:
  //       if (_viewName.localeCompare(this.GameView.playMove)) {
  //         document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-rock-big.svg";
  //       }
  //       document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.add("move_bg_selected");
  //       document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       break;

  //     case this.Move.paper:
  //       if (_viewName.localeCompare(this.GameView.playMove)) {
  //         document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-paper-big.svg";
  //       }
  //       document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.add("move_bg_selected");
  //       document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       break;

  //     case this.Move.scissors:
  //       if (_viewName.localeCompare(this.GameView.playMove)) {
  //         document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-scissor-big.svg";
  //       }
  //       document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.remove("move_bg_selected");
  //       document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.add("move_bg_selected");
  //       break;

  //     default:

  //       break;
  //   }
  // },

  gameMoveResults: async function (_gameId) {
    let result = [0, 0]; //  creator, joiner

    let rowMoves_0 = await PromiseManager.showRowMovesPromise(Types.Game.rps, _gameId, 0);
    // console.log("rowMoves_0: ", rowMoves_0);
    if (rowMoves_0[0] == 0) {
      return result;
    }

    switch (this.rowWinner(rowMoves_0)) {
      case this.MoveWinner.creator:
        result[0] = result[0] += 1;
        break;

      case this.MoveWinner.opponent:
        result[1] = result[1] += 1;
        break;

      default:
        break;
    }
    // console.log("result_0: ", result);

    let rowMoves_1 = await PromiseManager.showRowMovesPromise(Types.Game.rps, _gameId, 1);
    // console.log("rowMoves_1: ", rowMoves_1);
    if (rowMoves_1[0] == 0) {
      return result;
    }

    switch (this.rowWinner(rowMoves_1)) {
      case this.MoveWinner.creator:
        result[0] = result[0] += 1;
        break;

      case this.MoveWinner.opponent:
        result[1] = result[1] += 1;
        break;

      default:
        break;
    }
    // console.log("result_1: ", result);

    let rowMoves_2 = await PromiseManager.showRowMovesPromise(Types.Game.rps, _gameId, 2);
    // console.log("rowMoves_2: ", rowMoves_2);
    if (rowMoves_2[0] == 0) {
      return result;
    }

    switch (this.rowWinner(rowMoves_2)) {
      case this.MoveWinner.creator:
        result[0] = result[0] += 1;
        break;

      case this.MoveWinner.opponent:
        result[1] = result[1] += 1;
        break;

      default:
        break;
    }
    // console.log("result_2: ", result);

    return result;
  },

  rowWinner: function (_rowMoves) {
    let creatorMark = _rowMoves[0];
    let opponentMark = _rowMoves[1];

    if (!creatorMark.localeCompare(this.Move.rock.toString())) {
      if (!opponentMark.localeCompare(this.Move.paper.toString())) {
        return this.MoveWinner.opponent;
      } else if (!opponentMark.localeCompare(this.Move.scissors.toString())) {
        return this.MoveWinner.creator;
      }
    } else if (!creatorMark.localeCompare(this.Move.paper.toString())) {
      if (!opponentMark.localeCompare(this.Move.rock.toString())) {
        return this.MoveWinner.creator;
      } else if (!opponentMark.localeCompare(this.Move.scissors.toString())) {
        return this.MoveWinner.opponent;
      }
    } else if (!creatorMark.localeCompare(this.Move.scissors.toString())) {
      if (!opponentMark.localeCompare(this.Move.rock.toString())) {
        return this.MoveWinner.opponent;
      } else if (!opponentMark.localeCompare(this.Move.paper.toString())) {
        return this.MoveWinner.creator;
      }
    }

    return this.MoveWinner.draw;
  },

  
  /** UI HANDLERS */

  startGameClicked: async function () {
    console.log('%c startGameClicked_RPS', 'color: #e51dff');

    let bet = document.getElementById("rpsstart_bet").value;
    let seedStr = document.getElementById("rpsstart_seed").value;

    if (this.selectedMove == 0) {
      showAlert("error", "Please select move.");
      return;
    } else if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      showAlert("error", "Wrong bet. Min bet: " + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName() + ".");
      return;
    } else if (new BigNumber(await window.BlockchainManager.getBalance()).comparedTo(new BigNumber(Utils.etherToWei(bet))) < 0) {
      showAlert("error", "Not enough funds.");
      return;
    } else if (seedStr.length == 0) {
      showAlert("error", "Please enter seed phrase");
      return;
    }

    let seedStrHash = web3.utils.soliditySha3(seedStr);
    // console.log("seedStrHash: ", seedStrHash);
    let seedHash = web3.utils.soliditySha3(this.selectedMove, seedStrHash);
    // console.log("seedHash:    ", seedHash);

    let referral = document.getElementById("rpsstart_game_referral").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.rps).methods.createGame(referral, seedHash).send({
      from: window.BlockchainManager.currentAccount(),
      value: Utils.etherToWei(bet),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c startGame transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("CREATE GAME transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      RPS.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideTopBannerMessage();
    })
    .once('error', function (error, receipt) {
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Create game error...");
        throw new Error(error, receipt);
      }
    });
  },

  moveClicked: function (_move) {
    console.log('%c moveClicked_RPS: %s', 'color: #e51dff', _move);

    (_move > 10) ? this.selectedPrevMove = _move % 10 : this.selectedMove = _move;
  },

  makeTopClicked: async function () {
    console.log('%c makeTopClicked_RPS:', 'color: #e51dff');

    if (parseInt(await window.BlockchainManager.getBalance()) < Game.minBet) {
      showAlert('error', 'Make Top Game costs ' + Utils.weiToEtherFixed(Game.minBet, 2) + '. Not enough crypto.');
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    let gameId = document.getElementById("rpswfopponent_game_id").innerHTML;
    window.BlockchainManager.gameInst(Types.Game.rps).methods.addTopGame(gameId).send({
      from: window.BlockchainManager.currentAccount(),
      value: Game.minBet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c c oinflipMakeTop transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("MAKE TOP GAME transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      ProfileManager.update();
      hideTopBannerMessage();
      RPS.showGameViewForCurrentAccount();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "MAKE TOP GAME error...");
        throw new Error(error, receipt);
      }
    })
  },
  
  increaseBetClicked: async function () {
    console.log('%c increaseBetClicked_RPS:', 'color: #e51dff');

    let bet = document.getElementById("rpswfopponent_increase_bet").value;
    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      showAlert("error", "Min bet increase: " + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName() + ".");
      return;
    }

    let gameId = document.getElementById("rpswfopponent_game_id").innerHTML;

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.rps).methods.increaseBetForGameBy(gameId).send({
      from: window.BlockchainManager.currentAccount(),
      value: Utils.etherToWei(bet).toString(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c increaseBetClicked transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("INCREASE BET transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      console.log('%c increaseBetClicked receipt: %s', 'color: #1d34ff', receipt);

      RPS.showGameViewForCurrentAccount();
      ProfileManager.updateCurrentAccountBalanceUI();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Increase bet error...");
        throw new Error(error, receipt);
      }

    });
  },

  pauseGameClicked: async function () {
    console.log('%c pauseGameClicked_RPS:', 'color: #e51dff');

    let gameId = document.getElementById("rpswfopponent_game_id").innerHTML;
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);

    let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.rps, gameId);
    gameInfo.paused ? this.unpauseGame(gameId) : this.pauseGame(gameId);
  },

  pauseGame: async function (_gameId) {
    // console.log('%c pauseGame_RPS: %s', 'color: #e51dff', _gameId);

    window.BlockchainManager.gameInst(Types.Game.rps).methods.pauseGame(_gameId).send({
      from: window.BlockchainManager.currentAccount(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c c oinflipMakeTop transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("PAUSE GAME transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      hideTopBannerMessage();
      ProfileManager.update();
      RPS.showGameViewForCurrentAccount();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      hideTopBannerMessage();
      ProfileManager.update();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Pause game error...");
        throw new Error(error, receipt);
      }
    });
  },

  unpauseGame: async function (_gameId) {
    // console.log('%c unpauseGame_RPS:', 'color: #e51dff');

    if (parseInt(await window.BlockchainManager.getBalance()) < Game.minBet) {
      showAlert('error', 'Unpause Game costs ' + Utils.weiToEtherFixed(Game.minBet, 2) + '. Not enough funds.');
      return;
    }

    window.BlockchainManager.gameInst(Types.Game.rps).methods.unpauseGame(_gameId).send({
      from: window.BlockchainManager.currentAccount(),
      value: Game.minBet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c increaseBetClicked transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("UNPAUSE GAME transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      ProfileManager.update();
      hideTopBannerMessage();
      RPS.showGameViewForCurrentAccount();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Unpause game error...");
        throw new Error(error, receipt);
      }
    });
  },

  quitGameClicked: async function () {
    console.log('%c quitGameClicked_RPS', 'color: #e51dff');

    let gameId = document.getElementById(this.currentGameView + "_game_id").innerHTML;
    console.log("gameId: ", gameId);

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.rps).methods.quitGame(gameId).send({
      from: window.BlockchainManager.currentAccount(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c quitGame transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("QUIT GAME transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      RPS.showGameView(RPS.GameView.lost, null);
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Quit game error...");
        throw new Error(error, receipt);
      }
    });
  },

  closeResultView: function () {
    // console.log('%c closeResultView_RPS:', 'color: #e51dff');
    this.showGameViewForCurrentAccount();
  },

  joinGameClicked: async function () {
    console.log('%c joinGameClicked', 'color: #e51dff');

    let ongoingGameId = parseInt(await PromiseManager.ongoingGameIdxForPlayerPromise(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (ongoingGameId != 0) {
      showAlert('error', "Single game participation allowed. You are already playing game with id " + ongoingGameId);
      return;
    }

    if (this.selectedMove == 0) {
      showAlert("error", "Please select move.");
      return;
    }

    let referral = document.getElementById("rpsjoingame_game_referral").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let gameId = document.getElementById("rpsjoingame_game_id").innerHTML;
    let gameInfo = await PromiseManager.gameInfoPromise(Types.Game.rps, gameId);

    let bet = gameInfo.bet;
    if (parseInt(await window.BlockchainManager.getBalance()) < bet) {
      showAlert('error', 'Not enough balance to join game.');
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.rps).methods.joinGame(gameId, referral, this.selectedMove).send({
      from: window.BlockchainManager.currentAccount(),
      value: bet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c joinGame transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("JOIN GAME transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      RPS.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideTopBannerMessage();
    })
    .once('error', function (error, receipt) {
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Join game error...");
        throw new Error(error, receipt);
      }
    });
  },

  playMoveClicked: async function () {
    console.log('%c playMoveClicked', 'color: #e51dff');

    //  prev
    if (this.selectedPrevMove == 0) {
      showAlert("error", "Please select previous move.");
      return;
    }

    let seedStrPrev = document.getElementById("rpscreatormove_previous_move_seed").value;
    if (seedStrPrev.length == 0) {
      showAlert("error", "Please enter previous seed phrase.");
      return;
    }

    //  next
    let seedStr = document.getElementById("rpscreatormove_next_move_seed").value;
    if (this.skipNextMove) {
      this.selectedMove = 1;
    } else {
      if (this.selectedMove == 0) {
        showAlert("error", "Please select next move.");
        return;
      }

      if (seedStr.length == 0) {
        showAlert("error", "Please enter next move seed phrase.");
        return;
      }
    }

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);

    let gameId = document.getElementById("rpscreatormove_game_id").innerHTML;

    const prevSeedHash = web3.utils.soliditySha3(seedStrPrev);
    const seedStrHash = web3.utils.soliditySha3(seedStr);
    // console.log("seedStrHash: ", seedStrHash);
    const seedHash = web3.utils.soliditySha3(this.selectedMove, seedStrHash);
    // console.log("seedHash:    ", seedHash);

    window.BlockchainManager.gameInst(Types.Game.rps).methods.playMove(gameId, this.selectedPrevMove, prevSeedHash, seedHash).send({
      from: window.BlockchainManager.currentAccount(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c playMoveClicked transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("PLAY MOVE transaction: ", hash);
    })
    .once('receipt', async function (receipt) {
      ProfileManager.update();
      hideTopBannerMessage();

      const gameInfo = await PromiseManager.gameInfoPromise(Types.Game.rps, gameId);
      if ((new BigNumber(gameInfo.state.toString())).comparedTo(new BigNumber("1")) == 0) {
        RPS.showGameViewForCurrentAccount();
      } else {
        let resultView = RPS.resultViewForGame(gameInfo);
        RPS.showGameView(resultView, null);

        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
      }
    })
    .once('error', function (error, receipt) {
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Play move error...");
        throw new Error(error, receipt);
      }
    });
  },

  claimExpiredGameClicked: async function () {
    console.log('%c claimExpiredGameClicked: %s', 'color: #e51dff', this.currentGameView);

    let gameId = document.getElementById(this.currentGameView + "_game_id").innerHTML;
    console.log("gameId: ", gameId);

    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.rps).methods.finishExpiredGame(gameId).send({
      from: window.BlockchainManager.currentAccount(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function (hash) {
      // console.log('%c claimExpiredGamePrize transactionHash: %s', 'color: #1d34ff', hash);
      showTopBannerMessage("CLAIM EXPIRED GAME transaction: ", hash);
    })
    .once('receipt', function (receipt) {
      RPS.showGameView(RPS.GameView.won, null);
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideTopBannerMessage();
      window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Claim expired game error...");
        throw new Error(error, receipt);
      }
    });
  },
  















  resultViewForGame: function (_gameInfo) {
    // console.log(_gameInfo);
    let resultView = this.GameView.lost;

    if (Utils.addressesEqual(_gameInfo.winner, Utils.zeroAddress_eth)) {
      resultView = RPS.GameView.draw;
    } else if (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount())) {
      resultView = RPS.GameView.won;
    }

    return resultView;
  },

  updateGameViewInfo: function (_viewName, _gameInfo) {
    // console.log("updateGameView: ", _viewName, _gameInfo);
    this.populateViewWithGameInfo(_viewName, _gameInfo);
  },

  // hideAllGameViews: async function () {
  //   document.getElementById(this.GameView.startNew).classList.add("hidden");
  //   document.getElementById(this.GameView.waitingForOpponent).classList.add("hidden");
  //   document.getElementById(this.GameView.waitingForOpponentMove).classList.add("hidden");
  //   document.getElementById(this.GameView.join).classList.add("hidden");
  //   document.getElementById(this.GameView.makeMove).classList.add("hidden");
  //   document.getElementById(this.GameView.playMove).classList.add("hidden");
  //   document.getElementById(this.GameView.won).classList.add("hidden");
  //   document.getElementById(this.GameView.lost).classList.add("hidden");
  //   document.getElementById(this.GameView.draw).classList.add("hidden");
  //   return;
  // },

  makeMoveClicked: async function () {
    console.log('%c joinGameClicked', 'color: #e51dff');

    if (this.selectedMove == 0) {
      showAlert("error", "Please select move.");
      return;
    }

    let gameId = document.getElementById("rpsmakemove_game_id").innerHTML;
    window.CommonManager.showSpinner(Types.SpinnerView.gameView);
    window.BlockchainManager.gameInst(Types.Game.rps).methods.opponentNextMove(gameId, this.selectedMove).send({
      from: window.BlockchainManager.currentAccount(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
      .on('transactionHash', function (hash) {
        // console.log('%c opponentNextMove transactionHash: %s', 'color: #1d34ff', hash);
        showTopBannerMessage("MAKE MOVE transaction: ", hash);
      })
      .once('receipt', function (receipt) {
        RPS.showGameViewForCurrentAccount();
        ProfileManager.update();
        hideTopBannerMessage();
      })
      .once('error', function (error, receipt) {
        ProfileManager.update();
        hideTopBannerMessage();
        window.CommonManager.hideSpinner(Types.SpinnerView.gameView);

        if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
          showAlert('error', "Make move error...");
          throw new Error(error, receipt);
        }
      });
  }

}

window.RPS = RPS;

export default RPS;
