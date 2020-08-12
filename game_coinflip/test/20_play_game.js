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


contract("Play game", (accounts) => {
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
  const CREATOR_SEED_HASHED = web3.utils.soliditySha3(CREATOR_SEED);

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);
    
    ownerHash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(ownerHash, CREATOR_REFERRAL, {
      from: OWNER,
      value: ether("1", ether)
    });

    //  1
    await game.createGame(ownerHash, CREATOR_REFERRAL, {
      from: CREATOR,
      value: ether("1", ether)
    });

    await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
      from: OPPONENT,
      value: ether("1", ether)
    });
  });

  describe("Play game", () => {
    it("should fail if paused", async () => {
      await game.pause({
        from: OWNER
      });

      await expectRevert(game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      }), "Pausable: paused");
    });

    it("should fail if not game creator", async () => {
      await expectRevert(game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: OTHER
      }), "Not creator");
    });

    it("should fail if No opponent", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: OTHER,
        value: ether("1", ether)
      });

      await expectRevert(game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: OTHER
      }), "No opponent");
    });

    it("should fail if Game has winner", async () => {
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      await expectRevert(game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      }), "Game has winner");
    });

    it("should fail if Expired", async () => {
      await time.increase(time.duration.hours(13));

      await expectRevert(game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      }), "Expired");
    });

    it("should fail if Wrong hash value", async () => {
      await expectRevert(game.playGame(1, CREATOR_COIN_SIDE, web3.utils.soliditySha3("CREATOR_SEED"), {
        from: CREATOR
      }), "Wrong hash value");
    });

    it("should set correct game.winner", async () => {
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      // console.log((await game.games.call(1)).randCoinSide);
      if ((await game.games.call(1)).randCoinSide.cmp(new BN(CREATOR_COIN_SIDE.toString())) == 0) {
        // console.log("CREATOR");
        assert.equal(CREATOR, (await game.games.call(1)).winner, "should be CREATOR");
      } else {
        // console.log("OPPONENT");
        assert.equal(OPPONENT, (await game.games.call(1)).winner, "should be OPPONENT");
      }
    });

    it("should set correct game.creatorCoinSide", async () => {
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      assert.equal(0, (await game.games.call(1)).creatorCoinSide.cmp(new BN("1")), "should be 1");
    });

    it("should push to gamesWithPendingPrizeWithdrawal", async () => {
      //  1
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      let isCreatorWinner = false;
      if (CREATOR == (await game.games.call(1)).winner) {
        isCreatorWinner = true;
        assert.deepEqual((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)), [new BN("1")], "should be [1] for CREATOR");
      } else {
        assert.deepEqual((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)), [new BN("1")], "should be [1] for OPPONENT");
      }

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinGame(2,  OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      if (CREATOR == (await game.games.call(2)).winner) {
        if (isCreatorWinner == true) {
          assert.deepEqual((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)), [new BN("1"), new BN("2")], "should be [1, 2] for CREATOR _ 2");
        } else {
          assert.deepEqual((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)), [new BN("2")], "should be [2] for CREATOR _ 2");
        }
      } else {
        if (isCreatorWinner == true) {
          assert.deepEqual((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)), [new BN("2")], "should be [2] for OPPONENT _ 2");
        } else {
          assert.deepEqual((await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT)), [new BN("1"), new BN("2")], "should be [1, 2] for OPPONENT _ 2");
        }
      }
    });

    it("should push both to raffleParticipants", async () => {
      assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");

      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "should be [CREATOR, OPPONENT] after");
    });

    it("should increase gamesCompletedAmount", async () => {
      //  1
      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("0")), "should be 0 before");
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });
      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("1")), "should be 1 after");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinGame(2,  OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });
      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("2")), "should be 2 after");
    });

    it("should delete ongoingGameAsCreator & delete ongoingGameAsOpponent", async () => {
      assert.equal(0, (await game.ongoingGameAsCreator.call(CREATOR)).cmp(new BN("1")), "should be 1 before");
      assert.equal(0, (await game.ongoingGameAsOpponent.call(OPPONENT)).cmp(new BN("1")), "should be 1 before");
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });
      assert.equal(0, (await game.ongoingGameAsCreator.call(CREATOR)).cmp(new BN("0")), "should be 0 after");
      assert.equal(0, (await game.ongoingGameAsOpponent.call(OPPONENT)).cmp(new BN("0")), "should be 0 after");
    });

    it("should emit CF_GamePlayed", async () => {
      let tx = await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      assert.equal(tx.logs.length, 1, "should be 1 event");
      let event = tx.logs[0];
      assert.equal(event.event, "CF_GamePlayed", "wrong event name");
      assert.equal(0, event.args.id.cmp(new BN(1)), "wrong id");
      assert.equal(event.args.creator, CREATOR, "wrong CREATOR");
      assert.equal(event.args.opponent, OPPONENT, "wrong OPPONENT");
      assert.equal(event.args.winner, ((await game.games.call(1)).winner == CREATOR) ? CREATOR : OPPONENT, "wrong winner");
    });
  });

});