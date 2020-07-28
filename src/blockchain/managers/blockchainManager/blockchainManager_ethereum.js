import Web3 from 'web3';
import {
  CoinFlipData,
  RockPaperScissorsData
} from "../../contract/contract";
import Types from "../../types";
import PromiseManager from '../promiseManager';
import BigNumber from 'bignumber.js';

const $t = $('#translations').data();

const BlockchainManager_ethereum = {

  MetaMaskCodes: {
    userDenied: 4001
  },

  initted: false,
  currentAccount: null,
  contract_inst_cf: null,
  contract_inst_rps: null,

  showAppDisabledView: function (_show) {
    if (_show) {
      $("#app-disabled")[0].classList.add("app-disabled");
      $("#app-disabled")[0].classList.remove("hidden");
    } else {
      $("#app-disabled")[0].classList.remove("app-disabled");
      $("#app-disabled")[0].classList.add("hidden");
    }
  },

  init: async function () {
    console.log('%c BlockchainManager_ethereum - init', 'color: #00aa00');

    if (!await this.connectToMetaMask()) {
      return false;
    }

    this.contract_inst_cf = CoinFlipData.build();
    this.contract_inst_rps = RockPaperScissorsData.build();
  },

  connectToMetaMask: async function () {
    console.log('%c BlockchainManager_ethereum - connectToMetaMask', 'color: #00aa00');

    // Modern dapp browsers...
    if (window.ethereum) {
      console.log("Modern dapp browsers...");

      window.web3 = new Web3(ethereum);

      try {
        this.currentAccount = (await ethereum.send('eth_requestAccounts')).result[0];

        if (!this.isNetworkValid(ethereum.chainId)) {
          alert($t.err_wrong_network);
          showTopBannerMessage($t.err_wrong_network, null, false);
          this.showAppDisabledView(true);

          return false;
        }
      } catch (error) {
        // User denied account access

        alert(error.message);
        showTopBannerMessage(error.message, null, true);
        this.showAppDisabledView(true);

        this.initted = false;
        return false;
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log("Legacy dapp browsers...");
      // window.web3 = new Web3(web3.currentProvider);
      alert($t.err_legacy_browsers);
      showTopBannerMessage($t.err_legacy_browsers, null, false);
      this.showAppDisabledView(true);

      this.initted = false;
      return false;
    }
    // Non-dapp browsers...
    else {
      alert($t.err_non_eth_browser);
      showTopBannerMessage($t.err_non_eth_browser, null, false);
      this.showAppDisabledView(true);

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

    if (this.isNetworkValid(_networkVersion)) {
      hideTopBannerMessage();
      this.showAppDisabledView(false);
      return true;
    }

    alert($t.err_wrong_network);
    showTopBannerMessage($t.err_wrong_network, null, false);
    this.showAppDisabledView(true);
    return false;
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

  ongoinRafflePrize: async function () {
    let ongoinRafflePrize_cf = await PromiseManager.ongoinRafflePrizePromise(Types.Game.cf);
    // console.log("ongoinRafflePrize_cf: ", ongoinRafflePrize_cf.toString());
    let ongoinRafflePrize_rps = await PromiseManager.ongoinRafflePrizePromise(Types.Game.rps);
    // console.log("ongoinRafflePrize_rps: ", ongoinRafflePrize_rps.toString());

    return new BigNumber(ongoinRafflePrize_cf).plus(ongoinRafflePrize_rps);
  },

  partnerFeeUsedTotal: async function (_gameType) {
    let partnerFeeTotalUsed = await PromiseManager.partnerFeeUsedTotalPromise(_gameType);
    // console.log("partnerFeeTotalUsed: ", _gameType, partnerFeeTotalUsed.toString());

    return partnerFeeTotalUsed;
  },

  rafflePrizesWonTotal: async function (_gameType) {
    let rafflePrizesWonTotal = await PromiseManager.rafflePrizesWonTotalPromise(_gameType);
    // console.log("rafflePrizesWonTotal: ", _gameType, rafflePrizesWonTotal.toString());

    return rafflePrizesWonTotal;
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


  /**
   * HELPERS
   */

  getBalance: async function () {
    return await web3.eth.getBalance(this.currentAccount);
  },
}

export default BlockchainManager_ethereum;