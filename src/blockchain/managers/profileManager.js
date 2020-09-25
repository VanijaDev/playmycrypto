import Utils from "../utils";
import BigNumber from "bignumber.js";
import Types from "../types";
import $ from "../../../public/jquery.min"
import router from "../../router/index"

let ProfileManager = {
  GAMES_TOTAL_AMOUNT: 2,

  PendingWithdraw: {
    referral: "withdrawReferral",
    gamePrize: "withdrawGamePrize",
    raffle: "withdrawRafflePrize",
    beneficiary: "withdrawBeneficiaryPrize"
  },

  profileUpdateHandler: null,

  ongoingGameCF_Creator: new BigNumber("0"),
  ongoingGameCF_Opponent: new BigNumber("0"),
  ongoingGameRPS: new BigNumber("0"),

  setUpdateHandler: function (_handler) {
    this.profileUpdateHandler = _handler;
  },

  update: async function (_handler) {
    console.log('%c ProfileManager - update', 'color: #00aa00');

    hideTopBannerMessage();
    showAppDisabledView(false);

    this.updateCurrentAccountUI();
    this.updateCurrentAccountBalanceUI();

    await this.updateCurrentlyPlayingGames();
    await this.updatePlayedGamesTotalAmounts();
    await this.updatePlayerProfit();
    await this.updateReferralFeesWithdrawn();
    await this.updatePendingWithdrawals();
  },

  updateAfterWithdrawal: async function () {
    console.log('%c updateAfterWithdrawal - update', 'color: #00aa00');

    this.updateCurrentAccountBalanceUI();

    await this.updatePlayerGameplayProfit();
    await this.updatePlayerTotalProfit();
    await this.updateReferralFeesWithdrawn();
    await this.updatePendingWithdrawals();
  },

  updateCurrentAccountUI: async function () {
    let account = window.BlockchainManager.currentAccount();
    if (!account) {
      showTopBannerMessage("Not logged in to MetaMask.", null, false);
      showAppDisabledView(true);
      throw("Not logged in to MetaMask.");
    }
    document.getElementById("playerAccount").innerText = account.replace(/(0x[a-zA-Z0-9]{3})[a-zA-Z0-9]{34}/, "$1***");
  },

  updateCurrentAccountBalanceUI: async function () {
    let balance = (await window.BlockchainManager.getBalance()).toString();
    document.getElementById("currentAccountBalance").innerText = Utils.weiToEtherFixed(balance);
  },

  updateCurrentlyPlayingGames: async function () {
    await $('#listCurrentlyPlayingGames').empty();
    $('#profileNotification')[0].classList.add('hidden');

    //  cf
    this.ongoingGameCF_Creator = new BigNumber(await window.BlockchainManager.ongoingGameAsCreator(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("this.ongoingGameCF_Creator: ", this.ongoingGameCF_Creator.toString());
    if (this.ongoingGameCF_Creator.isGreaterThan(new BigNumber("0"))) {
      let btn = this.createPendingButtonElement("ongoingGameCF_Creator", Utils.gameIconSmallForGame(Types.Game.cf), "creator: " + this.ongoingGameCF_Creator);
        btn.onclick = function () {
          window.ProfileManager.currentlyPlayingGameClicked(Types.Game.cf, window.ProfileManager.ongoingGameCF_Creator.toString());
        };
      $('#listCurrentlyPlayingGames')[0].appendChild(btn);
      if (await this.checkIfPendingMove(Types.Game.cf, this.ongoingGameCF_Creator)) {
        showActionRequired("ongoingGameCF_Creator");
      }
    }

    this.ongoingGameCF_Opponent = new BigNumber(await window.BlockchainManager.ongoingGameAsOpponent(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("this.ongoingGameCF_Opponent: ", this.ongoingGameCF_Opponent.toString());
    if (this.ongoingGameCF_Opponent.isGreaterThan(new BigNumber("0"))) {
      let btn = this.createPendingButtonElement(null, Utils.gameIconSmallForGame(Types.Game.cf), "opponent: " + this.ongoingGameCF_Opponent);
        btn.onclick = function () {
          window.ProfileManager.currentlyPlayingGameClicked(Types.Game.cf, window.ProfileManager.ongoingGameCF_Opponent.toString());
        };
      $('#listCurrentlyPlayingGames')[0].appendChild(btn);
    }

    // //  rps
    // this.ongoingGameRPS = new BigNumber(await window.BlockchainManager.ongoingGameIdxForPlayer(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // // console.log("this.ongoingGameRPS: ", this.ongoingGameRPS.toString());
    // if (this.ongoingGameRPS.isGreaterThan(new BigNumber("0"))) {
    //   Utils.addGameIconsToElement($('#listCurrentlyPlayingGames'), [Types.Game.rps]);
    // }

    // let gameInfo = await window.BlockchainManager.gameInfo(Types.Game.rps, this.ongoingGameRPS);
    //   if (Utils.addressesEqual(gameInfo.nextMover, window.BlockchainManager.currentAccount())) {
    //     showTopBannerMessage($('#translations').data().rps_pending_move);
    //   }
  },

  checkIfPendingMove: async function (_gameType, _gameId) {
    switch (_gameType) {
      case Types.Game.cf:
        let gameInfo = await window.BlockchainManager.gameInfo(_gameType, _gameId);
        return !Utils.zeroAddress(gameInfo.opponent);

      case Types.Game.rps:
    
        break;

      default:
        throw("Wrong _gameType: ", _gameType);
    }
  },

  currentlyPlayingGameClicked: function (_gameType, _gameId) {
    console.log("ProfileManager - _gameType:", _gameType, "_gameId:", _gameId);
    window.CommonManager.setCurrentGameId(_gameId);

    (window.CommonManager.currentView == Types.View.game) ? window.Game.setup(_gameType) : router.push(_gameType);
  },

  updatePlayedGamesTotalAmounts: async function () {
    let cfResult = await window.BlockchainManager.playedGamesForPlayer(Types.Game.cf, window.BlockchainManager.currentAccount());
    document.getElementById("coinFlipPlayedTotalAmount").innerText = cfResult.length;

    // let rpsResult = await window.BlockchainManager.playedGameIdxsForPlayer(Types.Game.rps, window.BlockchainManager.currentAccount());
    // document.getElementById("rockPaperScissorsPlayedTotalAmount").innerText = rpsResult.length;
  },

  updatePlayerProfit: async function () {
    //  GAMEPLAY
    var gamePlayProfitAmountElement = document.getElementById("profit_amount_gameplay");
    gamePlayProfitAmountElement.classList.remove("red");
    gamePlayProfitAmountElement.classList.add("green");

    let cfBetResult = new BigNumber(await window.BlockchainManager.betTotal(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let betTotal = cfBetResult;
    // let rpsBetResult = new BigNumber(await window.BlockchainManager.betTotal(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // let betTotal = cfBetResult.plus(rpsBetResult);

    let cfPrizeResult = new BigNumber(await window.BlockchainManager.prizeTotal(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let prizeTotal = cfPrizeResult
    // let rpsPrizeResult = new BigNumber(await window.BlockchainManager.addressprizeTotal(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // let prizeTotal = cfPrizeResult.plus(rpsPrizeResult);

    let gamePlayProfit = betTotal.multipliedBy(new BigNumber("-1")).plus(prizeTotal.multipliedBy(new BigNumber("2")));
    // console.log("PPP ", (gamePlayProfit).toString());
    gamePlayProfitAmountElement.innerText = Utils.weiToEtherFixed(gamePlayProfit.toString());

    if (gamePlayProfit.isNegative()) {
      document.getElementById("updownpic_gameplay").innerHTML = '<img src="/img/icon-trending-down.svg">';
      gamePlayProfitAmountElement.classList.remove("green");
      gamePlayProfitAmountElement.classList.add("red");
    } else {
      document.getElementById("updownpic_gameplay").innerHTML = '<img src="/img/icon-trending-up.svg">';
    }

    //  TOTAL
    let totalProfit = gamePlayProfit;
    // console.log("totalProfit after gamePlayProfit: ", totalProfit.toString());

    //  raffle
    //  cf
    let raffleResults = await window.BlockchainManager.raffleResultCount(Types.Game.cf);
    for (let i = 0; i < raffleResults; i++) {
      let resultInfo = await window.BlockchainManager.raffleResultInfo(Types.Game.cf, i);
      if (Utils.addressesEqual(resultInfo.winner, window.BlockchainManager.currentAccount())) {
        // console.log("raffleResults cf ", i, resultInfo);
        totalProfit = totalProfit.plus(new BigNumber(resultInfo.prize));
      }
    }

    //  rps
    raffleResults = await window.BlockchainManager.raffleResultCount(Types.Game.rps);
    for (let i = 0; i < raffleResults; i++) {
      let resultInfo = await window.BlockchainManager.raffleResultInfo(Types.Game.rps, i);
      if (Utils.addressesEqual(resultInfo.winner, window.BlockchainManager.currentAccount())) {
        // console.log("raffleResults rps ", i, resultInfo);
        totalProfit = totalProfit.plus(new BigNumber(resultInfo.prize));
      }
    }
    console.log("totalProfit after raffle ", totalProfit.toString());

    //  referral
    //  cf
    let cfReferralResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("cfReferralResult: ", cfReferralResult.toString());
    totalProfit = totalProfit.plus(cfReferralResult);
    
    //  rps
    let rpsReferralResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // console.log("rpsReferralResult: ", rpsReferralResult.toString());
    
    totalProfit = totalProfit.plus(rpsReferralResult);
    // console.log("totalProfit after referral ", totalProfit.toString());

    var profitAmountTotalElement = document.getElementById("profit_amount_total");
    let totalProfitLengthCorrect = Utils.weiToEtherFixed(totalProfit.toString());
    profitAmountTotalElement.innerHTML = totalProfitLengthCorrect.toString();

    if (totalProfit.isNegative()) {
      document.getElementById("updownpic_total").innerHTML = '<img src="/img/icon-trending-down.svg">';
      profitAmountTotalElement.classList.remove("green");
      profitAmountTotalElement.classList.add("red");
    } else {
      document.getElementById("updownpic_total").innerHTML = '<img src="/img/icon-trending-up.svg">';
      profitAmountTotalElement.classList.remove("red");
      profitAmountTotalElement.classList.add("green");
    }
  },

  updateReferralFeesWithdrawn: async function () {
    let cfResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.cf, window.BlockchainManager.currentAccount()));
    document.getElementById('ReferralFeesWithdrawnCoinflip').innerHTML = Utils.weiToEtherFixed(cfResult.toString());

    let rpsResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.rps, window.BlockchainManager.currentAccount()));
    document.getElementById('ReferralFeesWithdrawnRPS').innerHTML = Utils.weiToEtherFixed(rpsResult.toString());
  },

  updatePendingWithdrawals: async function () {
    this.updatePendingReferral();
    // this.updatePendingGamePrize();
    // this.updatePendingRafflePrize();
    // this.updatePendingBeneficiaryPrize();
  },

  updatePendingReferral: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await window.BlockchainManager.referralFeesPending(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (cfResult.isGreaterThan(new BigNumber("0"))) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }
    
    let rpsResult = new BigNumber(await window.BlockchainManager.referralFeesPending(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (rpsResult.isGreaterThan(new BigNumber("0"))) {
      pendingGames.push(Types.Game.rps);
      pendingValues.push(rpsResult);
    }

    this.updatePendingPictures(this.PendingWithdraw.referral, pendingGames, pendingValues);
  },

  updatePendingGamePrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResultGames = await window.BlockchainManager.gamesWithPendingPrizeWithdrawalForAddress(Types.Game.cf, window.BlockchainManager.currentAccount());
    if (new BigNumber(cfResultGames.length.toString()).comparedTo(new BigNumber("0"))) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResultGames.length);
    }

    // let rpsResultGames = await window.BlockchainManager.gamesWithPendingPrizeWithdrawalForAddress(Types.Game.rps, window.BlockchainManager.currentAccount());
    // if (new BigNumber(rpsResultGames.length.toString()).comparedTo(new BigNumber("0"))) {
    //   pendingGames.push(Types.Game.rps);
    //   pendingValues.push(rpsResultGames.length);
    // }

    this.updatePendingPictures(this.PendingWithdraw.gamePrize, pendingGames, pendingValues);
  },

  updatePendingRafflePrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await window.BlockchainManager.rafflePrizePendingForAddress(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (cfResult.comparedTo(new BigNumber("0")) > 0) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }

    // let rpsResult = new BigNumber(await window.BlockchainManager.rafflePrizePendingForAddress(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // if (rpsResult.comparedTo(new BigNumber("0")) > 0) {
    //   pendingGames.push(Types.Game.rps);
    //   pendingValues.push(rpsResult);
    // }

    this.updatePendingPictures(this.PendingWithdraw.raffle, pendingGames, pendingValues);
  },

  updatePendingBeneficiaryPrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await window.BlockchainManager.feeBeneficiarBalance(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (cfResult.comparedTo(new BigNumber("0")) > 0) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }

    this.updatePendingPictures(this.PendingWithdraw.beneficiary, pendingGames, pendingValues);
  }, 

  isGameParticipant: function (_gameType, _id) {
    switch (_gameType) {
      case Types.Game.cf:
        if ((this.ongoingGameCF_Creator.comparedTo(_id) == 0) || (this.ongoingGameCF_Opponent.comparedTo(_id) == 0)) {
          return true;
        }
        break;

      case Types.Game.rps:
        
        break;
    
      default:
        throw("ERROR: " + _gameType + _id);
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

      _gamesWithPendingPrize.map((gameType, idx) => {
        let pendingValue = Utils.weiToEtherFixed(_pendingValues[idx]);
        let tooltipSuffix = " ETH";

        if (_pendingTarget == this.PendingWithdraw.gamePrize) {
          pendingValue = _pendingValues[idx];
          tooltipSuffix = $('#translations').data().suffix_games;
        }

        let btn = this.createPendingButtonElement(null, Utils.gameIconSmallForGame(gameType), pendingValue + tooltipSuffix);
        btn.onclick = function () {
          window.ProfileManager.pendingClicked(this, _pendingTarget, gameType);
        };
        $('#' + _pendingTarget)[0].appendChild(btn);
      });
    }
  },

  createPendingButtonElement: function (_id, _img, _tooltipString) {
    var btn = document.createElement("BUTTON");
    btn.classList.add(...["btn", "btn-animated"]);
    if (_id) {
      btn.id = _id;
    }

    var img = document.createElement('IMG');
    img.setAttribute("src", "/img/" + _img + ".svg");
    img.classList.add("game-icon", "mr-3");
    btn.appendChild(img);

    var tooltiptext = document.createElement("SPAN");
    tooltiptext.classList.add("tooltiptext");
    var t = document.createTextNode(_tooltipString);
    tooltiptext.appendChild(t);
    btn.appendChild(tooltiptext);

    return btn;
  },

  showPendingDot: function (_isShow, _pendingTarget) {
    switch (_pendingTarget) {
      case this.PendingWithdraw.referral:
        _isShow ? $('#referralPendingPrizeBtn').addClass('visible') : $('#referralPendingPrizeBtn').removeClass('visible');
        break;
      case this.PendingWithdraw.gamePrize:
        _isShow ? $('#gamePendingPrizeBtn').addClass('visible') : $('#gamePendingPrizeBtn').removeClass('visible');
        break;
      case this.PendingWithdraw.raffle:
        _isShow ? $('#rafflePendingPrizeBtn').addClass('visible') : $('#rafflePendingPrizeBtn').removeClass('visible');
        break;
      case this.PendingWithdraw.beneficiary:
        _isShow ? $('#beneficiaryPendingPrizeBtn').addClass('visible') : $('#beneficiaryPendingPrizeBtn').removeClass('visible');
        break;

      default:
        throw("ERROR: wrong _pendingTarget in showPendingDot");
    }
  },

  pendingClicked: async function (_btn, _pendingTarget, _gameType) {
    console.log("pendingClicked - _pendingTarget: %s,  _gameType: %s", _pendingTarget, _gameType);

    let gameContract = window.BlockchainManager.gameInst(_gameType);
    // console.log("gameContract: ", gameContract);

    _btn.classList.add('disabled');

    switch (_pendingTarget) {
      case this.PendingWithdraw.referral:
        // console.log('%c pendingClicked - withdrawReferral', 'color: #000baa');

        gameContract.methods.withdrawReferralFees().send({
            from: window.BlockchainManager.currentAccount()
            // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
          })
          .on('transactionHash', function (hash) {
            // console.log('%c withdrawReferralFees on transactionHash event: %s', 'color: #1d34ff', hash);
            showTopBannerMessage($('#translations').data().tx_referral_fee, hash, false);
          })
          .once('receipt', function (receipt) {
            hideTopBannerMessage();
            window.ProfileManager.updateAfterWithdrawal();
            window.ProfileManager.profileUpdateHandler.pendingWithdrawn();
          })
          .once('error', function (error, receipt) {
            if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
              showTopBannerMessage($('#translations').data().err_referral_fee_withdraw, null, true);
            }

            _btn.classList.remove('disabled');
            hideTopBannerMessage();
          });
        break;

      case this.PendingWithdraw.gamePrize:
        // console.log('pendingClicked - withdrawGamePrize');

        let pendingGames = await window.BlockchainManager.gamesWithPendingPrizeWithdrawalForAddress(_gameType, window.BlockchainManager.currentAccount());
        let loopAmount = Math.min(pendingGames.length, 10);

        gameContract.methods.withdrawGamePrizes(loopAmount).send({
            from: window.BlockchainManager.currentAccount()
            // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
          })
          .on('transactionHash', function (hash) {
            // console.log('%c withdrawGamePrizes on transactionHash event: %s', 'color: #1d34ff', hash);
            showTopBannerMessage($('#translations').data().tx_game_prize, hash, false);
          })
          .once('receipt', function (receipt) {
            hideTopBannerMessage();
            window.ProfileManager.updateAfterWithdrawal();
          })
          .once('error', function (error, receipt) {
            if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
              showTopBannerMessage($('#translations').data().err_game_prize_withdraw, null, true);
            }

            _btn.classList.remove('disabled');
            hideTopBannerMessage();
            window.ProfileManager.profileUpdateHandler.pendingWithdrawn();
          });
        break;

      case this.PendingWithdraw.raffle:
        // console.log('%c pendingClicked - withdrawRafflePrize', 'color: #000baa');

        gameContract.methods.withdrawRafflePrizes().send({
            from: window.BlockchainManager.currentAccount()
            // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
          })
          .on('transactionHash', function (hash) {
            // console.log('%c withdrawRafflePrizes on transactionHash event: %s', 'color: #1d34ff', hash);
            showTopBannerMessage($('#translations').data().tx_raffle_prize, hash, false);
          })
          .once('receipt', function (receipt) {
            hideTopBannerMessage();
            window.ProfileManager.updateAfterWithdrawal();
          })
          .once('error', function (error, receipt) {
            if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
              showTopBannerMessage($('#translations').data().err_raffle_prize_withdraw, null, true);
            }

            _btn.classList.remove('disabled');
            hideTopBannerMessage();
            window.ProfileManager.profileUpdateHandler.pendingWithdrawn();
          });
        break;

        case this.PendingWithdraw.beneficiary:
          // console.log('%c pendingClicked - withdrawBeneficiary', 'color: #000baa');

          gameContract.methods.withdrawBeneficiaryFee().send({
              from: window.BlockchainManager.currentAccount()
              // gasPrice: await window.BlockchainManager.gasPriceNormalizedString()
            })
            .on('transactionHash', function (hash) {
              // console.log('%c withdrawBeneficiaryFee on transactionHash event: %s', 'color: #1d34ff', hash);
              showTopBannerMessage($('#translations').data().tx_withdraw_beneficiary, hash, false);
            })
            .once('receipt', function (receipt) {
              hideTopBannerMessage();
              window.ProfileManager.updateAfterWithdrawal();
              window.ProfileManager.profileUpdateHandler.pendingWithdrawn();
            })
            .once('error', function (error, receipt) {
              if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
                showTopBannerMessage($('#translations').data().err_withdraw_beneficiary, null, true);
              }

              _btn.classList.remove('disabled');
              hideTopBannerMessage();
              window.ProfileManager.profileUpdateHandler.pendingWithdrawn();
            });
          break;

      default:
        throw ("pendingClicked - wrong _pendingTarget: ", _pendingTarget);
    }
  },

}

window.ProfileManager = ProfileManager;

export default ProfileManager;