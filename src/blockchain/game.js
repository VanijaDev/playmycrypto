import CF from "./gameView/cf";
import RPS from "./gameView/rps";
import Utils from "./utils";
import BigNumber from "bignumber.js";
import Types from "./types";

const $t = $('#translations').data();

const Game = {
  timer: null,

  //  raffle
  raffle_jackpot: 0,
  raffle_participantsPresent: 0,
  raffle_results: 0,
  raffle_jackpot_BN: null,

  //  beneficiary
  beneficiary_current: "",
  beneficiary_latestPrice_BN: null,

  cryptoIconSrc: "",
  minBet_BN: null,
  topGameIds: [],
  availableGameIds: [],
  availableGamesFetchStartIndex: -1,
  maxGamesToAddCount: 2, // max count of games to be added each "load more"

  gameType: "", //  Types.Game.cf / rps
  gameInst: null,

  // ProfileManager handler methods
  pendingWithdrawn: async function () {
    window.Game.update();
  },

  setup: async function (_currentGameType, _currentGameId_BN) {
    console.log('%c game - setup %s, gameId: %s', 'color: #00aa00', _currentGameType, (_currentGameId_BN) ? _currentGameId_BN.toString() : "null");

    if (this.gameType == _currentGameType &&
        this.gameInst.currentGameId_BN.isEqualTo(_currentGameId_BN)) {
          return;
    }

    window.Game.timer = setInterval(function () {
      window.Game.update(null, false);
      window.ProfileManager.update(false);
    }, 10000);

    this.gameType = _currentGameType;
    this.gameInst = this.initGameInst(_currentGameType);
    this.minBet_BN = new BigNumber(await window.BlockchainManager.minBetForGame(this.gameType));

    await window.ProfileManager.setUpdateHandler(this);
    await window.ProfileManager.update(true);

    this.updateTitle();
    this.updateMoneyIcons();

    await this.update(_currentGameId_BN, true);
  },

  initGameInst: function (_gameType) {
    switch (_gameType) {
      case Types.Game.cf:
        return CF;

      case Types.Game.rps:
        return RPS;

      default:
        throw ("Game - initGameInst wrong _gameType: ", _gameType);
    }
  },

  update: async function (_currentGameId_BN, _initialUpdate) {
    console.log('%c game - update gameId: %s, initialUpdate: %s', 'color: #00aa00', _currentGameId_BN, _initialUpdate);

    if (_initialUpdate) {
      await this.clearDataOnUpdate();
    }

    // this.gameInst.updateGameView(_currentGameId_BN);
    // await this.updateAllGamesForGame(this.gameType);
    await this.updateRaffleStateInfoForGame(this.gameType, _initialUpdate);
    await this.updateBeneficiary(this.gameType, _initialUpdate);
  },

  clearDataOnUpdate: async function () {
    //  raffle
    this.raffle_jackpot = 0;
    this.raffle_participantsPresent = 0;
    this.raffle_results = 0;
    this.raffle_jackpot_BN = null;

    //  beneficiary
    this.beneficiary_current = "";
    this.beneficiary_latestPrice_BN = null;

    this.cryptoIconSrc = "";
    this.topGameIds = [];
    this.availableGameIds = [];
    this.availableGamesFetchStartIndex = -1;
  },

  updateTitle: function () {
    let title = "TITLE - ERROR";
    switch (this.gameType) {
      case Types.Game.cf:
        title = $t.coin_flip;
        break;
      case Types.Game.rps:
        title = $t.rock_paper_scossors;
        break;
    
      default:
        throw("ERROR: game - update");
    }
    document.getElementById("gameName").innerHTML = title;
  },

  onUnload: function () {
    console.log('%c game - onUnload', 'color: #00aa00');

    if (window.Game.timer) {
      clearInterval(window.Game.timer);
    }

    this.gameInst.onUnload();
    window.ProfileManager.setUpdateHandler(null);
    hideTopBannerMessage();


  },

  //  LOAD GAMES
  updateAllGamesForGame: function (_gameType) {
    // clear data
    this.availableGamesFetchStartIndex = -1;
    this.availableGameIds.splice(0, this.availableGameIds.length);
    this.topGameIds.splice(0, this.topGameIds.length);

    this.loadTopGamesForGame(_gameType);
    this.loadAvailableGamesPortionForGame(_gameType);
  },

  loadTopGamesForGame: async function (_gameType) {
    $('#TopGames').empty();
    
    window.CommonManager.showSpinner(Types.SpinnerView.topGames);
    let ownGame;

    if (_gameType == Types.Game.cf) {
      // console.log("loadTopGamesForGame - CF");
      ownGame = await window.BlockchainManager.ongoingGameAsCreator(_gameType, window.BlockchainManager.currentAccount());
    } else if (_gameType == Types.Game.rps) {
      // console.log("loadTopGamesForGame - RPS");
      ownGame = await window.BlockchainManager.ongoingGameIdxForPlayer(_gameType, window.BlockchainManager.currentAccount());
    } else {
      throw ('loadTopGamesForGame - wrong _gameType');
    }

    let topGameIds_tmp = await window.BlockchainManager.topGames(_gameType);
    this.topGameIds = [].concat(topGameIds_tmp);
    let ownGameTopGamesIdx = this.topGameIds.indexOf(ownGame);

    if (ownGameTopGamesIdx >= 0) {
      this.topGameIds.splice(ownGameTopGamesIdx, 1);
      this.topGameIds.push("0");
    }
    // console.log("topGameIds: ", this.topGameIds);

    for (let i = 0; i < this.topGameIds.length; i++) {
      let id = parseInt(this.topGameIds[i]);
      if (id > 0) {
        let gameInfo = await window.BlockchainManager.gameInfo(_gameType, id);
        // console.log("Top game: ", id, " ", gameInfo);
        this.addGameWithInfo(gameInfo, true, false);
      }
    }
    window.CommonManager.hideSpinner(Types.SpinnerView.topGames);
  },

  loadAvailableGamesPortionForGame: async function (_gameType) {
    $("#AvailableGames").empty();

    if (_gameType == Types.Game.cf) {
      // console.log("loadAvailableGamesPortionForGame - CF");
    } else if (_gameType == window.BlockchainManager.rockPaperScissors) {
      // console.log("loadAvailableGamesPortionForGame - RPS");
    }

    if (this.availableGamesFetchStartIndex == 0) {
      // console.log('%c No games to load', 'color: #1d34ff');
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.availableGames);

    if (this.availableGamesFetchStartIndex == -1) {
      this.availableGamesFetchStartIndex = (await window.BlockchainManager.gamesCreatedAmount(_gameType)) - 1;
    }
    // console.log("this.availableGamesFetchStartIndex: ", this.availableGamesFetchStartIndex);
    let addedCount = 0;

    while (addedCount < this.maxGamesToAddCount && this.availableGamesFetchStartIndex > 0) {
      let gameInfo = await window.BlockchainManager.gameInfo(_gameType, this.availableGamesFetchStartIndex);
      // console.log(gameInfo);
      this.availableGamesFetchStartIndex -= 1;

      if (this.availableGameValidToAppend(gameInfo)) {
        this.addGameWithInfo(gameInfo, false, false);

        addedCount += 1;
        if ((addedCount == this.maxGamesToAddCount) || (this.availableGamesFetchStartIndex == 0)) {
          break;
        }
      }
    }

    window.CommonManager.hideSpinner(Types.SpinnerView.availableGames);
    // console.log("availableGameIds: ", this.availableGameIds);
  },

  availableGameValidToAppend: function (_gameInfo) {
    //  skip if paused && creator && winner present && top game
    return (!_gameInfo.paused &&
      !Utils.addressesEqual(_gameInfo.creator, window.BlockchainManager.currentAccount()) &&
      Utils.addressesEqual(_gameInfo.opponent, Utils.zeroAddress_eth) &&
      Utils.addressesEqual(_gameInfo.winner, Utils.zeroAddress_eth) &&
      !this.topGameIds.includes(_gameInfo.id)) ? true : false;
  },

  addGameWithInfo: function (_gameInfo, _isTopGame, _prepend) {
    // console.log("addGameWithInfo: ", _gameInfo, _isTopGame, _prepend);
    if (_isTopGame) {
      if (_prepend) {
        $('#TopGames').prepend(TopGamesTemplate.composetmp({
          'address': _gameInfo.creator,
          'bet': Utils.weiToEtherFixed(_gameInfo.bet.toString())
        }));
      } else {
        $('#TopGames').append(TopGamesTemplate.composetmp({
          'address': _gameInfo.creator,
          'bet': Utils.weiToEtherFixed(_gameInfo.bet.toString())
        }));
      }

    } else {
      if (_prepend) {
        this.availableGameIds.unshift(_gameInfo.id);
        $('#AvailableGames').prepend(TableAvailableGamesTemplate.composetmp({
          'address': _gameInfo.creator,
          'bet': Utils.weiToEtherFixed(_gameInfo.bet.toString())
        }));
      } else {
        this.availableGameIds.push(_gameInfo.id);
        $('#AvailableGames').append(TableAvailableGamesTemplate.composetmp({
          'address': _gameInfo.creator,
          'bet': Utils.weiToEtherFixed(_gameInfo.bet.toString())
        }));
      }
    }
  },

  removeGameWithId: function (_gameId) {
    // console.log("removeGameWithId: ", _gameId);

    if (this.topGameIds.includes(_gameId)) {
      // console.log("from TopGames");

      let idx = this.topGameIds.indexOf(_gameId);
      $('#TopGames')[0].removeChild($('#TopGames')[0].children[idx]);
      this.topGameIds.splice(idx, 1);
    } else if (this.availableGameIds.includes(_gameId)) {
      // console.log("from AvailableGames");

      let idx = this.availableGameIds.indexOf(_gameId);
      $('#AvailableGames')[0].removeChild($('#AvailableGames')[0].children[idx]);
      this.availableGameIds.splice(idx, 1);
    } else {
      throw ("No game to remove");
    }
  },

  //  RAFFLE
  updateRaffleStateInfoForGame: async function (_gameType, _showSpinner) {
    // console.log("updateRaffleStateInfoForGame");

    if (_showSpinner) {
      window.CommonManager.showSpinner(Types.SpinnerView.raffle);
    
      await this.updateRafflePlayersToActivateForGame(_gameType);
    }

    await this.updateRafflePlayersPresentForGame(_gameType);
    await this.updateRaffleStartButtonForGame(_gameType);
    await this.updateRaffleJackpotForGame(_gameType);
    await this.updateRaffleHistoryForGame(_gameType);

    window.CommonManager.hideSpinner(Types.SpinnerView.raffle);
  },

  updateRafflePlayersPresentForGame: async function (_gameType) {
    let participants = await window.BlockchainManager.raffleParticipants(_gameType);
    if (participants.length == this.raffle_participantsPresent) {
      return;
    }

    this.raffle_participantsPresent = participants.length;
    $("#rafflePlayingAmount")[0].innerText = participants.length;
  },

  updateRafflePlayersToActivateForGame: async function (_gameType) {
    let participants = await window.BlockchainManager.raffleActivationParticipantsAmount(_gameType);
    // console.log("raffleActivationParticipantsAmount: ", result.toString());
    $("#raffleActivationAmount")[0].innerText = participants.toString();
  },

  updateRaffleStartButtonForGame: async function (_gameType) {
    let isActivated = await window.BlockchainManager.isRaffleActivated(_gameType);
    $("#raffleStartBtn")[0].disabled = !isActivated;
  },

  updateRaffleJackpotForGame: async function (_gameType) {
    let jackpot = new BigNumber(await window.BlockchainManager.ongoinRafflePrize(_gameType));
    // console.log("jackpot: ", result.toString());
    if (jackpot == this.raffle_jackpot_BN) {
      return;
    }

    this.raffle_jackpot_BN = jackpot;
    $("#cryptoForRaffle")[0].innerText = Utils.weiToEtherFixed(jackpot.toString());
  },

  updateRaffleHistoryForGame: async function (_gameType) {
    let raffleResults = await window.BlockchainManager.raffleResultCount(_gameType);
    // console.log("raffleResults: ", raffleResults);
    if (raffleResults == 0 || raffleResults == this.raffle_results) {
      return;
    }
    
    $('#BlockRaffle').empty();
    this.raffle_results = raffleResults;
    let result = await window.BlockchainManager.raffleResultInfo(_gameType, raffleResults - 1);

    $('#BlockRaffle').append(RaffleGamesTemplate.composetmp({
      'address': result.winner,
      'amount': Utils.weiToEtherFixed(result.prize.toString()),
      'timeago': new Date(result.time * 1000).toISOString().slice(0, 10)
    }));
    $(".template_raffle").attr('src', window.Game.cryptoIconSrc);
  },

  //  Beneficiary vvv
  updateBeneficiary: async function (_gameType, _showSpinner) {
    if (_showSpinner) {
      window.CommonManager.showSpinner(Types.SpinnerView.beneficiary);
    }

    let currentBeneficiary = await window.BlockchainManager.feeBeneficiar(_gameType);
    let latestBeneficiarPrice = new BigNumber(await window.BlockchainManager.latestBeneficiarPrice(_gameType));

    if (Utils.addressesEqual(currentBeneficiary, this.beneficiary_current) && latestBeneficiarPrice.isEqualTo(this.beneficiary_latestPrice_BN)) {
      return;
    }

    this.beneficiary_current = currentBeneficiary;
    this.beneficiary_latestPrice_BN = latestBeneficiarPrice;

    $('#beneficiaryTransferred')[0].textContent = Utils.weiToEtherFixed(latestBeneficiarPrice.toString());
    $('#beneficiaryUser')[0].textContent = currentBeneficiary;

    await this.beneficiaryShowCurrentProfit(_gameType);
      
    (Utils.addressesEqual(window.BlockchainManager.currentAccount(), currentBeneficiary)) ? await this.beneficiaryShowIsCurrent() : await this.beneficiaryShowBecome();

    window.CommonManager.hideSpinner(Types.SpinnerView.beneficiary);
  },

  beneficiaryShowCurrentProfit: async function (_gameType) {
    let profit = await window.BlockchainManager.feeBeneficiarBalance(_gameType, window.BlockchainManager.currentAccount());
    $('#beneficiaryAmount')[0].textContent = Utils.weiToEtherFixed(profit);
    $('#beneficiaryCurrentAmount')[0].textContent = Utils.weiToEtherFixed(profit);
  },

  beneficiaryShowIsCurrent: async function () {
    $('#beneficiaryProfit')[0].classList.remove("hidden");
    $('#makeBeneficiary')[0].classList.add("hidden");
  },

  beneficiaryShowBecome: async function () {
    $('#beneficiaryProfit')[0].classList.add("hidden");
    $('#makeBeneficiary')[0].classList.remove("hidden");

    $('#beneficiaryTransferAmount')[0].value = Utils.weiToEtherFixed(this.beneficiary_latestPrice_BN.plus(this.minBet_BN)).toString();
  },

  makeBeneficiaryClicked: async function () {
    console.log('%c makeBeneficiaryClicked', 'color: #e51dff');

    let valueBN = new BigNumber(Utils.etherToWei($('#beneficiaryTransferAmount')[0].value));
    if (valueBN.isLessThanOrEqualTo(this.beneficiary_latestPrice_BN)) {
      showTopBannerMessage($t.wrong_beneficiary_amount, null, true);
      return;
    } else if ((new BigNumber(await BlockchainManager.getBalance()).isLessThan(valueBN))) {
      showTopBannerMessage($t.not_enough_funds, null, true);
      return;
    }

    window.CommonManager.showSpinner(Types.SpinnerView.beneficiary);
    window.BlockchainManager.gameInst(this.gameType).methods.makeFeeBeneficiar().send({
      from: window.BlockchainManager.currentAccount(),
      value: valueBN
    })
    .on('transactionHash', function (hash) {
      // console.log('%c makeTopClicked transactionHash: %s', 'color: #1d34ff', hash);
      if (window.CommonManager.isCurrentView(Types.View.game)) {
        showTopBannerMessage($t.tx_make_beneficiary_run, hash, false);
      }
    })
    .once('receipt', function (receipt) {
      if (window.CommonManager.isCurrentView(Types.View.game)) {
        window.ProfileManager.update(false);
        
        window.Game.updateBeneficiary(window.Game.gameType, true);
        hideTopBannerMessage();
      }
    })
    .once('error', function (error, receipt) {
      if (window.CommonManager.isCurrentView(Types.View.game)) {
        showTopBannerMessage($t.err_make_beneficiary_run, null, true);
        window.CommonManager.hideSpinner(Types.SpinnerView.beneficiary);

        throw new Error(error, receipt);
      }
    })
    .then(() => {
      if (window.CommonManager.isCurrentView(Types.View.game)) {
        window.CommonManager.hideSpinner(Types.SpinnerView.beneficiary);
      }
    });
  },
  //  Beneficiary ^^^









  
  //  NOTIFICATION HELPERS
  onGameUpdated: async function (_gameId) {
    // console.log('%c game - onGameUpdated %s', 'color: #1d34ff', _gameId);

    let gameInfo = await window.BlockchainManager.gameInfo(this.gameType, _gameId);
    if (gameInfo.paused) {
      // console.log('skip');
      return;
    }

    if (this.isGamePresentInAnyList(_gameId)) {
      const isTopGame = (this.topGameIds.includes(_gameId.toString()));
      this.removeGameWithId(_gameId.toString());
      this.addGameWithInfo(gameInfo, isTopGame, true);
    }
  },

  onGameAddedToTop: function (_gameType, _gameId, _creator) {
    if (_gameType == Types.Game.cf) {
      // console.log('%c game - onGameAddedToTop - CF: %s %s', 'color: #1d34ff', _gameId, _creator);
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c game - onGameAddedToTop - RPS: %s %s', 'color: #1d34ff', _gameId, _creator);
    }

    if (this.isGamePresentInAnyList(_gameId)) {
      this.removeGameWithId(_gameId);
    }
    this.loadTopGamesForGame(this.gameType);
  },


  //  HELPERS
  isGamePresentInAnyList: function (_gameId) {
    return (this.topGameIds.includes(_gameId)) || (this.availableGameIds.includes(_gameId));
  },


  onGameCreated: async function (_gameType, _gameId, _creator) {
    if (_gameType == Types.Game.cf) {
      // console.log('%c game - onGameCreated_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c game - onGameCreated_RPS', 'color: #1d34ff');
    }

    if (!_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      let gameInfo = await window.BlockchainManager.gameInfo(this.gameType, parseInt(_gameId));
      this.addGameWithInfo(gameInfo, false, true);
    }
  },

  onGameJoined: async function (_gameId, _creator, _opponent) {
    // console.log('%c game - onGameJoined_RPS', 'color: #1d34ff');

    if (this.isGamePresentInAnyList(_gameId)) {
      this.removeGameWithId(_gameId);
    }

    if (_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      let gameInfo = await window.BlockchainManager.gameInfo(this.gameType, parseInt(_gameId));
      this.gameInst.showGameView(this.gameInst.GameView.finish, gameInfo);
    }
  },

  onGamePlayed: async function (_gameType, _gameId, _creator, _opponent, _winner) {
    if (_gameType == Types.Game.cf) {
      // console.log('%c game - onGamePlayed_CF %s, %s, %s', 'color: #1d34ff', _gameId, _creator, _opponent);
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c game - onGamePlayed_RPS %s, %s, %s', 'color: #1d34ff', _gameId, _creator, _opponent);
    }

    if (_opponent.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      let gameInfo = await window.BlockchainManager.gameInfo(_gameType, parseInt(_gameId));
      let resultView = (Utils.addressesEqual(window.BlockchainManager.currentAccount(), gameInfo.winner)) ? this.gameInst.GameView.won : this.gameInst.GameView.lost;
      this.gameInst.showGameView(resultView, null);
      window.ProfileManager.update();
    }

    this.updateRaffleStateInfoForGame(this.gameType, false);
  },

  onGamePrizesWithdrawn: function () {
    this.updateRaffleStateInfoForGame(this.gameType, false);
  },

  onGamePaused: function (_gameId) {
    console.log('%c game - onGamePaused: %s', 'color: #1d34ff', _gameId);
    if (this.isGamePresentInAnyList(_gameId)) {
      this.removeGameWithId(_gameId);
    }
  },

  onGameUnpaused: async function (_gameId, _creator) {
    console.log('%c game - onGameUnpaused: %s %s', 'color: #1d34ff', _gameId, _creator);

    if (!_creator.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      let gameInfo = await window.BlockchainManager.gameInfo(this.gameType, parseInt(_gameId));
      this.addGameWithInfo(gameInfo, false, true);
    }
  },

  onGameFinished: async function (_id) {
    // console.log('%c game - onGameFinished_RPS, _id: %s', 'color: #1d34ff', _id);

    if (this.isGamePresentInAnyList(_id)) {
      this.removeGameWithId(_id);
    }
    window.Game.updateRaffleStateInfoForGame(window.Game.gameType, false);

    if (window.ProfileManager.isGameParticipant(Types.Game.rps, _id)) {
      let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.rps, _id);
      let resultView;

      if ((new BigNumber(gameInfo.state)).comparedTo(new BigNumber(Types.GameState.draw)) == 0) {
        resultView = this.gameInst.GameView.draw;
      } else if ((new BigNumber(gameInfo.state)).comparedTo(new BigNumber(Types.GameState.winnerPresent)) == 0) {
        resultView = (Utils.addressesEqual(window.BlockchainManager.currentAccount(), gameInfo.winner)) ? this.gameInst.GameView.won : this.gameInst.GameView.lost;
      } else if ((new BigNumber(gameInfo.state)).comparedTo(new BigNumber(Types.GameState.quitted)) == 0 ||
        (new BigNumber(gameInfo.state)).comparedTo(new BigNumber(Types.GameState.expired)) == 0) {
        resultView = (Utils.addressesEqual(window.BlockchainManager.currentAccount(), gameInfo.winner)) ? this.gameInst.GameView.won : this.gameInst.GameView.lost;
      } else {
        throw ("onGameFinished - ERROR");
      }

      this.gameInst.showGameView(resultView, null);
      await window.ProfileManager.update();
    }
  },

  onGameQuittedFinished: async function (_gameType, _id, _creator, _opponent) {
    console.log('%c game - onGameQuittedFinished_CF, _id: %s', 'color: #1d34ff', _id);

    if (this.isGamePresentInAnyList(_id)) {
      this.removeGameWithId(_id);
    }

    if (window.ProfileManager.isGameParticipant(_gameType, _id)) {
      await window.ProfileManager.update();

      let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, _id);
      (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount())) ? this.gameInst.showGameView(this.gameInst.GameView.won, null) : this.gameInst.showGameView(this.gameInst.GameView.lost, null);
    }

    window.Game.updateRaffleStateInfoForGame(window.Game.gameType, false);
  },

  onGameExpiredFinished: async function (_gameType, _id, _creator, _opponent) {
    console.log('%c game - onGameExpiredFinished_CF, _id: %s', 'color: #1d34ff', _id);

    if (window.ProfileManager.isGameParticipant(_gameType, _id)) {
      let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.cf, _id);
      if (Utils.addressesEqual(gameInfo.winner, window.BlockchainManager.currentAccount())) {
        this.gameInst.showGameView(this.gameInst.GameView.won, null);
        await window.ProfileManager.update();
      } else {
        this.gameInst.showGameView(this.gameInst.GameView.lost, null);
      }
    }

    window.Game.updateRaffleStateInfoForGame(window.Game.gameType, false);
  },

  onGameMovePlayed: function (_gameId, _nextMover) {
    // console.log('%c game - onGameMovePlayed: id: %s, _nextMover: %s', 'color: #1d34ff', _gameId, _nextMover);

    if (_nextMover.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      this.gameInst.showGameViewForCurrentAccount();
    }
  },

  onGameOpponentMoved: function (_gameId, _nextMover) {
    // console.log('%c game - onGameOpponentMoved: id: %s, _nextMover: %s', 'color: #1d34ff', _gameId, _nextMover);

    if (_nextMover.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      this.gameInst.showGameViewForCurrentAccount();
    }
  },

  onGameRafflePlayed: function (_gameType, _winner) {
    if (this.raffleStartedByMe) {
      this.raffleStartedByMe = false;
      return;
    }

    if (_gameType == Types.Game.cf) {
      // console.log('%c Game - onGameRafflePlayed_CF', 'color: #1d34ff');
    } else if (_gameType == Types.Game.rps) {
      // console.log('%c Game - onGameRafflePlayed_RPS', 'color: #1d34ff');
    }

    if (!_winner.includes(window.BlockchainManager.currentAccount().replace("0x", ""))) {
      window.ProfileManager.update();
      window.Game.updateRaffleStateInfoForGame(window.Game.gameType, true);
    }
  },


  //  UI ACTIONS
  startNewGameClicked: function () {
    this.gameInst.showGameView(this.gameInst.GameView.start, null);
  },

  startGameClicked: function () {
    this.gameInst.startGame();
  },

  makeTopClicked: function () {
    this.gameInst.makeTopClicked();
  },

  increaseBetClicked: function () {
    this.gameInst.increaseBetClicked();
  },

  closeResultView: function () {
    this.gameInst.closeResultView();
  },

  rps_moveClicked: function (_value) {
    this.gameInst.moveClicked(_value);
  },

  cf_moveClicked: function (_value) {
    this.gameInst.coinSideChanged(_value);
  },

  loadMoreAvailableGames: async function () {
    // console.log("loadMoreAvailableGames");
    document.getElementById("loadMoreAvailableGamesBtn").disabled = true;
    await this.loadAvailableGamesPortionForGame(this.gameType);
    document.getElementById("loadMoreAvailableGamesBtn").disabled = false;
  },

  gameClicked: function (_element) {
    let idx = $(_element.parentElement).index();
    // console.log("CLICK game gameId: ", Game.availableGameIds[idx]);
    this.joinGame(idx, false);
  },

  topGameClicked: function (_element) {
    let idx = $(_element.parentElement).index();
    // console.log("CLICK top game gameId: ", Game.topGameIds[idx]);
    this.joinGame(idx, true);
  },

  joinGame: async function (_gameIdx, _isTopGame) {
    // console.log("joinGame _gameIdx in list: ", _gameIdx, ", top: ", _isTopGame);
    let gameId = (_isTopGame) ? this.topGameIds[_gameIdx] : this.availableGameIds[_gameIdx];
    let gameInfo = await window.BlockchainManager.gameInfo(this.gameType, gameId);

    this.gameInst.showGameView(this.gameInst.GameView.join, gameInfo);
  },

  startRaffle: function () {
    window.CommonManager.showSpinner(Types.SpinnerView.raffle);
    this.raffleStartedByMe = true;

    window.BlockchainManager.gameInst(this.gameType).methods.runRaffle().send({
        from: window.BlockchainManager.currentAccount()
      })
      .on('transactionHash', function (hash) {
        // console.log('%c makeTopClicked transactionHash: %s', 'color: #1d34ff', hash);
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.tx_raffle_run, hash, false);
        }
      })
      .once('receipt', function (receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.ProfileManager.update();

          window.Game.updateRaffleStateInfoForGame(window.Game.gameType, true);
          hideTopBannerMessage();
        }
      })
      .once('error', function (error, receipt) {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          showTopBannerMessage($t.err_run_raffle, null, true);
          window.CommonManager.hideSpinner(Types.SpinnerView.raffle);

          throw new Error(error, receipt);
        }
      })
      .then(() => {
        if(window.CommonManager.isCurrentView(Types.View.game)) {
          window.CommonManager.hideSpinner(Types.SpinnerView.raffle);
        }
      });
  },

  updateMoneyIcons: function () {
    let srcStr = "/img/icon_amount-" + (window.BlockchainManager.currentCryptoName().toLowerCase()) + ".svg";
    window.Game.cryptoIconSrc = srcStr;

    let loadInterval = setInterval(function () {
      clearInterval(loadInterval);
      $(".template_available_games").attr('src', window.Game.cryptoIconSrc);
      $(".template_top_games").attr('src', window.Game.cryptoIconSrc);
    }, 500);
  },

  //  cf
  cf_coinSideChanged: function (_side) {
    this.gameInst.coinSideChanged(_side);
  },

  cf_joinGameClicked: function () {
    this.gameInst.joinGameClicked();
  },

  cf_pauseGameClicked: function () {
    this.gameInst.pauseGameClicked();
  },

  cf_quitGameClicked: function () {
    this.gameInst.quitGameClicked();
  },

  cf_claimExpiredGameClicked: function () {
    this.gameInst.claimExpiredGameClicked();
  },

  cf_playMoveClicked: function () {
    this.gameInst.playMoveClicked();
  },


  //  rps
  rps_quitGameClicked: function () {
    this.gameInst.quitGameClicked();
  },

  rps_pauseGameClicked: function () {
    this.gameInst.pauseGameClicked();
  },

  rps_joinGameClicked: function () {
    this.gameInst.joinGameClicked();
  },

  rps_claimExpiredGameClicked: function () {
    this.gameInst.claimExpiredGameClicked();
  },

  rps_playMoveClicked: function () {
    this.gameInst.playMoveClicked();
  },

  rps_makeMoveClicked: function () {
    this.gameInst.makeMoveClicked();
  },

  rps_quitGameClicked: function () {
    this.gameInst.quitGameClicked();
  }
}

