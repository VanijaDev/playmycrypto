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


contract("Top Games", (accounts) => {
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
    const OPPONENT_2_REFERRAL = accounts[11];

    const UPDATE_FEE = ether("0.01");

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
    });

    describe("addTopGame", () => {
        it("should fail if paused", async () => {
            await game.pause();

            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            }), "paused");
        });

        it("should fail if not game creator", async () => {
            await expectRevert(game.addTopGame(1, {
                from: OTHER,
                value: UPDATE_FEE
            }), "Not creator");
        });

        it("should fail if GameState == Started", async () => {
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });

            assert.strictEqual(0, (await game.games.call(1)).state.cmp(new BN("1")), "should be Started");
            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            }), "!= WaitingForOpponent");
        });

        it("should fail if GameState == WinnerPresent", async () => {
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });
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

            assert.strictEqual(0, (await game.games.call(1)).state.cmp(new BN("2")), "should be WinnerPresent");
            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            }), "!= WaitingForOpponent");
        });

        it("should fail if GameState == Draw", async () => {
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });

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

            assert.strictEqual(0, (await game.games.call(1)).state.cmp(new BN("3")), "should be Draw");
            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            }), "!= WaitingForOpponent");
        });

        it("should fail if GameState == Quitted", async () => {
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });
            await game.quitGame(1, {
                from: OPPONENT
            });

            assert.equal(0, (await game.games.call(1)).state.cmp(new BN("4")), "should be Quitted");
            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            }), "!= WaitingForOpponent");
        });

        it("should fail if GameState == Expired", async () => {
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });

            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(1, {
                from: OPPONENT
            });

            assert.equal(0, (await game.games.call(1)).state.cmp(new BN("5")), "should be Expired");
            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            }), "!= WaitingForOpponent");
        });

        it("should fail if game is paused", async () => {
            await game.pauseGame(1, {
                from: CREATOR
            });

            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            }), "Game is paused");
        });

        it("should fail if wrong UPDATE_FEE", async () => {
            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: ether("1")
            }), "Wrong fee");
        });

        it("should fail if on top of top games", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("0.1")
            });
        
            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });

            await game.addTopGame(2, {
                from: CREATOR_2,
                value: UPDATE_FEE
            });
        
            await expectRevert(game.addTopGame(2, {
                from: CREATOR_2,
                value: UPDATE_FEE
            }), "Top in TopGames");
        });

        it("should add game to top games", async () => {
            //  1
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("0.1")
            });
        
            await game.addTopGame(2, {
                from: CREATOR_2,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("2"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array 1");

            //  2
            await game.createGame(CREATOR, hash, {
                from: CREATOR_REFERRAL,
                value: ether("0.1")
            });
        
            await game.addTopGame(3, {
                from: CREATOR_REFERRAL,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("3"), new BN("2"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array 2");

            //  3
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2_REFERRAL,
                value: ether("0.1")
            });
        
            await game.addTopGame(4, {
                from: CREATOR_2_REFERRAL,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("4"), new BN("3"), new BN("2"), new BN("0"), new BN("0")], "wrong topGames array 3");

            //  4
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: OTHER,
                value: ether("0.1")
            });
        
            await game.addTopGame(5, {
                from: OTHER,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("5"), new BN("4"), new BN("3"), new BN("2"), new BN("0")], "wrong topGames array 4");

            //  5
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: OPPONENT,
                value: ether("0.1")
            });
        
            await game.addTopGame(6, {
                from: OPPONENT,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("6"), new BN("5"), new BN("4"), new BN("3"), new BN("2")], "wrong topGames array 5");

            //  6
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: OPPONENT_2,
                value: ether("0.1")
            });
        
            await game.addTopGame(7, {
                from: OPPONENT_2,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("7"), new BN("6"), new BN("5"), new BN("4"), new BN("3")], "wrong topGames array 6");

            //  7
            await game.addTopGame(5, {
                from: OTHER,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("5"), new BN("7"), new BN("6"), new BN("4"), new BN("3")], "wrong topGames array 7");

            //  8
            await game.addTopGame(3, {
                from: CREATOR_REFERRAL,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("3"), new BN("5"), new BN("7"), new BN("6"), new BN("4")], "wrong topGames array 8");
        });

        it("should update devFeePending by adding UPDATE_FEE", async () => {
            let devFee_before = await game.devFeePending.call();

            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });

            let devFee_after = await game.devFeePending.call();
            assert.strictEqual(0, devFee_after.sub(devFee_before).cmp(UPDATE_FEE), "wrong devFeePending after adding game to top");
        });

        it("should update totalUsedInGame by adding UPDATE_FEE", async () => {
            let totalUsedInGame_before = await game.totalUsedInGame.call();

            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });

            let totalUsedInGame_after = await game.totalUsedInGame.call();
            assert.strictEqual(0, totalUsedInGame_after.sub(totalUsedInGame_before).cmp(UPDATE_FEE), "wrong totalUsedInGame after adding game to top");
        });

        it("should emit GameAddedToTop event with correct prams", async () => {
            const { logs } = await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });
            assert.strictEqual(1, logs.length, "should be 1 event");
            await expectEvent.inLogs(
            logs, 'RPS_GameAddedToTop', {
                id: new BN("1"),
                creator: CREATOR
            });
        });
    });

    describe("removeTopGame", ()=> {
        it("should remove on quit", async() => {        
            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });

            assert.deepEqual(await game.getTopGames.call(), [new BN("1"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array before");
            await game.quitGame(1, {
                from: CREATOR
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("0"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array after");
        });

        it("should remove on join", async() => {
            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });

            assert.deepEqual(await game.getTopGames.call(), [new BN("1"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array before");
            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("0"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array after");
        });

        it("should remove on pause", async() => {
            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });

            assert.deepEqual(await game.getTopGames.call(), [new BN("1"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array before");
            await game.pauseGame(1, {
                from: CREATOR
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("0"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array after");
        
        });
    });

    describe("getTopGames", () => {
        it("should return correct topGames", async () => {
            //  1
            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("1"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array 1");
            
            //  2
            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("1")
            });
            await game.addTopGame(2, {
                from: CREATOR_2,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("2"), new BN("1"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array 2");

            //  3
            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: OTHER,
                value: ether("1")
            });

            //  4
            await game.createGame(OPPONENT_2_REFERRAL, hash, {
                from: OPPONENT_2,
                value: ether("1")
            });
            await game.addTopGame(4, {
                from: OPPONENT_2,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("4"), new BN("2"), new BN("1"), new BN("0"), new BN("0")], "wrong topGames array 3");

            //  5
            await game.addTopGame(3, {
                from: OTHER,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("3"), new BN("4"), new BN("2"), new BN("1"), new BN("0")], "wrong topGames array 4");
            
            //  6
            await game.createGame(OPPONENT_REFERRAL, hash, {
                from: OPPONENT,
                value: ether("1")
            });
            await game.addTopGame(5, {
                from: OPPONENT,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("5"), new BN("3"), new BN("4"), new BN("2"), new BN("1")], "wrong topGames array 5");
            
            //  7
            await game.createGame(OPPONENT_2_REFERRAL, hash, {
                from: OPPONENT_REFERRAL,
                value: ether("1")
            });
            await game.addTopGame(6, {
                from: OPPONENT_REFERRAL,
                value: UPDATE_FEE
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("6"), new BN("5"), new BN("3"), new BN("4"), new BN("2")], "wrong topGames array 6");
        });
    });

    describe.only("isTopGame", () => {
        it.only("should return false if no such game", async() => {
            assert.equal(await game.isTopGame.call(3), false, "should return false");
        });

        it("should return false if not TopGame", async() => {
            assert.equal(await game.isTopGame.call(1), false, "should return false");
        });

        it("should return true if TopGame", async() => {
            assert.equal(await game.isTopGame.call(1), false, "should return false");

            await game.addTopGame(1, {
                from: CREATOR,
                value: UPDATE_FEE
            });
            assert.equal(await game.isTopGame.call(1), true, "should return true");
        });
    });
});