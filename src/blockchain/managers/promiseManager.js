// import Web3 from 'web3';
// import { Utils } from "../utils";

import BlockchainManager from "./blockchainManager/blockchainManager";

let PromiseManager = {
  ongoingGameIdxForCreatorPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.ongoingGameIdxForCreator(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  ongoingGameIdxForPlayerPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.ongoingGameIdxForPlayer(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  participatedGameIdxsForPlayerPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.getParticipatedGameIdxsForPlayer(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  playedGameIdxsForPlayerPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.getPlayedGameIdxsForPlayer(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  addressBetTotalPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.addressBetTotal(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  addressPrizeTotalPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.addressPrizeTotal(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  referralFeesWithdrawnPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.referralFeesWithdrawn(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  raffleResultCountPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.getRaffleResultCount().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  raffleResultInfoPromise: function (_gameType, _idx) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.raffleResults(_idx).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  referralFeesPendingPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.referralFeesPending(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  gamesWithPendingPrizeWithdrawalForAddressPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.getGamesWithPendingPrizeWithdrawalForAddress(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  rafflePrizePendingForAddressPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.rafflePrizePendingForAddress(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  totalUsedReferralFeesPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.totalUsedReferralFees().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  ongoinRafflePrizePromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.ongoinRafflePrize().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  partnerFeeUsedTotalPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.partnerFeeTotalUsed().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  rafflePrizesWonTotalPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.rafflePrizesWonTotal().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  totalUsedInGamePromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.totalUsedInGame().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  gamesCreatedAmountPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.gamesCreatedAmount().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  gamesCompletedAmountPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.gamesCompletedAmount().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  ownerPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.owner().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  minBetForGamePromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.minBet().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  createdGameIdForAccountPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.ongoingGameIdxForCreator(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  gameInfoPromise: function (_gameType, _idx) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.games(_idx).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  isTopGamePromise: function (_gameType, _idx) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.isTopGame(_idx).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  allowedToPlayPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.allowedToPlay().call({
        from: _account
      })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  suspendedTimeDurationPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.suspendedTimeDuration().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  lastPlayTimestampPromise: function (_gameType, _account) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.lastPlayTimestamp(_account).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  topGamesPromise: function (_gameType) {
    return new Promise(resolve => {
      BlockchainManager.gameInst(_gameType).methods.getTopGames().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },


  getRaffleParticipantsPromise: function (_gameInst) {
    return new Promise(resolve => {
      _gameInst.methods.getRaffleParticipants().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  raffleActivationParticipantsAmountPromise: function (_gameInst) {
    return new Promise(resolve => {
      _gameInst.methods.raffleActivationParticipantsAmount().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  isRaffleActivatedPromise: function (_gameInst) {
    return new Promise(resolve => {
      _gameInst.methods.raffleActivated().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  getGameMoveExpiredPromise: function (_gameInst, _gameId) {
    return new Promise(resolve => {
      _gameInst.methods.gameMoveExpired(_gameId).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  getCreatorMoveHashesForGamePromise: function (_gameInst, _gameId) {
    return new Promise(resolve => {
      _gameInst.methods.getCreatorMoveHashesForGame(_gameId).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  getShowRowMovesPromise: function (_gameInst, _gameId, _row) {
    return new Promise(resolve => {
      _gameInst.methods.showRowMoves(_gameId, _row).call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },

  getMoveDurationPromise: function (_gameInst) {
    return new Promise(resolve => {
      _gameInst.methods.gameMoveDuration().call()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  },
}

export {
  PromiseManager
};