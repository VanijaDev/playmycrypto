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

const BigNumber = require("big-number");
const BigNumberr = require("bignumber.js");


contract("Make Move", (accounts) => {
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

  describe("makeMove main part", () => {
    it("should fail if game state != Started", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      // await game.joinGame(1, OPPONENT_REFERRAL, {
      //   from: OPPONENT,
      //   value: ether("1")
      // });

      await expectRevert(game.makeMove(1, 0, 0, {
        from: OPPONENT
      }), "!= Started");
    });

    it("should fail if game move was expired", async () => {
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
      await time.increase(333);

      //  3

      await expectRevert(game.makeMove(1, 0, 0, {
        from: (await game.games.call(1)).nextMover
      }), "Move expired");
    });

    it("should fail if != next mover", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await expectRevert(game.makeMove(1, 0, 0, {
        from: (nextPlayer == CREATOR) ? OPPONENT : CREATOR
      }), "Not next mover");
    });

    it("should fail if cell idx is beyond", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      //  1
      await expectRevert(game.makeMove(1, 3, 0, {
        from: (await game.games.call(1)).nextMover
      }), "Wrong cell idx");

      //  2
      await expectRevert(game.makeMove(1, 0, 3, {
        from: (await game.games.call(1)).nextMover
      }), "Wrong cell idx");
    });

    it("should fail if cell idx is not empty", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      //  1
      await game.makeMove(1, 1, 1, {
        from: (await game.games.call(1)).nextMover
      });

      //  2
      await expectRevert(game.makeMove(1, 1, 1, {
        from: (await game.games.call(1)).nextMover
      }), "Cell is set");
    });

    it("should increase movesTotal", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      //  1
      await game.makeMove(1, 0, 0, {
        from: (await game.games.call(1)).nextMover
      });

      assert.equal(0, (await game.games.call(1)).movesTotal.cmp(new BN("1")), "movesTotal should be 1");

      //  2
      await game.makeMove(1, 1, 0, {
        from: (await game.games.call(1)).nextMover
      });

      assert.equal(0, (await game.games.call(1)).movesTotal.cmp(new BN("2")), "movesTotal should be 2");

      //  3
      await game.makeMove(1, 0, 1, {
        from: (await game.games.call(1)).nextMover
      });

      assert.equal(0, (await game.games.call(1)).movesTotal.cmp(new BN("3")), "movesTotal should be 3");
    });

    it("should update prevMoveTimestamp to now", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      //  1
      await game.makeMove(1, 0, 0, {
        from: (await game.games.call(1)).nextMover
      });

      assert.equal(0, (await game.games.call(1)).prevMoveTimestamp.cmp(await time.latest()), "wrong prevMoveTimestamp after 1");

      //  2
      await time.increase(111);
      await game.makeMove(1, 1, 0, {
        from: (await game.games.call(1)).nextMover
      });

      assert.equal(0, (await game.games.call(1)).prevMoveTimestamp.cmp(await time.latest()), "wrong prevMoveTimestamp after 2");

      //  3
      await time.increase(222);
      await game.makeMove(1, 0, 1, {
        from: (await game.games.call(1)).nextMover
      });

      assert.equal(0, (await game.games.call(1)).prevMoveTimestamp.cmp(await time.latest()), "wrong prevMoveTimestamp after 3");
    });

    it("should update nextMover", async () => {
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
      let nextOwner = nextPlayer == CREATOR;
      let nextOpponent = nextPlayer == OPPONENT;

      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });
      if (nextOwner) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, OPPONENT, "should be OPPONENT after 1");
      } else if (nextOpponent) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, CREATOR, "should be CREATOR after 1");
      } else {
        console.log("nextMover: ", nextMover);
        assert.isTrue(false, "wrong nextMover address after 1");
      }

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      nextOwner = nextPlayer == CREATOR;
      nextOpponent = nextPlayer == OPPONENT;

      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });
      if (nextOwner) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, OPPONENT, "should be OPPONENT after 2");
      } else if (nextOpponent) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, CREATOR, "should be CREATOR after 2");
      } else {
        console.log("nextMover: ", nextMover);
        assert.isTrue(false, "wrong nextMover address after 2");
      }

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      nextOwner = nextPlayer == CREATOR;
      nextOpponent = nextPlayer == OPPONENT;

      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });
      if (nextOwner) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, OPPONENT, "should be OPPONENT after 3");
      } else if (nextOpponent) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, CREATOR, "should be CREATOR after 3");
      } else {
        console.log("nextMover: ", nextMover);
        assert.isTrue(false, "wrong nextMover address after 3");
      }

      //  4
      nextPlayer = (await game.games.call(1)).nextMover;
      nextOwner = nextPlayer == CREATOR;
      nextOpponent = nextPlayer == OPPONENT;

      await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });
      if (nextOwner) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, OPPONENT, "should be OPPONENT after 4");
      } else if (nextOpponent) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, CREATOR, "should be CREATOR after 4");
      } else {
        console.log("nextMover: ", nextMover);
        assert.isTrue(false, "wrong nextMover address after 4");
      }

      //  5
      nextPlayer = (await game.games.call(1)).nextMover;
      nextOwner = nextPlayer == CREATOR;
      nextOpponent = nextPlayer == OPPONENT;

      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });
      if (nextOwner) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, OPPONENT, "should be OPPONENT after 5");
      } else if (nextOpponent) {
        nextPlayer = (await game.games.call(1)).nextMover;
        assert.equal(nextPlayer, CREATOR, "should be CREATOR after 5");
      } else {
        console.log("nextMover: ", nextMover);
        assert.isTrue(false, "wrong nextMover address after 5");
      }

    });

    it("should set correct mark in set", async () => {
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
      let nextOwner = nextPlayer == CREATOR;

      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      let field = await game.showFieldColumns.call(1);
      // console.log(field);

      if (nextOwner) {
        assert.equal(0, field[0][0].cmp(new BN("1")), "wrong CREATOR Mark after 1");
      } else {
        assert.equal(0, field[0][0].cmp(new BN("2")), "wrong CREATOR Mark after 1");
      }

      // 2
      nextPlayer = (await game.games.call(1)).nextMover;
      nextOwner = nextPlayer == CREATOR;

      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      field = await game.showFieldColumns.call(1);
      // console.log(field);

      if (nextOwner) {
        assert.equal(0, field[1][1].cmp(new BN("1")), "wrong CREATOR Mark after 2");
      } else {
        assert.equal(0, field[1][1].cmp(new BN("2")), "wrong CREATOR Mark after 2");
      }

      // 3
      nextPlayer = (await game.games.call(1)).nextMover;
      nextOwner = nextPlayer == CREATOR;

      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });

      field = await game.showFieldColumns.call(1);
      // console.log(field);

      if (nextOwner) {
        assert.equal(0, field[2][2].cmp(new BN("1")), "wrong CREATOR Mark after 3");
      } else {
        assert.equal(0, field[2][2].cmp(new BN("2")), "wrong CREATOR Mark after 3");
      }
    });

    it("should emit GameMoveMade with correct args", async () => {
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
      let nextOwner = nextPlayer == CREATOR;

      let tx = await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GameMoveMade", "should be GameMoveMade");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.mover, nextOwner ? CREATOR : OPPONENT, "wrong nextMover");
      assert.equal(0, event.args.x.cmp(new BN("0")), "should be x == 0");
      assert.equal(0, event.args.y.cmp(new BN("0")), "should be y == 0");

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      nextOwner = nextPlayer == CREATOR;

      tx = await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      assert.equal(1, tx.logs.length, "should be 1 log");
      event = tx.logs[0];
      assert.equal(event.event, "GameMoveMade", "should be GameMoveMade");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.mover, nextOwner ? CREATOR : OPPONENT, "wrong nextMover");
      assert.equal(0, event.args.x.cmp(new BN("1")), "should be x == 1");
      assert.equal(0, event.args.y.cmp(new BN("1")), "should be y == 1");
    });

    it("should set state to WinnerPresent if winner present", async () => {
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
      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 1, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });
      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "wrong state on game winner present");
    });

    it("should set state to Draw if no more moves", async () => {
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
      // console.log((await game.games.call(1)).state);
      // let field = await game.showFieldColumns.call(1);
      // console.log(field);

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("3")), "wrong state on game Draw");
    });
  });

  describe("checkForWinner", () => {
    beforeEach("create & join", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });
    });
    //  horizontal
    it("should be winner on 0,0 x 1,0 x 2,0", async () => {
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

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 0,0 x 1,0 x 2,0");
    });

    it("should be winner on 0,1 x 1,1 x 2,1", async () => {
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
      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 0,1 x 1,1 x 2,1");
    });

    it("should be winner on 0,2 x 1,2 x 2,2", async () => {
      //  1
      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 2, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 0,2 x 1,2 x 2,2");
    });

    //  vertical
    it("should be winner on 0,0 x 0,1 x 0,2", async () => {
      //  1
      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 0,0 x 0,1 x 0,2");
    });

    it("should be winner on 1,0 x 1,1 x 1,2", async () => {
      //  1
      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 2, {
        from: nextPlayer
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 1,0 x 1,1 x 1,2");
    });

    it("should be winner on 2,0 x 2,1 x 2,2", async () => {
      //  1
      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 1, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 2,0 x 2,1 x 2,2");
    });

    //  cross
    it("should be winner on 0,0 x 1,1 x 2,2", async () => {
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
      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 0,0 x 1,1 x 2,2");
    });

    it("should be winner on 0,2 x 1,1 x 2,0", async () => {
      //  1
      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 1, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      assert.equal(0, (await game.games.call(1)).state.cmp(new BN("2")), "winner should be present on 0,2 x 1,1 x 2,0");
    });
  });

  describe("finishGame - WinnerPresent, Draw", () => {
    it("should push creator && opponent to raffleParticipants if GameState.WinnerPresent", async () => {
      assert.isTrue(await game.raffleParticipants.length == 0, "raffleParticipants should be empty before");
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

      assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "raffleParticipants should  be == [CREATOR, OPPONENT]");
    });

    it("should push creator && opponent to raffleParticipants if GameState.Draw", async () => {
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

      assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "raffleParticipants should  be == [CREATOR, OPPONENT]");
    });

    it("should clear ongoingGameIdxForParticipant for creator && opponent", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant CREATOR before");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant OPPONENT before");

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

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant CREATOR after");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant OPPONENT after");
    });

    it("should emit GameFinished with correct args - GameState.WinnerPresent", async () => {
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
      let tx = await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      assert.equal(2, tx.logs.length, "should be 2 logs");
      let event = tx.logs[1];
      assert.equal(event.event, "GameFinished", "should be GameFinished");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.winner, (nextPlayer == CREATOR) ? CREATOR : OPPONENT, "wrong winner");
      assert.equal(0, event.args.bet.cmp(ether("1")), "wrong bet");
    });

    it("should emit GameFinished with correct args - GameState.Draw", async () => {
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
      let tx = await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });

      assert.equal(2, tx.logs.length, "should be 2 logs");
      let event = tx.logs[1];
      assert.equal(event.event, "GameFinished", "should be GameFinished");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.winner, "0x0000000000000000000000000000000000000000", "wrong winner, should be 0x0");
      assert.equal(0, event.args.bet.cmp(ether("1")), "wrong bet");
    });
  });

});