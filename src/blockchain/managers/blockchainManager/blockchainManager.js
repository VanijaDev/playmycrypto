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
    this.setCurrentBlockchainManager(Types.BlockchainType.ethereum);
    return await this.currentBlockchainManager.init();
  },

  isInitted: function () {
    return (this.currentBlockchainManager && this.currentBlockchainManager.initted);
  },

  isCurrentNetworkValid: function () {
    return this.currentBlockchainManager.isCurrentNetworkValid();
  },

  setCurrentBlockchainManager: function (_blockchainType) {
    this.currentBlockchainType = _blockchainType;
    console.log('BlockchainManager - _blockchainType:', _blockchainType);

    switch (_blockchainType) {
      case Types.BlockchainType.ethereum:
        console.log("setCurrentBlockchainManager - Ethereum");
        this.currentBlockchainManager = BlockchainManager_ethereum;
        break;

      case Types.BlockchainType.tron:
        console.log("setCurrentBlockchainManager - Tron");
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

  referralFeesWithdrawn: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.referralFeesWithdrawn(_gameType, _currentAccount);
  },

  referralFeesPending: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.referralFeesPending(_gameType, _currentAccount);
  },

  gamesWithPendingPrizeWithdrawalForAddress: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.gamesWithPendingPrizeWithdrawalForAddress(_gameType, _currentAccount);
  },
  currentRaffleJackpot: function (_gameType) {
    return this.currentBlockchainManager.currentRaffleJackpot(_gameType);
  },

  partnerFeeUsedTotal: function (_gameType) {
    return this.currentBlockchainManager.partnerFeeUsedTotal(_gameType);
  },

  rafflePrizesWonTotal: function (_gameType) {
    return this.currentBlockchainManager.rafflePrizesWonTotal(_gameType);
  },

  rafflePrizePendingForAddress: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.rafflePrizePendingForAddress(_gameType, _currentAccount);
  },

  addressPrizeTotal: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.addressPrizeTotal(_gameType, _currentAccount);
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

  gameInfo: function (_gameType, _idx) {
    return this.currentBlockchainManager.gameInfo(_gameType, _idx);
  },

  minBetForGame: function (_gameType) {
    return this.currentBlockchainManager.minBetForGame(_gameType);
  },

  gameOwner: function (_gameType) {
    return this.currentBlockchainManager.gameOwner(_gameType);
  },

  ongoingGameAsCreator: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.ongoingGameAsCreator(_gameType, _currentAccount);
  },

  ongoingGameAsOpponent: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.ongoingGameAsOpponent(_gameType, _currentAccount);
  },

  ongoingGameIdxForPlayer: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.ongoingGameIdxForPlayer(_gameType, _currentAccount);
  },

  playedGamesForPlayer: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.playedGamesForPlayer(_gameType, _currentAccount);
  },

  topGames: function (_gameType) {
    return this.currentBlockchainManager.topGames(_gameType);
  },

  raffleParticipants: function (_gameType) {
    return this.currentBlockchainManager.raffleParticipants(_gameType);
  },

  raffleActivationParticipantsAmount: function (_gameType) {
    return this.currentBlockchainManager.raffleActivationParticipantsAmount(_gameType);
  },

  isRaffleActivated: function (_gameType) {
    return this.currentBlockchainManager.isRaffleActivated(_gameType);
  },

  ongoinRafflePrize: function (_gameType) {
    return this.currentBlockchainManager.ongoinRafflePrize(_gameType);
  },

  raffleResultCount: function (_gameType) {
    return this.currentBlockchainManager.raffleResultCount(_gameType);
  },

  raffleResultInfo: function (_gameType, _resultId) {
    return this.currentBlockchainManager.raffleResultInfo(_gameType, _resultId);
  },

  feeBeneficiar: function (_gameType) {
    return this.currentBlockchainManager.feeBeneficiar(_gameType);
  },

  latestBeneficiarPrice: function (_gameType) {
    return this.currentBlockchainManager.latestBeneficiarPrice(_gameType);
  },

  feeBeneficiarBalance: function (_gameType, _account) {
    return this.currentBlockchainManager.feeBeneficiarBalance(_gameType, _account);
  },

  addressBetTotal: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.addressBetTotal(_gameType, _currentAccount);
  },

  playedGameIdxsForPlayer: function (_gameType, _currentAccount) {
    return this.currentBlockchainManager.playedGameIdxsForPlayer(_gameType, _currentAccount);
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
    } else if (this.currentBlockchainType == Types.BlockchainType.tron) {
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