window.Game = Game;

export default Game;

//  HELPERS

String.prototype.composetmp = (function () {
  var re = /\{{(.+?)\}}/g;
  return function (o) {
    return this.replace(re, function (_, k) {
      return typeof o[k] != 'undefined' ? o[k] : '';
    });
  }
}());

var TableAvailableGamesTemplate = '<li>' +
  '<div class="bordered mt-1 game-cell" onclick="window.Game.gameClicked(this)">' +
  '<p>' +
  '<img src="/img/game-icon-wallet.svg" class="creator">' +
  '<span class="pl-2 pr-2 text-black-50 creator-title">' + $t.creator + ':</span>' +
  '<span class="one-line">{{address}}</span>' +
  '</p>' +
  '<p>' +
  '<img src="/img/game-icon-bet.svg" class="creator">' +
  '<span class="pl-2 pr-2 text-black-50 creator-title">' + $t.bet + ':</span>' +
  '<span class="text-primary"><b>{{bet}}</b></span>' +
  '<img class="money-icon template_available_games">' +
  '</p>' +
  '</div>' +
  '</li>';

var TopGamesTemplate = '<li>' +
  '<div class="bordered blue-border mt-1 game-cell" onclick="window.Game.topGameClicked(this)">' +
  '<p>' +
  '<img src="/img/game-icon-wallet.svg" class="creator">' +
  '<span class="pl-2 pr-2 text-black-50 creator-title">' + $t.creator + ':</span>' +
  '<span class="one-line">{{address}}</span>' +
  '</p>' +
  '<p>' +
  '<img src="/img/game-icon-bet.svg" class="creator">' +
  '<span class="pl-2 pr-2 text-black-50 creator-title">' + $t.bet + ':</span>' +
  '<span class="text-primary"><b>{{bet}}</b></span>' +

  '<img class="money-icon template_top_games">' +
  '</p>' +
  '</div>' +
  '</li>';

var RaffleGamesTemplate = '<li>' +
  '<div class="bordered mt-1"">' +
  '<p>' +
  '<img src="/img/game-icon-wallet.svg" class="creator">' +
  '<span class="pl-2 pr-2 text-black-50 creator-title">' + $t.winner + ':</span>' +
  '<span class="one-line">{{address}}</span>' +
  '</p>' +
  '<p>' +
  '<img src="/img/game-icon-bet.svg" class="creator">' +
  '<span class="pl-2 pr-2 text-black-50 creator-title">' + $t.prize + ':</span>' +
  '<span class="text-primary"><b>{{amount}}</b></span>' +
  '<img class="money-icon template_raffle">' +
  '<span class="float-right text-black-50">{{timeago}}</span>' +
  '</p>' +
  '</div>' +
  '</li>';