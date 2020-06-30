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


contract("IGamePausable", (accounts) => {
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
      value: ether("1")
    });
  });

  describe("gameOnPause", () => {
    it("should return true if game is paused", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });
      await game.pauseGame(1, {
        from: CREATOR
      });

      assert.isTrue(await game.gameOnPause.call(1), "game should be paused");
    });

    it("should return false if game is not paused", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });
      assert.isFalse(await game.gameOnPause.call(1), "game should not be paused");
    });
  });

  describe("pauseGame", () => {
    it("should fail if not game creator", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });
      await expectRevert(game.pauseGame(1, {
        from: OTHER
      }), "Not creator");
    });

    it("should fail if game is already paused", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      await expectRevert(game.pauseGame(1, {
        from: CREATOR
      }), "Game is paused");
    });

    it("should fail if game is joined", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await expectRevert(game.pauseGame(1, {
        from: CREATOR
      }), "!= WaitingForOpponent");
    });

    it("should update paused to true", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      assert.isTrue(await game.gameOnPause.call(1), "game should be paused");
    });

    it("should emit GamePaused with correct args", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      let tx = await game.pauseGame(1, {
        from: CREATOR
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GamePaused", "should be GameFinished");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
    });
  });

  describe("unpauseGame", () => {
    it("should fail if not game creator", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      await expectRevert(game.unpauseGame(1, {
        from: OTHER
      }), "Not creator");
    });

    it("should fail if game is not paused", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await expectRevert(game.unpauseGame(1, {
        from: CREATOR
      }), "Game is not paused");
    });

    it("should update paused to false", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      await game.unpauseGame(1, {
        from: CREATOR
      });

      assert.isFalse(await game.gameOnPause.call(1), "game should be unpaused");
    });

    it("should emit GameUnpaused with correct args", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      let tx = await game.unpauseGame(1, {
        from: CREATOR
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GameUnpaused", "should be GameUnpaused");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
    });
  });
});