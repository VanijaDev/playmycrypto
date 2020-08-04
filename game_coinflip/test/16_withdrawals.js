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


contract("Withdrawals", (accounts) => {
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
  const OPPONENT_COIN_SIDE = 0;
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

  describe("withdrawGamePrizes", () => {
    let addr_won_2_times;

    beforeEach("setup", async() => {
      // play 3 games, so there will be 2 + 1 win for players
      
      //  1
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      //  2
      await time.increase(1);
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.2", ether)
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.2", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      //  3
      await time.increase(1);
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.3", ether)
      });
      await game.joinGame(3, 1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.3", ether)
      });
      await game.playGame(3, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      addr_won_2_times = ((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length > 1) ? CREATOR : OPPONENT;
    });

    it("should fail if _maxLoop == 0", async() => {
      await expectRevert(game.withdrawGamePrizes(0, {from: OPPONENT}), "_maxLoop == 0");
    });

    it("should fail if no pending", async() => {
      await expectRevert(game.withdrawGamePrizes(10, {from: OTHER}), "no pending");
    });

    it("should fail if _maxLoop too big", async() => {
      if ((new BN(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR))).cmp(new BN("0")) == 1) {
        await expectRevert(game.withdrawGamePrizes(10, {from: CREATOR}), "_maxLoop too big");
      }

      if ((new BN(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT))).cmp(new BN("0")) == 1) {
        await expectRevert(game.withdrawGamePrizes(10, {from: OPPONENT}), "_maxLoop too big");
      }
    });

    it("should calculate correct referralFeesPending", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);
      let won_2_referral = (addr_won_2_times == CREATOR) ? CREATOR_REFERRAL : OPPONENT_REFERRAL;
      // console.log(won_2_referral);

      let referralTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        // console.log("gameId: ", gameId.toString(), "gamePrize: ", gamePrize.toString());
        referralTotal = referralTotal.add(gamePrize.div(new BN("100")));
        // console.log("referralTotal        : ", referralTotal.toString());
      }

      // won_2_referral
      assert.equal(0, (await game.referralFeesPending.call(won_2_referral)).cmp(ether("0")), "should be 0 before - won_2_referral");
      await game.withdrawGamePrizes(won_2_ids.length, {from: addr_won_2_times});
      assert.equal(0, (await game.referralFeesPending.call(won_2_referral)).cmp(referralTotal), "wrong won_2_referral amount after");
    });

    it("should increase totalUsedReferralFees", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);

      let referralTotal = new BN("0");
      won_2_ids.reverse();
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        let referralAmount = gamePrize.div(new BN("100"));
        // console.log("gameId: ", gameId.toString(), "referralAmount: ", referralAmount.toString());
        referralTotal = referralTotal.add(referralAmount);
        
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        // console.log("totalUsedReferralFees:     ",(await game.totalUsedReferralFees.call()).toString());
        assert.equal(0, (await game.totalUsedReferralFees.call()).sub(referralTotal).cmp(new BN("0")), "wrong referralTotal");
      }
    });

    it("should pop last game from gamesWithPendingPrizeWithdrawalForAddress", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      await game.withdrawGamePrizes(1, {from: addr_won_2_times});
      won_2_ids.pop();
      assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times), won_2_ids, "wrong pending after");
    });

    it("should pop 2 last games from gamesWithPendingPrizeWithdrawalForAddress", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);
      await game.withdrawGamePrizes(2, {from: addr_won_2_times});
      won_2_ids.pop();
      won_2_ids.pop();
      // console.log(won_2_ids);
      assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times), won_2_ids, "wrong pending after");
    });

    it("should increase addressPrizeTotal with correct amount", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);
      won_2_ids.reverse();
      let prizeTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        prizeTotal = prizeTotal.add(gamePrize);
        // console.log("prizeTotal:        ", prizeTotal.toString());
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        // console.log("addressPrizeTotal: ", (await game.addressPrizeTotal.call(addr_won_2_times)).toString());
        assert.equal(0, (await game.addressPrizeTotal.call(addr_won_2_times)).cmp(prizeTotal), "wrong addressPrizeTotal amount after");
      }
    });

    it("should calculate correct partnerFeePending after 1 withdrawal", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      let patnerFeeTotalPending = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        patnerFeeTotalPending = patnerFeeTotalPending.add(gamePrize.div(new BN("100")));
        // console.log("patnerFeeTotalPending:        ", patnerFeeTotalPending.toString());
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        // console.log("partnerFeePending:            ", (await game.partnerFeePending.call()).toString());
        assert.equal(0, (await game.partnerFeePending.call()).cmp(patnerFeeTotalPending), "wrong patnerFeeTotalPending amount after");
      }  
    });

    it("should calculate correct partnerFeePending after multiple withdrawals", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      // console.log(won_2_ids);
      await game.withdrawGamePrizes(won_2_ids.length, {from: addr_won_2_times});
      
      let patnerFeeTotalPending = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        patnerFeeTotalPending = patnerFeeTotalPending.add(gamePrize.div(new BN("100")));
        // console.log("patnerFeeTotalPending:        ", patnerFeeTotalPending.toString());
      }  
      // console.log("partnerFeePending:            ", (await game.partnerFeePending.call()).toString());
      assert.equal(0, (await game.partnerFeePending.call()).cmp(patnerFeeTotalPending), "wrong patnerFeeTotalPending amount after");
    });

    it("should calculate correct ongoinRafflePrize after 1 withdrawal", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      let ongoinRafflePrizeTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        ongoinRafflePrizeTotal = ongoinRafflePrizeTotal.add(gamePrize.div(new BN("100")));
        // console.log("ongoinRafflePrizeTotal:        ", ongoinRafflePrizeTotal.toString());
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        // console.log("ongoinRafflePrize:            ", (await game.ongoinRafflePrize.call()).toString());
        assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ongoinRafflePrizeTotal), "wrong ongoinRafflePrizeTotal amount after");
      } 
    });

    it("should calculate correct ongoinRafflePrize after multiple withdrawals", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      // console.log(won_2_ids);
      await game.withdrawGamePrizes(won_2_ids.length, {from: addr_won_2_times});
      
      let ongoinRafflePrizeTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        ongoinRafflePrizeTotal = ongoinRafflePrizeTotal.add(gamePrize.div(new BN("100")));
        // console.log("ongoinRafflePrizeTotal:        ", ongoinRafflePrizeTotal.toString());
      }  
      // console.log("ongoinRafflePrize:            ", (await game.ongoinRafflePrize.call()).toString());
      assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ongoinRafflePrizeTotal), "wrong ongoinRafflePrizeTotal amount after");
    });

    it("should calculate correct devFeePending after single withdrawal", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      // console.log(won_2_ids);
      let devFeePendingTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        devFeePendingTotal = devFeePendingTotal.add(gamePrize.div(new BN("100")));
        // console.log("devFeePendingTotal:        ", devFeePendingTotal.toString());
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        // console.log("devFeePending:            ", (await game.devFeePending.call()).toString());
        assert.equal(0, (await game.devFeePending.call()).cmp(devFeePendingTotal), "wrong devFeePendingTotal amount after");
      }
    });

    it("should calculate correct devFeePending after multiple withdrawal", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);
      await game.withdrawGamePrizes(won_2_ids.length, {from: addr_won_2_times});
      
      let devFeePendingTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        devFeePendingTotal = devFeePendingTotal.add(gamePrize.div(new BN("100")));
      }  
      // console.log("devFeePending:             ", (await game.devFeePending.call()).toString());
      assert.equal(0, (await game.devFeePending.call()).cmp(devFeePendingTotal), "wrong devFeePendingTotal amount after");
    });

    it("should increase BeneficiarFee after single withdrawal", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      // console.log(won_2_ids);
      let beneficiarFeePendingTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        beneficiarFeePendingTotal = beneficiarFeePendingTotal.add(gamePrize.div(new BN("100")));
        // console.log("beneficiarFeePendingTotal:        ", beneficiarFeePendingTotal.toString());
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        // console.log("devFeePending:            ", (await game.devFeePending.call()).toString());
        assert.equal(0, (await game.feeBeneficiarBalances.call(OWNER)).cmp(beneficiarFeePendingTotal), "wrong beneficiarFeePendingTotal amount after");
      }
    });

    it("should increase BeneficiarFee after multiple withdrawal", async() => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);
      await game.withdrawGamePrizes(won_2_ids.length, {from: addr_won_2_times});
      
      let beneficiarFeePendingTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        beneficiarFeePendingTotal = beneficiarFeePendingTotal.add(gamePrize.div(new BN("100")));
      }  
      // console.log("beneficiarFeePendingTotal:             ", (await game.beneficiarFeePendingTotal.call()).toString());
      assert.equal(0, (await game.devFeePending.call()).cmp(beneficiarFeePendingTotal), "wrong beneficiarFeePendingTotal amount after");
    });

    it("should transfer correct prizeTotal after single withdrawal", async() => {
      let addr_won_2_times_before = new BN(await web3.eth.getBalance(addr_won_2_times));
      
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);

      let gamePrize = (await game.games.call(won_2_ids[won_2_ids.length-1])).bet.mul(new BN("95")).div(new BN("100"));

      let tx = await game.withdrawGamePrizes(1, {from: addr_won_2_times});
      gasUsed = new BN(tx.receipt.gasUsed);
      txInfo = await web3.eth.getTransaction(tx.tx);
      gasPrice = new BN(txInfo.gasPrice);
      gasSpent = gasUsed.mul(gasPrice);

      let addr_won_2_times_after = new BN(await web3.eth.getBalance(addr_won_2_times));
      assert.equal(0, addr_won_2_times_before.add(gamePrize).sub(gasSpent).cmp(addr_won_2_times_after), "wrong addr_won_2_times_after");
    });

    it("should transfer correct prizeTotal after multiple withdrawals", async() => {
      let addr_won_2_times_before = new BN(await web3.eth.getBalance(addr_won_2_times));

      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      // console.log(won_2_ids);

      let gamePrizeTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet.mul(new BN("95")).div(new BN("100"));
        gamePrizeTotal = gamePrizeTotal.add(gamePrize);
      }  

      let tx = await game.withdrawGamePrizes(won_2_ids.length, {from: addr_won_2_times});
      gasUsed = new BN(tx.receipt.gasUsed);
      txInfo = await web3.eth.getTransaction(tx.tx);
      gasPrice = new BN(txInfo.gasPrice);
      gasSpent = gasUsed.mul(gasPrice);

      let addr_won_2_times_after = new BN(await web3.eth.getBalance(addr_won_2_times));
      assert.equal(0, addr_won_2_times_before.add(gamePrizeTotal).sub(gasSpent).cmp(addr_won_2_times_after), "wrong addr_won_2_times_after");
    });

    it("should not transferPartnerFee if < than threshold", async() => {
      let PARTNER_total_before = new BN(await web3.eth.getBalance(PARTNER));
         
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      // console.log(won_2_ids);
      let partnerTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        let gameId = new BN(won_2_ids[i]);
        let gamePrize = (await game.games.call(gameId)).bet;
        partnerTotal = partnerTotal.add(gamePrize.div(new BN("100")));
        // console.log("partnerTotal:        ", partnerTotal.toString());
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        // console.log("devFeePending:            ", (await game.devFeePending.call()).toString());
        let PARTNER_total_after = new BN(await web3.eth.getBalance(PARTNER));
        assert.equal(0, PARTNER_total_before.cmp(PARTNER_total_after), "wrong PARTNER_total_after");
      }
    });

    it("should not transferPartnerFee if > than threshold", async() => {
      let PARTNER_total_before = new BN(await web3.eth.getBalance(PARTNER));
         
      await time.increase(time.duration.minutes(1));
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("100.2", ether)
      });
      await game.joinGame(4, 1, OPPONENT_REFERRAL, {
        from: OPPONENT_2,
        value: ether("100.2", ether)
      });
      await game.playGame(4, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(4)).winner
      });

      let PARTNER_total_after = new BN(await web3.eth.getBalance(PARTNER));
      assert.equal(0, PARTNER_total_after.sub(PARTNER_total_before).cmp(ether("1.002")), "wrong PARTNER_total_after");
    });

    it("should emit CF_GamePrizesWithdrawn with correct params", async() => {
      let winner = (await game.games.call(3)).winner;
      const { logs } = await game.withdrawGamePrizes(1, {from: winner});

      assert.equal(1, logs.length, "should be single event");
      await expectEvent.inLogs(logs, 'CF_GamePrizesWithdrawn', {
        player: winner
      });
    });
  });

  describe("withdrawReferralFees", () => {
    let addr_won_2_times;

    beforeEach("setup", async() => {
      // play 3 games, so there will be 2 + 1 win for players
      
      //  1
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      //  2
      await time.increase(1);
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.2", ether)
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.2", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      //  3
      await time.increase(1);
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.3", ether)
      });
      await game.joinGame(3, 1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.3", ether)
      });
      await game.playGame(3, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      addr_won_2_times = ((await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR)).length > 1) ? CREATOR : OPPONENT;
    });

    it("should fail if No referral fee", async () => {
      await expectRevert(game.withdrawReferralFees({
        from: CREATOR_2_REFERRAL
      }), "No referral fee");
    });

    it("should clear referralFeesPending[msg.sender]", async () => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();
      // console.log(won_2_ids);

      const referral = (addr_won_2_times == CREATOR) ? CREATOR_REFERRAL : OPPONENT_REFERRAL;

      for (let i = 0; i < won_2_ids.length; i ++) {
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});

        assert.equal(1, (await game.referralFeesPending.call(referral)).cmp(new BN("0")), "referralFeesPending should be > 0 before");
        await game.withdrawReferralFees({
          from: referral
        });
        // console.log((await game.referralFeesPending.call(referral)).toString());
        assert.equal(0, (await game.referralFeesPending.call(referral)).cmp(new BN("0")), "referralFeesPending should be == 0 after");
      }
    });

    it("should increase referralFeesWithdrawn[msg.sender]", async () => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();

      const referral = (addr_won_2_times == CREATOR) ? CREATOR_REFERRAL : OPPONENT_REFERRAL;

      let referralFeesWithdrawnTotal = new BN("0");
      for (let i = 0; i < won_2_ids.length; i ++) {
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        referralFeesWithdrawnTotal = referralFeesWithdrawnTotal.add(await game.referralFeesPending.call(referral));
        await game.withdrawReferralFees({
          from: referral
        });
        assert.equal(0, (await game.referralFeesWithdrawn.call(referral)).cmp(referralFeesWithdrawnTotal), "wrong referralFeesWithdrawnTotal amount after");
      }
    });

    it("should transfer referral fee after single prize", async () => {
      let won_2_ids = await game.getGamesWithPendingPrizeWithdrawal.call(addr_won_2_times);
      won_2_ids.reverse();

      const referral = (addr_won_2_times == CREATOR) ? CREATOR_REFERRAL : OPPONENT_REFERRAL;

      for (let i = 0; i < won_2_ids.length; i ++) {
        await game.withdrawGamePrizes(1, {from: addr_won_2_times});
        
        const referralFee = await game.referralFeesPending.call(referral);

        //  referral balance before
        let refBalanceBefore = new BN(await web3.eth.getBalance(referral));
        // console.log(refBalanceBefore.toString());

        //  withdraw referral
        let tx = await game.withdrawReferralFees({
          from: referral
        });

        let gasUsed = new BN(tx.receipt.gasUsed);
        let txInfo = await web3.eth.getTransaction(tx.tx);
        let gasPrice = new BN(txInfo.gasPrice);
        let gasSpent = gasUsed.mul(gasPrice);

        let refBalanceAfter = new BN(await web3.eth.getBalance(referral));
        // console.log(refBalanceAfter.toString());

        assert.equal(0, refBalanceAfter.add(gasSpent).sub(referralFee).cmp(refBalanceBefore), "wrong balance after referral withdrawal");
      }
    });

    it("should emit CF_GameReferralWithdrawn event", async () => {
      let winner = (await game.games.call(3)).winner;
      await game.withdrawGamePrizes(1, {from: winner});

      const referral = (winner == CREATOR) ? CREATOR_REFERRAL : OPPONENT_REFERRAL;

      const { logs } = await game.withdrawReferralFees({
        from: referral
      });
      assert.equal(1, logs.length, "should be single event");
      await expectEvent.inLogs(logs, 'CF_GameReferralWithdrawn', {
        referral: referral
      });
    });
  });

  describe("withdrawDevFee", () => {
    it("should fail if not OWNER", async () => {
      await expectRevert(game.withdrawDevFee({
        from: OTHER
      }), "Ownable: caller is not the owner");
    });

    it("should fail if No dev fee", async () => {
      await expectRevert(game.withdrawDevFee({
        from: OWNER
      }), "No dev fee");
    });

    it("should clear devFeePending", async () => {
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      let winner = (await game.games.call(1)).winner;
      await game.withdrawGamePrizes(1, {
        from: winner
      });

      //  withdraw dev fee
      assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.01")), "dev fee should be == 0.01 ether before");
      await game.withdrawDevFee({
        from: OWNER
      });
      assert.equal(0, (await game.devFeePending.call()).cmp(ether("0")), "dev fee should be == 0 ether after");
    });

    it("should transfer devFeePending", async () => {
      await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      //  withdraw
      let winner = (await game.games.call(1)).winner;
      await game.withdrawGamePrizes(1, {
        from: winner
      });

      //  withdraw dev fee
      const devBalanceBefore = new BN(await web3.eth.getBalance(OWNER));
      // console.log("devBalanceBefore: ", devBalanceBefore.toString());
      const devFeePending = await game.devFeePending.call();
      let tx = await game.withdrawDevFee({
        from: OWNER
      });
      let gasUsed = new BN(tx.receipt.gasUsed);
      let txInfo = await web3.eth.getTransaction(tx.tx);
      let gasPrice = new BN(txInfo.gasPrice);
      let gasSpent = gasUsed.mul(gasPrice);

      const devBalanceAfter = new BN(await web3.eth.getBalance(OWNER));
      // console.log("devBalanceAfter : ", devBalanceAfter.toString());
      assert.equal(0, devBalanceBefore.add(devFeePending).sub(gasSpent).cmp(devBalanceAfter), "wrong dev fee after");
    });
  });
});