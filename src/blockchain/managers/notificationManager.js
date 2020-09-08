import {
  CoinFlipData,
  RockPaperScissorsData
} from "../../blockchain/contract/contract";
import {
  BigNumber
} from "bignumber.js";
import Types from "../types";

const NotificationManager = {

  NotificationHashes_CF: {
    gameCreated: "0x2f96aa00c72dd004da6bbd1a2d56762ee5a3504189732da096d9f75b41e2e46f",
    gameJoined: "0xcf247107fd467ee49df2d0a3f04db0dde0cf701e3d4611d03cc7d0ac96f90490",
    gamePlayed: "0x3e3f32c9ed40ee6dd4ba80907e69c64b4b877cd4f201f588d416fb1e1a4bc29c",
    gamePrizesWithdrawn: "0xf66e3f979648b506dd345b50ca1b3efbdc116887cd67c37de409d3bd8e4995b0",
    gameAddedToTop: "0x27850eb52960ae0f343455f87b489c819bb4fdaea63d6968aa19dba5adf2991e",
    gameReferralWithdrawn: "0xd20500ebc366bc59a5ec7044b7c82d3fed0d725dba0429ae6c20a56ee15cea92",
    gameUpdated: "0x040c8e41157c3ece3442654816da3e471438e15288a88faa65a51271a10238f9",
    gameExpiredFinished: "0x6e530d1f81c10976edecfd724ddf372347424ed7e3066073547a6438a09670fe",
    gameQuittedFinished: "0xb2d5361fc25bf5f72935b7dada9ef5aa3220aa1a8d72e922475140798153ae10",
    rafflePlayed: "0x3fcb6936a4c5aa28446d2519ebc71d8ce9f21cd4ecd4a6b362cdc9d403108ec2",
    rafflePrizeWithdrawn: "0x41f36e3513afe9499e34441f572f2e84284a9ae1416882252929b6b7c72a3089",
    partnerFeeTransferred: "0xeea88262d89f946cfd575393481b34aedd68aabbe9cb764357a15b1e0226e861",
    gamePaused: "0x700ef9560b7219bf268df827c61f5ae3323824a8b032726685696bdcfbe785b7",
    gameUnpaused: "0xf0b0a4baf8f4fd56bb7663286eb293a4201e771c238bc79cfc108e6abc2abbbb",
  },

  NotificationHashes_RPS: {
    gameCreated: "0xc8a7ad4588594944c5c6ec5e3dd1fc3a1aeb831f1a2bc35611c78302594092e0",
    gameJoined: "0x5f44cb4ec9720ed076031e2710d445527f4665689588ba6c7c7cd89bf7c76d0f",
    gameMovePlayed: "0x128c0d69f1a687d53c6845c37ed5e18b705dbcff4757abe1704440321f0277fa",
    gameOpponentMoved: "0x2102733ba214a57539a831c4f95e5b39b02fe44bff48b54a8c03fc783779ef95",
    gameFinished: "0x9729817a7a496a7d0e87303b24d9ccb8891421d3d2564f4c70a0d5c8bac35ac4",
    gamePrizesWithdrawn: "0x49dadfb9c0997e442b5c7378b159dfdab6c9261478186a18465f051014e761d6",
    gameUpdated: "0xb8d5c4acb2a233249b2c857bdc4149dfe9c4c56be5b4240797ec520890e86f84",
    gameAddedToTop: "0x10837c20b552775deff603be2e6bbd6011110295cf5729edc4da0376f0501a88",
    gameReferralWithdrawn: "0xaf3062c46366e85d91db7f7495492b8216bc40c609348a6d8b6fc3992410f589",
    rafflePlayed: "0x5b855748ec47b3a8c7d02c2551af912f3900fdd754f66a381dc33c8dea252f00",
    rafflePrizeWithdrawn: "0x99ac1c03579bfc1599617b99962258086dccf711612985a2dcf15c7f5c7e7f5e",
    gamePaused: "0xe05d203b1f744b2ba3112cf7cc9724fbc303fcbfca30c1fdcb8a5498fd97dc35",
    gameUnpaused: "0xe61b4812784f2e1e26d39703eb3d699469dc08b1b23ab37f0a21bf76cd96d214",
    partnerFeeTransferred: "0xcf6479f64bef705be7f01da6a3427e5c5f9b381f335bebc7d6939b727e8f2f2b"
  },

  eventEmitter: null,
  eventHandler: null,

  //  notifications for Index view
  subscribe_index: function () {
    console.log('%c NotificationManager - subscribe_index', 'color: #00aa00');

    switch (window.BlockchainManager.currentBlockchainType) {
      case Types.BlockchainType.ethereum:
        console.log("subscribe_index - Ethereum");
        this.subscribe_index_ethereum();

        break;

      case Types.BlockchainType.tron:
        console.log("subscribe_index - Tron");
        break;

      default:
        throw("ERROR: subscribe_index");
    }
  },

  subscribe_index_ethereum: function () {
    console.log('%c NotificationManager - subscribe_index_ethereum', 'color: #00aa00');

    window.NotificationManager.eventEmitter = window.web3.eth.subscribe('logs', {
      address: [CoinFlipData.address, RockPaperScissorsData.address]
    }, (error, result) => {
      if (error) {
        console.log("ERROR: ", error);
        return;
      }

      console.log("subscribe event: ", result);

      switch (result.topics[0]) {
        //  CF
        case this.NotificationHashes_CF.gameCreated:
          console.log("NotificationHashes_CF.gameCreated");
          this.eventHandler.onGameCreated(Types.Game.cf, result.topics[2]);
          break;

        case this.NotificationHashes_CF.gameJoined:
          console.log("NotificationHashes_CF.gameJoined");
          this.eventHandler.onGameJoined(Types.Game.cf, result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_CF.gamePlayed:
          console.log("NotificationHashes_CF.gamePlayed");
          this.eventHandler.onGamePlayed(Types.Game.cf, new BigNumber(result.topics[1]).toString(), result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_CF.gameAddedToTop:
          console.log("NotificationHashes_CF.gameAddedToTop");
          this.eventHandler.onGameAddedToTop(Types.Game.cf);
          break;

        case this.NotificationHashes_CF.gameUpdated:
          console.log("NotificationHashes_CF.gameUpdated");
          this.eventHandler.onGameUpdated(Types.Game.cf, result.topics[2]);
          break;

        case this.NotificationHashes_CF.gameQuittedFinished:
          console.log("NotificationHashes_CF.gameQuittedFinished");
          this.eventHandler.onGameQuittedFinished(Types.Game.cf, new BigNumber(result.topics[1]).toString(), result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_CF.gameExpiredFinished:
          console.log("NotificationHashes_CF.gameExpiredFinished");
          this.eventHandler.onGameExpiredFinished(Types.Game.cf, new BigNumber(result.topics[1]).toString(), result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_CF.gamePrizesWithdrawn:
          console.log("NotificationHashes_CF.gamePrizesWithdrawn");
          this.eventHandler.onGamePrizesWithdrawn(Types.Game.cf, result.topics[1]);
          break;

        // case this.NotificationHashes_CF.gameReferralWithdrawn:
        //   console.log("NotificationHashes_CF.gameReferralWithdrawn");
        //   this.eventHandler.onGameReferralWithdrawn(Types.Game.cf, result.topics[1]);
        //   break;

        // case this.NotificationHashes_CF.rafflePlayed:
        //   console.log("NotificationHashes_CF.rafflePlayed");
        //   this.eventHandler.onGameRafflePlayed(Types.Game.cf, result.topics[1]);
        //   break;

        // case this.NotificationHashes_CF.rafflePrizeWithdrawn:
        //   console.log("NotificationHashes_CF.rafflePrizeWithdrawn");
        //   this.eventHandler.onRafflePrizeWithdrawn(Types.Game.cf, result.topics[1]);
        //   break;

        // case this.NotificationHashes_CF.partnerFeeTransferred:
        //   console.log("NotificationHashes_CF.partnerFeeTransferred");
        //   break;

        //   //  RPS
        // case this.NotificationHashes_RPS.gameCreated:
        //   console.log("NotificationHashes_RPS.gameCreated");
        //   this.eventHandler.onGameCreated(Types.Game.rps, result.topics[1]);
        //   break;

        // case this.NotificationHashes_RPS.gameJoined:
        //   console.log("NotificationHashes_RPS.gameJoined");
        //   this.eventHandler.onGameJoined(Types.Game.rps, result.topics[2], result.topics[3]);
        //   break;

        // case this.NotificationHashes_RPS.gameMovePlayed:
        //   console.log("NotificationHashes_RPS.gameMovePlayed");
        //   this.eventHandler.onGameMovePlayed(new BigNumber(result.topics[1]).toString(), result.topics[2]);
        //   break;

        // case this.NotificationHashes_RPS.gameOpponentMoved:
        //   console.log("NotificationHashes_RPS.gameOpponentMoved");
        //   this.eventHandler.onGameOpponentMoved(new BigNumber(result.topics[1]).toString(), result.topics[2]);
        //   break;

        // case this.NotificationHashes_RPS.gameFinished:
        //   console.log("NotificationHashes_RPS.gameFinished");
        //   this.eventHandler.onGameFinished(new BigNumber(result.topics[1]).toString());
        //   break;

        // case this.NotificationHashes_RPS.gamePrizesWithdrawn:
        //   console.log("NotificationHashes_RPS.gamePrizesWithdrawn");
        //   this.eventHandler.onGamePrizesWithdrawn(Types.Game.rps);
        //   break;

        // case this.NotificationHashes_RPS.gameQuitted:
        //   console.log("NotificationHashes_RPS.gameQuitted");
        //   break;

        // case this.NotificationHashes_RPS.gameUpdated:
        //   console.log("NotificationHashes_RPS.gameUpdated");
        //   this.eventHandler.onGameUpdated(Types.Game.rps, result.topics[2]);

        //   break;

        // case this.NotificationHashes_RPS.gameAddedToTop:
        //   console.log("NotificationHashes_RPS.gameAddedToTop");
        //   this.eventHandler.onGameAddedToTop(Types.Game.rps);
        //   break;

        // case this.NotificationHashes_RPS.gameReferralWithdrawn:
        //   console.log("NotificationHashes_RPS.gameReferralWithdrawn");
        //   this.eventHandler.onGameReferralWithdrawn(Types.Game.rps, result.topics[1]);
        //   break;

        // case this.NotificationHashes_RPS.rafflePlayed:
        //   console.log("NotificationHashes_RPS.rafflePlayed");
        //   this.eventHandler.onGameRafflePlayed(Types.Game.rps, result.topics[1]);
        //   break;

        // case this.NotificationHashes_RPS.rafflePrizeWithdrawn:
        //   console.log("NotificationHashes_RPS.rafflePrizeWithdrawn");
        //   this.eventHandler.onRafflePrizeWithdrawn(Types.Game.rps, result.topics[1]);
        //   break;

        // case this.NotificationHashes_RPS.gamePaused:
        //   // ("NotificationHashes_RPS.gamePaused");
        //   break;

        // case this.NotificationHashes_RPS.gameUnpaused:
        //   console.log("NotificationHashes_RPS.gameUnpaused");
        //   break;

        // case this.NotificationHashes_RPS.partnerFeeTransferred:
        //   console.log("NotificationHashes_RPS.partnerFeeTransferred");
        //   break;

        default:
          break;
      }
    });
  },

  subscribe_cf: function () {
    console.log('%c NotificationManager - subscribe_cf', 'color: #00aa00');

    switch (window.BlockchainManager.currentBlockchainType) {
      case Types.BlockchainType.ethereum:
        console.log("subscribe_index - Ethereum");
        this.subscribe_cf_ethereum();

        break;

      case Types.BlockchainType.tron:
        console.log("subscribe_index - Tron");
        break;

      default:
        throw("ERROR: subscribe_index");
    }
  },

  subscribe_cf_ethereum: function () {
    console.log('%c NotificationManager - subscribe_cf_ethereum', 'color: #00aa00');

    window.NotificationManager.eventEmitter = window.web3.eth.subscribe('logs', {
      address: CoinFlipData.address
    }, (error, result) => {
      if (error) {
        console.log("ERROR: ", error);
        return;
      }

      console.log("subscribe_cf_ethereum event: ", result);

      switch (result.topics[0]) {
        case this.NotificationHashes_CF.gameCreated:
          console.log("NotificationHashes_CF.gameCreated");
          this.eventHandler.onGameCreated(Types.Game.cf, result.topics[1], result.topics[2]);
          break;

        case this.NotificationHashes_CF.gameUpdated:
          console.log("NotificationHashes_CF.gameUpdated");
          this.eventHandler.onGameUpdated((new BigNumber(result.topics[1])).toString());
          break;
          
        case this.NotificationHashes_CF.gameAddedToTop:
          console.log("NotificationHashes_CF.gameAddedToTop");
          this.eventHandler.onGameAddedToTop(Types.Game.cf, (new BigNumber(result.topics[1])).toString(), result.topics[2]);
          break;

        case this.NotificationHashes_CF.gamePaused:
          console.log("NotificationHashes_CF.gamePaused");
          this.eventHandler.onGamePaused((new BigNumber(result.topics[1])).toString());
          break;

        case this.NotificationHashes_CF.gameUnpaused:
          console.log("NotificationHashes_CF.gameUnpaused");
          this.eventHandler.onGameUnpaused((new BigNumber(result.topics[1])).toString(), result.topics[2]);
          break;

        case this.NotificationHashes_CF.gameJoined:
          console.log("NotificationHashes_CF.gameJoined");
          this.eventHandler.onGameJoined(new BigNumber(result.topics[1]).toString(), result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_CF.gameQuittedFinished:
          console.log("NotificationHashes_CF.gameQuittedFinished");
          this.eventHandler.onGameQuittedFinished(Types.Game.cf, new BigNumber(result.topics[1]).toString(), result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_CF.gameExpiredFinished:
          console.log("NotificationHashes_CF.gameExpiredFinished");
          this.eventHandler.onGameExpiredFinished(Types.Game.cf, new BigNumber(result.topics[1]).toString(), result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_CF.gamePlayed:
          console.log("NotificationHashes_CF.gamePlayed");
          // event CF_GamePlayed(uint256 indexed id, address indexed creator, address indexed opponent);
          this.eventHandler.onGamePlayed(Types.Game.cf, (new BigNumber(result.topics[1])).toString(), result.topics[2], result.topics[3]);
          break;

        // case this.NotificationHashes_CF.gamePrizesWithdrawn:
        //   console.log("NotificationHashes_CF.gamePrizesWithdrawn");
        //   this.eventHandler.onGamePrizesWithdrawn(Types.Game.cf);
        //   break;

        // case this.NotificationHashes_CF.gameReferralWithdrawn:
        //   console.log("NotificationHashes_CF.gameReferralWithdrawn");

        //   break;

        // case this.NotificationHashes_CF.rafflePlayed:
        //   console.log("NotificationHashes_CF.rafflePlayed");
        //   this.eventHandler.onGameRafflePlayed(Types.Game.cf, result.topics[1]);
        //   break;

          // case this.NotificationHashes_CF.rafflePrizeWithdrawn:
          //   console.log("NotificationHashes_CF.rafflePrizeWithdrawn");

          //   break;

          // case this.NotificationHashes_CF.partnerFeeTransferred:
          //   console.log("NotificationHashes_CF.partnerFeeTransferred");

          //   break;

        default:
          break;
      }
    })
  },

  subscribe_rps: function () {
    console.log('%c NotificationManager - subscribe_rps', 'color: #00aa00');

    window.web3.eth.subscribe('logs', {
      address: RockPaperScissorsData.address
    }, (error, result) => {
      if (error) {
        console.log("ERROR: ", error);
        return;
      }

      switch (result.topics[0]) {
        case this.NotificationHashes_RPS.gameCreated:
          console.log("NotificationHashes_RPS.gameCreated");
          this.eventHandler.onGameCreated(Types.Game.rps, result.topics[1], result.topics[2]);
          break;

        case this.NotificationHashes_RPS.gameJoined:
          console.log("NotificationHashes_RPS.gameJoined");
          this.eventHandler.onGameJoined(new BigNumber(result.topics[1]).toString(), result.topics[2], result.topics[3]);
          break;

        case this.NotificationHashes_RPS.gameMovePlayed:
          console.log("NotificationHashes_RPS.gameMovePlayed");
          this.eventHandler.onGameMovePlayed(new BigNumber(result.topics[1]).toString(), result.topics[2]);
          break;

        case this.NotificationHashes_RPS.gameOpponentMoved:
          console.log("NotificationHashes_RPS.gameOpponentMoved");
          this.eventHandler.onGameOpponentMoved(new BigNumber(result.topics[1]).toString(), result.topics[2]);
          break;

        case this.NotificationHashes_RPS.gameFinished:
          console.log("NotificationHashes_RPS.gameFinished");
          this.eventHandler.onGameFinished(new BigNumber(result.topics[1]).toString());
          break;

        case this.NotificationHashes_RPS.gamePrizesWithdrawn:
          console.log("NotificationHashes_RPS.gamePrizesWithdrawn");
          this.eventHandler.onGamePrizesWithdrawn(Types.Game.cf);
          break;

        case this.NotificationHashes_RPS.gameQuitted:
          console.log("NotificationHashes_RPS.gameQuitted");
          break;

        case this.NotificationHashes_RPS.gameUpdated:
          console.log("NotificationHashes_RPS.gameUpdated");
          this.eventHandler.onGameUpdated((new BigNumber(result.topics[1])).toString());
          break;

        case this.NotificationHashes_RPS.gameAddedToTop:
          console.log("NotificationHashes_RPS.gameAddedToTop");
          this.eventHandler.onGameAddedToTop(Types.Game.rps, (new BigNumber(result.topics[1])).toString(), result.topics[2]);
          break;

        case this.NotificationHashes_RPS.gameReferralWithdrawn:
          console.log("NotificationHashes_RPS.gameReferralWithdrawn");
          break;

        case this.NotificationHashes_RPS.rafflePlayed:
          console.log("NotificationHashes_RPS.rafflePlayed");
          break;

        case this.NotificationHashes_RPS.rafflePrizeWithdrawn:
          console.log("NotificationHashes_RPS.rafflePrizeWithdrawn");
          break;

        case this.NotificationHashes_RPS.gamePaused:
          console.log("NotificationHashes_RPS.gamePaused");
          this.eventHandler.onGamePaused((new BigNumber(result.topics[1])).toString());
          break;

        case this.NotificationHashes_RPS.gameUnpaused:
          console.log("NotificationHashes_RPS.gameUnpaused");
          this.eventHandler.onGameUnpaused((new BigNumber(result.topics[1])).toString(), result.topics[2]);
          break;

        case this.NotificationHashes_RPS.partnerFeeTransferred:
          console.log("NotificationHashes_RPS.partnerFeeTransferred");
          break;

        default:
          break;
      }
    })
  },

  clearAll: function () {
    console.log('%c NotificationManager - clearAll', 'color: #00aa00');
    switch (window.BlockchainManager.currentBlockchainType) {
      case Types.BlockchainType.ethereum:
        console.log("clearAll - Ethereum");
        window.NotificationManager.eventEmitter.unsubscribe(function(error, success){
          console.log('error:', error, " success:", success);
        });
        break;


      case Types.BlockchainType.tron:
        console.log("clearAll - Tron");
        break;

      default:
        break;
    }
  },
}

window.NotificationManager = NotificationManager;

export default NotificationManager;