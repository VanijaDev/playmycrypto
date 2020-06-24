// import Web3 from 'web3';
// import { Utils } from "../../utils";
// import { ProfileManager } from "../profileManager";
// import { CoinFlipData, RockPaperScissorsData } from "../../../../blockchain/contract";

import { BlockchainManager_ethereum } from "./blockchainManager_ethereum";
import Types from "../../types";

const BlockchainManager = {
  
  MetaMaskCodes: {
    userDenied: 4001
  },

  currentBlockchainType: "",
  currentBlockchain: null,
  initted: false,
  // coinFlipContract: null,
  // rockPaperScissorsContract: null,

  init: async function ()  {
    if (!this.initted) {
      console.log('%c BlockchainManager - init', 'color: #00aa00');

      this.setCurrentBlockchain(Types.BlockchainType.ethereum);
      await this.currentBlockchain.setup();

      this.initted = true;
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

  accountChanged: async function() {
    // console.log('%c BlockchainManager - accountChanged', 'color: #00aa00');
    this.currentBlockchain.accountChanged();
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

  currentAccount: function() {
    return this.currentBlockchain.currentAccount;
  },

  gameInst: function(_gameType) {
    // console.log("BM gameInst: ", _gameType);
    return this.currentBlockchain.gameInst(_gameType);
  },












  // connectToMetaMask: async function () {
  //   // console.log('%c BlockchainManager - connectToMetaMask', 'color: #00aa00');

  //   // Modern dapp browsers...
  //   if (window.ethereum) {
  //     console.log("Modern dapp browsers...");

  //     window.web3 = new Web3(ethereum);

  //     try {
  //       await ethereum.enable();

  //       this.currentNetworkVersion = ethereum.networkVersion;
  //       /** 
  //        * Ganache = 5777
  //        * Main Net = 1
  //        * Ropsten = 3
  //        * Kovan = 42
  //       */
  //       if (ethereum.networkVersion != "3") {
  //         throw new Error("Wrong Network. Please use Ropsten for testing.")
  //       }
  //     } catch (error) {
  //       window.BlockchainManager.initted = false;
  //       showAlert('error', error.message);
  //       return false;
  //     }
  //   }
  //   // Legacy dapp browsers...
  //   else if (window.web3) {
  //     console.log("Legacy dapp browsers...");
  //     // window.web3 = new Web3(web3.currentProvider);
  //       window.BlockchainManager.initted = false;
  //     showAlert('error', 'Legacy dapp browsers... Working on compatibility.');
  //     throw new Error('Please install MetaMask.')
  //   }
  //   // Non-dapp browsers...
  //   else {
  //     console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  //     window.BlockchainManager.initted = false;
  //     return false;
  //   }

  //   ethereum.autoRefreshOnNetworkChange = false;
  //   window.BlockchainManager.initted = true;
  //   return true;
  // },

  // setup: async function () {
  //   console.log('%c BlockchainManager - setup', 'color: #00aa00');

  //   if (!await this.connectToMetaMask()) {
  //     return;
  //   }

  //   this.currentAccount = (await ethereum.enable())[0];
  //   this.coinFlipContract = CoinFlipData.build();
  //   this.rockPaperScissorsContract = RockPaperScissorsData.build();
  //   this.blockchainChanged(0);

  //   ProfileManager.update();
  // },

  blockchainChanged: function (_blockchainType) {
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
        for (let i = 0; i < iconElements.length; i ++) {
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
        for (let i = 0; i < iconElements.length; i ++) {
          iconElements[i].src = "/images/icon_amount-trx.svg";
        }
        break;

      default:
        console.error("selectBlockchain - wrong _blockchainId: ", _blockchainId);
        break;
    }
  },

  currentCryptoName: function () {
    if (this.currentBlockchainType == 0) {
      return "ETH";
    } if (this.currentBlockchainType == 1) {
      return "TRX";
    }
  },

  /**
   * HELPERS
   */

  currentAccount: function() {
    return this.currentBlockchain.currentAccount;
  },

  getBalance: async function() {
    return await this.currentBlockchain.getBalance(this.currentAccount);
  },

  /**
   * Increase current gasPrice for 20% to make tx mine faster.
   */
  gasPriceNormalizedString: async function() {
    let gasPrice = await web3.eth.getGasPrice();
    console.log("gasPrice: ", gasPrice);
    let gasPriceNormalizedString = (parseInt(gasPrice) * 120).toString();
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
window.addEventListener("click", function(event) {
  const profileElement = document.getElementById("carttoggle");
  let targetElement = event.target; // clicked element
  
  do {
    if (targetElement == profileElement) {
      return;
    }
    // Go up the DOM
    targetElement = targetElement.parentNode;
  } while (targetElement);

  if((targetElement != profileElement) && (profileElement.style.display != "none")) {
    document.getElementById("carttoggle").style.display = "none";
  }
});

export default BlockchainManager;
