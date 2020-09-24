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
    this.updateCurrentBlockchain(Types.BlockchainType.ethereum);
    return await this.currentBlockchainManager.init();
  },

  isInitted: function () {
    return (this.currentBlockchainManager && this.currentBlockchainManager.initted);
  },

  isCurrentNetworkValid: function () {
    return this.currentBlockchainManager.isCurrentNetworkValid();
  },

  updateCurrentBlockchain: function (_blockchainType) {
    console.log('BlockchainManager - updateCurrentBlockchain:', _blockchainType);
    this.currentBlockchainType = _blockchainType;
    
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

  accountChanged: function (_account) {
    // console.log('%c BlockchainManager - accountChanged', 'color: #00aa00');
    this.currentBlockchainManager.accountChanged(_account);
  },

  chainChanged: function (_chainId) {
    console.log('%c BlockchainManager - chainChanged %s', 'color: #00aa00', _chainId);
    if (this.currentBlockchainType == Types.BlockchainType.ethereum) {
      if (this.currentBlockchainManager.chainChanged(_chainId)) {
        this.currentBlockchainManager.init();
        return true;
      }
    }
    return false;
  },

  //  API
  totalUsedReferralFees: async function () {
    return await this.currentBlockchainManager.totalUsedReferralFees();
  },

  referralFeesWithdrawn: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.referralFeesWithdrawn(_gameType, _currentAccount);
  },

  referralFeesPending: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.referralFeesPending(_gameType, _currentAccount);
  },

  gamesWithPendingPrizeWithdrawalForAddress: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.gamesWithPendingPrizeWithdrawalForAddress(_gameType, _currentAccount);
  },
  currentRaffleJackpot: async function (_gameType) {
    return await this.currentBlockchainManager.currentRaffleJackpot(_gameType);
  },

  partnerFeeUsedTotal: async function (_gameType) {
    return await this.currentBlockchainManager.partnerFeeUsedTotal(_gameType);
  },

  rafflePrizesWonTotal: async function (_gameType) {
    return await this.currentBlockchainManager.rafflePrizesWonTotal(_gameType);
  },

  rafflePrizePendingForAddress: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.rafflePrizePendingForAddress(_gameType, _currentAccount);
  },

  prizeTotal: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.prizeTotal(_gameType, _currentAccount);
  },

  totalUsedInGame: async function (_gameType) {
    return await this.currentBlockchainManager.totalUsedInGame(_gameType);
  },

  gamesCreatedAmount: async function (_gameType) {
    return await this.currentBlockchainManager.gamesCreatedAmount(_gameType);
  },

  gamesCompletedAmount: async function (_gameType) {
    return await this.currentBlockchainManager.gamesCompletedAmount(_gameType);
  },

  gameInfo: async function (_gameType, _idx) {
    return await this.currentBlockchainManager.gameInfo(_gameType, _idx);
  },

  minBetForGame: async function (_gameType) {
    return await this.currentBlockchainManager.minBetForGame(_gameType);
  },

  gameOwner: async function (_gameType) {
    return await this.currentBlockchainManager.gameOwner(_gameType);
  },

  ongoingGameAsCreator: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.ongoingGameAsCreator(_gameType, _currentAccount);
  },

  ongoingGameAsOpponent: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.ongoingGameAsOpponent(_gameType, _currentAccount);
  },

  ongoingGameIdxForPlayer: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.ongoingGameIdxForPlayer(_gameType, _currentAccount);
  },

  playedGamesForPlayer: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.playedGamesForPlayer(_gameType, _currentAccount);
  },

  topGames: async function (_gameType) {
    return await this.currentBlockchainManager.topGames(_gameType);
  },

  raffleParticipants: async function (_gameType) {
    return await this.currentBlockchainManager.raffleParticipants(_gameType);
  },

  raffleActivationParticipantsAmount: async function (_gameType) {
    return await this.currentBlockchainManager.raffleActivationParticipantsAmount(_gameType);
  },

  isRaffleActivated: async function (_gameType) {
    return await this.currentBlockchainManager.isRaffleActivated(_gameType);
  },

  ongoinRafflePrize: async function (_gameType) {
    return await this.currentBlockchainManager.ongoinRafflePrize(_gameType);
  },

  raffleResultCount: async function (_gameType) {
    return await this.currentBlockchainManager.raffleResultCount(_gameType);
  },

  raffleResultInfo: async function (_gameType, _resultId) {
    return await this.currentBlockchainManager.raffleResultInfo(_gameType, _resultId);
  },

  feeBeneficiar: async function (_gameType) {
    return await this.currentBlockchainManager.feeBeneficiar(_gameType);
  },

  latestBeneficiarPrice: async function (_gameType) {
    return await this.currentBlockchainManager.latestBeneficiarPrice(_gameType);
  },

  feeBeneficiarBalance: async function (_gameType, _account) {
    return await this.currentBlockchainManager.feeBeneficiarBalance(_gameType, _account);
  },

  betTotal: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.betTotal(_gameType, _currentAccount);
  },

  playedGameIdxsForPlayer: async function (_gameType, _currentAccount) {
    return await this.currentBlockchainManager.playedGameIdxsForPlayer(_gameType, _currentAccount);
  },

  isTopGame: async function (_gameType, _gameId) {
    return await this.currentBlockchainManager.isTopGame(_gameType, _gameId);
  },

  isGameMoveExpired: async function (_gameType, _idx) {
    return await this.currentBlockchainManager.isGameMoveExpired(_gameType, _idx);
  },

  moveDuration: async function (_gameType) {
    return await this.currentBlockchainManager.moveDuration(_gameType);
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