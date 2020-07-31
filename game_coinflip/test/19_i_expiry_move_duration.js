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
    expect, assert
} = require('chai');


contract("IExpiryMoveDuration", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const CREATOR_2_REFERRAL = accounts[7];
  const OTHER = accounts[9];
  const OPPONENT_2 = accounts[10];

  let game;

  const CREATOR_COIN_SIDE = 1;
  const CREATOR_SEED = "Hello World";
  let ownerHash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));

  beforeEach("setup", async () => {
      await time.advanceBlock();
      game = await Game.new(PARTNER);

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

      //  2
      await game.joinGame(1, OPPONENT_REFERRAL, {
          from: OPPONENT,
          value: ether("1")
      });
  });

  describe("updateGameMoveDuration", () => {
      it("should fail if not owner", async () => {
          await expectRevert(game.updateGameMoveDuration(333, {
              from: OTHER
          }), "Ownable: caller is not the owner");
      });

      it("should fail if new duration == 0", async () => {
          await expectRevert(game.updateGameMoveDuration(0), "Should be > 0");
      });

      it("should update gameMoveDuration variable", async () => {
          assert.equal(0, (await game.gameMoveDuration.call()).cmp(time.duration.hours(12)), "gameMoveDuration should be 12 hours before");

          await game.updateGameMoveDuration(time.duration.minutes(6));

          assert.equal(0, (await game.gameMoveDuration.call()).cmp(time.duration.minutes(6)), "gameMoveDuration should be 6 minutes after");
      });
  });

  describe("gameMoveExpired", () => {
    it("should return false if no prevMoveTimestamp", async () => {
        assert.isFalse(await game.gameMoveExpired.call(1), "should be false");
    });

    it("should return false ifnot yet expired", async () => {
        await time.increase(time.duration.minutes(1));
        assert.isFalse(await game.gameMoveExpired.call(1), "should be false");
    });

    it("should return true if move is already expired", async () => {
        await time.increase(time.duration.hours(13));
        assert.isTrue(await game.gameMoveExpired.call(1), "should be true");
    });
  });

  describe.only("finishExpiredGame", () => {
    it("should fail if no game with provided id", async () => {
        await expectRevert(game.finishExpiredGame(22), "No game with such id");
    });

    it("should fail if not opponent", async () => {
      await time.increase(time.duration.hours(13));

      await expectRevert(game.finishExpiredGame(1, {
          from: OTHER
      }), "Not opponent");
    });

    it("should fail if has winner", async () => {
      await time.increase(time.duration.hours(13));

      await game.finishExpiredGame(1, {
        from: OPPONENT
      });

      await expectRevert(game.finishExpiredGame(1, {
          from: OPPONENT
      }), "Has winner");
    });

    it("should fail if not yet expired", async () => {
      await time.increase(time.duration.minutes(2));

      await expectRevert(game.finishExpiredGame(1, {
          from: OPPONENT
      }), "Not yet expired");
    });

    it("should set winner to claimer", async () => {
      assert.equal((await game.games.call(1)).winner, "0x0000000000000000000000000000000000000000", "should be no winner before");

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(1, {
          from: OPPONENT
      });

      assert.equal((await game.games.call(1)).winner, OPPONENT, "wrong winner after claim, should be OPPONENT");
    });

    it("should add gameId to gamesWithPendingPrizeWithdrawal", async () => {
      assert.equal((await game.getGamesWithPendingPrizeWithdrawalForAddress(OPPONENT)).length, 0, "should be 0 length before");

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(1, {
          from: OPPONENT
      });

      assert.equal((await game.getGamesWithPendingPrizeWithdrawalForAddress(OPPONENT)).length, 1, "should be 1 length after");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(2, OPPONENT_REFERRAL, {
          from: OPPONENT,
          value: ether("1")
      });

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(2, {
          from: OPPONENT
      });

      assert.equal((await game.getGamesWithPendingPrizeWithdrawalForAddress(OPPONENT)).length, 2, "should be 2 length after");
    });

    it("should add only OPPONENT to raffleParticipants", async () => {
      assert.equal((await game.getRaffleParticipants()).length, 0, "should be 0 length before");

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(1, {
          from: OPPONENT
      });

      assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT], "should be [OPPONENT] after");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(2, OPPONENT_REFERRAL, {
          from: OPPONENT,
          value: ether("1")
      });

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(2, {
          from: OPPONENT
      });

      assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT, OPPONENT], "should be [OPPONENT, OPPONENT] after");
    });

    it("should increase gamesCompletedAmount", async () => {
      // console.log(await game.getRaffleParticipants());
      assert.equal(await game.gamesCompletedAmount(), 0, "should be 0 before");

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(1, {
          from: OPPONENT
      });

      assert.equal(await game.gamesCompletedAmount(), 1, "should be 1 after");

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(2, OPPONENT_REFERRAL, {
          from: OPPONENT,
          value: ether("1")
      });

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(2, {
          from: OPPONENT
      });

      assert.equal(await game.gamesCompletedAmount(), 2, "should be 2 after");
    });

    it("should clear ongoingGameAsCreator", async () => {
      assert.equal(await game.ongoingGameAsCreator(CREATOR), 1, "should be 1 before");

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(1, {
          from: OPPONENT
      });

      assert.equal(await game.ongoingGameAsCreator(CREATOR), 0, "should be 0 sfter");
    });

    it("should clear ongoingGameAsOpponent", async () => {
      assert.equal(await game.ongoingGameAsOpponent(OPPONENT), 1, "should be 1 before");

      await time.increase(time.duration.hours(13));
      await game.finishExpiredGame(1, {
          from: OPPONENT
      });

      assert.equal(await game.ongoingGameAsOpponent(OPPONENT), 0, "should be 0 sfter");
    });

    it("should emit CF_GameExpiredFinished event", async () => {
      await time.increase(time.duration.hours(13));

      let tx = await game.finishExpiredGame(1, {
          from: OPPONENT
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "CF_GameExpiredFinished", "should be CF_GameExpiredFinished");
    });
  });
});