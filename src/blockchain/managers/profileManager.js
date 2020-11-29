import Utils from "../utils";
import BigNumber from "bignumber.js";
import Types from "../types";
import $ from "../../../public/jquery.min";
import router from "../../router/index";

let ProfileManager = {
  GAMES_TOTAL_AMOUNT: 2,

  PendingWithdraw: {
    referral: "withdrawReferral",
    gamePrize: "withdrawGamePrize",
    raffle: "withdrawRafflePrize",
    beneficiary: "withdrawBeneficiaryPrize"
  },

  profileUpdateHandler: null,
  gamePlayProfitStr: "",
  totalProfitStr: "",

  pendingReferralBN_cf: new BigNumber("0"),
  pendingReferralBN_rps: new BigNumber("0"),
  pendingGamePrizeCount_cf: 0,
  pendingGamePrizeCount_rps: 0,
  pendingRafflePrizeBN_cf: new BigNumber("0"),
  pendingRafflePrizeBN_rps: new BigNumber("0"),
  pendingBeneficiaryBN_cf: new BigNumber("0"),
  pendingBeneficiaryBN_rps: new BigNumber("0"),

  ongoingGameCF_Creator: new BigNumber("0"),
  ongoingGameCF_Opponent: new BigNumber("0"),
  ongoingGameRPS_Creator: new BigNumber("0"),
  ongoingGameRPS_Opponent: new BigNumber("0"),

  setUpdateHandler: function (_handler) {
    this.profileUpdateHandler = _handler;
  },

  clearData: async function () {
    this.gamePlayProfitStr = "";
    this.totalProfitStr = "";

    this.pendingReferralBN_cf = new BigNumber("0");
    this.pendingReferralBN_rps = new BigNumber("0");
    this.pendingGamePrizeCount_cf = 0;
    this.pendingGamePrizeCount_rps = 0;
    this.pendingRafflePrizeBN_cf = new BigNumber("0");
    this.pendingRafflePrizeBN_rps = new BigNumber("0");
    this.pendingBeneficiaryBN_cf = new BigNumber("0");
    this.pendingBeneficiaryBN_rps = new BigNumber("0");

    this.ongoingGameCF_Creator = new BigNumber("0");
    this.ongoingGameCF_Opponent = new BigNumber("0");
    this.ongoingGameRPS_Creator = new BigNumber("0");
    this.ongoingGameRPS_Opponent = new BigNumber("0");

    this.updatePendingPictures(this.PendingWithdraw.referral, [], []);
    this.updatePendingPictures(this.PendingWithdraw.gamePrize, [], []);
    this.updatePendingPictures(this.PendingWithdraw.raffle, [], []);
    this.updatePendingPictures(this.PendingWithdraw.beneficiary, [], []);
    
    await $('#listCurrentlyPlayingGames').empty();
    $('#profileNotification')[0].classList.add('hidden');
  },

  update: async function (_isClearData) {
    console.log('%c ProfileManager - update & clear: %s', 'color: #00aa00', _isClearData);

    if (_isClearData) {
      await this.clearData();

      hideTopBannerMessage();
      showAppDisabledView(false);
      this.updateCurrentAccountUI();
    }

    this.updateCurrentAccountBalanceUI();
    
    await this.updateCurrentlyPlayingGames();
    await this.updatePlayedGamesTotalAmounts();
    await this.updatePlayerProfit();
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

    let str = account.replace(/(0x[a-zA-Z0-9]{3})[a-zA-Z0-9]{34}/, "$1***");
    if ($("#playerAccount")[0].textContent.localeCompare(str) != 0) {
      $("#playerAccount")[0].textContent = str;
    }
  },

  updateCurrentAccountBalanceUI: async function () {
    let balanceStr = (await window.BlockchainManager.getBalance()).toString();
    if ($("#currentAccountBalance")[0].textContent.localeCompare(balanceStr) != 0) {
      $("#currentAccountBalance")[0].textContent = Utils.weiToEtherFixed(balanceStr);
    }
  },

  updateCurrentlyPlayingGames: async function () {
    let btns = [];

    let ongoingGameCF_Creator_tmp = new BigNumber(await window.BlockchainManager.ongoingGameAsCreator(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let ongoingGameCF_Opponent_tmp = new BigNumber(await window.BlockchainManager.ongoingGameAsOpponent(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let ongoingGameRPS_Creator_tmp = new BigNumber(await window.BlockchainManager.ongoingGameAsCreator(Types.Game.rps, window.BlockchainManager.currentAccount()));
    let ongoingGameRPS_Opponent_tmp = new BigNumber(await window.BlockchainManager.ongoingGameAsOpponent(Types.Game.rps, window.BlockchainManager.currentAccount()));

    console.log();

    if (ongoingGameCF_Creator_tmp.isEqualTo(this.ongoingGameCF_Creator) &&
        ongoingGameCF_Opponent_tmp.isEqualTo(this.ongoingGameCF_Opponent) && 
        ongoingGameRPS_Creator_tmp.isEqualTo(this.ongoingGameRPS_Creator) &&
        ongoingGameRPS_Opponent_tmp.isEqualTo(this.ongoingGameRPS_Opponent)) {
          return;
        }

    await this.clearData();

    this.ongoingGameCF_Creator = ongoingGameCF_Creator_tmp;
    this.ongoingGameCF_Opponent = ongoingGameCF_Opponent_tmp;
    this.ongoingGameRPS_Creator = ongoingGameRPS_Creator_tmp;
    this.ongoingGameRPS_Opponent = ongoingGameRPS_Opponent_tmp;

    btns.forEach(btn => {
      $('#listCurrentlyPlayingGames')[0].appendChild(btn);
    });   

    //  cf
    //  ongoingGameCF_Creator
    // console.log("this.ongoingGameCF_Creator: ", this.ongoingGameCF_Creator.toString());
    if (this.ongoingGameCF_Creator.isGreaterThan(new BigNumber("0"))) {
      let tooltipStr = "creator: " + this.ongoingGameCF_Creator;
      let btn_cf_creator = this.createPendingButtonElement("ongoingGameCF_Creator", Utils.gameIconSmallForGame(Types.Game.cf), tooltipStr);
      btn_cf_creator.onclick = function () {
        window.ProfileManager.currentlyPlayingGameClicked(Types.Game.cf, window.ProfileManager.ongoingGameCF_Creator);
      };
      if (await this.checkIfPendingMove(Types.Game.cf, this.ongoingGameCF_Creator)) {
        showActionRequired(btn_cf_creator);
      }

      btns.push(btn_cf_creator);
      // $('#listCurrentlyPlayingGames')[0].appendChild(btn_cf_creator);
    }

    //  ongoingGameCF_Opponent
    // console.log("this.ongoingGameCF_Opponent: ", this.ongoingGameCF_Opponent.toString());
    if (this.ongoingGameCF_Opponent.isGreaterThan(new BigNumber("0"))) {
      let tooltipStr = "opponent: " + this.ongoingGameCF_Opponent;
      let btn_cf_opponent = this.createPendingButtonElement(null, Utils.gameIconSmallForGame(Types.Game.cf), tooltipStr);
      btn_cf_opponent.onclick = function () {
        window.ProfileManager.currentlyPlayingGameClicked(Types.Game.cf, window.ProfileManager.ongoingGameCF_Opponent);
      };
      btns.push(btn_cf_opponent);
      // $('#listCurrentlyPlayingGames')[0].appendChild(btn_cf_opponent);
    }

    //  rps
    //  ongoingGameRPS_Creator
    // console.log("this.ongoingGameRPS_Creator: ", this.ongoingGameRPS_Creator.toString());
    if (this.ongoingGameRPS_Creator.isGreaterThan(new BigNumber("0"))) {
      let tooltipStr =  "creator: " + this.ongoingGameRPS_Creator;
      let btn_rps_creator = this.createPendingButtonElement("ongoingGameRPS_Creator", Utils.gameIconSmallForGame(Types.Game.rps),tooltipStr);
      btn_rps_creator.onclick = function () {
        window.ProfileManager.currentlyPlayingGameClicked(Types.Game.rps, window.ProfileManager.ongoingGameRPS_Creator);
      };
      if (await this.checkIfPendingMove(Types.Game.rps, this.ongoingGameRPS_Creator)) {
        showActionRequired(btn_rps_creator);
      }

      btns.push(btn_rps_creator);
    }

    //  ongoingGameRPS_Opponent
    // console.log("this.ongoingGameRPS_Opponent: ", this.ongoingGameRPS_Opponent.toString());
    if (this.ongoingGameRPS_Opponent.isGreaterThan(new BigNumber("0"))) {
      let tooltipStr =  "opponent: " + this.ongoingGameRPS_Opponent;
      let btn_rps_opponent = this.createPendingButtonElement(null, Utils.gameIconSmallForGame(Types.Game.rps), tooltipStr);
      btn_rps_opponent.onclick = function () {
        window.ProfileManager.currentlyPlayingGameClicked(Types.Game.rps, window.ProfileManager.ongoingGameRPS_Opponent);
      };
      btns.push(btn_rps_opponent);
      // $('#listCurrentlyPlayingGames')[0].appendChild(btn_rps_opponent);
    }

    btns.forEach(btn => {
      $('#listCurrentlyPlayingGames')[0].appendChild(btn);
    });
  },

  checkIfPendingMove: async function (_gameType, _gameId) {
    let gameInfo = await window.BlockchainManager.gameInfo(_gameType, _gameId);
    return !Utils.zeroAddress(gameInfo.opponent);
  },

  currentlyPlayingGameClicked: function (_gameType, _gameId) {
    console.log("ProfileManager - _gameType:", _gameType, "_gameId:", _gameId.toString());
    (window.CommonManager.currentView == Types.View.game) ? window.Game.setup(_gameType, _gameId) : router.push(_gameType);
  },

  updatePlayedGamesTotalAmounts: async function () {
    let cfResult = await window.BlockchainManager.playedGamesForPlayer(Types.Game.cf, window.BlockchainManager.currentAccount());
    if ($("#cfPlayedTotalAmount")[0].textContent.localeCompare(cfResult) != 0) {
      $("#cfPlayedTotalAmount")[0].textContent = cfResult.length;
    }

    let rpsResult = await window.BlockchainManager.playedGamesForPlayer(Types.Game.rps, window.BlockchainManager.currentAccount());
    if ($("#rpsPlayedTotalAmount")[0].textContent.localeCompare(rpsResult) != 0) {
      $("#rpsPlayedTotalAmount")[0].textContent = rpsResult.length;
    }
  },

  updatePlayerProfit: async function () {
    //  GAMEPLAY
    var gamePlayProfitAmountElement = document.getElementById("profit_amount_gameplay");

    let cfBetResult = new BigNumber(await window.BlockchainManager.betTotal(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let betTotal = cfBetResult;
    let rpsBetResult = new BigNumber(await window.BlockchainManager.betTotal(Types.Game.rps, window.BlockchainManager.currentAccount()));
    betTotal = betTotal.plus(rpsBetResult);

    let cfPrizeResult = new BigNumber(await window.BlockchainManager.prizeTotal(Types.Game.cf, window.BlockchainManager.currentAccount()));
    let prizeTotal = cfPrizeResult
    let rpsPrizeResult = new BigNumber(await window.BlockchainManager.prizeTotal(Types.Game.rps, window.BlockchainManager.currentAccount()));
    prizeTotal = prizeTotal.plus(rpsPrizeResult);

    let gamePlayProfit = betTotal.multipliedBy(new BigNumber("-1")).plus(prizeTotal.multipliedBy(new BigNumber("2")));
    // console.log("PPP ", (gamePlayProfit).toString());
    if (this.gamePlayProfitStr.localeCompare(gamePlayProfit.toString()) != 0) {
      this.gamePlayProfitStr = gamePlayProfit.toString();
      gamePlayProfitAmountElement.innerText = Utils.weiToEtherFixed(this.gamePlayProfitStr);
  
      if (gamePlayProfit.isNegative()) {
        document.getElementById("updownpic_gameplay").innerHTML = '<img src="/img/icon-trending-down.svg">';

        gamePlayProfitAmountElement.classList.remove("green");
        gamePlayProfitAmountElement.classList.add("red");
      } else {
        document.getElementById("updownpic_gameplay").innerHTML = '<img src="/img/icon-trending-up.svg">';

        gamePlayProfitAmountElement.classList.remove("red");
        gamePlayProfitAmountElement.classList.add("green");
      }
      
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
    // console.log("totalProfit after raffle ", totalProfit.toString());

    //  beneficiary
    //  cf
    let cfBeneficiaryResult = new BigNumber(await window.BlockchainManager.feeBeneficiaryWithdrawn(Types.Game.cf, window.BlockchainManager.currentAccount()));
    // console.log("cfBeneficiaryResult: ", cfBeneficiaryResult.toString());
    totalProfit = totalProfit.plus(cfBeneficiaryResult);
    //  rps
    let rpsBeneficiaryResult = new BigNumber(await window.BlockchainManager.feeBeneficiaryWithdrawn(Types.Game.rps, window.BlockchainManager.currentAccount()));
    // console.log("rpsBeneficiaryResult: ", rpsBeneficiaryResult.toString());
    totalProfit = totalProfit.plus(rpsBeneficiaryResult);

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

    if (this.totalProfitStr.localeCompare(totalProfit.toString()) != 0) {
      this.totalProfitStr = totalProfit.toString();

      var profitAmountTotalElement = document.getElementById("profit_amount_total");
      let totalProfitLengthCorrect = Utils.weiToEtherFixed(this.totalProfitStr);
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
    }
  },

  updateReferralFeesWithdrawn: async function () {
    let cfResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if ($("#ReferralFeesWithdrawnCF")[0].textContent.localeCompare(cfResult.toString()) != 0) {
      $("#ReferralFeesWithdrawnCF")[0].textContent = Utils.weiToEtherFixed(cfResult.toString());
    }

    let rpsResult = new BigNumber(await window.BlockchainManager.referralFeesWithdrawn(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if ($("#ReferralFeesWithdrawnRPS")[0].textContent.localeCompare(rpsResult.toString()) != 0) {
      $("#ReferralFeesWithdrawnRPS")[0].textContent = Utils.weiToEtherFixed(rpsResult.toString());
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
    if (this.pendingReferralBN_cf.comparedTo(cfResult) != 0) {
      this.pendingReferralBN_cf = cfResult;

      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }
    
    let rpsResult = new BigNumber(await window.BlockchainManager.referralFeesPending(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (this.pendingReferralBN_rps.comparedTo(rpsResult) != 0) {
      this.pendingReferralBN_rps = rpsResult;

      pendingGames.push(Types.Game.rps);
      pendingValues.push(rpsResult);
    }

    if (pendingGames.length > 0) {
      this.updatePendingPictures(this.PendingWithdraw.referral, pendingGames, pendingValues);
    }
  },

  updatePendingGamePrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = await window.BlockchainManager.gamesWithPendingPrizeWithdrawal(Types.Game.cf, window.BlockchainManager.currentAccount());
    if (cfResult.length != this.pendingGamePrizeCount_cf) {
      this.pendingGamePrizeCount_cf = cfResult.length;

      if ((new BigNumber(cfResult.length.toString())).isGreaterThan(new BigNumber("0"))) {
        pendingGames.push(Types.Game.cf);
        pendingValues.push(cfResult.length);
      }
    }

    let rpsResult = await window.BlockchainManager.gamesWithPendingPrizeWithdrawal(Types.Game.rps, window.BlockchainManager.currentAccount());
    if (rpsResult.length > this.pendingGamePrizeCount_rps) {
      this.pendingGamePrizeCount_rps = rpsResult.length;

      if ((new BigNumber(rpsResult.length.toString())).isGreaterThan(new BigNumber("0"))) {
        pendingGames.push(Types.Game.rps);
        pendingValues.push(rpsResult.length);
      }
    }

    if (pendingGames.length > 0) {
      this.updatePendingPictures(this.PendingWithdraw.gamePrize, pendingGames, pendingValues);
    }
  },

  updatePendingRafflePrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await window.BlockchainManager.rafflePrizePending(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (this.pendingRafflePrizeBN_cf.comparedTo(cfResult) != 0) {
      this.pendingRafflePrizeBN_cf = cfResult;

      if (cfResult.isGreaterThan(new BigNumber("0"))) {
        pendingGames.push(Types.Game.cf);
        pendingValues.push(cfResult);
      }
    }

    let rpsResult = new BigNumber(await window.BlockchainManager.rafflePrizePending(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (this.pendingRafflePrizeBN_rps.comparedTo(rpsResult) != 0) {
      this.pendingRafflePrizeBN_rps = rpsResult;

      if (rpsResult.isGreaterThan(new BigNumber("0"))) {
        pendingGames.push(Types.Game.rps);
        pendingValues.push(rpsResult);
      }
    }

    if (pendingGames.length > 0) {
      this.updatePendingPictures(this.PendingWithdraw.raffle, pendingGames, pendingValues);
    }
  },

  updatePendingBeneficiaryPrize: async function () {
    let pendingGames = [];
    let pendingValues = [];

    let cfResult = new BigNumber(await window.BlockchainManager.feeBeneficiarBalance(Types.Game.cf, window.BlockchainManager.currentAccount()));
    if (this.pendingBeneficiaryBN_cf.comparedTo(cfResult) != 0) {
      this.pendingBeneficiaryBN_cf = cfResult;

      pendingGames.push(Types.Game.cf);
      pendingValues.push(cfResult);
    }

    let rpsResult = new BigNumber(await window.BlockchainManager.feeBeneficiarBalance(Types.Game.rps, window.BlockchainManager.currentAccount()));
    if (this.pendingBeneficiaryBN_rps.comparedTo(rpsResult) != 0) {
      this.pendingBeneficiaryBN_rps = rpsResult;

      pendingGames.push(Types.Game.rps);
      pendingValues.push(rpsResult);
    }

    if (pendingGames.length > 0) {
      this.updatePendingPictures(this.PendingWithdraw.beneficiary, pendingGames, pendingValues);
    }
  }, 

  isGameParticipant: function (_gameType, _id) {
    switch (_gameType) {
      case Types.Game.cf:
        if ((this.ongoingGameCF_Creator.eq(_id)) || (this.ongoingGameCF_Opponent.eq(_id))) {
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
            window.ProfileManager.update(true);
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

        let pendingGames = await window.BlockchainManager.gamesWithPendingPrizeWithdrawal(_gameType, window.BlockchainManager.currentAccount());
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
            window.ProfileManager.update(true);
            window.ProfileManager.profileUpdateHandler.pendingWithdrawn();
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
            window.ProfileManager.update(true);
            window.ProfileManager.profileUpdateHandler.pendingWithdrawn();
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
              window.ProfileManager.update(true);
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
  }
}

window.ProfileManager = ProfileManager;

export default ProfileManager;