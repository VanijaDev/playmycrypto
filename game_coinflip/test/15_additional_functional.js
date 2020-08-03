const Game = artifacts.require("./CoinFlipGame.sol");
const {
  BN,
  time,
  ether,
  balance,
  constants,
  expectEvent,
  expectRevert
} = require('openzeppelin-test-helpers');
const {
  expect
} = require('chai');

var assert = require('assert');


contract("Additional functional", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const OTHER = accounts[9];

  let game;
  let ownerHash;
  const CREATOR_COIN_SIDE = 1;
  const CREATOR_SEED = "Hello World";
  const CREATOR_SEED_HASHED = web3.utils.soliditySha3(CREATOR_SEED);
  const TOP_FEE = ether("0.01");

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);
    
    ownerHash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(ownerHash, CREATOR_REFERRAL, {
      from: OWNER,
      value: ether("1", ether)
    });
  });

  describe("allowedToPlay", () => {
    it("should not allow if less than 1 hour since previous joined game", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await expectRevert(game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Suspended to play");

      //  2.1
      await time.increase(time.duration.minutes(10));
      await expectRevert(game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Suspended to play");

      //  2.2
      await time.increase(time.duration.minutes(30));
      await expectRevert(game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Suspended to play");
    });

    it("should allow if more than 1 hour since previous joined game", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await time.increase(time.duration.hours(2));
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
    });
  });

  describe.only("addTopGame", () => {
    it("should fail if not creator - addTopGame", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.addTopGame(1, {
        from: OTHER,
        value: TOP_FEE
      }), "Not creator");
    });

    it("should fail if Has opponent", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      await expectRevert(game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      }), "Has opponent");
    });

    it("should fail if Wrong fee", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.addTopGame(1, {
        from: CREATOR,
        value: ether("0.1")
      }), "Wrong fee");
    });

    it("should fail if Top in TopGames", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      });

      await expectRevert(game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      }), "Top in TopGames");
    });

    it("should add game idx to the beginning", async () => {
      //  create new games
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      await game.createGame(ownerHash, OPPONENT_REFERRAL, {
        from: CREATOR_REFERRAL,
        value: ether("1", ether)
      });

      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: OPPONENT_REFERRAL,
        value: ether("1", ether)
      });

      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: PARTNER,
        value: ether("1", ether)
      });

      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: OTHER,
        value: ether("1", ether)
      });

      //  add games
      //  1
      await game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      });
      assert.deepEqual(await game.getTopGames.call(), [new BN("1"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong array in 1");

      //  2
      await game.addTopGame(2, {
        from: OPPONENT,
        value: TOP_FEE
      });
      assert.deepEqual(await game.getTopGames.call(), [new BN("2"), new BN("1"), new BN("0"), new BN("0"), new BN("0")], "wrong array in 2");

      //  3
      await game.addTopGame(4, {
        from: OPPONENT_REFERRAL,
        value: TOP_FEE
      });
      assert.deepEqual(await game.getTopGames.call(), [new BN("4"), new BN("2"), new BN("1"), new BN("0"), new BN("0")], "wrong array in 3");

      //  4
      await game.addTopGame(3, {
        from: CREATOR_REFERRAL,
        value: TOP_FEE
      });
      assert.deepEqual(await game.getTopGames.call(), [new BN("3"), new BN("4"), new BN("2"), new BN("1"), new BN("0")], "wrong array in 4");

      //  5
      await game.addTopGame(5, {
        from: PARTNER,
        value: TOP_FEE
      });
      assert.deepEqual(await game.getTopGames.call(), [new BN("5"), new BN("3"), new BN("4"), new BN("2"), new BN("1")], "wrong array in 5");

      //  6
      await game.addTopGame(6, {
        from: CREATOR_2,
        value: TOP_FEE
      });
      assert.deepEqual(await game.getTopGames.call(), [new BN("6"), new BN("5"), new BN("3"), new BN("4"), new BN("2")], "wrong array in 6");

      //  7
      await game.addTopGame(7, {
        from: OTHER,
        value: TOP_FEE
      });
      assert.deepEqual(await game.getTopGames.call(), [new BN("7"), new BN("6"), new BN("5"), new BN("3"), new BN("4")], "wrong array in 7");
    });

    it("should increase devFeePending after each addition", async () => {
      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      });

      assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.01")), "wrong devFeePending after add to top #1");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await game.addTopGame(2, {
        from: CREATOR_2,
        value: TOP_FEE
      });

      assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.02")), "wrong devFeePending after add to top #2");
    });

    it("Should update totalUsedInGame", async() => {
      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      });

      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("2.01")), "wrong totalUsedInGame after add to top #1");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await game.addTopGame(2, {
        from: CREATOR_2,
        value: TOP_FEE
      });

      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("3.02")), "wrong totalUsedInGame after add to top #2");
    });

    it("should emit CF_GameAddedToTop event", async () => {
      // event GameAddedToTop(uint256 _id);

      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      const { logs } = await game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      });
      assert.equal(1, logs.length, "should be 1 event");
      await expectEvent.inLogs(
        logs, 'CF_GameAddedToTop', {
        id: new BN("1")
      });
    });
  });

  describe("isTopGame", () => {
    it("should return true if game is top -  isTopGame", async() => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(await game.isTopGame.call(1), false, "should be false before");
      await game.addTopGame(1, {
        from: CREATOR,
        value: TOP_FEE
      });
      assert.equal(await game.isTopGame.call(1), true, "should be true after");
    });
  });

  describe("getGamesWithPendingPrizeWithdrawal", () => {
    it("should return correct games with pending prizes", async() => {
      let creatorGames = [];
      let opponentGames = [];

      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      
      if ((await game.games.call(1)).winner == CREATOR) {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length;
        creatorGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR))[length-1]);
        // console.log("\n");
        // console.log("CREATOR");
        // console.log("creatorGames: ", creatorGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), creatorGames, "wrong array for CREATOR 1");
      } else {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).length;
        opponentGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT))[length - 1]);
        // console.log("\n");
        // console.log("OPPONENT");
        // console.log("opponentGames: ", opponentGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), opponentGames, "wrong array for OPPONENT 1");
      }

      //  2
      await time.increase(time.duration.hours(2));
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      if ((await game.games.call(2)).winner == CREATOR) {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length;
        creatorGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR))[length - 1]);
        // console.log("\n");
        // console.log("CREATOR");
        // console.log("creatorGames: ", creatorGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), creatorGames, "wrong array for CREATOR 2");
      } else {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).length;
        opponentGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT))[length - 1]);
        // console.log("\n");
        // console.log("OPPONENT");
        // console.log("opponentGames: ", opponentGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), opponentGames, "wrong array for OPPONENT 2");
      }

      //  3
      await time.increase(time.duration.hours(2));
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(3, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      if ((await game.games.call(3)).winner == CREATOR) {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length;
        creatorGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR))[length - 1]);
        // console.log("\n");
        // console.log("CREATOR");
        // console.log("creatorGames: ", creatorGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), creatorGames, "wrong array for CREATOR 3");
      } else {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).length;
        opponentGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT))[length - 1]);
        // console.log("\n");
        // console.log("OPPONENT");
        // console.log("opponentGames: ", opponentGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), opponentGames, "wrong array for OPPONENT 3");
      }
    });

    it("should delete games with pending prizes after withdrawal", async() => {
      let creatorGames = [];
      let opponentGames = [];

      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      
      if ((await game.games.call(1)).winner == CREATOR) {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length;
        creatorGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR))[length-1]);
        // console.log("\n");
        // console.log("CREATOR");
        // console.log("creatorGames: ", creatorGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), creatorGames, "wrong array for CREATOR 1");
      } else {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).length;
        opponentGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT))[length - 1]);
        // console.log("\n");
        // console.log("OPPONENT");
        // console.log("opponentGames: ", opponentGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), opponentGames, "wrong array for OPPONENT 1");
      }

      //  2
      await time.increase(time.duration.hours(2));
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      if ((await game.games.call(2)).winner == CREATOR) {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length;
        creatorGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR))[length - 1]);
        // console.log("\n");
        // console.log("CREATOR");
        // console.log("creatorGames: ", creatorGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), creatorGames, "wrong array for CREATOR 2");
      } else {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).length;
        opponentGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT))[length - 1]);
        // console.log("\n");
        // console.log("OPPONENT");
        // console.log("opponentGames: ", opponentGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), opponentGames, "wrong array for OPPONENT 2");
      }

      //  3
      await time.increase(time.duration.hours(2));
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(3, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      if ((await game.games.call(3)).winner == CREATOR) {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length;
        creatorGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR))[length - 1]);
        // console.log("\n");
        // console.log("CREATOR");
        // console.log("creatorGames: ", creatorGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), creatorGames, "wrong array for CREATOR 3");
      } else {
        let length = (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).length;
        opponentGames.push((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT))[length - 1]);
        // console.log("\n");
        // console.log("OPPONENT");
        // console.log("opponentGames: ", opponentGames.toString());
        // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), opponentGames, "wrong array for OPPONENT 3");
      }

      // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
      // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
      if (creatorGames.length > opponentGames.length) {
        // console.log("CREATOR withdraw");
        await game.withdrawGamePrizes(creatorGames.length, {
          from: CREATOR
        });
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "CREATOR array should be deleted");
      } else {
        // console.log("OPPONENT withdraw");
        await game.withdrawGamePrizes(opponentGames.length, {
          from: OPPONENT
        });
        assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], "OPPONENT array should be deleted");
      }
      // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).toString());
      // console.log("getGamesWithPendingPrizeWithdrawal: ", (await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)).toString());
    });
  });

  describe("getParticipatedGameIdxsForPlayer", () => {
    it("should fail if address 0x0", async() => {
      await expectRevert(game.getParticipatedGameIdxsForPlayer.call("0x0000000000000000000000000000000000000000"), "Cannt be 0x0");
    });

    it("should return correct game id", async() => {
      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.getParticipatedGameIdxsForPlayer.call(CREATOR)).length, 1, "whong length after 1 CREATOR");
      assert.equal(0, ((await game.getParticipatedGameIdxsForPlayer.call(CREATOR))[0]).cmp(new BN(1)), "should be 1 CREATOR");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal((await game.getParticipatedGameIdxsForPlayer.call(CREATOR_2)).length, 1, "whong length after 1 CREATOR_2");
      assert.equal(0, ((await game.getParticipatedGameIdxsForPlayer.call(CREATOR_2))[0]).cmp(new BN(2)), "should be 2 CREATOR_2");
    });
  });
});