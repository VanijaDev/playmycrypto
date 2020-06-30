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


contract("Finish Game", (accounts) => {
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

    await game.createGame(CREATOR_REFERRAL, {
      from: CREATOR,
      value: ether("1")
    });
    await game.joinGame(1, OPPONENT_REFERRAL, {
      from: OPPONENT,
      value: ether("1")
    });
  });

  describe("finishGame from claimExpiredGamePrize", () => {
    it("should push winner to raffleParticipants", async () => {
      //  1
      await time.increase(333);

      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;
      await game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      });

      assert.deepEqual(await game.getRaffleParticipants.call(), [claimerCorrect], "wrong player added 1");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await time.increase(333);

      let nextPlayer_2 = (await game.games.call(2)).nextMover;
      let claimerCorrect_2 = (nextPlayer_2 == CREATOR_2) ? OPPONENT_2 : CREATOR_2;
      await game.claimExpiredGamePrize(2, {
        from: claimerCorrect_2
      });

      assert.deepEqual(await game.getRaffleParticipants.call(), [claimerCorrect, claimerCorrect_2], "wrong player added 2");
    });

    it("should update gamesCompletedAmount", async () => {
      //  1
      await time.increase(333);
      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;
      await game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      });

      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("1")), "wrong gamesCompletedAmount in 1");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await time.increase(333);

      let nextPlayer_2 = (await game.games.call(2)).nextMover;
      let claimerCorrect_2 = (nextPlayer_2 == CREATOR_2) ? OPPONENT_2 : CREATOR_2;
      await game.claimExpiredGamePrize(2, {
        from: claimerCorrect_2
      });

      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("2")), "wrong gamesCompletedAmount in 2");
    });

    it("should delete ongoingGameIdxForParticipant[game.creator] and ongoingGameIdxForParticipant[game.opponent]", async () => {
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");

      //  1
      await time.increase(333);
      let nextPlayer = (await game.games.call(1)).nextMover;
      let claimerCorrect = (nextPlayer == CREATOR) ? OPPONENT : CREATOR;
      await game.claimExpiredGamePrize(1, {
        from: claimerCorrect
      });

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 1 after");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 1 after");


      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await time.increase(333);

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR_2)).cmp(new BN("2")), "wrong ongoingGameIdxForParticipant in 2 before");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT_2)).cmp(new BN("2")), "wrong ongoingGameIdxForParticipant in 2 before");

      let nextPlayer_2 = (await game.games.call(2)).nextMover;
      let claimerCorrect_2 = (nextPlayer_2 == CREATOR_2) ? OPPONENT_2 : CREATOR_2;
      await game.claimExpiredGamePrize(2, {
        from: claimerCorrect_2
      });

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR_2)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 2 after");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT_2)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 2 after");
    });

    it("should emit GameFinished with correct params", async () => {
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
      assert.equal(0, event.args.bet.cmp(ether("1")), "should be 1 ether");
    });
  });

  describe("finishGame from makeMove with WinnerPresent", () => {
    it("should push both CREATOR & OPPONENT to raffleParticipants", async () => {
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

      assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "wrong getRaffleParticipants");
    });

    it("should update gamesCompletedAmount", async () => {
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

      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("1")), "wrong gamesCompletedAmount in 1");


      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("1")
      });
      //  1
      nextPlayer = (await game.games.call(2)).nextMover;
      await game.makeMove(2, 0, 2, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(2)).nextMover;
      await game.makeMove(2, 0, 1, {
        from: nextPlayer
      });

      //  2
      nextPlayer = (await game.games.call(2)).nextMover;
      await game.makeMove(2, 1, 1, {
        from: nextPlayer
      });

      nextPlayer = (await game.games.call(2)).nextMover;
      await game.makeMove(2, 2, 1, {
        from: nextPlayer
      });

      //  3
      nextPlayer = (await game.games.call(2)).nextMover;
      await game.makeMove(2, 2, 0, {
        from: nextPlayer
      });

      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("2")), "wrong gamesCompletedAmount in 2");
    });

    it("should delete ongoingGameIdxForParticipant[game.creator] and ongoingGameIdxForParticipant[game.opponent]", async () => {
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");

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

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 2 after");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 2 after");
    });

    it("should emit GameFinished with correct params", async () => {
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
      let tx = await game.makeMove(1, 2, 0, {
        from: nextPlayer
      });

      assert.equal(2, tx.logs.length, "should be 2 logs");
      let event = tx.logs[1];
      assert.equal(event.event, "GameFinished", "should be GameFinished");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.winner, nextPlayer, "wrong winner");
      assert.equal(0, event.args.bet.cmp(ether("1")), "should be 1 ether");
    });
  });

  describe("finishGame from makeMove with Draw", () => {
    it("should push both CREATOR & OPPONENT to raffleParticipants", async () => {
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

      assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "wrong getRaffleParticipants");
    });

    it("should update gamesCompletedAmount", async () => {
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

      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("1")), "wrong gamesCompletedAmount in 1");
    });

    it("should delete ongoingGameIdxForParticipant[game.creator] and ongoingGameIdxForParticipant[game.opponent]", async () => {
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");

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

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 1 after");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 1 after");
    });

    it("should emit GameFinished with correct params", async () => {
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
      assert.equal(event.args.winner, "0x0000000000000000000000000000000000000000", "wrong winner");
      assert.equal(0, event.args.bet.cmp(ether("1")), "should be 1 ether");
    });
  });

  describe("finishGame from quitGame", () => {
    it("should push winner to raffleParticipants - OPPONENT only", async () => {
      await game.quitGame(1, {
        from: CREATOR
      });

      assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT], "wrong getRaffleParticipants");
    });

    it("should update gamesCompletedAmount - OPPONENT only", async () => {
      await game.quitGame(1, {
        from: CREATOR
      });

      assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT], "wrong getRaffleParticipants");
    });

    it("should delete ongoingGameIdxForParticipant[game.creator] and ongoingGameIdxForParticipant[game.opponent]", async () => {
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant in 1 before");

      await game.quitGame(1, {
        from: CREATOR
      });

      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 1 after");
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(OPPONENT)).cmp(new BN("0")), "wrong ongoingGameIdxForParticipant in 1 after");
    });

    it("should emit GameFinished with correct params", async () => {
      let tx = await game.quitGame(1, {
        from: OPPONENT
      });

      assert.equal(2, tx.logs.length, "should be 2 logs");
      let event = tx.logs[0];
      assert.equal(event.event, "GameFinished", "should be GameFinished");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.winner, CREATOR, "wrong winner");
      assert.equal(0, event.args.bet.cmp(ether("1")), "should be 1 ether");
    });
  });
});