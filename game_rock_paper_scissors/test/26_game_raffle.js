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


contract("GameRaffle", (accounts) => {
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

    describe("getRaffleParticipants", () => {
      it("should uodate raffle participants number", async() => {
        assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be 0 before");

        //  play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "wrong after play");

        //  quit
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("0.1")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("0.1")
        });
        await game.quitGame(2, {
          from: CREATOR_2
        });
        assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT, OPPONENT_2], "wrong after quit");
      });
    });

    describe("updateRaffleActivationParticipantsCount", () => {
      it("should fail if not owner", async() => {
        await expectRevert(game.updateRaffleActivationParticipantsCount([1], {
          from: OTHER
        }), "Ownable: caller is not the owner.");
      });

      it("should fail if 0", async() => {
        await expectRevert(game.updateRaffleActivationParticipantsCount(0, {
          from: OWNER
        }), "Should be > 0");
      });

      it("should update activation count", async() => {
        assert.equal(0, (await game.raffleActivationParticipantsAmount.call()).cmp(new BN("200")), "should be 200 before");

        await game.updateRaffleActivationParticipantsCount([10], {
          from: OWNER
        });

        assert.equal(0, (await game.raffleActivationParticipantsAmount.call()).cmp(new BN("10")), "should be 10 after");
      });
    });

    describe("getRaffleResultCount", () => {
      it("should return correct count", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });
        await game.runRaffle({
          from: OTHER
        })
        assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("1")), "should be 1");

        //  2 - play
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("0.1")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("0.1")
        });
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });
        
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });

        await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR_2
        });
        await game.runRaffle({
          from: OTHER
        })
        assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("2")), "should be 2");
      });
    });

    describe("raffleActivated", () => {
      it("should return raffleActivated if so", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        assert.equal(await game.raffleActivated.call(), false, "should be false before");

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });

        assert.equal(await game.raffleActivated.call(), true, "should be true before 1");
        await game.runRaffle({
          from: OTHER
        })
        assert.equal(await game.raffleActivated.call(), false, "should be false after 1");

        //  2 - play
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("0.1")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("0.1")
        });
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });
        
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });

        await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR_2
        });

        assert.equal(await game.raffleActivated.call(), true, "should be true before 2");
        await game.runRaffle({
          from: OTHER
        })
        assert.equal(await game.raffleActivated.call(), false, "should be false after 2");
      });
    });

    describe("runRaffle", () => {
      it("should fail if Raffle != activated", async() => {
        await expectRevert(game.runRaffle({
          from: OTHER
        }), "Raffle != activated");
      });

      it("should update rafflePrizePending", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });


        let randNum = await game.rand.call(); //  is the same as will be in raffle
        let randWinner_1 = await game.raffleParticipants.call(randNum);
        assert.equal(0, (await game.rafflePrizePending.call(randWinner_1)).cmp(ether("0")), "should be 0 before");
        await game.runRaffle({
          from: OTHER
        })
        assert.equal(0, (await game.rafflePrizePending.call(randWinner_1)).cmp(ether("0.02")), "should be 0.02 after");

        //  2 - play
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("0.1")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("0.1")
        });
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });
        
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });

        await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR_2
        });

        let randNum_2 = await game.rand.call(); //  is the same as will be in raffle
        let randWinner_2 = await game.raffleParticipants.call(randNum_2);
        assert.equal(0, (await game.rafflePrizePending.call(randWinner_2)).cmp(ether("0")), "should be 0 before 1");
        await game.runRaffle({
          from: OTHER
        })
        assert.equal(0, (await game.rafflePrizePending.call(randWinner_2)).cmp(ether("0.002")), "should be 0.002 after 1");
      });

      it("should update rafflePrizesWonTotal", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });

        assert.equal(0, (await game.rafflePrizesWonTotal.call()).cmp(ether("0")), "should be 0 before");
        await game.runRaffle({
          from: OTHER
        })
        assert.equal(0, (await game.rafflePrizesWonTotal.call()).cmp(ether("0.02")), "should be 0.02 after");

        //  2 - play
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("0.1")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("0.1")
        });
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });
        
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });

        await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR_2
        });

        await game.runRaffle({
          from: OTHER
        })
        assert.equal(0, (await game.rafflePrizesWonTotal.call()).cmp(ether("0.022")), "should be 0.022 after 1");
      });
    });

    describe("raffleResults", () => {
      it("should push correct RaffleResult to raffleResults", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });

        assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("0")), "should be 0 before");
        await game.runRaffle({
          from: OTHER
        });
        assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("1")), "should be 1 after");

        //  2 - play
        await game.createGame(CREATOR_REFERRAL, hash, {
          from: CREATOR_2,
          value: ether("0.1")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT_2,
            value: ether("0.1")
        });
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });
        
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT_2
        });

        await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR_2
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR_2
        });

        assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("1")), "should be 1 before 1");
        await game.runRaffle({
          from: OTHER
        });
        assert.equal(0, (await game.getRaffleResultCount.call()).cmp(new BN("2")), "should be 2 after 1");
      });
    });

    describe("other", () => {
      it("should emit RafflePlayed", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });


        let randNum = await game.rand.call(); //  is the same as will be in raffle
        let randWinner_1 = await game.raffleParticipants.call(randNum);
        const {logs} = await game.runRaffle({
          from: OTHER
        });
        assert.equal(1, logs.length, "should be single event");
        await expectEvent.inLogs(logs, 'RPS_RafflePlayed', {
          winner: randWinner_1,
          prize: ether("0.02")
        });
      });

      it("should delete ongoinRafflePrize", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });

        assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ether("0.02")), "wrong ongoinRafflePrize before");
        await game.runRaffle({
          from: OTHER
        });
        assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ether("0")), "wrong ongoinRafflePrize after");
      });

      it("should delete raffleParticipants", async() => {
        await game.updateRaffleActivationParticipantsCount(2, {
          from: OWNER
        });

        //  1 - play
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
          from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });
        
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 1, {
            from: OPPONENT
        });

        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        await game.withdrawGamePrizes(1, {
          from: CREATOR
        });
        await game.withdrawGamePrizes(1, {
          from: OPPONENT
        });

       assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "wrong getRaffleParticipants before");
        await game.runRaffle({
          from: OTHER
        });
        assert.deepEqual(await game.getRaffleParticipants.call(), [], "wrong getRaffleParticipants before");        
      });
    });
});

