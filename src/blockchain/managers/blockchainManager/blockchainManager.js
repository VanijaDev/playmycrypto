import BlockchainManager_ethereum from "./blockchainManager_ethereum";
import Types from "../../types";

const BlockchainManager = {

  MetaMaskCodes: {
    userDenied: 4001
  },

  currentBlockchainType: "",
  currentBlockchainManager: null,

  init: async function () {
    console.log('%c BlockchainManager - init', 'color: #00aa00');
    await this.setCurrentBlockchainManager(Types.BlockchainType.ethereum);
    await this.currentBlockchainManager.init();
    return this;
  },

  isInitted: function () {
    return (this.currentBlockchainManager && this.currentBlockchainManager.initted);
  },

  isCurrentNetworkValid: function () {
    return this.currentBlockchainManager.isCurrentNetworkValid();
  },

  setCurrentBlockchainManager: function (_blockchainType) {
    this.currentBlockchainType = _blockchainType;

    switch (_blockchainType) {
      case Types.BlockchainType.ethereum:
        // console.log("setCurrentBlockchainManager - Ethereum");
        this.currentBlockchainManager = BlockchainManager_ethereum;
        break;

      case Types.BlockchainType.tron:
        // console.log("setCurrentBlockchainManager - Tron");
        break;

      default:
        throw ("setCurrentBlockchainManager - wrong type" + _blockchainType);
    }
  },

  accountChanged: async function (_account) {
    // console.log('%c BlockchainManager - accountChanged', 'color: #00aa00');
    this.currentBlockchainManager.accountChanged(_account);
  },

  chainChanged: async function (_chainId) {
    console.log('%c BlockchainManager - chainChanged %s', 'color: #00aa00', _chainId);
    if (this.currentBlockchainType == Types.BlockchainType.ethereum) {
      if (this.currentBlockchainManager.chainChanged(_chainId)) {
        await this.currentBlockchainManager.init();
        return true;
      }
    }
    return false;
  },

  //  API
  totalUsedReferralFees: function () {
    return this.currentBlockchainManager.totalUsedReferralFees();
  },

  ongoinRafflePrize: function () {
    return this.currentBlockchainManager.ongoinRafflePrize();
  },

  partnerFeeUsedTotal: function (_gameType) {
    return this.currentBlockchainManager.partnerFeeUsedTotal(_gameType);
  },

  rafflePrizesWonTotal: function (_gameType) {
    return this.currentBlockchainManager.rafflePrizesWonTotal(_gameType);
  },

  totalUsedInGame: function (_gameType) {
    return this.currentBlockchainManager.totalUsedInGame(_gameType);
  },

  gamesCreatedAmount: function (_gameType) {
    return this.currentBlockchainManager.gamesCreatedAmount(_gameType);
  },

  gamesCompletedAmount: function (_gameType) {
    return this.currentBlockchainManager.gamesCompletedAmount(_gameType);
  },

  contract_cf: function () {
    return this.currentBlockchainManager.contract_inst_cf;
  },

  contract_rps: function () {
    return this.currentBlockchainManager.contract_inst_rps;
  },


  /**
   * HELPERS
   */

  currentAccount: function () {
    return this.currentBlockchainManager.currentAccount;
  },

  gameInst: function (_gameType) {
    // console.log("BM gameInst: ", _gameType);
    return this.currentBlockchainManager.gameInst(_gameType);
  },

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

        console.log('%c blockchainChanged - Ethereum', 'color: #1a3aaa');
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
        console.error("selectBlockchain - wrong _blockchainType: ", _blockchainType);
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

  getBalance: async function () {
    return await this.currentBlockchainManager.getBalance(this.currentAccount);
  },

  /**
   * Increase current gasPrice for 20% to make tx mine faster.
   */
  gasPriceNormalizedString: async function () {
    let gasPrice = await web3.eth.getGasPrice();
    console.log("gasPrice: ", gasPrice);
    let gasPriceNormalizedString = (gasPrice * 1.05).toFixed(0);
    console.log("     !!! gasPriceNormalizedString: ", gasPriceNormalizedString);
    return gasPriceNormalizedString;
  }
}

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

window.BlockchainManager = BlockchainManager;

export default BlockchainManager;