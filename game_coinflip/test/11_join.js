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


contract("Join game", (accounts) => {
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
  const OPPONENT_COIN_SIDE = 0;
  const CREATOR_SEED = "Hello World";

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

  describe("Join game", () => {
    it("should fail if paused", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.pause({
        from: OWNER
      });

      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      }), "Pausable: paused");
    });

    it("should fail if already joined", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "No more opponenting");
    });

    it("should fail if Wrong referral", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Wrong referral");
    });

    it("should fail if Game is paused", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Game is paused");
    });

    it("should fail if No game with such id", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await expectRevert(game.joinGame(21, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "No game with such id");
    });

    it("should fail if Is creator", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      }), "Is creator");
    });

    it("should fail Game has opponent", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT, {
        from: OTHER,
        value: ether("1", ether)
      }), "Game has opponent");
    });

    it("should fail Game has winner - quit", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Game has winner");
    });

    it("should fail Game has winner - game played", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      await game.playGame(1, CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED), {
        from: CREATOR
      });

      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Game has opponent");
    });

    it("should fail if Wrong bet", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      //  2 - join
      await expectRevert(game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("11", ether)
      }), "Wrong bet");
    });

    it("should set correct opponent", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal((await game.games.call(1)).opponent, OPPONENT, "wrong opponent address");
    });

    it("should set correct opponentCoinSide", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal((await game.games.call(1)).opponentCoinSide, OPPONENT_COIN_SIDE, "wrong opponentCoinSide");
    });

    it("should set correct opponentJoinedAt", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, new BN((await game.games.call(1)).opponentJoinedAt).cmp(await time.latest()), "wrong opponentJoinedAt");
    });

    it("should keep opponentReferral as owner() if no referral param provided", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_COIN_SIDE, "0x0000000000000000000000000000000000000000", {
        from: OPPONENT,
        value: ether("1", ether)
      });

      let gameObj = await game.games.call(1);
      assert.equal(gameObj.opponentReferral, OWNER, "wrong opponentReferral, should be OWNER");
    });

    it("should set opponentReferral to referral param provided", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      let gameObj = await game.games.call(1);
      assert.equal(gameObj.opponentReferral, OPPONENT_REFERRAL, "wrong opponentReferral, should be OPPONENT_REFERRAL");
    });

    it("should increase totalUsedInGame", async () => {
      // 1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("3")), "totalUsedInGame should be 3 ether");

      // 2
      await time.increase(time.duration.minutes(2));
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT, {
        from: OPPONENT_REFERRAL,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("5")), "totalUsedInGame should be 5 ether");
    });

    it("should increase betTotal for opponent", async () => {
      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.betTotal.call(OPPONENT)).cmp(ether("1")), "wrong betTotal 1");


      await game.quitGame(1, {
        from: CREATOR
      });

      //  2
      await time.increase(time.duration.minutes(2));
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("0.5")
      });

      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.5", ether)
      });

      assert.equal(0, (await game.betTotal.call(OPPONENT)).cmp(ether("1.5")), "wrong betTotal 2");
    });

    it("should set correct ongoingGameAsOpponent", async () => {
      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.ongoingGameAsOpponent(OPPONENT)).cmp(new BN("1")), "should be 1");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1")
      });

      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT, {
        from: OPPONENT_REFERRAL,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.ongoingGameAsOpponent(OPPONENT_REFERRAL)).cmp(new BN("2")), "should be 2");
    });

    it("should add gameId to playedGames", async () => {
      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.deepEqual(await game.getPlayedGamesForPlayer.call(OPPONENT), [new BN("1")], "wrong array in 1");

      await game.quitGame(1, {
        from: CREATOR
      });

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.deepEqual(await game.getPlayedGamesForPlayer.call(OPPONENT), [new BN("1"), new BN("2")], "wrong array in 1, 2");
    });

    it("should remove from Top games if present there", async () => {
      //  1
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });



      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.deepEqual(await game.getPlayedGamesForPlayer.call(OPPONENT), [new BN("1")], "wrong array in 1");

      await game.quitGame(1, {
        from: CREATOR
      });

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.deepEqual(await game.getPlayedGamesForPlayer.call(OPPONENT), [new BN("1"), new BN("2")], "wrong array in 1, 2");
    });

    it("should remove game id from topGames", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.createGame(ownerHash, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      //  add to top
      await game.addTopGame(1, {
        from: CREATOR,
        value: ether("0.01")
      });
      assert.equal(0, new BN("1").cmp((await game.getTopGames.call())[0]), "1 should be in topGames");

      await game.addTopGame(2, {
        from: OPPONENT,
        value: ether("0.01")
      });
      assert.equal(0, new BN("2").cmp((await game.getTopGames.call())[0]), "2 should be in topGames");

      assert.equal(0, new BN("2").cmp((await game.getTopGames.call())[0]), "0 wrong topGames array before");
      assert.equal(0, new BN("1").cmp((await game.getTopGames.call())[1]), "1 wrong topGames array before");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[2]), "2 wrong topGames array before");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[3]), "3 wrong topGames array before");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[4]), "4 wrong topGames array before");

      //  join
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      assert.equal(0, new BN("2").cmp((await game.getTopGames.call())[0]), "0 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[1]), "1 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[2]), "2 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[3]), "3 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[4]), "4 wrong topGames array after");
    });
    
    it("should emit CF_GameJoined event", async () => {
      // 1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      let tx = await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(tx.logs.length, 1, "should be 1 event");
      let event = tx.logs[0];
      assert.equal(event.event, "CF_GameJoined", "wrong event name");
      assert.equal(0, event.args.id.cmp(new BN(1)), "wrong id");
      assert.equal(event.args.creator, CREATOR, "wrong CREATOR");
      assert.equal(event.args.opponent, OPPONENT, "wrong OPPONENT");
      assert.equal(0, (await game.games.call(1)).bet.cmp(ether("1", ether)), "wrong bet");
    });
  });
});