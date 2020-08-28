import Utils from "../utils";
import BigNumber from "bignumber.js";
import Types from "../types";
import $ from "../../../public/jquery.min"

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
    await this.updatePlayerGameplayProfit();
    await this.updateReferralFeesWithdrawn();
    await this.updatePlayerTotalProfit();
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
      alert("Not logged in to MetaMask.");
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
    $('#listCurrentlyPlayingGames').empty();
    $('#profileNotification').addClass('hidden');

    //  cf
    this.ongoingGameCF_Creator = new BigNumber(await window.BlockchainManager.ongoingGameAsCreator(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("this.ongoingGameCF_Creator: ", this.ongoingGameCF_Creator.toString());
    if (this.ongoingGameCF_Creator.comparedTo(new BigNumber("0")) == 1) {
      $('#listCurrentlyPlayingGames').append('<button id="ongoingGameCF_Creator" class="btn btn-animated" onclick="ProfileManager.currentlyPlayingGameClicked(\'' + Types.Game.cf + '\',' + this.ongoingGameCF_Creator + ');"><img src="/img/icon-coinflip-sm.svg" class="game-icon mr-3"></button>');
      if (await this.checkIfPendingMove(Types.Game.cf, this.ongoingGameCF_Creator)) {
        showActionRequired("ongoingGameCF_Creator");
      }
    }

    this.ongoingGameCF_Opponent = new BigNumber(await window.BlockchainManager.ongoingGameAsOpponent(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("this.ongoingGameCF_Opponent: ", this.ongoingGameCF_Opponent.toString());
    if (this.ongoingGameCF_Opponent.comparedTo(new BigNumber("0")) == 1) {
      $('#listCurrentlyPlayingGames').append('<button class="btn btn-animated" onclick="ProfileManager.currentlyPlayingGameClicked(\'' + Types.Game.cf + '\',' + this.ongoingGameCF_Opponent + ');"><img src="/img/icon-coinflip-sm.svg" class="game-icon mr-3"></button>');
    }

    // //  rps
    // this.ongoingGameRPS = new BigNumber(await window.BlockchainManager.ongoingGameIdxForPlayer(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // // console.log("this.ongoingGameRPS: ", this.ongoingGameRPS.toString());
    // if (this.ongoingGameRPS.comparedTo(new BigNumber("0")) == 1) {
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

  currentlyPlayingGameClicked(_gameType, _gameId) {
    window.location.href = "/" + _gameType + "?id=" + _gameId;
  },

  updatePlayedGamesTotalAmounts: async function () {
    let cfResult = await window.BlockchainManager.playedGamesForPlayer(Types.Game.cf, window.BlockchainManager.currentAccount());
    document.getElementById("coinFlipPlayedTotalAmount").innerText = cfResult.length;

    // let rpsResult = await window.BlockchainManager.playedGameIdxsForPlayer(Types.Game.rps, window.BlockchainManager.currentAccount());
    // document.getElementById("rockPaperScissorsPlayedTotalAmount").innerText = rpsResult.length;
  },

  updatePlayerGameplayProfit: async function () {
    //  gameplay
    var profitAmountElement = document.getElementById("profit_amount_gameplay");
    profitAmountElement.classList.remove("red");
    profitAmountElement.classList.add("green");

    let cfBetResult = new BigNumber(await window.BlockchainManager.addressBetTotal(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let rpsBetResult = new BigNumber(await window.BlockchainManager.addressBetTotal(Types.Game.rps, window.BlockchainManager.currentAccount()));
    let totalBet = cfBetResult.plus(rpsBetResult);

    let cfPrizeResult = new BigNumber(await window.BlockchainManager.addressPrizeTotal(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let rpsPrizeResult = new BigNumber(await window.BlockchainManager.addressPrizeTotal(Types.Game.rps, window.BlockchainManager.currentAccount()));
    let prizeTotal = cfPrizeResult.plus(rpsPrizeResult);

    let profit = prizeTotal.minus(totalBet);
    profitAmountElement.innerText = Utils.weiToEtherFixed(profit.toString());

    if (profit.comparedTo(new BigNumber("0")) < 0) {
      document.getElementById("updownpic_gameplay").innerHTML = '<img src="/img/icon-trending-down.svg">';
      profitAmountElement.classList.remove("green");
      profitAmountElement.classList.add("red");
    } else {
      document.getElementById("updownpic_gameplay").innerHTML = '<img src="/img/icon-trending-up.svg">';
    }
  },

  updateReferralFeesWithdrawn: async function () {
    let cfResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.cf, window.BlockchainManager.currentAccount()));
    document.getElementById('ReferralFeesWithdrawnCoinflip').innerHTML = Utils.weiToEtherFixed(cfResult.toString());

    let rpsResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.rps, window.BlockchainManager.currentAccount()));
    document.getElementById('ReferralFeesWithdrawnRPS').innerHTML = Utils.weiToEtherFixed(rpsResult.toString());
  },

  updatePlayerTotalProfit: async function () {
    // console.log("updatePlayerTotalProfit");

    //  raffle
    //  cf
    let totalProfit = new BigNumber("0");

    let raffleResults = await window.BlockchainManager.raffleResultCount(Types.Game.cf);
    for (let i = 0; i < raffleResults; i++) {
      let resultInfo = await window.BlockchainManager.raffleResultInfo(Types.Game.cf, i);
      // console.log("raffleResults cf ", i, resultInfo);
      if (Utils.addressesEqual(resultInfo.winner, window.BlockchainManager.currentAccount())) {
        totalProfit = totalProfit.plus(resultInfo.prize);
      }
    }
    // console.log("raffleResults cf: ", totalProfit.toString());
    //  rps
    raffleResults = await window.BlockchainManager.raffleResultCount(Types.Game.rps);
    for (let i = 0; i < raffleResults; i++) {
      let resultInfo = await window.BlockchainManager.raffleResultInfo(Types.Game.rps, i);
      // console.log("raffleResults rps ", i, resultInfo);
      if (Utils.addressesEqual(resultInfo.winner, window.BlockchainManager.currentAccount())) {
        totalProfit = totalProfit.plus(resultInfo.prize);
      }
    }
    // console.log("raffleResults totalProfit after rps: ", totalProfit.toString());

    //  referral
    let cfReferralResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("cfReferralResult: ", cfReferralResult.toString());
    let rpsReferralResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // console.log("rpsReferralResult: ", rpsReferralResult.toString());
    totalProfit = totalProfit.plus(cfReferralResult).plus(rpsReferralResult);
    // console.log("totalProfit: ", totalProfit.toString());
    // console.log("totalProfit: raffle + referral: ", totalProfit.toString());
    // console.log("totalProfit raffle + referral: ", new BigNumber(Utils.weiToEtherFixed(totalProfit).toString()).toString());

    //  gameplayProfit
    let gameplayProfit = new BigNumber(profit_amount_gameplay.innerText);
    // console.log("gameplayProfit: ", gameplayProfit.toString());

    totalProfit = new BigNumber(Utils.weiToEtherFixed(totalProfit).toString()).plus(gameplayProfit);
    // console.log("totalProfit: ", totalProfit.toString());

    var profitAmountTotalElement = document.getElementById("profit_amount_total");
    let totalProfitLengthCorrect = parseFloat(totalProfit).toFixed(5);
    profitAmountTotalElement.innerHTML = totalProfitLengthCorrect.toString();

    if (totalProfit.comparedTo(new BigNumber("0")) < 0) {
      document.getElementById("updownpic_total").innerHTML = '<img src="/img/icon-trending-down.svg">';
      profitAmountTotalElement.classList.remove("green");
      profitAmountTotalElement.classList.add("red");
    } else {
      document.getElementById("updownpic_total").innerHTML = '<img src="/img/icon-trending-up.svg">';
      profitAmountTotalElement.classList.remove("red");
      profitAmountTotalElement.classList.add("green");
    }
  },

  updatePendingWithdrawals: async function () {
    this.updatePendingReferral();
    this.updatePendingGamePrize();
    this.updatePendingRafflePrize();
    this.updatePendingBeneficiaryPrize();
  },

  updatePendingReferral: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await window.BlockchainManager.referralFeesPending(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (cfResult.comparedTo(new BigNumber("0")) > 0) {
      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }
    
    let rpsResult = new BigNumber(await window.BlockchainManager.referralFeesPending(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (rpsResult.comparedTo(new BigNumber("0")) > 0) {
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
    if (_gameType == Types.Game.cf) {
      return this.ongoingGameCF.comparedTo(new BigNumber(_id)) == 0;
    } else if (_gameType == Types.Game.rps) {
      return this.ongoingGameRPS.comparedTo(new BigNumber(_id)) == 0;
    } else {
      throw ("ERROR: " + _gameType + _id);
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

        var btn = document.createElement("BUTTON");
        btn.classList.add("btn");
        btn.classList.add("btn-animated");
        btn.onclick = function () {
          ProfileManager.pendingClicked(this, _pendingTarget, gameType);
        };

        var img = document.createElement('IMG');
        img.setAttribute("src", "/img/" + Utils.gameIconSmallForGame(gameType) + ".svg");
        img.classList.add("game-icon");
        img.classList.add("mr-3");
        btn.appendChild(img);

        var tooltiptext = document.createElement("SPAN");
        tooltiptext.classList.add("tooltiptext");
        var t = document.createTextNode(pendingValue + tooltipSuffix);
        tooltiptext.appendChild(t);
        btn.appendChild(tooltiptext);

        $('#' + _pendingTarget)[0].appendChild(btn);
      });
    }
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
            showTopBannerMessage($('#translations').data().tx_referral_fee, hash);
          })
          .once('receipt', function (receipt) {
            hideTopBannerMessage();
            ProfileManager.updateAfterWithdrawal();
            ProfileManager.profileUpdateHandler.pendingReferralWithdrawn();
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
            showTopBannerMessage($('#translations').data().tx_game_prize, hash);
          })
          .once('receipt', function (receipt) {
            hideTopBannerMessage();
            ProfileManager.updateAfterWithdrawal();
          })
          .once('error', function (error, receipt) {
            if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
              showTopBannerMessage($('#translations').data().err_game_prize_withdraw, null, true);
            }

            _btn.classList.remove('disabled');
            hideTopBannerMessage();
            ProfileManager.profileUpdateHandler.pendingPrizeWithdrawn();
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
            showTopBannerMessage($('#translations').data().tx_raffle_prize, hash);
          })
          .once('receipt', function (receipt) {
            hideTopBannerMessage();
            ProfileManager.updateAfterWithdrawal();
          })
          .once('error', function (error, receipt) {
            if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
              showTopBannerMessage($('#translations').data().err_raffle_prize_withdraw, null, true);
            }

            _btn.classList.remove('disabled');
            hideTopBannerMessage();
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
              showTopBannerMessage($('#translations').data().tx_withdraw_beneficiary, hash);
            })
            .once('receipt', function (receipt) {
              hideTopBannerMessage();
              ProfileManager.updateAfterWithdrawal();
              window.Game.updateBeneficiary(_gameType);
            })
            .once('error', function (error, receipt) {
              if (error.code != window.BlockchainManager.MetaMaskCodes.userDenied) {
                showTopBannerMessage($('#translations').data().err_withdraw_beneficiary, null, true);
              }

              _btn.classList.remove('disabled');
              hideTopBannerMessage();
            });
          break;

      default:
        throw ("pendingClicked - wrong _pendingTarget: ", _pendingTarget);
    }
  },

}

window.ProfileManager = ProfileManager;

export default ProfileManager;