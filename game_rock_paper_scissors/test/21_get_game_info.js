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


contract("Get Game Info", (accounts) => {
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

        await game.createGame(CREATOR_REFERRAL, hash, {
            from: CREATOR,
            value: ether("1")
        });
        await game.joinGame(1, OPPONENT_REFERRAL, 1, {
            from: OPPONENT,
            value: ether("1")
        });
    });

    describe("showRowMoves", () => {
        it("should return correct moves after each move", async () => {
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[0].cmp(new BN("0")), "wrong CREATOR move (1, 0) after join");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 0) after join");

            // 1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[0].cmp(new BN("1")), "wrong CREATOR move (1, 0) after playMove 1");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 0) after playMove 1");

            //  2
            await game.opponentNextMove(1, 3, {
                from: OPPONENT
            });
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[0].cmp(new BN("1")), "wrong CREATOR move (1, 0) after OPPONENT move 2");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 0) after OPPONENT move 2");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[0].cmp(new BN("0")), "wrong CREATOR move (1, 1) after OPPONENT move 2");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[1].cmp(new BN("3")), "wrong OPPONENT move (1, 1) after OPPONENT move 2");

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[0].cmp(new BN("1")), "wrong CREATOR move (1, 0) after playMove 2");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 0) after playMove 2");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[0].cmp(new BN("1")), "wrong CREATOR move (1, 1) after playMove 2");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[1].cmp(new BN("3")), "wrong OPPONENT move (1, 1) after playMove 2");

            //  3
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[0].cmp(new BN("1")), "wrong CREATOR move (1, 0) after OPPONENT move 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 0) after OPPONENT move 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[0].cmp(new BN("1")), "wrong CREATOR move (1, 1) after OPPONENT move 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[1].cmp(new BN("3")), "wrong OPPONENT move (1, 1) after OPPONENT move 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 2))[0].cmp(new BN("0")), "wrong CREATOR move (1, 1) after OPPONENT move 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 2))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 1) after OPPONENT move 3");

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[0].cmp(new BN("1")), "wrong CREATOR move (1, 0) after playMove 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 0))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 0) after playMove 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[0].cmp(new BN("1")), "wrong CREATOR move (1, 1) after playMove 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 1))[1].cmp(new BN("3")), "wrong OPPONENT move (1, 1) after playMove 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 2))[0].cmp(new BN("1")), "wrong CREATOR move (1, 2) after playMove 3");
            assert.strictEqual(0, (await game.showRowMoves.call(1, 2))[1].cmp(new BN("1")), "wrong OPPONENT move (1, 2) after playMove 3");
        });
    });

    describe("getCreatorMoveHashesForGame", () => {
        it("should return correct hash after each move", async () => {
            assert.deepEqual(await game.getCreatorMoveHashesForGame.call(1),
                [hash,
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                ], "wrong hashes after creation");

            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.deepEqual(await game.getCreatorMoveHashesForGame.call(1),
                [hash,
                    web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)),
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                ], "wrong hashes after playMove 1");

            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            //  2
            await game.playMove(1, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.deepEqual(await game.getCreatorMoveHashesForGame.call(1),
                [hash,
                    web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)),
                    web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED))
                ], "wrong hashes after playMove 2");

            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            //  3
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(100, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.deepEqual(await game.getCreatorMoveHashesForGame.call(1),
                [hash,
                    web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)),
                    web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED))
                ], "wrong hashes after playMove 3");
        });
    });

    describe("gameWithdrawalInfo", () => {
        it("should return true for PrizeWithdrawn", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await game.opponentNextMove(1, 3, {
                from: OPPONENT
            });
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  3
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            await game.withdrawGamePrizes(1, {
                from: CREATOR
            });
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[0], true, "should be true PrizeWithdrawn");
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[1], false, "should be false drawWithdrawnCreator");
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[2], false, "should be false drawWithdrawnOpponent");
        });

        it("should return true for drawWithdrawnCreator", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  3
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            await game.withdrawGamePrizes(1, {
                from: CREATOR
            });
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[0], false, "should be false PrizeWithdrawn");
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[1], true, "should be true drawWithdrawnCreator");
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[2], false, "should be false drawWithdrawnOpponent");
        });

        it("should return true for drawWithdrawnOpponent", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  3
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            await game.withdrawGamePrizes(1, {
                from: OPPONENT
            });
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[0], false, "should be false PrizeWithdrawn");
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[1], false, "should be false drawWithdrawnCreator");
            assert.strictEqual((await game.gameWithdrawalInfo.call(1))[2], true, "should be true drawWithdrawnOpponent");
        });
    });

    describe("getPlayedGamesForPlayer", () => {
        it("should fail if address == 0x0", async () => {
            await expectRevert(game.getPlayedGamesForPlayer.call("0x0000000000000000000000000000000000000000"), "Cannt be 0x0");
        });

        it("should return correct getPlayedGamesForPlayer after game activity", async () => {
            //  1
            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("1")
            });
            assert.deepEqual(await game.getPlayedGamesForPlayer.call(CREATOR_2), [new BN("2")], "wrong idx after 1");

            //  2
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("1")
            });
            assert.deepEqual(await game.getPlayedGamesForPlayer.call(OPPONENT_2), [new BN("2")], "wrong idx after 2");

            //  3
            await game.quitGame(2, {
                from: CREATOR_2
            });
            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("1")
            });
            assert.deepEqual(await game.getPlayedGamesForPlayer.call(CREATOR_2), [new BN("2"), new BN("3")], "wrong idx after 3");

            //  4
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: OTHER,
                value: ether("1")
            });
            assert.deepEqual(await game.getPlayedGamesForPlayer.call(OTHER), [new BN("4")], "wrong idx after 4");
        });
    });

    describe("getGamesWithPendingPrizeWithdrawal", () => {
        it("should add game on multiple finish", async() => {
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "wrong amount before");

            //  Quitted
            await game.quitGame(1, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1")], "should be 1");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], "should be empty");

            //  Expired
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(2, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1")], "should be 1");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("2")], "should be 2");

            //  WinnerPresent
            //  1
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });
            await game.joinGame(3, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await game.opponentNextMove(3, 1, {
                from: OPPONENT
            });
            await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  3
            await game.opponentNextMove(3, 1, {
                from: OPPONENT
            });
            await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1")], "should be 1");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("2"), new BN("3")], "should be 2, 3");

            //  Draw
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });
            await game.joinGame(4, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });

            await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await game.opponentNextMove(4, 1, {
                from: OPPONENT
            });
            await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  3
            await game.opponentNextMove(4, 1, {
                from: OPPONENT
            });
            await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1"), new BN("4")], "should be 1");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("2"), new BN("3"), new BN("4")], "should be 2, 3, 4");
        });
    });

    describe("balance", () => {
        it("should update balance on game creation", async () => {
            let balanceBefore = await balance.current(game.address);

            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("1")
            });
            let balanceAfter = await balance.current(game.address);
            assert.strictEqual(0, balanceAfter.sub(balanceBefore).cmp(ether("1")), "wrong balnce after game created");
        });

        it("should update balance after game joined", async () => {
            let balanceBefore = await balance.current(game.address);

            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("1")
            });
            let balanceAfter = await balance.current(game.address);
            assert.strictEqual(0, balanceAfter.sub(balanceBefore).cmp(ether("2")), "wrong balnce after game joined");
        });

        it("should update balance after prize withdrawal", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await game.opponentNextMove(1, 3, {
                from: OPPONENT
            });

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  3
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            let balanceBefore = await balance.current(game.address);
            // console.log(balanceBefore.toString());
            await game.withdrawGamePrizes(1, {
                from: CREATOR
            });
            let balanceAfter = await balance.current(game.address);
            // console.log(balanceAfter.toString());
            let prize = ether("1.95");
            assert.strictEqual(0, balanceBefore.sub(balanceAfter).cmp(prize), "wrong balnce after withdrawGamePrize");
        });

        it("should update balance on devFeePending withdraw", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await game.opponentNextMove(1, 3, {
                from: OPPONENT
            });

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  3
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            let balanceBefore = await balance.current(game.address);
            // console.log(balanceBefore.toString());
            await game.withdrawGamePrizes(1, {
                from: CREATOR
            });

            //  dev fee
            let devFeePending = await game.devFeePending.call();
            await game.withdrawDevFee();

            let balanceAfter = await balance.current(game.address);
            let prize = ether("1.9");
            assert.strictEqual(0, balanceBefore.sub(balanceAfter).cmp(prize.add(devFeePending)), "wrong balnce after dev fee withdraw");
        });
    });
});