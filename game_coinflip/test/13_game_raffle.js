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
  expect, assert
} = require('chai');



contract("Game Raffle", (accounts) => {
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
    await game.joinGame(1, OPPONENT_COIN_SIDE, OPPONENT_REFERRAL, {
      from: OPPONENT,
      value: ether("1", ether)
    });
    await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
      from: CREATOR
    });

    await time.increase(1);
  });

  describe("GameRaffle", () => {
    it("should return correct amount for getRaffleParticipants", async () => {
      await game.updateRaffleActivationParticipantsCount(4);
      let participants = await game.getRaffleParticipants.call();
      assert.equal(participants.length, 2, "wrong participants amount, should be 2");
      assert.equal(participants[0], CREATOR, "shhould be CREATOR");
      assert.equal(participants[1], OPPONENT, "shhould be OPPONENT");

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      participants = await game.getRaffleParticipants.call();
      assert.equal(participants.length, 4, "wrong participants amount, should be 4");
      assert.equal(participants[0], CREATOR, "shhould be CREATOR");
      assert.equal(participants[1], OPPONENT, "shhould be OPPONENT");
      assert.equal(participants[2], CREATOR_2, "shhould be CREATOR_2");
      assert.equal(participants[3], OPPONENT_2, "shhould be OPPONENT_2");
    });

    it("should fail to updateRaffleActivationParticipantsCount if not OWNER", async () => {
      assert.equal(0, (await game.raffleActivationParticipantsAmount.call()).cmp(new BN("200")), "should be 200");
      await expectRevert(game.updateRaffleActivationParticipantsCount(10, {
        from: OTHER
      }), "Ownable: caller is not the owner");
    });

    it("should fail to updateRaffleActivationParticipantsCount if _amount is 0", async () => {
      assert.equal(0, (await game.raffleActivationParticipantsAmount.call()).cmp(new BN("200")), "should be 200");
      await expectRevert(game.updateRaffleActivationParticipantsCount(0, {
        from: OWNER
      }), "Should be > 0");
    });
    
    it("should update updateRaffleActivationParticipantsCount", async () => {
      assert.equal(0, (await game.raffleActivationParticipantsAmount.call()).cmp(new BN("200")), "should be 200");
      await game.updateRaffleActivationParticipantsCount(10, {
        from: OWNER
      });
      assert.equal(0, (await game.raffleActivationParticipantsAmount.call()).cmp(new BN("10")), "should be 10");
    });

    it("should return correct amount for getRaffleResultCount", async() => {
      await game.updateRaffleActivationParticipantsCount(2, {
        from: OWNER
      });

      let winner = (await game.games.call(1)).winner;
      await game.withdrawGamePrizes(1, {
        from: winner
      });

      await time.increase(1);
      await game.runRaffle({
        from: OTHER
      });
      assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("1")), "should be 1");

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });
      
      winner = (await game.games.call(2)).winner;
      await game.withdrawGamePrizes(1, {
        from: winner
      });

      await time.increase(1);
      await game.runRaffle({
        from: OTHER
      });
      assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("2")), "should be 2");
    });

    it("should show raffle is activated - raffleActivated", async () => {
      await game.updateRaffleActivationParticipantsCount(4);
      //  withdraw 1
      let winner = (await game.games.call(1)).winner;
      await game.withdrawGamePrizes(1, {
        from: winner
      });

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      await time.increase(1);

      assert.isTrue(await game.raffleActivated.call(), "should be activated");
    });

    it("should show raffle is not activated - raffleActivated", async () => {
      //  withdraw
      let winner = (await game.games.call(1)).winner;
      await game.withdrawGamePrizes(1, {
        from: winner
      });

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      assert.isFalse(await game.raffleActivated.call(), "should not be activated");
    });
  });

  describe("runRaffle", () => {
    it("should fail if Raffle != activated", async () => {
      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      await time.increase(2);

      await expectRevert(game.runRaffle(), "Raffle != activated");
    });

    it("should update rafflePrizePending", async() => {
      await game.updateRaffleActivationParticipantsCount(2);

      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      let raffleWinner_1 = (await game.getRaffleParticipants.call())[await game.rand.call()];
      assert.equal(0, (await game.rafflePrizePending.call(raffleWinner_1)).cmp(ether("0")), "should be 0 before");

      await game.runRaffle({
        from: OTHER
      });

      assert.equal(0, (await game.rafflePrizePending.call(raffleWinner_1)).cmp(ether("0.01")), "should be 0.01 after");
    });

    it("should update rafflePrizesWonTotal", async () => {
      await game.updateRaffleActivationParticipantsCount(4);
      
      let rafflePrizesWonTotalBefore = await game.rafflePrizesWonTotal.call();
      
      // withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      await time.increase(1);

      //  2 
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      await time.increase(1);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      let ongoinRafflePrize = await game.ongoinRafflePrize.call();
      assert.equal(0, ongoinRafflePrize.cmp(ether("0.03")), "wrong ongoinRafflePrize");

      //  3
      await game.runRaffle();

      let rafflePrizesWonTotalAfter = await game.rafflePrizesWonTotal.call();
      assert.equal(0, rafflePrizesWonTotalAfter.sub(rafflePrizesWonTotalBefore).cmp(ongoinRafflePrize), "wrong rafflePrizesWonTotalAfter");
    });

    it("should add new RaffleResult to raffleResults", async () => {
      await game.updateRaffleActivationParticipantsCount(2);
      
      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      assert.equal((await game.getRaffleResultCount.call()).toNumber(), 0, "raffleResults amount should be == 0");

      await time.increase(1);
      let randNum = await game.rand.call(); //  is the same as will be in raffle
      let randWinner = await game.raffleParticipants.call(randNum);

      // console.log(await game.getRaffleParticipants.call());
      await game.runRaffle();
      // console.log((await game.raffleResults.call(0)).winner);
      assert.equal((await game.getRaffleResultCount.call()).toNumber(), 1, "raffleResults amount should be == 1");
      assert.equal((await game.raffleResults.call(0)).winner, randWinner, "wrong raffle winner");


      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("0.1")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("0.1")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      await time.increase(1);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      await time.increase(2);

      assert.equal((await game.getRaffleResultCount.call()).toNumber(), 1, "raffleResults amount should still be == 1 before 1");

      await time.increase(time.duration.seconds(1));
      randNum = await game.rand.call(); //  is the same as will be in raffle
      randWinner = await game.raffleParticipants.call(randNum);

      // console.log(await game.getRaffleParticipants.call());
      await game.runRaffle();
      // console.log((await game.raffleResults.call(0)).winner);
      // console.log((await game.raffleResults.call(1)).winner);
      assert.equal((await game.getRaffleResultCount.call()).toNumber(), 2, "raffleResults amount should be == 2 after 1");
      assert.equal((await game.raffleResults.call(1)).winner, randWinner, "wrong raffle winner after 1");
    });

    it("should emit CF_RafflePlayed", async () => {
      await game.updateRaffleActivationParticipantsCount(4);
      
      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      await time.increase(2);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      await time.increase(1);
      
      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      let randNum = await game.rand.call(); //  is the same as will be in raffle
      let randWinner = await game.raffleParticipants.call(randNum);
      let ongoinRafflePrize = await game.ongoinRafflePrize.call();

      // event RafflePlayed(address indexed winner, uint256 indexed prize);
      const { logs } = await game.runRaffle();
      assert.equal(1, logs.length, "should be 1 event");
      await expectEvent.inLogs(
        logs, 'CF_RafflePlayed', {
        winner: randWinner,
        prize: ongoinRafflePrize
      });
    });

    it("should clear ongoinRafflePrize", async () => {
      await game.updateRaffleActivationParticipantsCount(4);
      
      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      await time.increase(1);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      await time.increase(1);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      assert.equal(1, (await game.ongoinRafflePrize.call()).cmp(new BN("0")), "ongoinRafflePrize should be > 0");
      await game.runRaffle();
      assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(new BN("0")), "ongoinRafflePrize should be == 0");
    });

    it("should clear raffleParticipants", async () => {
      await game.updateRaffleActivationParticipantsCount(4);
      
      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      await time.increase(1);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      await time.increase(1);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      assert.equal(0, new BN((await game.getRaffleParticipants.call()).length).cmp(new BN("4")), "raffleParticipants should be 4");
      await game.runRaffle();
      assert.equal(0, new BN((await game.getRaffleParticipants.call()).length).cmp(new BN("0")), "raffleParticipants should be == 0");
    });

    it("should return number in correct range - rand", async() => {
      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });

      assert.equal(-1, (await game.rand.call()).cmp(new BN("2")), "should be < 1");
      await time.increase(2);
      assert.equal(-1, (await game.rand.call()).cmp(new BN("2")), "should be < 1");
      await time.increase(2);
      assert.equal(-1, (await game.rand.call()).cmp(new BN("2")), "should be < 1");
      await time.increase(2);
      assert.equal(-1, (await game.rand.call()).cmp(new BN("2")), "should be < 1");


      await time.increase(2);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2")
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2")
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      assert.equal(-1, (await game.rand.call()).cmp(new BN("4")), "should be < 1");
      await time.increase(2);
      assert.equal(-1, (await game.rand.call()).cmp(new BN("4")), "should be < 1");
      await time.increase(2);
      assert.equal(-1, (await game.rand.call()).cmp(new BN("4")), "should be < 1");
      await time.increase(2);
      assert.equal(-1, (await game.rand.call()).cmp(new BN("4")), "should be < 1");
    });
  });

  describe("withdrawRafflePrizes", () => {
    it("should fail if no raffle prize for sender", async() => {
      await expectRevert(game.withdrawRafflePrizes({
        from: OTHER
      }), "No raffle prize");
    });

    it("should delete rafflePrizePending[msg.sender]", async () => {
      await game.updateRaffleActivationParticipantsCount(4);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });
      await time.increase(1);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2", ether)
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });
      await time.increase(1);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      //  3
      let randNum = await game.rand.call(); //  is the same as will be in raffle
      let randWinner = await game.raffleParticipants.call(randNum);
      await game.runRaffle();
      await time.increase(1);

      assert.equal(0, (await game.rafflePrizePending.call(randWinner)).cmp(ether("0.03")), "rafflePrizePending[msg.sender] should be > 0.03 eth");

      await time.increase(2);
      await game.withdrawRafflePrizes({
        from: randWinner
      });

      assert.equal(0, (await game.rafflePrizePending.call(randWinner)).cmp(new BN("0")), "should delete rafflePrizePending[msg.sender]");
    });

    it("should increse rafflePrizeWithdrawn for winner", async() => {
      await game.updateRaffleActivationParticipantsCount(4);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });
      await time.increase(1);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2", ether)
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });
      await time.increase(1);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      //  3
      await time.increase(1);
      let ongoinRafflePrize = await game.ongoinRafflePrize.call();
      let randNum = await game.rand.call(); //  is the same as will be in raffle
      let randWinner = await game.raffleParticipants.call(randNum);
      await game.runRaffle();

      let rafflePrizeWithdrawnBefore = await game.rafflePrizeWithdrawn.call(randWinner);
      
      await game.withdrawRafflePrizes({
        from: randWinner
      });

      let rafflePrizeWithdrawnAfter = await game.rafflePrizeWithdrawn.call(randWinner);
      assert.equal(0, rafflePrizeWithdrawnAfter.sub(rafflePrizeWithdrawnBefore).cmp(ongoinRafflePrize), "wrong rafflePrizeWithdrawn after raffle");
    });

    it("should transfer correct prize to raffle winner", async () => {
      await game.updateRaffleActivationParticipantsCount(4);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });
      await time.increase(1);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2", ether)
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });
      await time.increase(1);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      let randNum = await game.rand.call(); //  is the same as will be in raffle
      let randWinner = await game.raffleParticipants.call(randNum);
      await game.runRaffle();

      await time.increase(2);
      let randWinnerBalanceBefore = new BN(await web3.eth.getBalance(randWinner));

      let tx = await game.withdrawRafflePrizes({
        from: randWinner
      });
      let gasUsed = new BN(tx.receipt.gasUsed);
      let txInfo = await web3.eth.getTransaction(tx.tx);
      let gasPrice = new BN(txInfo.gasPrice);
      let gasSpent = gasUsed.mul(gasPrice);
      let randWinnerBalanceAfter = new BN(await web3.eth.getBalance(randWinner));
      assert.equal(0, randWinnerBalanceBefore.sub(gasSpent).add(ether("0.03")).cmp(randWinnerBalanceAfter), "wrong prize transferred");
    });

    it("should emit CF_RafflePrizeWithdrawn event", async() => {
      await game.updateRaffleActivationParticipantsCount(4);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(1)).winner
      });
      await time.increase(2);

      //  2
      await game.createGame(ownerHash, CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("2", ether)
      });
      await game.joinGame(2, OPPONENT_COIN_SIDE, OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("2", ether)
      });
      await game.playGame(2, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR_2
      });
      await time.increase(2);

      //  withdraw
      await game.withdrawGamePrizes(1, {
        from: (await game.games.call(2)).winner
      });

      await time.increase(2);

      let randNum = await game.rand.call(); //  is the same as will be in raffle
      let randWinner = await game.raffleParticipants.call(randNum);
      await game.runRaffle();

      await time.increase(2);

      const { logs } = await game.withdrawRafflePrizes({
        from: randWinner
      });
      assert.equal(1, logs.length, "should be 1 event");
      await expectEvent.inLogs(
        logs, 'CF_RafflePrizeWithdrawn', {
        winner: randWinner
      });
    });
  });
});