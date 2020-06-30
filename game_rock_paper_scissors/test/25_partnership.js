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

var assert = require('assert');


contract("Partnership", (accounts) => {
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

      //  create game & join
      await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR,
          value: ether("1")
      });
      await game.joinGame(1, OPPONENT_REFERRAL, 1, {
          from: OPPONENT,
          value: ether("1")
      });
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
        await expectRevert(game.updatePartner("0x0000000000000000000000000000000000000000"), "Cannt be 0x0");
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
  
        // Quit
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("50.33")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("50.33")
        });
        
        await game.quitGame(2, {
            from: OPPONENT_2
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
        // Quit
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("50.33")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("50.33")
        });
        
        await game.quitGame(2, {
            from: OPPONENT_2
        });
  
        //  2
        // Quit
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("52.33")
        });
        await game.joinGame(3, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("52.33")
        });
        
        await game.quitGame(3, {
            from: CREATOR_2
        });
  
        //  withdraw 1
        await game.withdrawGamePrizes(1, {
          from: CREATOR_2
        });
        await time.increase(1);
  
        // console.log("1: ", (await game.partnerFeeTotalUsed.call()).toString());
        assert.equal(0, (await game.partnerFeeTotalUsed.call()).cmp(ether("1.0066")), "fee should be 1.0066");

        //  withdraw 2
        await game.withdrawGamePrizes(1, {
          from: OPPONENT_2
        });
        await time.increase(1);
  
        // console.log("1: ", (await game.partnerFeeTotalUsed.call()).toString());
        assert.equal(0, (await game.partnerFeeTotalUsed.call()).cmp(ether("2.0532")), "fee should be 2.0532");
      });
  
      it("should transfer correct value", async() => {
        let partnerBalanceBefore = new BN(await web3.eth.getBalance(PARTNER));
  
        // Quit
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("52.33")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("52.33")
        });
        
        await game.quitGame(2, {
            from: CREATOR_2
        });
  
        await game.withdrawGamePrizes(1, {
          from: OPPONENT_2
        });
  
        let partnerBalanceAfter = new BN(await web3.eth.getBalance(PARTNER));
        assert.equal(0, partnerBalanceBefore.add(ether("1.0466")).cmp(partnerBalanceAfter), "wrong PARTNER balance after single prize withdraw");
      });
  
      it("should emit RPS_PartnerFeeTransferred", async() => {
        // Quit
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("52.33")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("52.33")
        });
        
        await game.quitGame(2, {
            from: CREATOR_2
        });
  
        const { logs } = await game.withdrawGamePrizes(1, {
          from: OPPONENT_2
        });
  
        assert.equal(2, logs.length, "should be 2 events");
        await expectEvent.inLogs(
          logs, 'RPS_PartnerFeeTransferred', {
          from: game.address,
          to: PARTNER,
          amount: ether("1.0466")
        });
      });
    });
  });