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


contract("finishGame", (accounts) => {
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

    describe("raffleParticipants", () => {
        it("should push CREATOR to raffleParticipants if GameState.Expired", async() => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");
            
            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(1, {
                from: CREATOR
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR], "should include CREATOR after");

            //  2
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
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

            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(2, {
                from: CREATOR_2
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, CREATOR_2], "should include CREATOR, CREATOR_2 after");
        });

        it("should push OPPONENT to raffleParticipants if GameState.Expired", async() => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");
            
            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT], "should include OPPONENT after");

            //  2
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(2, {
                from: OPPONENT_2
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT, OPPONENT_2], "should include OPPONENT, OPPONENT_2 after");
        });

        it("should push CREATOR to raffleParticipants if GameState.Quitted", async() => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");
            await game.quitGame(1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR], "should include CREATOR after");

            //  2
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
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

            await game.quitGame(2, {
                from: OPPONENT_2
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, CREATOR_2], "should include CREATOR, CREATOR_2 after");
        });

        it("should push OPPONENT to raffleParticipants if GameState.Quitted", async() => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");
            
            await game.quitGame(1, {
                from: CREATOR
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT], "should include OPPONENT after");

            //  2
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
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

            assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT, OPPONENT_2], "should include OPPONENT, OPPONENT_2 after");
        });

        it("should add both players if GameState.WinnerPresent", async() => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            
            //  2
            await game.playMove(1, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 2, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");

            //  3
            await game.playMove(1, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "should include CREATOR, OPPONENT after");
        });

        it("should add both players if GameState.Draw", async() => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            
            //  2
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");

            //  3
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR, OPPONENT], "should include CREATOR, OPPONENT after");
        });
    });

    describe("other", () => {
        it("should increase gamesCompletedAmount", async() => {
            //  Expired
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.strictEqual(0, (await game.gamesCompletedAmount.call()).cmp(new BN("0")), "should be 0 before");
            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(1, {
                from: CREATOR
            });
            assert.strictEqual(0, (await game.gamesCompletedAmount.call()).cmp(new BN("1")), "should be 1");
            
            //  Quitted
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
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
            assert.strictEqual(0, (await game.gamesCompletedAmount.call()).cmp(new BN("2")), "should be 2");
            
            //  WinnerPresent
            await time.increase(time.duration.minutes(6));

            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(3, OPPONENT_REFERRAL, 2, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(3, 1, {
                from: OPPONENT_2
            });

            //  2
            await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(3, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.strictEqual(0, (await game.gamesCompletedAmount.call()).cmp(new BN("3")), "should be 3");
            
            //  Draw
            await time.increase(time.duration.minutes(6));

            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(4, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(4, 1, {
                from: OPPONENT_2
            });

            //  2
            await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(4, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.strictEqual(0, (await game.gamesCompletedAmount.call()).cmp(new BN("4")), "should be 4");
        });

        it("should delete ongoingGameAsCreator", async() => {
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

            assert.strictEqual(0, (await game.ongoingGameAsCreator.call(CREATOR)).cmp(new BN("1")), "should be 1");

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.strictEqual(0, (await game.ongoingGameAsCreator.call(CREATOR)).cmp(new BN("0")), "should be 0");
        });

        it("should delete ongoingGameAsOpponent", async() => {
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

            assert.strictEqual(0, (await game.ongoingGameAsOpponent.call(OPPONENT)).cmp(new BN("1")), "should be 1");

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.strictEqual(0, (await game.ongoingGameAsOpponent.call(OPPONENT)).cmp(new BN("0")), "should be 0");
        });

        it("should delete _game.prevMoveTimestamp", async() => {
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

            assert.strictEqual(1, (await game.games.call(1)).prevMoveTimestamp.cmp(new BN("0")), "should be > 0");

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.strictEqual(0, (await game.games.call(1)).prevMoveTimestamp.cmp(new BN("0")), "should be == 0");
        });

        it("should delete _game.nextMover", async() => {
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

            assert.strictEqual((await game.games.call(1)).nextMover, CREATOR, "should be CREATOR");

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.strictEqual((await game.games.call(1)).nextMover, "0x0000000000000000000000000000000000000000", "should be 0x0");
        });

        it("should push CREATOR to gamesWithPendingPrizeWithdrawal if GameState.Expired", async() => {
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "should be empty before");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], "should be empty before");
            
            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(1, {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1")], "should be 1 after");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], "should be empty after");
        });

        it("should push OPPONENT to gamesWithPendingPrizeWithdrawal if GameState.Quitted", async() => {
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "should be empty before");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], "should be empty before");
            await game.quitGame(1, {
                from: CREATOR
            });
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "should be empty after");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1")], "should be 1 after");
        });

        it("should push OPPONENT to gamesWithPendingPrizeWithdrawal if GameState.WinnerPresent", async() => {    
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 2, {
                from: OPPONENT
            });

            //  2
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "should be empty before");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], "should be empty before");

            //  3
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "should be empty after");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1")], "should be 1 after");
        });

        it("should push both players to gamesWithPendingPrizeWithdrawal if GameState.Draw", async() => {    
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            //  2
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "should be empty before");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], "should be empty before");

            //  3
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1")], "should be empty after");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1")], "should be 1 after");

            //  next DRAW
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });

            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT
            });

            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1")], "should be 1 before");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1")], "should be 1 before");

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1"), new BN("2")], "should be 1, 2 after");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1"), new BN("2")], "should be 1, 2 after");

        });

        // it.only("should emit GameFinished event if GameState.Draw", async() => {
        //     //  1
        //     await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        //         from: CREATOR
        //     });
        //     await game.opponentNextMove(1, 1, {
        //         from: OPPONENT
        //     });

        //     //  2
        //     await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        //         from: CREATOR
        //     });
        //     await game.opponentNextMove(1, 1, {
        //         from: OPPONENT
        //     });

            // const {logs} = await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            //     from: CREATOR
            // });

            // assert.strictEqual(1, logs.length, "should be single event");
            // await expectEvent.inLogs(logs, 'RPS_GameFinished', {
            //     id: new BN("1")
            // });
        // });
    });
});