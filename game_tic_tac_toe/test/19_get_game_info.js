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


contract("Get Game Info", (accounts) => {
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

  describe("showFieldColumns", () => {
    it("should return correct game columns after each move", async () => {
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
      let nextPlayerMark_1_1 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 0, 0, {
        from: nextPlayer
      });
      let fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(new BN("0")), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(new BN("0")), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(new BN("0")), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(new BN("0")), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(new BN("0")), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(new BN("0")), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(new BN("0")), "wrong mark [2][2] after 1");

      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_1_2 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 0, 1, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(new BN("0")), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(new BN("0")), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(new BN("0")), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(new BN("0")), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(new BN("0")), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(new BN("0")), "wrong mark [2][2] after 1");

      //  2
      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_2_1 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(nextPlayerMark_2_1), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(new BN("0")), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(new BN("0")), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(new BN("0")), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(new BN("0")), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(new BN("0")), "wrong mark [2][2] after 1");

      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_2_2 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 1, 0, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(nextPlayerMark_2_1), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(nextPlayerMark_2_2), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(new BN("0")), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(new BN("0")), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(new BN("0")), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(new BN("0")), "wrong mark [2][2] after 1");


      //  3
      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_3_1 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 1, 1, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(nextPlayerMark_2_1), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(nextPlayerMark_2_2), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(nextPlayerMark_3_1), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(new BN("0")), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(new BN("0")), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(new BN("0")), "wrong mark [2][2] after 1");

      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_3_2 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(nextPlayerMark_2_1), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(nextPlayerMark_2_2), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(nextPlayerMark_3_1), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(new BN("0")), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(nextPlayerMark_3_2), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(new BN("0")), "wrong mark [2][2] after 1");

      //  4
      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_4_1 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 1, 2, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(nextPlayerMark_2_1), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(nextPlayerMark_2_2), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(nextPlayerMark_3_1), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(nextPlayerMark_4_1), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(nextPlayerMark_3_2), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(new BN("0")), "wrong mark [2][2] after 1");

      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_4_2 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 2, 2, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(nextPlayerMark_2_1), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(nextPlayerMark_2_2), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(nextPlayerMark_3_1), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(nextPlayerMark_4_1), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(nextPlayerMark_3_2), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(new BN("0")), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(nextPlayerMark_4_2), "wrong mark [2][2] after 1");

      //  5
      nextPlayer = (await game.games.call(1)).nextMover;
      let nextPlayerMark_5_1 = (nextPlayer == CREATOR) ? new BN("1") : new BN("2");
      await game.makeMove(1, 2, 1, {
        from: nextPlayer
      });
      fieldColumns = await game.showFieldColumns.call(1);
      assert.equal(0, fieldColumns[0][0].cmp(nextPlayerMark_1_1), "wrong mark [0][0] after 1");
      assert.equal(0, fieldColumns[0][1].cmp(nextPlayerMark_1_2), "wrong mark [0][1] after 1");
      assert.equal(0, fieldColumns[0][2].cmp(nextPlayerMark_2_1), "wrong mark [0][2] after 1");
      assert.equal(0, fieldColumns[1][0].cmp(nextPlayerMark_2_2), "wrong mark [1][0] after 1");
      assert.equal(0, fieldColumns[1][1].cmp(nextPlayerMark_3_1), "wrong mark [1][1] after 1");
      assert.equal(0, fieldColumns[1][2].cmp(nextPlayerMark_4_1), "wrong mark [1][2] after 1");
      assert.equal(0, fieldColumns[2][0].cmp(nextPlayerMark_3_2), "wrong mark [2][0] after 1");
      assert.equal(0, fieldColumns[2][1].cmp(nextPlayerMark_5_1), "wrong mark [2][1] after 1");
      assert.equal(0, fieldColumns[2][2].cmp(nextPlayerMark_4_2), "wrong mark [2][2] after 1");
    });
  });

  describe("gameWithdrawalInfo", () => {
    it("should return true for PrizeWithdrawn", async () => {
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

      await game.withdrawGamePrize(1, {
        from: nextPlayer
      });

      assert.isTrue((await game.gameWithdrawalInfo.call(1))[0], "should be true PrizeWithdrawn");
    });

    it("should return true for drawWithdrawnCreator", async () => {
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

      await game.withdrawGamePrize(1, {
        from: CREATOR
      });
      assert.isTrue((await game.gameWithdrawalInfo.call(1))[1], "should be true for drawWithdrawnCreator");
    });

    it("should return true for drawWithdrawnOpponent", async () => {
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

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });
      assert.isTrue((await game.gameWithdrawalInfo.call(1))[2], "should be true for drawWithdrawnOpponent");
    });
  });

  describe("getParticipatedGameIdxsForPlayer", () => {
    it("should fail if address == 0x0", async () => {
      await expectRevert(game.getParticipatedGameIdxsForPlayer.call("0x0000000000000000000000000000000000000000"), "Cannt be 0x0");
    });

    it("should return correct participatedGameIdxsForPlayer after game activity", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });
      assert.isTrue((await game.getParticipatedGameIdxsForPlayer.call(CREATOR)).length == 1, "wrong length after 1");
      assert.deepEqual(0, (await game.getParticipatedGameIdxsForPlayer.call(CREATOR))[0].cmp(new BN("1")), "wrong idx, should be [1] afetr 1");

      //  2
      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });
      assert.isTrue((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT)).length == 1, "wrong length after 2");
      assert.deepEqual(0, (await game.getParticipatedGameIdxsForPlayer.call(OPPONENT))[0].cmp(new BN("1")), "wrong idx, should be [1] after 2");

      //  3
      await game.quitGame(1, {
        from: CREATOR
      });
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });
      assert.isTrue((await game.getParticipatedGameIdxsForPlayer.call(CREATOR)).length == 2, "wrong length after 2");
      assert.deepEqual(0, (await game.getParticipatedGameIdxsForPlayer.call(CREATOR))[0].cmp(new BN("1")), "wrong idx, should be [1] afetr 3");
      assert.deepEqual(0, (await game.getParticipatedGameIdxsForPlayer.call(CREATOR))[1].cmp(new BN("2")), "wrong idx, should be [1] afetr 3");

      //  4
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("1")
      });
      assert.isTrue((await game.getParticipatedGameIdxsForPlayer.call(CREATOR_2)).length == 1, "wrong length after 4");
      assert.deepEqual(0, (await game.getParticipatedGameIdxsForPlayer.call(CREATOR_2))[0].cmp(new BN("3")), "wrong idx, should be [1] afetr 4");
    });
  });
});