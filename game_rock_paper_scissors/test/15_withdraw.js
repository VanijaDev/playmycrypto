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


        //  3 prizes && 2 draw

        //  1 - OPPONENT wins
        await game.createGame(CREATOR_REFERRAL, hash, {
            from: CREATOR,
            value: ether("1")
        });

        //  2 
        await game.joinGame(1, OPPONENT_REFERRAL, 1, {
            from: OPPONENT,
            value: ether("1")
        });
        await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(1, 2, {
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

        //  2 - OPPONENT wins
        await game.createGame(CREATOR_REFERRAL, hash, {
            from: CREATOR,
            value: ether("0.1")
        });
        await game.joinGame(2, OPPONENT_REFERRAL, 1, {
            from: OPPONENT,
            value: ether("0.1")
        });
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(2, 2, {
            from: OPPONENT
        });
        
        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(2, 1, {
            from: OPPONENT
        });

        await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        //  3 - OPPONENT wins
        await game.createGame(CREATOR_REFERRAL, hash, {
            from: CREATOR,
            value: ether("0.1")
        });
        await game.joinGame(3, OPPONENT_REFERRAL, 2, {
            from: OPPONENT,
            value: ether("0.1")
        });
        await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(3, 1, {
            from: OPPONENT
        });
        
        await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(3, 1, {
            from: OPPONENT
        });

        await game.playMove(3, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        //  4 - Draw
        await game.createGame(CREATOR_REFERRAL, hash, {
            from: CREATOR,
            value: ether("0.2")
        });
        await game.joinGame(4, OPPONENT_REFERRAL, 1, {
            from: OPPONENT,
            value: ether("0.2")
        });
        await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(4, 1, {
            from: OPPONENT
        });
        
        await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(4, 1, {
            from: OPPONENT
        });

        await game.playMove(4, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });

        //  5 - Draw
        await game.createGame(CREATOR_REFERRAL, hash, {
            from: CREATOR,
            value: ether("0.3")
        });
        await game.joinGame(5, OPPONENT_2, 1, {
            from: OPPONENT,
            value: ether("0.3")
        });
        await game.playMove(5, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(5, 1, {
            from: OPPONENT
        });
        
        await game.playMove(5, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
        await game.opponentNextMove(5, 1, {
            from: OPPONENT
        });

        await game.playMove(5, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
            from: CREATOR
        });
    });

    describe("withdrawGamePrizes", () => {
        it("should fail if _maxLoop == 0", async() => {
            await expectRevert(game.withdrawGamePrizes(0, {from: OPPONENT}), "_maxLoop == 0");
        });

        it("should fail if no pending", async() => {
            await expectRevert(game.withdrawGamePrizes(10, {from: OTHER}), "no pending");
        });

        it("should fail if wrong _maxLoop", async() => {
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("4"), new BN("5")]);
            await expectRevert(game.withdrawGamePrizes(10, {from: CREATOR}), "_maxLoop too big");

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")]);
            await expectRevert(game.withdrawGamePrizes(10, {from: OPPONENT}), "_maxLoop too big");
        });

        it("should set drawWithdrawn == true for CREATOR for last game - gameWithdrawalInfo", async() => {
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT");
            
            await game.withdrawGamePrizes(1, {from: CREATOR});
            
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(5))[1], "should be true after for CREATOR");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false after for OPPONENT");
        });

        it("should set drawWithdrawn == true for CREATOR for two last games - gameWithdrawalInfo", async() => {
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false before for CREATOR - 4");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false before for OPPONENT - 4");
           
            await game.withdrawGamePrizes(2, {from: CREATOR});
           
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(5))[1], "should be true after for CREATOR - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false after for OPPONENT - 5");
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(4))[1], "should be true after for CREATOR - 4");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false after for OPPONENT - 4");
        });

        it("should set drawWithdrawn == true for OPPONENT - gameWithdrawalInfo", async() => {
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false before for CREATOR - 4");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false before for OPPONENT - 4");
           
            await game.withdrawGamePrizes(2, {from: OPPONENT});
           
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false after for CREATOR - 5");
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(5))[2], "should be true after for OPPONENT - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false after for CREATOR - 4");
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(4))[2], "should be true after for OPPONENT - 4");
        });

        it("should set prizeWithdrawn = true if winner withdrawn - gameWithdrawalInfo", async() => {
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[0], "should be false after for winner - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT - 5");
            
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[0], "should be false after for winner - 4");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false before for CREATOR - 4");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false before for OPPONENT - 4");
            
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(3))[0], "should be false after for winner - 3");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(3))[1], "should be false before for CREATOR - 3");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(3))[2], "should be false before for OPPONENT - 3");
            
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(2))[0], "should be false after for winner - 2");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(2))[1], "should be false before for CREATOR - 2");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(2))[2], "should be false before for OPPONENT - 2");
           
            await game.withdrawGamePrizes(4, {from: OPPONENT});
           
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[0], "should be false after for winner - 5");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false after for CREATOR - 5");
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(5))[2], "should be true after for OPPONENT - 5");
            
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[0], "should be false after for winner - 4");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false after for CREATOR - 4");
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(4))[2], "should be true after for OPPONENT - 4");
            
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(3))[0], "should be true after for winner - 3");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(3))[1], "should be false after for CREATOR - 3");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(3))[2], "should be false after for OPPONENT - 3");
            
            await assert.strictEqual(true, (await game.gameWithdrawalInfo.call(2))[0], "should be true after for winner - 2");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(2))[1], "should be false after for CREATOR - 2");
            await assert.strictEqual(false, (await game.gameWithdrawalInfo.call(2))[2], "should be false after for OPPONENT - 2");
        });

        it("should not add referral fee if draw referralFeesPending for last", async() => {
            // CREATOR_REFERRAL
            assert.strictEqual(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0")), "should be 0 before - CREATOR_REFERRAL");
            await game.withdrawGamePrizes(1, {from: CREATOR});
            assert.strictEqual(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0")), "should be 0 after - CREATOR_REFERRAL");


            // OPPONENT_REFERRAL
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "should be 0 before - OPPONENT_REFERRAL");
            await game.withdrawGamePrizes(1, {from: CREATOR});
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "should be 0 after - OPPONENT_REFERRAL");
        });

        it("should calculate correct referralFeesPending for 1 win", async() => {
            //  3 - CREATOR wins
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.41")
            });
            await game.joinGame(6, OPPONENT_REFERRAL, 3, {
                from: OPPONENT,
                value: ether("0.41")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });

            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            
            // CREATOR_REFERRAL
            assert.strictEqual(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0")), "should be 0 before - CREATOR_REFERRAL");
            await game.withdrawGamePrizes(3, {from: CREATOR});
            assert.strictEqual(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0.0041")), "should be 0.41 after - CREATOR_REFERRAL");
        });

        it("should calculate correct referralFeesPending for 2 wins + 2 draws", async() => {            
            // OPPONENT_REFERRAL
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "should be 0 before - OPPONENT_REFERRAL");
            await game.withdrawGamePrizes(4, {from: OPPONENT});
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.002")), "should be 0.002 after - OPPONENT_REFERRAL");
        });

        it("should calculate correct referralFeesPending for 5 last - OPPONENT", async() => {
            // OPPONENT_REFERRAL
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "should be 0 before - OPPONENT_REFERRAL");
            await game.withdrawGamePrizes(5, {from: OPPONENT});
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.012")), "should be 0.012 after - OPPONENT_REFERRAL");
        });

        it("should increase totalUsedReferralFees", async() => {
            assert.strictEqual(0, (await game.totalUsedReferralFees.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.strictEqual(0, (await game.totalUsedReferralFees.call()).cmp(ether("0")), "should be 0 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.totalUsedReferralFees.call()).cmp(ether("0.001")), "should be 0.001 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.totalUsedReferralFees.call()).cmp(ether("0.012")), "should be 0.012 after last 3");
        });

        it("should pop last game from gamesWithPendingPrizeWithdrawalForAddress", async() => {
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("4"), new BN("5")], ", should be 4, 5 before - CREATOR");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")], ", should be 1, 2, 3, 4, 5 before - OPPONENT");

            await game.withdrawGamePrizes(1, {from: CREATOR});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("4")], ", should be 4 after - CREATOR");

            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4")], ", should be 1, 2, 3, 4 after - OPPONENT");
        });

        it("should pop 3 last games from gamesWithPendingPrizeWithdrawalForAddress", async() => {
            //  3 - CREATOR wins
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.41")
            });
            await game.joinGame(6, OPPONENT_REFERRAL, 3, {
                from: OPPONENT,
                value: ether("0.41")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });

            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("4"), new BN("5"), new BN("6")], ", should be 4, 5, 6 before - CREATOR");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")], ", should be 1, 2, 3, 4, 5 before - OPPONENT");

            await game.withdrawGamePrizes(3, {from: CREATOR});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], ", should be empty after - CREATOR");

            await game.withdrawGamePrizes(3, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1"), new BN("2")], ", should be 1, 2 after - OPPONENT");
        });

        it("should pop 5 last games from gamesWithPendingPrizeWithdrawalForAddress", async() => {
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")], ", should be 1, 2, 3, 4, 5 before - OPPONENT");

            await game.withdrawGamePrizes(5, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(OPPONENT), [], ", should be empty after - OPPONENT");
        });

        it("should increase addressPrizeTotal with correct amount", async() => {
            assert.strictEqual(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.strictEqual(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("0")), "should be 0 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("0.1")), "should be 0.1 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("1.2")), "should be 1.2 after last 2");
        });

        it("should calculate correct partnerFeePending", async() => {
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0.001")), "should be 0.001 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0.012")), "should be 0.012 after last 2");
        });

        it("should calculate correct ongoinRafflePrize", async() => {
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0.001")), "should be 0.001 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0.012")), "should be 0.012 after last 2");
        });

        it("should calculate correct devFeePending", async() => {
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0.001")), "should be 0.001 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0.012")), "should be 0.012 after last 2");
        });

        it("should calculate correct Beneficiar Fee", async() => {
            assert.strictEqual(0, (await game.feeBeneficiarBalances.call(OWNER)).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.strictEqual(0, (await game.feeBeneficiarBalances.call(OWNER)).cmp(ether("0")), "should be 0 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.feeBeneficiarBalances.call(OWNER)).cmp(ether("0.001")), "should be 0.001 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.strictEqual(0, (await game.feeBeneficiarBalances.call(OWNER)).cmp(ether("0.012")), "should be 0.012 after last 2");
        });

        it("should transfer correct prizeTotal", async() => {
            let OPPONENT_total_before = new BN(await web3.eth.getBalance(OPPONENT));

            //  1, game 5
            let tx = await game.withdrawGamePrizes(1, {from: OPPONENT});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_total_after = new BN(await web3.eth.getBalance(OPPONENT));
            assert.strictEqual(0, OPPONENT_total_before.add(ether("0.3")).sub(gasSpent).cmp(OPPONENT_total_after), "wrong OPPONENT_total_after 1");

            //  2, games 4, 3
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_total_after_2 = new BN(await web3.eth.getBalance(OPPONENT));
            let correctAmount = ether("0.2").add(ether("0.1").mul(new BN("95")).div(new BN("100")));
            assert.strictEqual(0, OPPONENT_total_after.add(correctAmount).sub(gasSpent).cmp(OPPONENT_total_after_2), "wrong OPPONENT_total_after_2");

            //  3, game, 2, 1
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_total_after_3 = new BN(await web3.eth.getBalance(OPPONENT));
            correctAmount = ether("1.1").mul(new BN("95")).div(new BN("100"));
            assert.strictEqual(0, OPPONENT_total_after_2.add(correctAmount).sub(gasSpent).cmp(OPPONENT_total_after_3), "wrong OPPONENT_total_after_3");
        });

        it("should not transferPartnerFee if < than threshold", async() => {
            let PARTNER_total_before = new BN(await web3.eth.getBalance(PARTNER));
             
            //  1, game 5
            let tx = await game.withdrawGamePrizes(1, {from: OPPONENT});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let PARTNER_total_after_1 = new BN(await web3.eth.getBalance(PARTNER));
            assert.strictEqual(0, PARTNER_total_before.cmp(PARTNER_total_after_1), "wrong PARTNER_total_after_1");

            //  2, games 4, 3
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let PARTNER_total_after_2 = new BN(await web3.eth.getBalance(PARTNER));
            assert.strictEqual(0, PARTNER_total_before.cmp(PARTNER_total_after_2), "wrong PARTNER_total_after_2");

            //  3, game, 2, 1
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let PARTNER_total_after_3 = new BN(await web3.eth.getBalance(PARTNER));
            assert.strictEqual(0, PARTNER_total_before.cmp(PARTNER_total_after_3), "wrong PARTNER_total_after_3");
        });

        it("should transferPartnerFee if > than threshold", async() => {
            let PARTNER_total_before = new BN(await web3.eth.getBalance(PARTNER));
             
            //  1, game 5
            await game.withdrawGamePrizes(1, {from: OPPONENT});

            let PARTNER_total_after_1 = new BN(await web3.eth.getBalance(PARTNER));
            assert.strictEqual(0, PARTNER_total_before.cmp(PARTNER_total_after_1), "wrong PARTNER_total_after_1");

             //  2 - CREATOR wins
             await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("100.41")
            });
            await game.joinGame(6, OPPONENT_REFERRAL, 3, {
                from: OPPONENT,
                value: ether("100.41")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });

            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            await game.withdrawGamePrizes(1, {from: CREATOR});

            let PARTNER_total_after_2 = new BN(await web3.eth.getBalance(PARTNER));
            assert.strictEqual(0, PARTNER_total_after_2.sub(PARTNER_total_before).cmp(ether("1.0041")), "wrong PARTNER_total_after_2");
            assert.strictEqual(0, (await game.partnerFeePending.call()).cmp(ether("0")), "partnerFeePending should be 0 after");
        });

        it("should emit RPS_GamePrizesWithdrawn with correct params", async() => {
            const { logs } = await game.withdrawGamePrizes(1, {from: OPPONENT});
    
            assert.strictEqual(1, logs.length, "should be single event");
            await expectEvent.inLogs(logs, 'RPS_GamePrizesWithdrawn', {
                player: OPPONENT
            });
        });
    });

    describe("withdrawReferralFees", () => {
        it("should fail if No referral fee", async() => {
            await expectRevert(game.withdrawReferralFees({from: OPPONENT_REFERRAL}), "No referral fee");
        });

        it("should delete referralFeesPending[msg.sender]", async() => {
            //  1
            await game.withdrawGamePrizes(4, {from: OPPONENT});

            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.002")), "wrong referralFeesPending before 1");
            await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "wrong referralFeesPending after 1");

            //  2
            await game.withdrawGamePrizes(1, {from: OPPONENT});

            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.01")), "wrong referralFeesPending before 2");
            await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            assert.strictEqual(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "wrong referralFeesPending after 2");
        });

        it("should update referralFeesWithdrawn[msg.sender]", async() => {
             //  1
             await game.withdrawGamePrizes(4, {from: OPPONENT});

             assert.strictEqual(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0")), "wrong referralFeesWithdrawn before 1");
             await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
             assert.strictEqual(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0.002")), "wrong referralFeesWithdrawn after 1");
 
             //  2
             await game.withdrawGamePrizes(1, {from: OPPONENT});
 
             assert.strictEqual(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0.002")), "wrong referralFeesWithdrawn before 2");
             await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
             assert.strictEqual(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0.012")), "wrong referralFeesWithdrawn after 2");
        });

        it("should transfer correct amount", async() => {
            let OPPONENT_REFERRAL_before = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));

            await game.withdrawGamePrizes(4, {from: OPPONENT});

            //  1
            let tx = await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_REFERRAL_after = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));
            assert.strictEqual(0, OPPONENT_REFERRAL_before.add(ether("0.002")).sub(gasSpent).cmp(OPPONENT_REFERRAL_after), "wrong OPPONENT_REFERRAL_after");

            //  2
            await time.increase(time.duration.seconds(6));

            let OPPONENT_REFERRAL_before_2 = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            tx = await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_REFERRAL_after_2 = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));
            assert.strictEqual(0, OPPONENT_REFERRAL_before_2.add(ether("0.01")).sub(gasSpent).cmp(OPPONENT_REFERRAL_after_2), "wrong OPPONENT_REFERRAL_after_2");

            //  3 - Quit
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.33")
            });
            await game.joinGame(6, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("0.33")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.quitGame(6, {
                from: OPPONENT
            });

            //  5
            await time.increase(time.duration.seconds(6));

            let CREATOR_REFERRAL_before_3 = new BN(await web3.eth.getBalance(CREATOR_REFERRAL));

            await game.withdrawGamePrizes(1, {from: CREATOR});

            tx = await game.withdrawReferralFees({from: CREATOR_REFERRAL});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let CREATOR_REFERRAL_after_3 = new BN(await web3.eth.getBalance(CREATOR_REFERRAL));
            assert.strictEqual(0, CREATOR_REFERRAL_before_3.add(ether("0.0033")).sub(gasSpent).cmp(CREATOR_REFERRAL_after_3), "wrong CREATOR_REFERRAL_after_3");
        });

        it("should emit RPS_GameReferralWithdrawn with correct params", async() => {
            await game.withdrawGamePrizes(4, {from: OPPONENT});
            
            const { logs } = await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
    
            assert.strictEqual(1, logs.length, "should be single event");
            await expectEvent.inLogs(logs, 'RPS_GameReferralWithdrawn', {
                referral: OPPONENT_REFERRAL
            });
        });
    });

    describe("withdrawDevFee", () => {
        it("should fail if No dev fee", async() => {
            await expectRevert(game.withdrawDevFee({from: OWNER}), "No dev fee");
        });

        it("should delete devFeePending", async() => {
            //  1
            await game.withdrawGamePrizes(4, {from: OPPONENT});

            assert.strictEqual(0, (await game.devFeePending.call()).cmp(ether("0.002")), "wrong devFeePending before 1");
            await game.withdrawDevFee({from: OWNER});
            assert.strictEqual(0, (await game.devFeePending.call()).cmp(ether("0")), "wrong devFeePending after 1");

            //  2
            await game.withdrawGamePrizes(1, {from: OPPONENT});

            assert.strictEqual(0, (await game.devFeePending.call()).cmp(ether("0.01")), "wrong devFeePending before 2");
            await game.withdrawDevFee({from: OWNER});
            assert.strictEqual(0, (await game.devFeePending.call()).cmp(ether("0")), "wrong devFeePending after 2");
        });

        it("should transfer correct amount", async() => {
            let OWNER_before = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(4, {from: OPPONENT});

            //  1
            let tx = await game.withdrawDevFee({from: OWNER});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after = new BN(await web3.eth.getBalance(OWNER));
            assert.strictEqual(0, OWNER_before.add(ether("0.002")).sub(gasSpent).cmp(OWNER_after), "wrong OWNER_after");

            //  2
            await time.increase(time.duration.seconds(6));

            let OWNER_before_2 = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            tx = await game.withdrawDevFee({from: OWNER});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after_2 = new BN(await web3.eth.getBalance(OWNER));
            assert.strictEqual(0, OWNER_before_2.add(ether("0.01")).sub(gasSpent).cmp(OWNER_after_2), "wrong OWNER_after_2");

            //  3 - Quit
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.33")
            });
            await game.joinGame(6, OPPONENT_2, 1, {
                from: OPPONENT,
                value: ether("0.33")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.quitGame(6, {
                from: CREATOR
            });

            await time.increase(time.duration.seconds(6));

            let OWNER_before_3 = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            tx = await game.withdrawDevFee({from: OWNER});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after_3 = new BN(await web3.eth.getBalance(OWNER));
            assert.strictEqual(0, OWNER_before_3.add(ether("0.0033")).sub(gasSpent).cmp(OWNER_after_3), "wrong OWNER_after_3");

            //  4 - Quit
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.22")
            });
            await game.joinGame(7, OPPONENT_2, 1, {
                from: OPPONENT,
                value: ether("0.22")
            });
            await game.playMove(7, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(7, 1, {
                from: OPPONENT
            });
            
            await game.playMove(7, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(7, 1, {
                from: OPPONENT
            });
            
            await game.quitGame(7, {
                from: CREATOR
            });

            await time.increase(time.duration.seconds(6));

            let OWNER_before_4 = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            tx = await game.withdrawDevFee({from: OWNER});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after_4 = new BN(await web3.eth.getBalance(OWNER));
            assert.strictEqual(0, OWNER_before_4.add(ether("0.0022")).sub(gasSpent).cmp(OWNER_after_4), "wrong OWNER_after_4");
        });
    });

    describe("withdrawRafflePrizes", () => {
        beforeEach("update for raffle test", async() => {
            await game.updateRaffleActivationParticipantsCount(2, {from: OWNER});
        });
        
        it("should fail if No raffle prize", async() => {
            await expectRevert(game.withdrawRafflePrizes({from: OTHER}), "No raffle prize");
        });

        it("should delete rafflePrizePending[msg.sender]", async() => {
            //  1
            await game.withdrawGamePrizes(4, {from: OPPONENT});
            await game.runRaffle();
            let raffleWinner = (await game.raffleResults.call(0)).winner;

            await assert.strictEqual(0, (await game.rafflePrizePending.call(raffleWinner)).cmp(ether("0.002")), "wrong rafflePrizePending before");
            await game.withdrawRafflePrizes({from: raffleWinner});
            await assert.strictEqual(0, (await game.rafflePrizePending.call(raffleWinner)).cmp(ether("0")), "wrong rafflePrizePending after");

            //  2
            //  OPPONENT wins
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("0.321")
            });
            await game.joinGame(6, OPPONENT_2, 2, {
                from: OPPONENT,
                value: ether("0.321")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });

            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            await game.withdrawGamePrizes(2, {from: OPPONENT}); //  (0.321 + 1) * 0.01 = 0.01321

            await time.increase(time.duration.minutes(2));
            await game.runRaffle();
            raffleWinner = (await game.raffleResults.call(1)).winner;

            await assert.strictEqual(0, (await game.rafflePrizePending.call(raffleWinner)).cmp(ether("0.01321")), "wrong rafflePrizePending before 2");
            await game.withdrawRafflePrizes({from: raffleWinner});
            await assert.strictEqual(0, (await game.rafflePrizePending.call(raffleWinner)).cmp(ether("0")), "wrong rafflePrizePending after 2");
        });

        it("should increase addressPrizeTotal[msg.sender]", async() => {
            //  1
            await game.withdrawGamePrizes(4, {from: OPPONENT});
            
            let randNum = await game.rand.call();
            let raffleWinner = await game.raffleParticipants.call(randNum);
            let winnerBalanceBefore = await game.addressPrizeTotal.call(raffleWinner);

            await game.runRaffle();
            await game.withdrawRafflePrizes({from: raffleWinner});
            await assert.strictEqual(0, (await game.addressPrizeTotal.call(raffleWinner)).sub(winnerBalanceBefore).cmp(ether("0.002")), "wrong addressPrizeTotal after");

            await time.increase(time.duration.seconds(6));

            //  2 - OPPONENT wins
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.123")
            });
            await game.joinGame(6, OWNER, 2, {
                from: OPPONENT,
                value: ether("0.123")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });

            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            await game.withdrawGamePrizes(1, {from: OPPONENT});
            
            randNum = await game.rand.call();
            raffleWinner = await game.raffleParticipants.call(randNum);
            winnerBalanceBefore = await game.addressPrizeTotal.call(raffleWinner);

            await game.runRaffle();
            await game.withdrawRafflePrizes({from: raffleWinner});  //  0.123 * 0.01 = 0.00123
            await assert.strictEqual(0, (await game.addressPrizeTotal.call(raffleWinner)).sub(winnerBalanceBefore).cmp(ether("0.00123")), "wrong addressPrizeTotal after 1");
        });

        it("should transfer correct prize", async() => {
            //  1
            await game.withdrawGamePrizes(4, {from: OPPONENT});
            
            let randNum = await game.rand.call();
            let raffleWinner = await game.raffleParticipants.call(randNum);
            let raffleWinnerBefore = new BN(await web3.eth.getBalance(raffleWinner));

            await game.runRaffle();

            let tx = await game.withdrawRafflePrizes({from: raffleWinner});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let raffleWinnerAfter = new BN(await web3.eth.getBalance(raffleWinner));
            await assert.strictEqual(0, raffleWinnerBefore.add(ether("0.002")).sub(gasSpent).cmp(raffleWinnerAfter), "wrong raffleWinnerAfter after");

            await time.increase(time.duration.seconds(6));

            //  2 - OPPONENT wins
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.123")
            });
            await game.joinGame(6, OWNER, 2, {
                from: OPPONENT,
                value: ether("0.123")
            });
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });
            
            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(6, 1, {
                from: OPPONENT
            });

            await game.playMove(6, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            await game.withdrawGamePrizes(1, {from: OPPONENT});
            
            randNum = await game.rand.call();
            raffleWinner = await game.raffleParticipants.call(randNum);
            raffleWinnerBefore = new BN(await web3.eth.getBalance(raffleWinner));

            await game.runRaffle();

            tx = await game.withdrawRafflePrizes({from: raffleWinner});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            raffleWinnerAfter = new BN(await web3.eth.getBalance(raffleWinner));  //  0.123 * 0.01 = 0.00123
            await assert.strictEqual(0, raffleWinnerBefore.add(ether("0.00123")).sub(gasSpent).cmp(raffleWinnerAfter), "wrong raffleWinnerAfter after 1");
        });

        it("should emit RPS_RafflePrizeWithdrawn with correct params", async() => {
            await game.withdrawGamePrizes(4, {from: OPPONENT});
            
            let randNum = await game.rand.call();
            let raffleWinner = await game.raffleParticipants.call(randNum);

            await game.runRaffle();
            const { logs } = await game.withdrawRafflePrizes({from: raffleWinner});
    
            assert.strictEqual(1, logs.length, "should be single event");
            await expectEvent.inLogs(logs, 'RPS_RafflePrizeWithdrawn', {
                winner: raffleWinner
            });
        });
    });
});