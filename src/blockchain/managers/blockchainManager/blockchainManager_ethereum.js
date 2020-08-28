import Web3 from 'web3';
import {
  CoinFlipData,
  RockPaperScissorsData
} from "../../contract/contract";
import BigNumber from 'bignumber.js';
import PromiseManager from "../promiseManager";
import Types from "../../types";

const $t = $('#translations').data();

const BlockchainManager_ethereum = {

  MetaMaskCodes: {
    userDenied: 4001
  },

  initted: false,
  currentAccount: null,
  contract_inst_cf: null,
  contract_inst_rps: null,

  init: async function () {
    console.log('%c BlockchainManager_ethereum - init', 'color: #00aa00');

    if (!await this.connectToMetaMask()) {
      return false;
    }

    this.contract_inst_cf = CoinFlipData.build();
    this.contract_inst_rps = RockPaperScissorsData.build();

    return true;
  },

  connectToMetaMask: async function () {
    console.log('%c BlockchainManager_ethereum - connectToMetaMask', 'color: #00aa00');

    // Modern dapp browsers...
    if (window.ethereum) {
      console.log("Modern dapp browsers...");

      ethereum.autoRefreshOnNetworkChange;
      window.web3 = new Web3(ethereum);

      try {
        this.currentAccount = (await ethereum.send('eth_requestAccounts')).result[0];

        if (!this.isNetworkValid(ethereum.chainId)) {
          // alert($t.err_wrong_network);
          // showTopBannerMessage($t.err_wrong_network, null, false);
          alert("Wrong network, switch to Ethereum Main Network");
          showTopBannerMessage("Wrong network, switch to Ethereum Main Network", null, false);
          showAppDisabledView(true);

          return false;
        }
      } catch (error) {
        // User denied account access

        alert(error.message);
        showTopBannerMessage(error.message, null, true);
        showAppDisabledView(true);

        this.initted = false;
        return false;
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log("Legacy dapp browsers...");
      // window.web3 = new Web3(web3.currentProvider);
      alert("Legacy dapp browsers... Working on compatibility");
      showTopBannerMessage("Legacy dapp browsers... Working on compatibility", null, false);
      showAppDisabledView(true);

      this.initted = false;
      return false;
    }
    // Non-dapp browsers...
    else {
      alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
      showTopBannerMessage("Non-Ethereum browser detected. You should consider trying MetaMask!", null, false);
      showAppDisabledView(true);

      this.initted = false;
      return false;
    }

    ethereum.autoRefreshOnNetworkChange = false;
    this.initted = true;
    return true;
  },

  accountChanged: async function (_account) {
    console.log('%c BlockchainManager_ethereum - accountChanged', 'color: #00aa00');

    if (!this.initted) {
      console.error("BlockchainManager_ethereum - accountChanged, !initted");
      return;
    }

    this.currentAccount = _account;
  },

  chainChanged: function (_networkVersion) {
    console.log('%c BlockchainManager_ethereum - chainChanged: %s', 'color: #00aa00', _networkVersion);

    return (this.isNetworkValid(_networkVersion));
  },

  isNetworkValid: function (_networkVersion) {
    /**
     * Ganache = 0x1691, (5777)
     * Main Net = 0x1
     * Ropsten = 0x3
     */
    return (_networkVersion == "0x1691");
  },

  isCurrentNetworkValid: function () {
    return this.isNetworkValid(ethereum.chainId);
  },

  gameInst: function (_gameType) {
    // console.log("gameInst e: ", _gameType);

    let gameInst;

    switch (_gameType) {
      case Types.Game.cf:
        gameInst = this.contract_inst_cf;
        break;

      case Types.Game.rps:
        gameInst = this.contract_inst_rps;
        break;

      default:
        console.error("BlockchainManager_ethereum gameInst:", _gameType);
        break;
    }
    return gameInst;
  },


  //  API
  totalUsedReferralFees: async function () {
    let referralFees_cf = await PromiseManager.totalUsedReferralFeesPromise(Types.Game.cf);
    // console.log("referralFees_cf: ", referralFees_cf.toString());
    let referralFees_rps = await PromiseManager.totalUsedReferralFeesPromise(Types.Game.rps);
    // console.log("referralFees_rps: ", referralFees_rps.toString());

    return new BigNumber(referralFees_cf).plus(referralFees_rps);
  },

  referralFeesWithdrawn: async function (_gameType, _currentAccount) {
    return await PromiseManager.referralFeesWithdrawnPromise(_gameType, _currentAccount);
  },

  referralFeesPending: async function (_gameType, _currentAccount) {
    return await PromiseManager.referralFeesPendingPromise(_gameType, _currentAccount);
  },

  gamesWithPendingPrizeWithdrawalForAddress: async function (_gameType, _currentAccount) {
    return await PromiseManager.gamesWithPendingPrizeWithdrawalForAddressPromise(_gameType, _currentAccount);
  },

  currentRaffleJackpot: async function (_gameType) {
    return new BigNumber(await PromiseManager.ongoinRafflePrizePromise(_gameType));
  },

  rafflePrizesWonTotal: async function (_gameType) {
    let rafflePrizesWonTotal = await PromiseManager.rafflePrizesWonTotalPromise(_gameType);
    // console.log("rafflePrizesWonTotal: ", _gameType, rafflePrizesWonTotal.toString());

    return new BigNumber(rafflePrizesWonTotal);
  },

  partnerFeeUsedTotal: async function (_gameType) {
    let partnerFeeTotalUsed = await PromiseManager.partnerFeeUsedTotalPromise(_gameType);
    // console.log("partnerFeeTotalUsed: ", _gameType, partnerFeeTotalUsed.toString());

    return partnerFeeTotalUsed;
  },

  totalUsedInGame: async function (_gameType) {
    let totalUsedInGame = await PromiseManager.totalUsedInGamePromise(_gameType);
    // console.log("totalUsedInGame: ",_gameType,  totalUsedInGame.toString());

    return totalUsedInGame;
  },

  gamesCreatedAmount: async function (_gameType) {
    let gamesCreatedAmount = await PromiseManager.gamesCreatedAmountPromise(_gameType);
    // console.log("gamesCreatedAmount: ", _gameType,  gamesCreatedAmount.toString());

    return gamesCreatedAmount;
  },

  gamesCompletedAmount: async function (_gameType) {
    let gamesCompletedAmount = await PromiseManager.gamesCompletedAmountPromise(_gameType);
    // console.log("gamesCompletedAmount: ", _gameType,  gamesCompletedAmount.toString());

    return gamesCompletedAmount;
  },

  gameInfo: async function (_gameType, _idx) {
    let gameInfo = await PromiseManager.gameInfoPromise(_gameType, _idx);
    // console.log("gameInfo: ", _gameType, _idx,  gameInfo);

    return gameInfo;
  },

  ongoingGameAsCreator: async function (_gameType, _currentAccount) {
    return await PromiseManager.ongoingGameAsCreatorPromise(_gameType, _currentAccount);
  },

  ongoingGameAsOpponent: async function (_gameType, _currentAccount) {
    return await PromiseManager.ongoingGameAsOpponentPromise(_gameType, _currentAccount);
  },

  ongoingGameIdxForPlayer: async function (_gameType, _currentAccount) {
    return await PromiseManager.ongoingGameIdxForPlayerPromise(_gameType, _currentAccount);
  },

  topGames: async function (_gameType) {
    return await PromiseManager.topGamesPromise(_gameType);
  },

  minBetForGame: async function (_gameType) {
    return await PromiseManager.minBetForGamePromise(_gameType);
  },

  raffleParticipants: async function (_gameType) {
    return await PromiseManager.raffleParticipantsPromise(_gameType);
  },

  raffleActivationParticipantsAmount: async function (_gameType) {
    return await PromiseManager.raffleActivationParticipantsAmountPromise(_gameType);
  },

  isRaffleActivated: async function (_gameType) {
    return await PromiseManager.isRaffleActivatedPromise(_gameType);
  },

  ongoinRafflePrize: async function (_gameType) {
    return await PromiseManager.ongoinRafflePrizePromise(_gameType);
  },

  rafflePrizePendingForAddress: async function (_gameType, _currentAccount) {
    return await PromiseManager.rafflePrizePendingForAddressPromise(_gameType, _currentAccount);
  },

  addressPrizeTotal: async function (_gameType, _currentAccount) {
    return await PromiseManager.addressPrizeTotalPromise(_gameType, _currentAccount);
  },

  raffleResultCount: async function (_gameType) {
    return await PromiseManager.raffleResultCountPromise(_gameType);
  },

  raffleResultInfo: async function (_gameType, _resultId) {
    return await PromiseManager.raffleResultInfoPromise(_gameType, _resultId);
  },

  feeBeneficiar: async function (_gameType) {
    return await PromiseManager.feeBeneficiarPromise(_gameType);
  },

  latestBeneficiarPrice: async function (_gameType) {
    return await PromiseManager.latestBeneficiarPricePromise(_gameType);
  },
  
  feeBeneficiarBalance: async function (_gameType, _account) {
    return await PromiseManager.feeBeneficiarBalancePromise(_gameType, _account);
  },

  addressBetTotal: async function (_gameType, _currentAccount) {
    return await PromiseManager.addressBetTotalPromise(_gameType, _currentAccount);
  },

  playedGameIdxsForPlayer: async function (_gameType, _currentAccount) {
    return await PromiseManager.playedGameIdxsForPlayerPromise(_gameType, _currentAccount);
  },

  playedGamesForPlayer: async function (_gameType, _currentAccount) {
    return await PromiseManager.playedGamesForPlayerPromise(_gameType, _currentAccount);
  },


  /**
   * HELPERS
   */

  getBalance: async function () {
    return await web3.eth.getBalance(this.currentAccount);
  },
}

export default BlockchainManager_ethereum;