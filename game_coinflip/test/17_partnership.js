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
  expect
} = require('chai');


contract("Partnership", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const OTHER = accounts[9];
  const OPPONENT_2 = accounts[10];
  const CREATOR_2_REFERRAL = accounts[11];
  const OPPONENT_2_REFERRAL = accounts[12];

  let game;
  let ownerHash;
  const CREATOR_COIN_SIDE = 1;
  const CREATOR_SEED = "Hello World";
  const CREATOR_SEED_HASHED = web3.utils.soliditySha3(CREATOR_SEED);

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);
    ownerHash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));

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

    await time.increase(1);
  });

  describe("Partnership Constructor", () => {
    it("should set correct inital values", async() => {
      assert.equal(await game.partner.call(), PARTNER, "wrong partner");
      assert.equal(0, (await game.partnerFeeTransferThreshold.call()).cmp(ether("1")), "threshold should be 1 ether");
    });
  });

  describe("updatePartner", () => {
    it("should fail if not Owner", async() => {
      await expectRevert(game.updatePartner(OTHER, {
        from: CREATOR
      }), "Ownable: caller is not the owner");
    });

    it("should fail if provided partner == 0x0", async() => {
      await expectRevert(game.updatePartner("0x0000000000000000000000000000000000000000"), "Wrong partner");
    });

    it("should update partner", async() => {
      assert.equal(await game.partner.call(), PARTNER, "wrong partner before");
      await game.updatePartner(OTHER);
      assert.equal(await game.partner.call(), OTHER, "wrong partner after");
    });
  });

  describe("updatePartnerTransferThreshold", () => {
    it("should fail if not Owner", async() => {
      await expectRevert(game.updatePartnerTransferThreshold(ether("2"), {
        from: CREATOR
      }), "Ownable: caller is not the owner");
    });

    it("should fail if provided threshold == 0", async() => {
      await expectRevert(game.updatePartnerTransferThreshold(0), "threshold must be > 0");
    });

    it("should update threshold", async() => {
      assert.equal(0, (await game.partnerFeeTransferThreshold.call()).cmp(ether("1")), "wrong threshold before");
      await game.updatePartnerTransferThreshold(ether("3"));
      assert.equal(0, (await game.partnerFeeTransferThreshold.call()).cmp(ether("3")), "wrong threshold after");
    });
  });

  describe("transferPartnerFee", () => {
    it("should delete partnerFeePending after transfer to partner", async() => {
      assert.equal(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 before");

      await game.createGame(0, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("60", ether)
      });

      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT_2,
        value: ether("60", ether)
      });

      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });
      await time.increase(1);

      assert.equal(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 after");
    });

    it("should update partnerFeeTotalUsed after multiple transfers", async() => {
      assert.equal(0, (await game.partnerFeeTotalUsed.call()).cmp(ether("0")), "fee should be 0 before");

      //  1
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await time.increase(time.duration.minutes(61));

      //  2
      await game.createGame(0, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("60", ether)
      });

      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("60", ether)
      });
      await time.increase(time.duration.minutes(62));

      //  3
      await game.createGame(0, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("50", ether)
      });

      await game.joinAndPlayGame(3, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("50", ether)
      });

      let addr_won_2_times = ((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length > 1) ? CREATOR : OPPONENT;

      //  withdraw 1
      await game.withdrawGamePrizes(1, {
        from: addr_won_2_times
      });
      await time.increase(1);

      // console.log("0: ", (await game.partnerFeeTotalUsed.call()).toString());
      assert.equal(0, (await game.partnerFeeTotalUsed.call()).cmp(ether("1")), "fee should be 1");

      //  withdraw 2
      await game.withdrawGamePrizes(1, {
        from: addr_won_2_times
      });
      await time.increase(1);

      // console.log("1: ", (await game.partnerFeeTotalUsed.call()).toString());
      assert.equal(0, (await game.partnerFeeTotalUsed.call()).cmp(ether("2.2")), "fee should be 2.2");
    });

    it("should transfer correct value", async() => {
      let partnerBalanceBefore = new BN(await web3.eth.getBalance(PARTNER));

      await game.createGame(0, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("55")
      });
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT_2,
        value: ether("55")
      });

      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      let partnerBalanceAfter = new BN(await web3.eth.getBalance(PARTNER));
      assert.equal(0, partnerBalanceBefore.add(ether("1.1")).cmp(partnerBalanceAfter), "wrong PARTNER balance after single prize withdraw");
    });

    it("should emit CF_PartnerFeeTransferred", async() => {
      await game.createGame(0, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("50.1")
      });
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT_2,
        value: ether("50.1")
      });

      let winner = (await game.games.call(2)).winner;
      const { logs } = await game.withdrawGamePrizes(1, {
        from: winner
      });

      assert.equal(2, logs.length, "should be 2 events");
      await expectEvent.inLogs(
        logs, 'CF_PartnerFeeTransferred', {
        from: game.address,
        to: PARTNER,
        amount: ether("1.002")
      });
    });
  });
});
