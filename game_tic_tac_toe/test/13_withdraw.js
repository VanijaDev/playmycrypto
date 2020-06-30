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


contract("Withdraw", (accounts) => {
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

  describe("withdrawGamePrize", () => {
    it("should fail if GameState.WaitingForOpponent", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      // await game.quitGame(1);

      await expectRevert(game.withdrawGamePrize(1), "Wrong state");
    });

    it("should fail if GameState.Started", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      // await game.quitGame(1);

      await expectRevert(game.withdrawGamePrize(1), "Wrong state");
    });

    it("should fail if GameState.Expired", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      // await game.quitGame(1, {
      //   from: (nextPlayer == CREATOR) ? OPPONENT : CREATOR
      // });
      await time.increase(333);

      await expectRevert(game.withdrawGamePrize(1, {
        from: nextPlayer
      }), "Wrong state");
    });

    it("should call performPrizeCalculationsAndTransferForGameWithWinner if GameState.WinnerPresent", async () => {
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

      assert.isTrue((await game.games.call(1)).prizeWithdrawn, "should be true");
    });

    it("should call performPrizeCalculationsAndTransferForGameWithWinner if GameState.Quitted", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });

      assert.isTrue((await game.games.call(1)).prizeWithdrawn, "should be true");
    });

    // it("should correct prize should be transferred to winner, bet 1 ETH", async () => {

    // });

    // it("should correct prize should be transferred to winner, bet 2 ETH", async () => {

    // });

    // it("should update winnerReferral balance", async () => {

    // });

    // it("should update ongoinRafflePrize", async () => {

    // });

    // it("should update partnerFee", async () => {

    // });

    // it("should transfer partnerFee if > 1 ETH", async () => {

    // });

    // it("should update devFee", async () => {

    // });

    it("should emit GamePrizeWithdrawn with correct args", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      let tx = await game.withdrawGamePrize(1, {
        from: OPPONENT
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GamePrizeWithdrawn", "should be GamePrizeWithdrawn");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
    });
  });

  describe("withdrawReferralFees", async () => {
    it("should fail if no referralFee", async () => {
      await expectRevert(game.withdrawReferralFees(), "No referral fee");
    });

    it("should delete referralFees[msg.sender]", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });

      assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.04")), "should be referralFee 0.04 ETH before");
      //  2

      await game.withdrawReferralFees({
        from: OPPONENT_REFERRAL
      });
      assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "should be referralFee 0 ETH after");

    });

    it("should transfer correct referralFee", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });

      let balanceBefore = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));
      let referralBalance = await game.referralFeesPending.call(OPPONENT_REFERRAL);

      //  2
      let tx = await game.withdrawReferralFees({
        from: OPPONENT_REFERRAL
      });

      let gasUsed = new BN(tx.receipt.gasUsed);
      let txInfo = await web3.eth.getTransaction(tx.tx);
      let gasPrice = new BN(txInfo.gasPrice);
      let gasSpent = gasUsed.mul(gasPrice);

      let balanceAfter = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));

      assert.equal(0, balanceBefore.sub(gasSpent).add(referralBalance).cmp(balanceAfter), "wrong referral balance after claim");
    });

    it("should emit GameReferralWithdrawn withcorect args", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });

      //  2
      let tx = await game.withdrawReferralFees({
        from: OPPONENT_REFERRAL
      });

      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GameReferralWithdrawn", "should be GameReferralWithdrawn");
      assert.equal(event.args.referral, OPPONENT_REFERRAL, "wrong referral address");
    });
  });

  describe("withdrawDevFee", () => {
    it("should fail if no devFee", async () => {
      await expectRevert(game.withdrawDevFee({
        from: OWNER
      }), "No dev fee");
    });

    it("should delete devFee", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });


      assert.equal(0, (await game.devFee.call()).cmp(ether("0.08")), "should be devFee 0.08 ETH before");
      //  2

      await game.withdrawDevFee({
        from: OWNER
      });
      assert.equal(0, (await game.devFee.call()).cmp(ether("0")), "should be devFee 0 ETH after");
    });

    it("should transfer correct amount", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      let nextPlayer = (await game.games.call(1)).nextMover;
      await game.makeMove(1, 0, 2, {
        from: nextPlayer
      });

      await game.quitGame(1, {
        from: CREATOR
      });

      await game.withdrawGamePrize(1, {
        from: OPPONENT
      });

      let balanceBefore = new BN(await web3.eth.getBalance(OWNER));
      let devBalance = await game.devFee.call();

      //  2
      let tx = await game.withdrawDevFee({
        from: OWNER
      });

      let gasUsed = new BN(tx.receipt.gasUsed);
      let txInfo = await web3.eth.getTransaction(tx.tx);
      let gasPrice = new BN(txInfo.gasPrice);
      let gasSpent = gasUsed.mul(gasPrice);

      let balanceAfter = new BN(await web3.eth.getBalance(OWNER));

      assert.equal(0, balanceBefore.sub(gasSpent).add(devBalance).cmp(balanceAfter), "wrong OWNER balance after devFee claim");
    });
  });

});