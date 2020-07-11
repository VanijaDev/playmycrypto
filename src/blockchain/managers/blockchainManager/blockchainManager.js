// import Web3 from 'web3';
// import { Utils } from "../../utils";
// import { ProfileManager } from "../profileManager";
// import { CoinFlipData, RockPaperScissorsData } from "../../../../blockchain/contract";

import {BlockchainManager_ethereum} from "./blockchainManager_ethereum";
import Types from "../../types";

const BlockchainManager = {

  MetaMaskCodes: {
    userDenied: 4001
  },

  currentBlockchainType: "",
  currentBlockchain: null,
  initted: false,

  init: async function () {
    if (!this.initted) {
      console.log('%c BlockchainManager - init', 'color: #00aa00');

      this.setCurrentBlockchain(Types.BlockchainType.ethereum);
      if (await this.currentBlockchain.setup()) {
        this.initted = true;
      } else {
        this.initted = false;
      }
    }
  },

  setCurrentBlockchain: function (_blockchainType) {
    this.currentBlockchainType = _blockchainType;

    switch (_blockchainType) {
      case Types.BlockchainType.ethereum:
        // console.log("setCurrentBlockchain - Ethereum");
        this.currentBlockchain = BlockchainManager_ethereum;
        break;

      case Types.BlockchainType.tron:
        // console.log("setCurrentBlockchain - Tron");
        break;

      default:
        throw("setCurrentBlockchain - wrong type" + _blockchainType);
        break;
    }
  },

  accountChanged: async function (_account) {
    // console.log('%c BlockchainManager - accountChanged', 'color: #00aa00');
    this.currentBlockchain.accountChanged(_account);
  },

  networkChanged: async function(_accounts) {
    if (this.currentBlockchainType == Types.BlockchainType.ethereum) {
      this.initted = false;

      if (this.currentBlockchain.networkChanged(_accounts)) {
        if (await this.currentBlockchain.setup()) {
          this.initted = true;
        } else {
          this.initted = false;
        }
      }
    }
  },

  //  API
  totalUsedReferralFees: function () {
    return this.currentBlockchain.totalUsedReferralFees();
  },

  ongoinRafflePrize: function () {
    return this.currentBlockchain.ongoinRafflePrize();
  },

  partnerFeeUsedTotal: function (_gameType) {
    return this.currentBlockchain.partnerFeeUsedTotal(_gameType);
  },

  rafflePrizesWonTotal: function (_gameType) {
    return this.currentBlockchain.rafflePrizesWonTotal(_gameType);
  },

  totalUsedInGame: function (_gameType) {
    return this.currentBlockchain.totalUsedInGame(_gameType);
  },

  gamesCreatedAmount: function (_gameType) {
    return this.currentBlockchain.gamesCreatedAmount(_gameType);
  },

  gamesCompletedAmount: function (_gameType) {
    return this.currentBlockchain.gamesCompletedAmount(_gameType);
  },

  contract_cf: function () {
    return this.currentBlockchain.contract_inst_cf;
  },

  contract_rps: function () {
    return this.currentBlockchain.contract_inst_rps;
  },


  /**
   * HELPERS
   */

  currentAccount: function () {
    return this.currentBlockchain.currentAccount;
  },

  gameInst: function (_gameType) {
    // console.log("BM gameInst: ", _gameType);
    return this.currentBlockchain.gameInst(_gameType);
  },

  blockchainChanged: function (_blockchainType) {
    return;

    if (!this.initted) {
      return;
    }

    this.currentBlockchainType = _blockchainType;
    let iconElements;

    switch (_blockchainType) {
      case 0:
        if (document.getElementById("ethereum-select-btn").classList.contains("activated")) {
          return;
        }

        console.log('%c selectBlockchain - Ethereum', 'color: #1a3aaa');
        document.getElementById("ethereum-select-btn").classList.remove("deactivated");
        document.getElementById("ethereum-select-btn").classList.add("activated");

        document.getElementById("tron-select-btn").classList.remove("activated");
        document.getElementById("tron-select-btn").classList.add("deactivated");

        iconElements = document.getElementsByClassName("game-crypto-icon");
        for (let i = 0; i < iconElements.length; i++) {
          iconElements[i].src = "/images/icon_amount-eth.svg";
        }
        break;

      case 1:
        if (document.getElementById("tron-select-btn").classList.contains("activated")) {
          return;
        }

        console.log('%c selectBlockchain - Tron', 'color: #1a3aaa');
        document.getElementById("ethereum-select-btn").classList.remove("activated");
        document.getElementById("ethereum-select-btn").classList.add("deactivated");

        document.getElementById("tron-select-btn").classList.remove("deactivated");
        document.getElementById("tron-select-btn").classList.add("activated");

        iconElements = document.getElementsByClassName("game-crypto-icon");
        for (let i = 0; i < iconElements.length; i++) {
          iconElements[i].src = "/images/icon_amount-trx.svg";
        }
        break;

      default:
        console.error("selectBlockchain - wrong _blockchainId: ", _blockchainId);
        break;
    }
  },

  currentCryptoName: function () {
    if (this.currentBlockchainType == Types.BlockchainType.ethereum) {
      return "ETH";
    }
    if (this.currentBlockchainType == Types.BlockchainType.tron) {
      return "TRX";
    }
  },

  /**
   * HELPERS
   */

  currentAccount: function () {
    return this.currentBlockchain.currentAccount;
  },

  getBalance: async function () {
    return await this.currentBlockchain.getBalance(this.currentAccount);
  },

  /**
   * Increase current gasPrice for 20% to make tx mine faster.
   */
  gasPriceNormalizedString: async function () {
    let gasPrice = await web3.eth.getGasPrice();
    console.log("gasPrice: ", gasPrice);
    let gasPriceNormalizedString = (parseInt(gasPrice) * 1.2).toString();
    console.log("     !!! gasPriceNormalizedString: ", gasPriceNormalizedString);
    return gasPriceNormalizedString;
  },


  /**
   * PROMISES
   */

  // gameContractForGameType: function (_gameType) {
  // let gameContract = this.coinFlipContract;

  // if (_gameType == Types.Game.rps) {
  //   gameContract = this.rockPaperScissorsContract;
  // }
  // return gameContract;
  // }
}

window.BlockchainManager = BlockchainManager;

//  COMMON FOR ALL SCREENS
window.addEventListener("click", function (event) {
  const profileElement = document.getElementById("carttoggle");
  let targetElement = event.target; // clicked element

  do {
    if (targetElement == profileElement) {
      return;
    }
    // Go up the DOM
    targetElement = targetElement.parentNode;
  } while (targetElement);

  if ((targetElement != profileElement) && (profileElement.style.display != "none")) {
    document.getElementById("carttoggle").style.display = "none";
  }
});

export default BlockchainManager;
