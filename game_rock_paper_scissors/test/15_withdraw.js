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

        //  1
        await game.createGame(CREATOR_REFERRAL, hash, {
            from: CREATOR,
            value: ether("1")
        });

        //  2 
        await game.joinGame(1, OPPONENT_REFERRAL, 1, {
            from: OPPONENT,
            value: ether("1")
        });

        //  3 prizes && 2 draw

        //  1 - OPPONENT wins
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
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR), [new BN("4"), new BN("5")]);
            await expectRevert(game.withdrawGamePrizes(10, {from: CREATOR}), "wrong _maxLoop");

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")]);
            await expectRevert(game.withdrawGamePrizes(10, {from: OPPONENT}), "wrong _maxLoop");
        });

        it("should set drawWithdrawn == true for CREATOR for last game - gameWithdrawalInfo", async() => {
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT");
            
            await game.withdrawGamePrizes(1, {from: CREATOR});
            
            await assert.equal(true, (await game.gameWithdrawalInfo.call(5))[1], "should be true after for CREATOR");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false after for OPPONENT");
        });

        it("should set drawWithdrawn == true for CREATOR for two last games - gameWithdrawalInfo", async() => {
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false before for CREATOR - 4");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false before for OPPONENT - 4");
           
            await game.withdrawGamePrizes(2, {from: CREATOR});
           
            await assert.equal(true, (await game.gameWithdrawalInfo.call(5))[1], "should be true after for CREATOR - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false after for OPPONENT - 5");
            await assert.equal(true, (await game.gameWithdrawalInfo.call(4))[1], "should be true after for CREATOR - 4");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false after for OPPONENT - 4");
        });

        it("should set drawWithdrawn == true for OPPONENT - gameWithdrawalInfo", async() => {
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false before for CREATOR - 4");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false before for OPPONENT - 4");
           
            await game.withdrawGamePrizes(2, {from: OPPONENT});
           
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false after for CREATOR - 5");
            await assert.equal(true, (await game.gameWithdrawalInfo.call(5))[2], "should be true after for OPPONENT - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false after for CREATOR - 4");
            await assert.equal(true, (await game.gameWithdrawalInfo.call(4))[2], "should be true after for OPPONENT - 4");
        });

        it("should set prizeWithdrawn = true if winner withdrawn - gameWithdrawalInfo", async() => {
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[0], "should be false after for winner - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false before for CREATOR - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[2], "should be false before for OPPONENT - 5");
            
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[0], "should be false after for winner - 4");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false before for CREATOR - 4");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[2], "should be false before for OPPONENT - 4");
            
            await assert.equal(false, (await game.gameWithdrawalInfo.call(3))[0], "should be false after for winner - 3");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(3))[1], "should be false before for CREATOR - 3");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(3))[2], "should be false before for OPPONENT - 3");
            
            await assert.equal(false, (await game.gameWithdrawalInfo.call(2))[0], "should be false after for winner - 2");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(2))[1], "should be false before for CREATOR - 2");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(2))[2], "should be false before for OPPONENT - 2");
           
            await game.withdrawGamePrizes(4, {from: OPPONENT});
           
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[0], "should be false after for winner - 5");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(5))[1], "should be false after for CREATOR - 5");
            await assert.equal(true, (await game.gameWithdrawalInfo.call(5))[2], "should be true after for OPPONENT - 5");
            
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[0], "should be false after for winner - 4");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(4))[1], "should be false after for CREATOR - 4");
            await assert.equal(true, (await game.gameWithdrawalInfo.call(4))[2], "should be true after for OPPONENT - 4");
            
            await assert.equal(true, (await game.gameWithdrawalInfo.call(3))[0], "should be true after for winner - 3");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(3))[1], "should be false after for CREATOR - 3");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(3))[2], "should be false after for OPPONENT - 3");
            
            await assert.equal(true, (await game.gameWithdrawalInfo.call(2))[0], "should be true after for winner - 2");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(2))[1], "should be false after for CREATOR - 2");
            await assert.equal(false, (await game.gameWithdrawalInfo.call(2))[2], "should be false after for OPPONENT - 2");
        });

        it("should calculate correct referralFeesPending for last", async() => {
            // CREATOR_REFERRAL
            assert.equal(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0")), "should be 0 before - CREATOR_REFERRAL");
            await game.withdrawGamePrizes(1, {from: CREATOR});
            assert.equal(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0.003")), "should be 0.003 after - CREATOR_REFERRAL");

            // OPPONENT_2
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0")), "should be 0 before - OPPONENT_2");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0.003")), "should be 0.003 after - OPPONENT_2");
        });

        it("should calculate correct referralFeesPending for 3 last", async() => {
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
            assert.equal(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0")), "should be 0 before - CREATOR_REFERRAL");
            await game.withdrawGamePrizes(3, {from: CREATOR});
            assert.equal(0, (await game.referralFeesPending.call(CREATOR_REFERRAL)).cmp(ether("0.0132")), "should be 0.0132 after - CREATOR_REFERRAL");

            // OPPONENT_2 + OPPONENT_REFERRAL
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0")), "should be 0 before - OPPONENT_2");
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "should be 0 before - OPPONENT_REFERRAL");
            await game.withdrawGamePrizes(3, {from: OPPONENT});
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0.003")), "should be 0.003 after - OPPONENT_2");
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.004")), "should be 0.004 after - OPPONENT_REFERRAL");
        });

        it("should calculate correct referralFeesPending for 5 last - OPPONENT", async() => {
             // OPPONENT_2 + OPPONENT_REFERRAL
             assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0")), "should be 0 before - OPPONENT_2");
             assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "should be 0 before - OPPONENT_REFERRAL");
             await game.withdrawGamePrizes(5, {from: OPPONENT});
             assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0.003")), "should be 0.003 after - OPPONENT_2");
             assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.026")), "should be 0.026 after - OPPONENT_REFERRAL");
        });

        it("should increase totalUsedReferralFees", async() => {
            assert.equal(0, (await game.totalUsedReferralFees.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.equal(0, (await game.totalUsedReferralFees.call()).cmp(ether("0.003")), "should be 0.003 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.totalUsedReferralFees.call()).cmp(ether("0.007")), "should be 0.007 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.totalUsedReferralFees.call()).cmp(ether("0.029")), "should be 0.029 after last 2");
        });

        it("should pop last game from gamesWithPendingPrizeWithdrawalForAddress", async() => {
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR), [new BN("4"), new BN("5")], ", should be 4, 5 before - CREATOR");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")], ", should be 1, 2, 3, 4, 5 before - OPPONENT");

            await game.withdrawGamePrizes(1, {from: CREATOR});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR), [new BN("4")], ", should be 4 after - CREATOR");


            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4")], ", should be 1, 2, 3, 4 after - OPPONENT");
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

            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR), [new BN("4"), new BN("5"), new BN("6")], ", should be 4, 5, 6 before - CREATOR");
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")], ", should be 1, 2, 3, 4, 5 before - OPPONENT");

            await game.withdrawGamePrizes(3, {from: CREATOR});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR), [], ", should be empty after - CREATOR");

            await game.withdrawGamePrizes(3, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT), [new BN("1"), new BN("2")], ", should be 1, 2 after - OPPONENT");
        });

        it("should pop 5 last games from gamesWithPendingPrizeWithdrawalForAddress", async() => {
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT), [new BN("1"), new BN("2"), new BN("3"), new BN("4"), new BN("5")], ", should be 1, 2, 3, 4, 5 before - OPPONENT");

            await game.withdrawGamePrizes(5, {from: OPPONENT});
            assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT), [], ", should be empty after - OPPONENT");
        });

        it("should increase addressPrizeTotal with correct amount", async() => {
            assert.equal(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.equal(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("0.3")), "should be 0.3 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("0.7")), "should be 0.7 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.addressPrizeTotal.call(OPPONENT)).cmp(ether("2.9")), "should be 2.9 after last 2");
        });

        it("should calculate correct partnerFeePending", async() => {
            assert.equal(0, (await game.partnerFeePending.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.equal(0, (await game.partnerFeePending.call()).cmp(ether("0.003")), "should be 0.003 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.partnerFeePending.call()).cmp(ether("0.007")), "should be 0.007 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.partnerFeePending.call()).cmp(ether("0.029")), "should be 0.029 after last 2");
        });

        it("should calculate correct ongoinRafflePrize", async() => {
            assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ether("0.003")), "should be 0.003 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ether("0.007")), "should be 0.007 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.ongoinRafflePrize.call()).cmp(ether("0.029")), "should be 0.029 after last 2");
        });

        it("should calculate correct devFeePending", async() => {
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0")), "should be 0 before");
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.006")), "should be 0.006 after last");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.014")), "should be 0.014 after 2");

            await game.withdrawGamePrizes(2, {from: OPPONENT});
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.058")), "should be 0.058 after last 2");
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
            assert.equal(0, OPPONENT_total_before.add(ether("0.285")).sub(gasSpent).cmp(OPPONENT_total_after), "wrong OPPONENT_total_after 1");

            //  2, games 4, 3
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_total_after_2 = new BN(await web3.eth.getBalance(OPPONENT));
            assert.equal(0, OPPONENT_total_after.add(ether("0.38")).sub(gasSpent).cmp(OPPONENT_total_after_2), "wrong OPPONENT_total_after_2");

            //  3, game, 2, 1
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_total_after_3 = new BN(await web3.eth.getBalance(OPPONENT));
            assert.equal(0, OPPONENT_total_after_2.add(ether("2.09")).sub(gasSpent).cmp(OPPONENT_total_after_3), "wrong OPPONENT_total_after_3");
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
            assert.equal(0, PARTNER_total_before.cmp(PARTNER_total_after_1), "wrong PARTNER_total_after_1");

            //  2, games 4, 3
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let PARTNER_total_after_2 = new BN(await web3.eth.getBalance(PARTNER));
            assert.equal(0, PARTNER_total_before.cmp(PARTNER_total_after_2), "wrong PARTNER_total_after_2");

            //  3, game, 2, 1
            await time.increase(time.duration.seconds(6));

            tx = await game.withdrawGamePrizes(2, {from: OPPONENT});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let PARTNER_total_after_3 = new BN(await web3.eth.getBalance(PARTNER));
            assert.equal(0, PARTNER_total_before.cmp(PARTNER_total_after_3), "wrong PARTNER_total_after_3");
        });

        it("should not transferPartnerFee if > than threshold", async() => {
            let PARTNER_total_before = new BN(await web3.eth.getBalance(PARTNER));
             
            //  1, game 5
            await game.withdrawGamePrizes(1, {from: OPPONENT});

            let PARTNER_total_after_1 = new BN(await web3.eth.getBalance(PARTNER));
            assert.equal(0, PARTNER_total_before.cmp(PARTNER_total_after_1), "wrong PARTNER_total_after_1");

             //  2 - CREATOR wins
             await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("50.41")
            });
            await game.joinGame(6, OPPONENT_REFERRAL, 3, {
                from: OPPONENT,
                value: ether("50.41")
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

            let PARTNER_total_after_4 = new BN(await web3.eth.getBalance(PARTNER));
            assert.equal(0, PARTNER_total_after_4.sub(PARTNER_total_before).cmp(ether("1.0112")), "wrong PARTNER_total_after_4");
            assert.equal(0, (await game.partnerFeePending.call()).cmp(ether("0")), "partnerFeePending should be 0 after");
        });

        it("should emit RPS_GamePrizesWithdrawn with correct params", async() => {
            const { logs } = await game.withdrawGamePrizes(1, {from: OPPONENT});
    
            assert.equal(1, logs.length, "should be single event");
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
            await game.withdrawGamePrizes(1, {from: OPPONENT});

            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0.003")), "wrong referralFeesPending before 1");
            await game.withdrawReferralFees({from: OPPONENT_2});
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_2)).cmp(ether("0")), "wrong referralFeesPending after 1");

            //  2
            await game.withdrawGamePrizes(2, {from: OPPONENT});

            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.004")), "wrong referralFeesPending before 2");
            await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "wrong referralFeesPending after 2");
            
            //  3
            await game.withdrawGamePrizes(2, {from: OPPONENT});

            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0.022")), "wrong referralFeesPending before 3");
            await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            assert.equal(0, (await game.referralFeesPending.call(OPPONENT_REFERRAL)).cmp(ether("0")), "wrong referralFeesPending after 3");
        });

        it("should update referralFeesWithdrawn[msg.sender]", async() => {
             //  1
             await game.withdrawGamePrizes(1, {from: OPPONENT});

             assert.equal(0, (await game.referralFeesWithdrawn.call(OPPONENT_2)).cmp(ether("0")), "wrong referralFeesWithdrawn before 1");
             await game.withdrawReferralFees({from: OPPONENT_2});
             assert.equal(0, (await game.referralFeesWithdrawn.call(OPPONENT_2)).cmp(ether("0.003")), "wrong referralFeesWithdrawn after 1");
 
             //  2
             await game.withdrawGamePrizes(2, {from: OPPONENT});
 
             assert.equal(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0")), "wrong referralFeesWithdrawn before 2");
             await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
             assert.equal(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0.004")), "wrong referralFeesWithdrawn after 2");

             //  3
             await game.withdrawGamePrizes(2, {from: OPPONENT});
 
             assert.equal(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0.004")), "wrong referralFeesWithdrawn before 3");
             await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
             assert.equal(0, (await game.referralFeesWithdrawn.call(OPPONENT_REFERRAL)).cmp(ether("0.026")), "wrong referralFeesWithdrawn after 3");
        });

        it("should transfer correct amount", async() => {
            let OPPONENT_2_before = new BN(await web3.eth.getBalance(OPPONENT_2));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            //  1
            let tx = await game.withdrawReferralFees({from: OPPONENT_2});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_2_after = new BN(await web3.eth.getBalance(OPPONENT_2));
            assert.equal(0, OPPONENT_2_before.add(ether("0.003")).sub(gasSpent).cmp(OPPONENT_2_after), "wrong OPPONENT_2_after");

            //  2
            await time.increase(time.duration.seconds(6));

            let OPPONENT_REFERRAL_before_2 = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));

            await game.withdrawGamePrizes(2, {from: OPPONENT});

            tx = await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_REFERRAL_after_2 = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));
            assert.equal(0, OPPONENT_REFERRAL_before_2.add(ether("0.004")).sub(gasSpent).cmp(OPPONENT_REFERRAL_after_2), "wrong OPPONENT_REFERRAL_after_2");

            //  3
            await time.increase(time.duration.seconds(6));

            let OPPONENT_REFERRAL_before_3 = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));

            await game.withdrawGamePrizes(2, {from: OPPONENT});

            tx = await game.withdrawReferralFees({from: OPPONENT_REFERRAL});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OPPONENT_REFERRAL_after_3 = new BN(await web3.eth.getBalance(OPPONENT_REFERRAL));
            assert.equal(0, OPPONENT_REFERRAL_before_3.add(ether("0.022")).sub(gasSpent).cmp(OPPONENT_REFERRAL_after_3), "wrong OPPONENT_REFERRAL_after_3");

            //  4 - Quit
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
                from: OPPONENT
            });

            //  5
            await time.increase(time.duration.seconds(6));

            let CREATOR_REFERRAL_before_4 = new BN(await web3.eth.getBalance(CREATOR_REFERRAL));

            await game.withdrawGamePrizes(1, {from: CREATOR});

            tx = await game.withdrawReferralFees({from: CREATOR_REFERRAL});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let CREATOR_REFERRAL_after_4 = new BN(await web3.eth.getBalance(CREATOR_REFERRAL));
            assert.equal(0, CREATOR_REFERRAL_before_4.add(ether("0.0066")).sub(gasSpent).cmp(CREATOR_REFERRAL_after_4), "wrong CREATOR_REFERRAL_after_4");
        });

        it("should emit RPS_GameReferralWithdrawn with correct params", async() => {
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            
            const { logs } = await game.withdrawReferralFees({from: OPPONENT_2});
    
            assert.equal(1, logs.length, "should be single event");
            await expectEvent.inLogs(logs, 'RPS_GameReferralWithdrawn', {
                referral: OPPONENT_2
            });
        });
    });

    describe("withdrawDevFee", () => {
        it("should fail if No dev fee", async() => {
            await expectRevert(game.withdrawDevFee({from: OWNER}), "No dev fee");
        });

        it("should delete devFeePending", async() => {
            //  1
            await game.withdrawGamePrizes(1, {from: OPPONENT});

            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.006")), "wrong devFeePending before 1");
            await game.withdrawDevFee({from: OWNER});
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0")), "wrong devFeePending after 1");

            //  2
            await game.withdrawGamePrizes(2, {from: OPPONENT});

            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.008")), "wrong devFeePending before 2");
            await game.withdrawDevFee({from: OWNER});
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0")), "wrong devFeePending after 2");

            //  3
            await game.withdrawGamePrizes(2, {from: OPPONENT});

            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.044")), "wrong devFeePending before 3");
            await game.withdrawDevFee({from: OWNER});
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0")), "wrong devFeePending after 3");
        });

        it("should transfer correct amount", async() => {
            let OWNER_before = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            //  1
            let tx = await game.withdrawDevFee({from: OWNER});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after = new BN(await web3.eth.getBalance(OWNER));
            assert.equal(0, OWNER_before.add(ether("0.006")).sub(gasSpent).cmp(OWNER_after), "wrong OWNER_after");

            //  2
            await time.increase(time.duration.seconds(6));

            let OWNER_before_2 = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(2, {from: OPPONENT});

            tx = await game.withdrawDevFee({from: OWNER});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after_2 = new BN(await web3.eth.getBalance(OWNER));
            assert.equal(0, OWNER_before_2.add(ether("0.008")).sub(gasSpent).cmp(OWNER_after_2), "wrong OWNER_after_2");

            //  3
            await time.increase(time.duration.seconds(6));

            let OWNER_before_3 = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(2, {from: OPPONENT});

            tx = await game.withdrawDevFee({from: OWNER});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after_3 = new BN(await web3.eth.getBalance(OWNER));
            assert.equal(0, OWNER_before_3.add(ether("0.044")).sub(gasSpent).cmp(OWNER_after_3), "wrong OWNER_after_3");

            //  4 - Quit
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

            //  5
            await time.increase(time.duration.seconds(6));

            let OWNER_before_4 = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            tx = await game.withdrawDevFee({from: OWNER});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after_4 = new BN(await web3.eth.getBalance(OWNER));
            assert.equal(0, OWNER_before_4.add(ether("0.0132")).sub(gasSpent).cmp(OWNER_after_4), "wrong OWNER_after_4");

            //  7 - Quit
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

            //  8
            await time.increase(time.duration.seconds(6));

            let OWNER_before_5 = new BN(await web3.eth.getBalance(OWNER));

            await game.withdrawGamePrizes(1, {from: OPPONENT});

            tx = await game.withdrawDevFee({from: OWNER});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            let OWNER_after_5 = new BN(await web3.eth.getBalance(OWNER));
            assert.equal(0, OWNER_before_5.add(ether("0.0088")).sub(gasSpent).cmp(OWNER_after_5), "wrong OWNER_after_5");
        });
    });

    describe("withdrawRafflePrizes", () => {
        beforeEach("update for raffle test", async() => {
            await game.updateRaffleActivationParticipantsCount(2, {from: OWNER});
        });
        
        it("should fail if No raffle prize", async() => {
            await expectRevert(game.withdrawRafflePrizes({from: OTHER}), "No raffle prize");
        });

        it("should delete rafflePrizePendingForAddress[msg.sender]", async() => {
            //  1
            await game.withdrawGamePrizes(1, {from: OPPONENT});
            await game.runRaffle();
            let raffleWinner = (await game.raffleResults.call(0)).winner;

            await assert.equal(0, (await game.rafflePrizePendingForAddress.call(raffleWinner)).cmp(ether("0.003")), "wrong rafflePrizePendingForAddress before");
            await game.withdrawRafflePrizes({from: raffleWinner});
            await assert.equal(0, (await game.rafflePrizePendingForAddress.call(raffleWinner)).cmp(ether("0")), "wrong rafflePrizePendingForAddress after");
        
            //  2
            //  Draw
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("0.321")
            });
            await game.joinGame(6, OPPONENT_2, 1, {
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

            await game.withdrawGamePrizes(1, {from: CREATOR_2});    //  0.321
            await game.withdrawGamePrizes(3, {from: OPPONENT}); //  0.01042


            await time.increase(time.duration.minutes(2));
            await game.runRaffle();
            raffleWinner = (await game.raffleResults.call(1)).winner;

            await assert.equal(0, (await game.rafflePrizePendingForAddress.call(raffleWinner)).cmp(ether("0.01042")), "wrong rafflePrizePendingForAddress before 2");
            await game.withdrawRafflePrizes({from: raffleWinner});
            await assert.equal(0, (await game.rafflePrizePendingForAddress.call(raffleWinner)).cmp(ether("0")), "wrong rafflePrizePendingForAddress after 2");
        });

        it("should increase addressPrizeTotal[msg.sender]", async() => {
            //  1
            await game.withdrawGamePrizes(2, {from: OPPONENT});
            
            let randNum = await game.rand.call();
            let raffleWinner = await game.raffleParticipants.call(randNum);
            let winnerBalanceBefore = await game.addressPrizeTotal.call(raffleWinner);

            await game.runRaffle();
            await game.withdrawRafflePrizes({from: raffleWinner});
            await assert.equal(0, (await game.addressPrizeTotal.call(raffleWinner)).sub(winnerBalanceBefore).cmp(ether("0.005")), "wrong addressPrizeTotal after");

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
            await game.withdrawRafflePrizes({from: raffleWinner});
            await assert.equal(0, (await game.addressPrizeTotal.call(raffleWinner)).sub(winnerBalanceBefore).cmp(ether("0.00246")), "wrong addressPrizeTotal after 1");
        });

        it("should increase partnerFeePending", async() => {
             //  1
             await game.withdrawGamePrizes(2, {from: OPPONENT});
            
             await time.increase(time.duration.seconds(1));
             let randNum = await game.rand.call();
             let raffleWinner = await game.raffleParticipants.call(randNum);
             let partnerFeePendingBefore = await game.partnerFeePending.call();
 
             await game.runRaffle();
             await game.withdrawRafflePrizes({from: raffleWinner});
             let partnerFeePendingAfter = await game.partnerFeePending.call();
             await assert.equal(0, partnerFeePendingAfter.sub(partnerFeePendingBefore).cmp(ether("0.00005")), "wrong partnerFeePendingAfter after");

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
             
             await time.increase(time.duration.seconds(1));
             randNum = await game.rand.call();
             raffleWinner = await game.raffleParticipants.call(randNum);
 
             await game.runRaffle();
             
             partnerFeePendingBefore = await game.partnerFeePending.call();
             await game.withdrawRafflePrizes({from: raffleWinner});
             partnerFeePendingAfter = await game.partnerFeePending.call();
             await assert.equal(0, partnerFeePendingAfter.sub(partnerFeePendingBefore).cmp(ether("0.0000246")), "wrong partnerFeePendingAfter after 1");
        });

        it("should increase devFeePending", async() => {
             //  1
             await game.withdrawGamePrizes(2, {from: OPPONENT});
            
             let randNum = await game.rand.call();
             let raffleWinner = await game.raffleParticipants.call(randNum);
             let devFeePendingBefore = await game.devFeePending.call();
 
             await game.runRaffle();
             await game.withdrawRafflePrizes({from: raffleWinner});
             let devFeePendingAfter = await game.devFeePending.call();
             await assert.equal(0, devFeePendingAfter.sub(devFeePendingBefore).cmp(ether("0.0001")), "wrong devFeePendingAfter after");


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
 
             await game.runRaffle();
             
             let devFeePendingDefore_2 = await game.devFeePending.call();
             await game.withdrawRafflePrizes({from: raffleWinner});
             let devFeePendingAfter_2 = await game.devFeePending.call();
             await assert.equal(0, devFeePendingAfter_2.sub(devFeePendingDefore_2).cmp(ether("0.0000492")), "wrong devFeePendingAfter_2 after 1");
        });

        it("should transfer correct prize", async() => {
            //  1
            await game.withdrawGamePrizes(2, {from: OPPONENT});
            
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
            await assert.equal(0, raffleWinnerBefore.add(ether("0.00485")).sub(gasSpent).cmp(raffleWinnerAfter), "wrong raffleWinnerAfter after");

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

            raffleWinnerAfter = new BN(await web3.eth.getBalance(raffleWinner));
            await assert.equal(0, raffleWinnerBefore.add(ether("0.0023862")).sub(gasSpent).cmp(raffleWinnerAfter), "wrong raffleWinnerAfter after 1");
        });

        it("should not transferPartnerFee if < threshold", async() => {
            //  1
            await game.withdrawGamePrizes(2, {from: OPPONENT});
            
            let randNum = await game.rand.call();
            let raffleWinner = await game.raffleParticipants.call(randNum);
            let partnerBefore = new BN(await web3.eth.getBalance(PARTNER));

            await game.runRaffle();

            let tx = await game.withdrawRafflePrizes({from: raffleWinner});
            let gasUsed = new BN(tx.receipt.gasUsed);
            let txInfo = await web3.eth.getTransaction(tx.tx);
            let gasPrice = new BN(txInfo.gasPrice);
            let gasSpent = gasUsed.mul(gasPrice);

            let partnerAfter = new BN(await web3.eth.getBalance(PARTNER));
            await assert.equal(0, partnerAfter.cmp(partnerBefore), "wrong partnerAfter after");

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
            partnerBefore = new BN(await web3.eth.getBalance(PARTNER));

            await game.runRaffle();

            tx = await game.withdrawRafflePrizes({from: raffleWinner});
            gasUsed = new BN(tx.receipt.gasUsed);
            txInfo = await web3.eth.getTransaction(tx.tx);
            gasPrice = new BN(txInfo.gasPrice);
            gasSpent = gasUsed.mul(gasPrice);

            partnerAfter = new BN(await web3.eth.getBalance(PARTNER));
            await assert.equal(0, partnerAfter.cmp(partnerBefore), "wrong partnerAfter after 1");
        });

        it("should transferPartnerFee if > threshold", async() => {
            let partnerBefore = new BN(await web3.eth.getBalance(PARTNER));

            //  1 - OPPONENT wins
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("49.999123")
            });
            await game.joinGame(6, OWNER, 2, {
                from: OPPONENT,
                value: ether("49.999123")
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
            // 0,99998246 - after withdrawal
            
            let partnerAfter = new BN(await web3.eth.getBalance(PARTNER));
            await assert.equal(0, partnerAfter.sub(partnerBefore).cmp(ether("0")), "wrong partnerAfter after");

            let randNum = await game.rand.call();
            let raffleWinner = await game.raffleParticipants.call(randNum);
            partnerBefore = new BN(await web3.eth.getBalance(PARTNER));

            await game.runRaffle();
            await game.withdrawRafflePrizes({from: raffleWinner});

            partnerAfter = new BN(await web3.eth.getBalance(PARTNER));
            await assert.equal(0, partnerAfter.sub(partnerBefore).cmp(ether("1.0099822846")), "wrong partnerAfter after 1");

            await time.increase(time.duration.seconds(6));

            //  2 - OPPONENT wins
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("49.999")
            });
            await game.joinGame(7, OWNER, 2, {
                from: OPPONENT,
                value: ether("49.999")
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

            await game.playMove(7, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            await game.withdrawGamePrizes(1, {from: OPPONENT});
            
            randNum = await game.rand.call();
            raffleWinner = await game.raffleParticipants.call(randNum);
            partnerBefore = new BN(await web3.eth.getBalance(PARTNER));

            await game.runRaffle();
            await game.withdrawRafflePrizes({from: raffleWinner});

            partnerAfter = new BN(await web3.eth.getBalance(PARTNER));
            await assert.equal(0, partnerAfter.sub(partnerBefore).cmp(ether("1.0099798")), "wrong partnerAfter after 2");
        });

        it("should emit RPS_RafflePrizeWithdrawn with correct params", async() => {
            await game.withdrawGamePrizes(2, {from: OPPONENT});
            
            let randNum = await game.rand.call();
            let raffleWinner = await game.raffleParticipants.call(randNum);

            await game.runRaffle();
            const { logs } = await game.withdrawRafflePrizes({from: raffleWinner});
    
            assert.equal(1, logs.length, "should be single event");
            await expectEvent.inLogs(logs, 'RPS_RafflePrizeWithdrawn', {
                winner: raffleWinner,
                prize: ether("0.00485")
            });
        });
    });
});