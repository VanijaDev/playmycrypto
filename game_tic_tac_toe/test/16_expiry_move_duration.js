const Game = artifacts.require("./TicTacToeGame.sol");
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


contract("IExpiryMoveDuration", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const CREATOR_2_REFERRAL = accounts[7];
  const OPPONENT_2 = accounts[10];
  const OPPONENT_2_REFERRAL = accounts[11];
  const OTHER = accounts[9];

  let game;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(OTHER, {
      from: OWNER,
      value: ether("1", ether)
    });
  });

  describe("updateGameMoveDuration", () => {
    it("should validate new duration is > 0", async () => {
      await expectRevert(game.updateGameMoveDuration(0), "Should be > 0");
    });

    it("should update gameMoveDuration variable", async () => {
      assert.equal(0, (await game.gameMoveDuration.call()).cmp(new BN("300")), "gameMoveDuration should be 300 before");

      await game.updateGameMoveDuration(333);

      assert.equal(0, (await game.gameMoveDuration.call()).cmp(new BN("333")), "gameMoveDuration should be 333 after");
    });

    it("should fail if not owner", async () => {
      await expectRevert(game.updateGameMoveDuration(333, {
        from: OTHER
      }), "Ownable: caller is not the owner");
    });
  });

  describe("gameMoveExpired", () => {
    it("should return false if no prevMoveTimestamp", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.isFalse(await game.gameMoveExpired.call(1), "should be false");
    });

    it("should return true if move made after expiration duration", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await time.increase(333);

      assert.isTrue(await game.gameMoveExpired.call(1), "should be true");
    });
  });

  describe("claimExpiredGamePrize", () => {
    it("should fail if no game with provided id", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.claimExpiredGamePrize(2), "No game with such id");
    });

    it("should fail if prizeWithdrawn", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });

      await expectRevert(game.claimExpiredGamePrize(1, {
        from: CREATOR
      }), "Prize withdrawn");
    });

    it("should fail if winner present", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await expectRevert(game.claimExpiredGamePrize(1, {
        from: CREATOR
      }), "Game was played");
    });

    it("should fail if claimer is not next mover", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await time.increase(333);

      await expectRevert(game.claimExpiredGamePrize(1, {
        from: OTHER
      }), "Wrong claimer");
    });

    it("should fail if not yet expired", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });


      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;
      await expectRevert(game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      }), "Not yet expired");
    });

    it("should set winner to claimer", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await time.increase(333);

      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;
      await game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      });

      assert.equal((await game.games.call(1)).winner, claimerCorrect, "wrong winner after claim");
    });

    it("should set game state to GameState.Expired", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await time.increase(333);

      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;
      await game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("5")), "state should be Expired");
    });

    it("should emit GameFinished event", async () => {
      // event GameFinished(uint256 indexed id, address indexed winner, uint256 bet);
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("2", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("2")
      });

      await time.increase(333);

      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;

      let tx = await game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GameFinished", "should be GameFinished");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.winner, claimerCorrect, "wrong winner");
      assert.equal(0, event.args.bet.cmp(ether("2")), "wrong bet");
    });

    it("should call performPrizeCalculationsAndTransferForGameWithWinner - check by game.prizeWithdrawn = true", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("2", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("2")
      });

      await time.increase(333);

      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;

      let tx = await game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      });

      assert.isTrue((await game.games.call(1)).prizeWithdrawn, "prizeWithdrawn should be true after claim");
    });
  });
});