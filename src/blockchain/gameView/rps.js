import BlockchainManager from "../managers/blockchainManager/blockchainManager";
import { PromiseManager } from "../managers/promiseManager";
import { Game } from "../game";
import { Utils } from "../utils";
import BigNumber from "bignumber.js";
import { ProfileManager } from "../managers/profileManager";

//  TODO:
//  - remove unused game views

const RPS = {
  ownerAddress: "",
  minBet: 0,
  currentGameView: "",
  
  selectedMove: 0,
  selectedPrevMove: 0,
  skipNextMove: false,
  countdown: null,

  Move: {
    none: 0,
    rock: 1,
    paper: 2,
    scissors: 3
  },

  MoveWinner: {
    draw: 0,
    creator: 1,
    opponent: 2
  },

  GameView: {
    startNew: "rpsstart",
    waitingForOpponent: "rpswfopponent",
    waitingForOpponentMove: "rpswfopponentmove",
    join: "rpsjoingame",
    playMove: "rpsplaymove",
    makeMove: "rpsmakemove",
    won: "rpsyouwon",
    lost: "rpsyoulost",
    draw: "rpsdraw"
  },

  updateGameView: async function() {
    console.log("RPS - updateGameView");

    showSpinner(Spinner.gameView);
    this.ownerAddress = await PromiseManager.getOwnerPromise(window.BlockchainManager.rockPaperScissorsContract);
    this.minBet = await PromiseManager.minBetForGamePromise(window.BlockchainManager.rockPaperScissorsContract);

    this.setPlaceholders();
    this.showGameViewForCurrentAccount();
  },

  setPlaceholders: function () {
    $('#gameReferral_start_rps')[0].placeholder = this.ownerAddress;
    $('#gameReferral_join_rps')[0].placeholder = this.ownerAddress;
    $('#rpsplaymove_previous_move_seed')[0].placeholder = "String from previous move";
    $('#rpsplaymove_next_move_seed')[0].placeholder = "Any string, but MEMORIZE it !";
    $('#seed_start_rps')[0].placeholder ="Any string, but MEMORIZE it !";
    $('#gameBet_start_rps')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
    $('#rpswfopponent_increse_bet')[0].placeholder = Utils.weiToEtherFixed(this.minBet, 2);
  },

  showGameViewForCurrentAccount: async function () {
    showSpinner(Spinner.gameView);

    let gameId = parseInt(await PromiseManager.getOngoingGameIdxForPlayerPromise(window.BlockchainManager.rockPaperScissorsContract, window.BlockchainManager.currentAccount));
    // console.log("showGameViewForCurrentAccount gameId: ", gameId);

    if (gameId == 0) {
      this.showGameView(this.GameView.startNew, null);
    } else {
      let gameInfo = await PromiseManager.getGameInfoPromise(window.BlockchainManager.rockPaperScissorsContract, gameId);
      // console.log("gameInfo: ", gameInfo);

      switch (parseInt(gameInfo.state)) {
        case Utils.GameState.waitingForOpponent:
          (this.currentGameView == this.GameView.waitingForOpponent) ? this.updateGameViewInfo(this.GameView.waitingForOpponent, gameInfo) : this.showGameView(this.GameView.waitingForOpponent, gameInfo);
          break;

        case Utils.GameState.started:
          let isNextMover = Utils.addressesEqual(window.BlockchainManager.currentAccount, gameInfo.nextMover);
          if (isNextMover) {
            let isGameCreator = Utils.addressesEqual(window.BlockchainManager.currentAccount, gameInfo.creator);
            if (isGameCreator) {
              this.showGameView(this.GameView.playMove, gameInfo);
            } else {
              this.showGameView(this.GameView.makeMove, gameInfo);
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

    hideSpinner(Spinner.gameView);
  },

  resultViewForGame: function(_gameInfo) {
    // console.log(_gameInfo);
    let resultView = this.GameView.lost;

    if (Utils.addressesEqual(_gameInfo.winner, Utils.zeroAddress_eth)) {
      resultView = RPS.GameView.draw;
    } else if (Utils.addressesEqual(_gameInfo.winner, window.BlockchainManager.currentAccount)) {
      resultView = RPS.GameView.won;
    }

    return resultView;
  },

  showJoinGame: function (_gameInfo) {
    // console.log("showJoinGame: ", _gameInfo);
    this.showGameView(this.GameView.join, _gameInfo);
  },

  showGameView: function (_viewName, _gameInfo){
    // console.log("showGameView: ", _viewName, _gameInfo);

    this.selectedMove = this.Move.none;
    this.selectedPrevMove = this.Move.none;
    this.currentGameView = _viewName;

    this.hideAllGameViews();
    this.populateViewWithGameInfo(_viewName, _gameInfo);

    document.getElementById(_viewName).classList.remove("display-none");
  },

  updateGameViewInfo: function (_viewName, _gameInfo){
    // console.log("updateGameView: ", _viewName, _gameInfo);
    this.populateViewWithGameInfo(_viewName, _gameInfo);
  },

  hideAllGameViews: async function (){
    document.getElementById(this.GameView.startNew).classList.add("display-none");    
    document.getElementById(this.GameView.waitingForOpponent).classList.add("display-none");
    document.getElementById(this.GameView.waitingForOpponentMove).classList.add("display-none");
    document.getElementById(this.GameView.join).classList.add("display-none");
    document.getElementById(this.GameView.makeMove).classList.add("display-none");
    document.getElementById(this.GameView.playMove).classList.add("display-none");
    document.getElementById(this.GameView.won).classList.add("display-none");
    document.getElementById(this.GameView.lost).classList.add("display-none");
    document.getElementById(this.GameView.draw).classList.add("display-none");
    return;
  },

  populateViewWithGameInfo: async function (_viewName, _gameInfo) {
    // console.log("populateWithGameInfo: ", _viewName, _gameInfo);

    this.clearView(_viewName);

    if (!_gameInfo) {
      return;
    }

    const isMoveExpired = await PromiseManager.getGameMoveExpiredPromise(window.BlockchainManager.rockPaperScissorsContract, _gameInfo.id);
    const isGameCreator = Utils.addressesEqual(window.BlockchainManager.currentAccount, _gameInfo.creator);
    const gameMoveResults = await this.gameMoveResults(_gameInfo.id);
    // console.log("gameMoveResults: ", gameMoveResults);

    switch (_viewName) {
      case this.GameView.waitingForOpponent:
        document.getElementById(this.GameView.waitingForOpponent + "_game_id").innerHTML = _gameInfo.id;
        document.getElementById(this.GameView.waitingForOpponent + "_game_creator").innerHTML = _gameInfo.creator;
        document.getElementById(this.GameView.waitingForOpponent + "_game_opponent").innerHTML = "";
        document.getElementById(this.GameView.waitingForOpponent + "_game_bet").innerHTML = Utils.weiToEtherFixed(_gameInfo.bet, 5);

        let isPaused = _gameInfo.paused;
        if (isPaused) {
          document.getElementById(this.GameView.waitingForOpponent + "_paused").classList.remove("display-none");
          document.getElementById(this.GameView.waitingForOpponent + "_pauseBtn").innerHTML = "Unpause game";

          document.getElementById(this.GameView.waitingForOpponent + "_makeTop").classList.add("display-none");
        } else {
          document.getElementById(this.GameView.waitingForOpponent + "_paused").classList.add("display-none");
          document.getElementById(this.GameView.waitingForOpponent + "_pauseBtn").innerHTML = "Pause game";

          (await PromiseManager.isTopGamePromise(window.BlockchainManager.rockPaperScissorsContract, _gameInfo.id)) ? document.getElementById("rpswfopponent_makeTop").classList.add("display-none") : document.getElementById("rpswfopponent_makeTop").classList.remove("display-none");
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
        document.getElementById(this.GameView.join + "_gameId").innerHTML = _gameInfo.id;
        document.getElementById(this.GameView.join + "_gameCreator").innerHTML = _gameInfo.creator;
        document.getElementById(this.GameView.join + "_gameOpponent").innerHTML = "0x0";
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

        let creatorMoveHashes = await PromiseManager.getCreatorMoveHashesForGamePromise(window.BlockchainManager.rockPaperScissorsContract, _gameInfo.id);    
        if (!(new BigNumber(creatorMoveHashes[2]).comparedTo(new BigNumber("0")))) {
          document.getElementById(this.GameView.playMove + "_move_action").children[1].classList.remove("display-none");
          this.skipNextMove = false;
        } else {
          document.getElementById(this.GameView.playMove + "_move_action").children[1].classList.add("display-none");
          this.skipNextMove = true;
        }
        break;

      default:
        console.error("populateViewWithGameInfo - no view: " + _viewName);
        break;
    }
  },

  updateExpiredUIFor: async function(_viewName, _isExpired, _prevMoveTimestamp) {
    switch (_viewName) {
      case this.GameView.waitingForOpponentMove:
        if (_isExpired) {
          document.getElementById(this.GameView.waitingForOpponentMove + "_move_remain_min").innerHTML = 0;
          document.getElementById(this.GameView.waitingForOpponentMove + "_move_remain_sec").innerHTML = 0;
          
          document.getElementById(this.GameView.waitingForOpponentMove + "_move_expired").classList.remove("display-none");
          document.getElementById(this.GameView.waitingForOpponentMove + "_claim_expired_btn").classList.remove("disabled");
        } else {
          document.getElementById(this.GameView.waitingForOpponentMove + "_quit_btn").classList.remove("disabled");

          let lastMoveTime = new BigNumber(_prevMoveTimestamp);
          let moveDuration = new BigNumber(await PromiseManager.getMoveDurationPromise(window.BlockchainManager.rockPaperScissorsContract));
          let endTime = parseInt(lastMoveTime.plus(moveDuration));
          this.updateMoveExpirationCountdown(this.GameView.waitingForOpponentMove, endTime);
        }
        break;

      case this.GameView.makeMove:
        if (_isExpired) {
          document.getElementById(this.GameView.makeMove + "_move_remain_min").innerHTML = 0;
          document.getElementById(this.GameView.makeMove + "_move_remain_sec").innerHTML = 0;

          document.getElementById(this.GameView.makeMove + "_move_expired").classList.remove("display-none");
          document.getElementById(this.GameView.makeMove + "_make_move_btn").classList.add("disabled");
        } else {
          document.getElementById(this.GameView.makeMove + "_move_action").classList.remove("display-none");
          document.getElementById(this.GameView.makeMove + "_make_move_btn").classList.remove("disabled");
          
          let lastMoveTime = new BigNumber(_prevMoveTimestamp);
          let moveDuration = new BigNumber(await PromiseManager.getMoveDurationPromise(window.BlockchainManager.rockPaperScissorsContract));
          let endTime = parseInt(lastMoveTime.plus(moveDuration));
          this.updateMoveExpirationCountdown(this.GameView.makeMove, endTime);
        }
        break;

      case this.GameView.playMove:
        if (_isExpired) {
          document.getElementById(this.GameView.playMove + "_move_remain_min").innerHTML = 0;
          document.getElementById(this.GameView.playMove + "_move_remain_sec").innerHTML = 0;

          document.getElementById(this.GameView.playMove + "_move_expired").classList.remove("display-none");
          document.getElementById(this.GameView.playMove + "_play_move_btn").classList.add("disabled");
        } else {
          document.getElementById(this.GameView.playMove + "_play_move_btn").classList.remove("disabled");
          document.getElementById(this.GameView.playMove + "_move_action").classList.remove("display-none");
          
          let lastMoveTime = new BigNumber(_prevMoveTimestamp);
          let moveDuration = new BigNumber(await PromiseManager.getMoveDurationPromise(window.BlockchainManager.rockPaperScissorsContract));
          let endTime = parseInt(lastMoveTime.plus(moveDuration));
          this.updateMoveExpirationCountdown(this.GameView.playMove, endTime);
        }
        break;

      default:
        console.error("updateExpiredUIFor - no view: " + _viewName);
        break;
    }
  },

  gameMoveResults: async function(_gameId) {
    let result = [0,0]; //  creator, joiner

    let rowMoves_0 = await PromiseManager.getShowRowMovesPromise(window.BlockchainManager.rockPaperScissorsContract, _gameId, 0);
    // console.log("rowMoves_0: ", rowMoves_0);
    if (rowMoves_0[0] == 0) {
      return result;
    }

    switch (this.rowWinner(rowMoves_0)) {
      case this.MoveWinner.creator:
        result[0] = result[0]+=1;
        break;

      case this.MoveWinner.opponent:
        result[1] = result[1]+=1;
        break;
    
      default:
        break;
    }
    // console.log("result_0: ", result);

    let rowMoves_1 = await PromiseManager.getShowRowMovesPromise(window.BlockchainManager.rockPaperScissorsContract, _gameId, 1);
    // console.log("rowMoves_1: ", rowMoves_1);
    if (rowMoves_1[0] == 0) {
      return result;
    }
    
    switch (this.rowWinner(rowMoves_1)) {
      case this.MoveWinner.creator:
        result[0] = result[0]+=1;
        break;

      case this.MoveWinner.opponent:
        result[1] = result[1]+=1;
        break;

      default:
        break;
    }
    // console.log("result_1: ", result);

    let rowMoves_2 = await PromiseManager.getShowRowMovesPromise(window.BlockchainManager.rockPaperScissorsContract, _gameId, 2);
    // console.log("rowMoves_2: ", rowMoves_2);
    if (rowMoves_2[0] == 0) {
      return result;
    }

    switch (this.rowWinner(rowMoves_2)) {
      case this.MoveWinner.creator:
        result[0] = result[0]+=1;
        break;

      case this.MoveWinner.opponent:
        result[1] = result[1]+=1;
        break;
    
      default:
        break;
    }
    // console.log("result_2: ", result);
    
    return result;
  },

  rowWinner: function(_rowMoves) {
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

  clearView: function(_viewName) {
    console.log("clearView: ", _viewName);

    if (this.countdown) {
      clearInterval(this.countdown);
    }

    switch (_viewName) {
      case this.GameView.startNew:
        document.getElementById("gameReferral_start_rps").value = "";
        document.getElementById("seed_start_rps").value = "";
        document.getElementById("gameBet_start_rps").value = "";
        this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
        break;

      case this.GameView.waitingForOpponent:
        document.getElementById(this.GameView.waitingForOpponent + "_increse_bet").value = "";
        break;

      case this.GameView.waitingForOpponentMove:
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_id").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_creator").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_opponent").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_game_bet").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_score_you").innerHTML = "...";
        document.getElementById(this.GameView.waitingForOpponentMove + "_score_opponent").innerHTML = "...";

        document.getElementById(this.GameView.waitingForOpponentMove + "_move_expired").classList.add("display-none");

        document.getElementById(this.GameView.waitingForOpponentMove + "_claim_expired_btn").classList.add("disabled");
        document.getElementById(this.GameView.waitingForOpponentMove + "_quit_btn").classList.add("disabled");
        break;

      case this.GameView.join:
        document.getElementById("gameReferral_join_rps").value = "";
        this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
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

        document.getElementById(this.GameView.makeMove + "_move_action").classList.add("display-none");
        document.getElementById(this.GameView.makeMove + "_move_expired").classList.add("display-none");

        document.getElementById(this.GameView.makeMove + "_claim_expired_btn").classList.add("disabled");
        this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
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

        document.getElementById(this.GameView.playMove + "_move_action").classList.add("display-none");
        document.getElementById(this.GameView.playMove + "_move_expired").classList.add("display-none");

        document.getElementById(this.GameView.playMove + "_claim_expired_btn").classList.add("disabled");
        
        this.updateSelectedMoveImgs(_viewName, this.Move.none, false);
        this.updateSelectedMoveImgs(_viewName, this.Move.none, true);
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

  updateSelectedMoveImgs: function (_viewName, _move, _isPrevMove) {
    // console.log('%c updateSelectedMoveImgs_RPS: %s %s', 'color: #e51dff', _viewName, _move);

    let prefix = "";
    if (!_viewName.localeCompare(this.GameView.startNew)) {
      prefix = "start_";
    } else if (!_viewName.localeCompare(this.GameView.join)) {
      prefix = "rpsjoingame_";
    } else if (!_viewName.localeCompare(this.GameView.makeMove)) {
      prefix = "rpsmakemove_";
    } else if (!_viewName.localeCompare(this.GameView.playMove)) {
      prefix = "rpsplaymove_";
    }

    const suffix = _isPrevMove ? "_prev" : "";

    switch (_move) {
      case this.Move.none:
        if (_viewName.localeCompare(this.GameView.playMove)) {
          document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-ask-big.svg";
        }
        document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.remove("move_bg_selected");
        document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.remove("move_bg_selected");
        document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.remove("move_bg_selected");
        break;

      case this.Move.rock:
        if (_viewName.localeCompare(this.GameView.playMove)) {
          document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-rock-big.svg";
        }
        document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.add("move_bg_selected");
        document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.remove("move_bg_selected");
        document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.remove("move_bg_selected");
        break;

      case this.Move.paper:
        if (_viewName.localeCompare(this.GameView.playMove)) {
          document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-paper-big.svg";
        }
        document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.remove("move_bg_selected");
        document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.add("move_bg_selected");
        document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.remove("move_bg_selected");
        break;

      case this.Move.scissors:
        if (_viewName.localeCompare(this.GameView.playMove)) {
          document.getElementById(prefix + "selected_move_img").src = "/img/game-icon-scissor-big.svg";
        }      
        document.getElementById(prefix + "small_rock_img" + suffix).parentElement.classList.remove("move_bg_selected");
        document.getElementById(prefix + "small_paper_img" + suffix).parentElement.classList.remove("move_bg_selected");
        document.getElementById(prefix + "small_scissors_img" + suffix).parentElement.classList.add("move_bg_selected");
        break;
    
      default:

        break;
    }
  },

  updateMoveExpirationCountdown: function (_viewName, _endTime) {
    // console.log('%c updateMoveExpirationCountdown: %s %s', 'color: #1d59ff', _viewName, _endTime);
    this.countdown = setInterval(function() {
      let remain = Utils.getTimeRemaining(_endTime);

      switch (_viewName) {
        case RPS.GameView.waitingForOpponentMove:
          document.getElementById(RPS.GameView.waitingForOpponentMove + "_move_remain_min").innerHTML = remain.minutes;
          document.getElementById(RPS.GameView.waitingForOpponentMove + "_move_remain_sec").innerHTML = remain.seconds;
          
          if (remain.total <= 0) {
            document.getElementById(RPS.GameView.waitingForOpponentMove + "_move_remain_min").innerHTML = "0";
            document.getElementById(RPS.GameView.waitingForOpponentMove + "_move_remain_sec").innerHTML = "0";

            document.getElementById(RPS.GameView.waitingForOpponentMove + "_quit_btn").classList.add("disabled");
            document.getElementById(RPS.GameView.waitingForOpponentMove + "_claim_expired_btn").classList.remove("disabled");
            document.getElementById(RPS.GameView.waitingForOpponentMove + "_move_expired").classList.remove("display-none");
          }
          break;
  
        case RPS.GameView.makeMove:
          document.getElementById(RPS.GameView.makeMove + "_move_remain_min").innerHTML = remain.minutes;
          document.getElementById(RPS.GameView.makeMove + "_move_remain_sec").innerHTML = remain.seconds;
          
          if (remain.total <= 0) {
            document.getElementById(RPS.GameView.makeMove + "_move_remain_min").innerHTML = "0";
            document.getElementById(RPS.GameView.makeMove + "_move_remain_sec").innerHTML = "0";

            document.getElementById(RPS.GameView.makeMove + "_quit_btn").classList.add("disabled");
            document.getElementById(RPS.GameView.makeMove + "_claim_expired_btn").classList.remove("disabled");
            document.getElementById(RPS.GameView.makeMove + "_move_action").classList.add("display-none");
            document.getElementById(RPS.GameView.makeMove + "_move_expired").classList.remove("display-none");
            document.getElementById(RPS.GameView.makeMove + "_make_move_btn").classList.add("disabled");
          }
          break;

        case RPS.GameView.playMove:
          document.getElementById(RPS.GameView.playMove + "_move_remain_min").innerHTML = remain.minutes;
          document.getElementById(RPS.GameView.playMove + "_move_remain_sec").innerHTML = remain.seconds;

          if (remain.total <= 0) {
            document.getElementById(RPS.GameView.playMove + "_move_remain_min").innerHTML = "0";
            document.getElementById(RPS.GameView.playMove + "_move_remain_sec").innerHTML = "0";

            document.getElementById(RPS.GameView.playMove + "_quit_btn").classList.remove("disabled");
            document.getElementById(RPS.GameView.playMove + "_claim_expired_btn").classList.add("disabled");
            document.getElementById(RPS.GameView.playMove + "_move_action").classList.add("display-none");
            document.getElementById(RPS.GameView.playMove + "_move_expired").classList.remove("display-none");
            document.getElementById(RPS.GameView.playMove + "_play_move_btn").classList.add("disabled");
          }
          break;
  
        default:
          break;
      }

      if (remain.total <= 0) {
        clearInterval(this.countdown);
      }
    }, 1000);
  },

  /** UI HANDLERS */

  moveClicked: function(_move) {
    console.log('%c moveClicked_RPS: %s', 'color: #e51dff', _move);

    if (_move > 10) {
      //  prev
      this.selectedPrevMove = _move % 10;
      this.updateSelectedMoveImgs(this.currentGameView, this.selectedPrevMove, true);
    } else {
      this.selectedMove = _move;
      this.updateSelectedMoveImgs(this.currentGameView, _move, false);
    }
  },

  startGameClicked: async function() {
    console.log('%c startGameClicked_RPS', 'color: #e51dff');

    let bet = document.getElementById("gameBet_start_rps").value;
    let seedStr = document.getElementById("seed_start_rps").value;

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

    let referral = document.getElementById("gameReferral_start_rps").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    showSpinner(Spinner.gameView);
    window.BlockchainManager.rockPaperScissorsContract.methods.createGame(referral, seedHash).send({
      from: window.BlockchainManager.currentAccount,
      value: Utils.etherToWei(bet),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c startGame transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("CREATE GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      RPS.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideAndClearNotifView();
    })
    .once('error', function (error, receipt) {
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Create game error...");
        throw new Error(error, receipt);
      }
    });
  },

  joinGameClicked: async function() {
    console.log('%c joinGameClicked', 'color: #e51dff');

    let ongoingGameId = parseInt(await PromiseManager.getOngoingGameIdxForPlayerPromise(window.BlockchainManager.rockPaperScissorsContract, window.BlockchainManager.currentAccount));
    if (ongoingGameId != 0) {
      showAlert('error', "Single game participation allowed. You are already playing game with id " + ongoingGameId);
      return;
    }

    if (this.selectedMove == 0) {
      showAlert("error", "Please select move.");
      return;
    }

    let referral = document.getElementById("gameReferral_join_rps").value;
    if (referral.length > 0) {
      if (!web3.utils.isAddress(referral)) {
        showAlert("error", "Wrong referral address.");
        return;
      }
    } else {
      referral = this.ownerAddress;
    }

    let gameId = document.getElementById("rpsjoingame_gameId").innerHTML;
    let gameInfo = await PromiseManager.getGameInfoPromise(window.BlockchainManager.rockPaperScissorsContract, gameId);
    
    let bet = gameInfo.bet;
    if (parseInt(await window.BlockchainManager.getBalance()) < bet) {
      showAlert('error', 'Not enough balance to join game.');
      return;
    }

    showSpinner(Spinner.gameView);
    window.BlockchainManager.rockPaperScissorsContract.methods.joinGame(gameId, referral, this.selectedMove).send({
      from: window.BlockchainManager.currentAccount,
      value: bet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c joinGame transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("JOIN GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      RPS.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideAndClearNotifView();
    })
    .once('error', function (error, receipt) {
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Join game error...");
        throw new Error(error, receipt);
      }
    });
  },

  makeMoveClicked: async function() {
    console.log('%c joinGameClicked', 'color: #e51dff');

    if (this.selectedMove == 0) {
      showAlert("error", "Please select move.");
      return;
    }

    let gameId = document.getElementById("rpsmakemove_game_id").innerHTML;
    showSpinner(Spinner.gameView);
    window.BlockchainManager.rockPaperScissorsContract.methods.opponentNextMove(gameId, this.selectedMove).send({
      from: window.BlockchainManager.currentAccount,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c opponentNextMove transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("MAKE MOVE transaction ", hash);
    })
    .once('receipt', function(receipt){
      RPS.showGameViewForCurrentAccount();
      ProfileManager.update();
      hideAndClearNotifView();
    })
    .once('error', function (error, receipt) {
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Make move error...");
        throw new Error(error, receipt);
      }
    });
  },

  playMoveClicked: async function() {
    console.log('%c playMoveClicked', 'color: #e51dff');

    //  prev
    if (this.selectedPrevMove == 0) {
      showAlert("error", "Please select previous move.");
      return;
    }

    let seedStrPrev = document.getElementById("rpsplaymove_previous_move_seed").value;
    if (seedStrPrev.length == 0) {
      showAlert("error", "Please enter previous seed phrase.");
      return;
    }

    //  next
    let seedStr = document.getElementById("rpsplaymove_next_move_seed").value;
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

    showSpinner(Spinner.gameView);

    let gameId = document.getElementById("rpsplaymove_game_id").innerHTML;

    const prevSeedHash = web3.utils.soliditySha3(seedStrPrev);
    const seedStrHash = web3.utils.soliditySha3(seedStr);
    // console.log("seedStrHash: ", seedStrHash);
    const seedHash = web3.utils.soliditySha3(this.selectedMove, seedStrHash);
    // console.log("seedHash:    ", seedHash);

    window.BlockchainManager.rockPaperScissorsContract.methods.playMove(gameId, this.selectedPrevMove, prevSeedHash, seedHash).send({
      from: window.BlockchainManager.currentAccount,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c playMoveClicked transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("PLAY MOVE transaction ", hash);
    })
    .once('receipt', async function(receipt){
      ProfileManager.update();
      hideAndClearNotifView();

      const gameInfo = await PromiseManager.getGameInfoPromise(window.BlockchainManager.rockPaperScissorsContract, gameId);
      if ((new BigNumber(gameInfo.state.toString())).comparedTo(new BigNumber("1")) == 0) {
        RPS.showGameViewForCurrentAccount();
      } else {
        let resultView = RPS.resultViewForGame(gameInfo);
        RPS.showGameView(resultView, null);

        hideSpinner(Spinner.gameView);
      }
    })
    .once('error', function (error, receipt) {
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);
      
      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Play move error...");
        throw new Error(error, receipt);
      }
    });
  },

  quitGameClicked: async function(_viewName) {
    console.log('%c quitGameClicked_RPS: %s', 'color: #e51dff', _viewName);

    let gameId = document.getElementById("rpswfopponent_game_id").innerHTML;
    if (!_viewName.localeCompare(this.GameView.waitingForOpponentMove)) {
      gameId = document.getElementById("rpswfopponentmove_game_id").innerHTML;
    } else if (!_viewName.localeCompare(this.GameView.playMove)) {
      gameId = document.getElementById("rpsplaymove_game_id").innerHTML;
    }
    console.log("gameId: ", gameId);
    
    showSpinner(Spinner.gameView);
    window.BlockchainManager.rockPaperScissorsContract.methods.quitGame(gameId).send({
      from: window.BlockchainManager.currentAccount,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c quitGame transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("QUIT GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      RPS.showGameView(RPS.GameView.lost, null);
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Quit game error...");
        throw new Error(error, receipt);
      }
    });
  },

  claimExpiredGameClicked: async function(_viewName) {
    console.log('%c claimExpiredGameClicked: %s', 'color: #e51dff', _viewName);

    let gameId = document.getElementById("rpswfopponentmove_game_id").innerHTML;
    if (!_viewName.localeCompare(this.GameView.makeMove)) {
      gameId = document.getElementById("rpsmakemove_game_id").innerHTML;
    }
    console.log("gameId: ", gameId);
    
    showSpinner(Spinner.gameView);
    window.BlockchainManager.rockPaperScissorsContract.methods.finishExpiredGame(gameId).send({
      from: window.BlockchainManager.currentAccount,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c claimExpiredGamePrize transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("CLAIM EXPIRED GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      RPS.showGameView(RPS.GameView.won, null);
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Claim expired game error...");
        throw new Error(error, receipt);
      }
    });
  },

  increaseBetClicked: async function() {
    console.log('%c increaseBetClicked_RPS:', 'color: #e51dff');

    let bet = document.getElementById("rpswfopponent_increse_bet").value;
    if ((bet.length == 0) || (new BigNumber(Utils.etherToWei(bet)).comparedTo(this.minBet) < 0)) {
      showAlert("error", "Min bet increase: " + Utils.weiToEtherFixed(this.minBet, 2) + " " + window.BlockchainManager.currentCryptoName() + ".");
      return;
    }

    let gameId = document.getElementById("rpswfopponent_game_id").innerHTML;
    
    showSpinner(Spinner.gameView);
    window.BlockchainManager.rockPaperScissorsContract.methods.increaseBetForGameBy(gameId).send({
      from: window.BlockchainManager.currentAccount,
      value: Utils.etherToWei(bet).toString(),
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c increaseBetClicked transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("INCREASE BET transaction ", hash);
    })
    .once('receipt', function(receipt){
      console.log('%c increaseBetClicked receipt: %s', 'color: #1d34ff', receipt);
      
      RPS.showGameViewForCurrentAccount();
      ProfileManager.updateCurrentAccountBalanceUI();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Increase bet error...");
        throw new Error(error, receipt);
      }

    });
  },

  pauseGameClicked: async function() {
    console.log('%c pauseGameClicked_RPS:', 'color: #e51dff');

    let gameId = document.getElementById("rpswfopponent_game_id").innerHTML;
    showSpinner(Spinner.gameView);

    let gameInfo = await PromiseManager.getGameInfoPromise(window.BlockchainManager.rockPaperScissorsContract, gameId);
    gameInfo.paused ? this.unpauseGame(gameId) : this.pauseGame(gameId);
  },

  pauseGame: async function(_gameId) {
    console.log('%c pauseGame_RPS: %s', 'color: #e51dff', _gameId);

    window.BlockchainManager.rockPaperScissorsContract.methods.pauseGame(_gameId).send({
      from: window.BlockchainManager.currentAccount,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c c oinflipMakeTop transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("PAUSE GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      hideAndClearNotifView();
      ProfileManager.update();
      RPS.showGameViewForCurrentAccount();
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Pause game error...");
        throw new Error(error, receipt);
      }
    });
  },

  unpauseGame: async function(_gameId) {
    console.log('%c unpauseGame_RPS:', 'color: #e51dff');

    if (parseInt(await window.BlockchainManager.getBalance()) < Game.minBet) {
      showAlert('error', 'Unpause Game costs ' + Utils.weiToEtherFixed(Game.minBet, 2) + '. Not enough crypto.');
      return;
    }

    window.BlockchainManager.rockPaperScissorsContract.methods.unpauseGame(_gameId).send({
      from: window.BlockchainManager.currentAccount,
      value: Game.minBet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c increaseBetClicked transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("UNPAUSE GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      ProfileManager.update();
      hideAndClearNotifView();
      RPS.showGameViewForCurrentAccount();
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "Unpause game error...");
        throw new Error(error, receipt);
      }
    });
  },

  makeTopClicked: async function () {
    console.log('%c makeTopClicked_RPS:', 'color: #e51dff');
    
    if (parseInt(await window.BlockchainManager.getBalance()) < Game.minBet) {
      showAlert('error', 'Make Top Game costs ' + Utils.weiToEtherFixed(Game.minBet, 2) + '. Not enough crypto.');
      return;
    }

    showSpinner(Spinner.gameView);
    let gameId = document.getElementById("rpswfopponent_game_id").innerHTML;
    window.BlockchainManager.rockPaperScissorsContract.methods.addTopGame(gameId).send({
      from: window.BlockchainManager.currentAccount,
      value: Game.minBet,
      gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
    })
    .on('transactionHash', function(hash){
      // console.log('%c c oinflipMakeTop transactionHash: %s', 'color: #1d34ff', hash);
      showNotifViewWithData("MAKE TOP GAME transaction ", hash);
    })
    .once('receipt', function(receipt){
      ProfileManager.update();
      hideAndClearNotifView();
      RPS.showGameViewForCurrentAccount();
      hideSpinner(Spinner.gameView);
    })
    .once('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      ProfileManager.update();
      hideAndClearNotifView();
      hideSpinner(Spinner.gameView);

      if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
        showAlert('error', "MAKE TOP GAME error...");
        throw new Error(error, receipt);
      }
    })
  },

  closeResultView: function () {
    // console.log('%c closeResultView_RPS:', 'color: #e51dff');
    this.showGameViewForCurrentAccount();
  },

}

window.RPS = RPS;

export {
  RPS
};
