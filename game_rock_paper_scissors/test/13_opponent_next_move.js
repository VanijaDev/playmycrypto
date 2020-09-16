const Game = artifacts.require("./RockPaperScissorsGame.sol");
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


contract("Opponent Next Move", (accounts) => {
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
  let hash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(OTHER, hash, {
      from: OWNER,
      value: ether("1")
    });

    //  1
    await game.createGame(CREATOR_REFERRAL, hash, {
      from: CREATOR,
      value: ether("1")
    });
    await game.joinGame(1, OPPONENT_REFERRAL, 1, {
      from: OPPONENT,
      value: ether("1")
    });
  });

  describe("opponentNextMove", () => {
    it("should fail if paused", async () => {
      await game.pause();

      await expectRevert(game.opponentNextMove(1, 1, {
        from: OPPONENT
      }), "paused");
    });

    it("should fail if not nextMover", async () => {
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });

      await expectRevert(game.opponentNextMove(1, 1, {
        from: OPPONENT_2
      }), "Not next mover");
    });

    it("should fail if game expired", async () => {
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });

      await time.increase(time.duration.hours(16));

      await expectRevert(game.opponentNextMove(1, 1, {
        from: OPPONENT
      }), "Move expired");
    });

    it("should fail if not valid move", async () => {
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });

      await expectRevert(game.opponentNextMove(1, 0, {
        from: OPPONENT
      }), "Wrong move idx");

      await expectRevert(game.opponentNextMove(1, 4, {
        from: OPPONENT
      }), "Wrong move idx");
    });

    it("should set game.movesOpponent[gameRow] = _moveMark", async () => {
      //  1
      assert.equal(0, (await game.showRowMoves.call(1, 0))[1].cmp(new BN("1")), "wrong game movesOpponent[gameRow] for 1");

      //  2
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });
      await game.opponentNextMove(1, 2, {
        from: OPPONENT
      });
      assert.equal(0, (await game.showRowMoves.call(1, 1))[1].cmp(new BN("2")), "wrong game movesOpponent[gameRow] for 2");

      //  3
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });
      await game.opponentNextMove(1, 1, {
        from: OPPONENT
      });
      assert.equal(0, (await game.showRowMoves.call(1, 2))[1].cmp(new BN("1")), "wrong game movesOpponent[gameRow] for 3");
    });

    it("should set game.nextMover = game.creator", async () => {
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });
      await game.opponentNextMove(1, 1, {
        from: OPPONENT
      });

      assert.equal((await game.games.call(1)).nextMover, CREATOR, "wrong game nextMover");
    });

    it("should set game.prevMoveTimestamp = now", async () => {
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });

      await game.opponentNextMove(1, 1, {
        from: OPPONENT
      });
      let moveTime = await time.latest();
      await time.increase(55);

      assert.equal(0, (await game.games.call(1)).prevMoveTimestamp.cmp(moveTime), "wrong game prevMoveTimestamp");
    });

    it("should emit RPS_GameOpponentMoved", async () => {
      await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR
      });

      const { logs } = await game.opponentNextMove(1, 1, {
        from: OPPONENT
      });
      assert.equal(1, logs.length, "should be 1 event1");
      await expectEvent.inLogs(
        logs, 'RPS_GameOpponentMoved', {
        id: new BN("1")
      });
    });    
  });
});