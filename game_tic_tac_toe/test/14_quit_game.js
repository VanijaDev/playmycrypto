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


contract("quitGame", (accounts) => {
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

  describe("quitGame", () => {
    it("should fail if sender is not game participant", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await expectRevert(game.quitGame(1, {
        from: OTHER
      }), "Not a game player");
    });

    it("should fail if Game.State == WinnerPresent", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      //  1
      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 1, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      await expectRevert(game.quitGame(1, {
        from: CREATOR
      }), "Wrong state");
    });

    it("should fail if Game.State == Draw", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      //  1
      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 1, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      //  4
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 2, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });

      //  5
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });

      await expectRevert(game.quitGame(1, {
        from: CREATOR
      }), "Wrong state");
    });

    it("should fail if Game.State == Quitted", async () => {
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

      await expectRevert(game.quitGame(1, {
        from: CREATOR
      }), "Wrong state");

      await expectRevert(game.quitGame(1, {
        from: OPPONENT
      }), "Wrong state");
    });

    it("should fail if Game.State == Expired", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      let expiredClaimCaller = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;

      await time.increase(333);
      await game.claimExpiredGamePrize(1, {
        from: expiredClaimCaller
      });

      await expectRevert(game.quitGame(1, {
        from: CREATOR
      }), "Wrong state");

    });

    it("should set game.state = GameState.Quitted", async () => {
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

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("4")), "game.state should be GameState.Quitted");
    });

    it("should set game.winner to opposite to quitter if both players present", async () => {
      //  1
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

      assert.equal((await game.games.call(1)).winner, OPPONENT, "wrong winner, should be OPPONENT");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await game.joinGame(2, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("1")
      });

      await game.quitGame(2, {
        from: OPPONENT_2
      });

      assert.equal((await game.games.call(2)).winner, CREATOR_2, "wrong winner, shold be CREATOR_2");
    });

    it("should set game.winner to OWNER if no OPPONENT", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      assert.equal((await game.games.call(1)).winner, OWNER, "wrong winner, should be OWNER");
    });

    it("should emit GameFinished event to finish game", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      let tx = await game.quitGame(1, {
        from: CREATOR
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      event = tx.logs[0];
      assert.equal(event.event, "GameFinished", "should be GameFinished");
    });

    it("should emit GameQuitted with correct args", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      let tx = await game.quitGame(1, {
        from: CREATOR
      });
      assert.equal(2, tx.logs.length, "should be 2 logs");
      event = tx.logs[1];
      assert.equal(event.event, "GameQuitted", "should be GameQuitted");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.quitter, CREATOR, "wrong quitter");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await game.joinGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      tx = await game.quitGame(2, {
        from: OPPONENT
      });
      assert.equal(2, tx.logs.length, "should be 2 logs");
      event = tx.logs[1];
      assert.equal(event.event, "GameQuitted", "should be GameQuitted");
      assert.equal(0, event.args.id.cmp(new BN("2")), "should be 2");
      assert.equal(event.args.quitter, OPPONENT, "wrong quitter");
    });
  });
});