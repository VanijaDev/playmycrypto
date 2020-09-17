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


contract("Quit Game", (accounts) => {
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
        await game.joinGame(1, OPPONENT_REFERRAL, 1, {
            from: OPPONENT,
            value: ether("1")
        });
    });

    describe("quitGame", () => {
        it("should fail if sender is Not a game player", async () => {
            await expectRevert(game.quitGame(1, {
                from: OTHER
            }), "Not a game player");
        });

        it("should fail if Game.State == WinnerPresent", async () => {
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

            await expectRevert(game.quitGame(1, {
                from: CREATOR
            }), "Wrong game state");
        });

        it("should fail if Game.State == Draw", async () => {
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

            await expectRevert(game.quitGame(1, {
                from: CREATOR
            }), "Wrong game state");
        });

        it("should fail if Game.State == Quitted", async () => {
            await game.quitGame(1, {
                from: CREATOR
            });

            await expectRevert(game.quitGame(1, {
                from: CREATOR
            }), "Wrong game state");

            await expectRevert(game.quitGame(1, {
                from: OPPONENT
            }), "Wrong game state");
        });

        it("should fail if Game.State == Expired", async () => {
            await time.increase(time.duration.hours(16));
            await game.finishExpiredGame(1, {
                from: OPPONENT
            });

            await expectRevert(game.quitGame(1, {
                from: CREATOR
            }), "Wrong game state");

            await expectRevert(game.quitGame(1, {
                from: OPPONENT
            }), "Wrong game state");
        });

        it("should set winner as OWNER if no opponent", async() => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("0.1")
            });

            await game.quitGame(2, {
                from: CREATOR_2
            });

            assert.strictEqual((await game.games.call(2)).winner, OWNER, "wrong winner, shold be OWNER");
        });

        it("should set game.winner to opposite to quitter if both players present", async () => {
            await game.quitGame(1, {
                from: CREATOR
            });

            assert.strictEqual((await game.games.call(1)).winner, OPPONENT, "wrong winner, should be OPPONENT");

            //  2
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            await game.quitGame(2, {
                from: OPPONENT_2
            });

            assert.equal((await game.games.call(2)).winner, CREATOR_2, "wrong winner, should be CREATOR_2");
        });

        it("should fail if claimer & Game.State == Expired", async () => {
            await time.increase(time.duration.hours(16));

            await expectRevert(game.quitGame(1, {
                from: OPPONENT
            }), "Claim, not quit");
        });

        it("should set game.state = GameState.Quitted", async () => {
            await game.quitGame(1, {
                from: CREATOR
            });

            assert.equal(0, (await game.games.call(1)).state.cmp(new BN("4")), "game.state should be GameState.Quitted");
        });

        it("should remove from top games", async() => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.addTopGame(2, {
                from: CREATOR_2,
                value: ether("0.01")
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("2"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array before");

            await game.quitGame(2, {
                from: CREATOR_2
            });
            assert.deepEqual(await game.getTopGames.call(), [new BN("0"), new BN("0"), new BN("0"), new BN("0"), new BN("0")], "wrong topGames array after");
        });

        it("should emit GameFinished event to finish game", async () => {
            let tx = await game.quitGame(1, {
                from: CREATOR
            });
            assert.equal(1, tx.logs.length, "should be 1 log");
            event = tx.logs[0];
            assert.equal(event.event, "RPS_GameFinished", "should be RPS_GameFinished");
        });
    });
});