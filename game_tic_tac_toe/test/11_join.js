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


contract("Join", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const CREATOR_2_REFERRAL = accounts[7];
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

  describe("joinGame", () => {
    it("should fail if already participating in other game", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      await expectRevert(game.joinGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      }), "No more participating");
    });

    it("should fail if creator", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.joinGame(2, OPPONENT_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      }), "No more participating");
    });

    it("should fail if game is paused", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      await expectRevert(game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      }), "Game is paused");
    });

    it("should fail is state != WaitingForOpponent", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await expectRevert(game.joinGame(1, OPPONENT_REFERRAL, {
        from: OTHER,
        value: ether("1")
      }), "!= WaitingForOpponent");
    });

    it("should fail if referral == opponent", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.joinGame(1, OPPONENT, {
        from: OPPONENT,
        value: ether("1")
      }), "Wrong referral");
    });

    it("should fail if wrong bet", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.joinGame(1, CREATOR_REFERRAL, {
        from: OPPONENT,
        value: ether("11")
      }), "Wrong bet");
    });

    it("should set correct game opponentReferral if != address(0)", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      assert.equal((await game.games.call(1)).opponentReferral, OPPONENT_REFERRAL, "wrong opponentReferral set");
    });

    it("should set correct ongoingGameIdxForParticipant", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2", ether)
      });

      await game.joinGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("2")
      });

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("2")), "wrong ongoingGameIdxForParticipant after create");
    });

    it("should update participatedGameIdxsForPlayer", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2", ether)
      });

      await game.joinGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("2")
      });

      let idxs = await game.getParticipatedGameIdxsForPlayer.call(OPPONENT);
      assert.equal(idxs.length, 1, "wrong idxs amount");
      assert.equal(0, idxs[0].cmp(new BN("2")), "wrong game index");
    });

    it("should set nextMover", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal((await game.games.call(1)).nextMover, "0x0000000000000000000000000000000000000000");

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      assert.notEqual((await game.games.call(1)).nextMover, "0x0000000000000000000000000000000000000000");
    });

    it("should update state to Started", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      assert.equal(0, ((await game.games.call(1)).state).cmp(new BN("1")), "should be Started");
    });

    it("should set prevMoveTimestamp", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(0, ((await game.games.call(1)).prevMoveTimestamp).cmp(new BN("0")), "should be 0 before");

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      assert.equal(1, ((await game.games.call(1)).prevMoveTimestamp).cmp(new BN("0")), "should be > 0 after");
    });

    it("should emit GameJoined with correct args", async () => {
      // event GameJoined(uint256 indexed id, address indexed creator, address indexed opponent, address firstMove); //  firstMove: 0 - creator; 1 - opponent

      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2", ether)
      });

      let tx = await game.joinGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("2")
      });

      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GameJoined", "should be GameJoined");
      assert.equal(0, event.args.id.cmp(new BN("2")), "should be 2");
      assert.equal(event.args.creator, CREATOR_2, "should be CREATOR_2");
      assert.equal(event.args.opponent, OPPONENT, "should be OPPONENT");
      assert.isTrue(event.args.firstMove != "0x0000000000000000000000000000000000000000", "should not be 0x0");
    });
  });

});