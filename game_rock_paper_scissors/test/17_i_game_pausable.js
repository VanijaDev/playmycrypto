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


contract("IGamePausable", (accounts) => {
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
    });

    describe("Paused", () => {
        it("should fail createGame if paused", async() => {
            await game.pause({from: OWNER});

            await expectRevert(game.createGame(CREATOR_REFERRAL, hash, {
                from: OTHER,
                value: ether("1")
            }), "Pausable: paused");
        });

        it("should fail joinGame if paused", async() => {
            await game.pause({from: OWNER});

            await expectRevert(game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            }), "Pausable: paused");
        });

        it("should fail addTopGame if paused", async() => {
            await game.pause({from: OWNER});

            await expectRevert(game.addTopGame(1, {
                from: CREATOR,
                value: ether("0.01")
            }), "Pausable: paused");
        });

        it("should fail increaseBetForGameBy if paused", async() => {
            await game.pause({from: OWNER});

            await expectRevert(game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.1111")
            }), "Pausable: paused");
        });
    });

    describe("gameOnPause", () => {
        it("should return true if game is paused", async () => {
            assert.isFalse(await game.gameOnPause.call(1), "game should be false before");
            await game.pauseGame(1, {
                from: CREATOR
            });

            assert.isTrue(await game.gameOnPause.call(1), "game should be true after");
        });

        it("should return false if game is not paused", async () => {
            await game.pauseGame(1, {
                from: CREATOR
            });
            assert.isTrue(await game.gameOnPause.call(1), "game should be true before");

            await game.unpauseGame(1, {
                from: CREATOR,
                value: ether("0.01")
            });
            assert.isFalse(await game.gameOnPause.call(1), "game should not be false after");
        });
    });

    describe("pauseGame", () => {
        it("should fail if not game creator", async () => {
            await expectRevert(game.pauseGame(1, {
                from: OTHER
            }), "Not creator");
        });

        it("should fail if game is already paused", async () => {
            await game.pauseGame(1, {
                from: CREATOR
            });

            await expectRevert(game.pauseGame(1, {
                from: CREATOR
            }), "Game is paused");
        });

        it("should fail if game is joined", async () => {
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });

            await expectRevert(game.pauseGame(1, {
                from: CREATOR
            }), "!= WaitingForOpponent");
        });

        it("should update paused to true", async () => {
            assert.isFalse(await game.gameOnPause.call(1), "game paused should be false before");
            await game.pauseGame(1, {
                from: CREATOR
            });

            assert.isTrue(await game.gameOnPause.call(1), "game paused should be true after");
        });

        it("should removeGameFromTopGames", async () => {
            //  1
            await game.addTopGame(1, {
                from: CREATOR,
                value: ether("0.01")
            });

            //  2
            await game.createGame(OPPONENT_REFERRAL, hash, {
                from: OPPONENT,
                value: ether("1")
            });
            await game.addTopGame(2, {
                from: OPPONENT,
                value: ether("0.01")
            });

            let _topGames = await game.getTopGames.call();
            assert.equal(0, _topGames[0].cmp(new BN("2")), "wrong top games [0] before");
            assert.equal(0, _topGames[1].cmp(new BN("1")), "wrong top games [1] before");
            assert.equal(0, _topGames[2].cmp(new BN("0")), "wrong top games [2] before");
            assert.equal(0, _topGames[3].cmp(new BN("0")), "wrong top games [3] before");
            assert.equal(0, _topGames[4].cmp(new BN("0")), "wrong top games [4] before");

            await game.pauseGame(1, {
                from: CREATOR
            });

            _topGames = await game.getTopGames.call();
            assert.equal(0, _topGames[0].cmp(new BN("2")), "wrong top games [0] after");
            assert.equal(0, _topGames[1].cmp(new BN("0")), "wrong top games [1] after");
            assert.equal(0, _topGames[2].cmp(new BN("0")), "wrong top games [2] after");
            assert.equal(0, _topGames[3].cmp(new BN("0")), "wrong top games [3] after");
            assert.equal(0, _topGames[4].cmp(new BN("0")), "wrong top games [4] after");

        });

        it("should emit GamePaused with correct args", async () => {
            let tx = await game.pauseGame(1, {
                from: CREATOR
            });
            assert.equal(1, tx.logs.length, "should be 1 log");
            let event = tx.logs[0];
            assert.equal(event.event, "RPS_GamePaused", "should be RPS_GamePaused");
            assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
        });
    });

    describe("unpauseGame", () => {
        it("should fail if not game creator", async () => {
            await expectRevert(game.unpauseGame(1, {
                from: OTHER,
                value: ether("0.01")
            }), "Not creator");

            await game.pauseGame(1, {
                from: CREATOR
            });
        });

        it("should fail if game is not paused", async () => {
            await expectRevert(game.unpauseGame(1, {
                from: CREATOR,
                value: ether("0.01")
            }), "Game is not paused");
        });

        it("should fail if wrong fee", async () => {
            await game.pauseGame(1, {
                from: CREATOR
            });

            await expectRevert(game.unpauseGame(1, {
                from: CREATOR,
                value: ether("0.00001")
            }), "Wrong fee");
        });

        it("should update paused to false", async () => {
            await game.pauseGame(1, {
                from: CREATOR
            });

            assert.isTrue(await game.gameOnPause.call(1), "game should be paused");

            await game.unpauseGame(1, {
                from: CREATOR,
                value: ether("0.01")
            });

            assert.isFalse(await game.gameOnPause.call(1), "game should be unpaused");
        });

        it("should update devFeePending", async () => {
            await game.pauseGame(1, {
                from: CREATOR
            });

            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0")), "devFeePending should be 0 before");
            await game.unpauseGame(1, {
                from: CREATOR,
                value: ether("0.01")
            });
            assert.equal(0, (await game.devFeePending.call()).cmp(ether("0.01")), "devFeePending should be 0.01 after");
        });

        it("should update totalUsedInGame", async() => {
            await game.pauseGame(1, {
                from: CREATOR
            });
            let totalUsedInGameBefore = await game.totalUsedInGame.call();
      
            await game.unpauseGame(1, {
                from: CREATOR,
                value: ether("0.01")
            });

            let totalUsedInGameAfter = await game.totalUsedInGame.call();

            assert.equal(0, totalUsedInGameAfter.sub(totalUsedInGameBefore).cmp(ether("0.01")), "wrong difference");
        });

        it("should emit GameUnpaused with correct args", async () => {
            await game.pauseGame(1, {
                from: CREATOR
            });

            let tx = await game.unpauseGame(1, {
                from: CREATOR,
                value: ether("0.01")
            });
            assert.equal(1, tx.logs.length, "should be 1 log");
            let event = tx.logs[0];
            assert.equal(event.event, "RPS_GameUnpaused", "should be RPS_GameUnpaused");
            assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
        });
    });
});