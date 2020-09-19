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


contract("Play Move", (accounts) => {
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

    describe("makeMove - intermediate moves", () => {
        it("should fail if paused", async () => {
            await game.pause();

            await expectRevert(game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: OTHER
            }), "paused");
        });

        it("should fail if not game creator", async () => {
            await expectRevert(game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: OTHER
            }), "Not creator");
        });

        it("should fail if != next mover", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            //  2
            await expectRevert(game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            }), "Not next mover");
        });

        it("should fail if game move was expired", async () => {
            await time.increase(time.duration.hours(16));

            await expectRevert(game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            }), "Move expired");
        });

        it("should fail if Wrong hash value", async () => {
            await expectRevert(game.playMove(1, 1, web3.utils.soliditySha3("Hello World wrong"), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            }), "Wrong hash value");
        });

        it("should update movesCreator", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.equal(0, (await game.showRowMoves.call(1, 0))[0].cmp(new BN("1")), "wrong movesCreator[0]");

            //  2
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            await game.playMove(1, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.equal(0, (await game.showRowMoves.call(1, 1))[0].cmp(new BN("2")), "wrong movesCreator[1]");

            //  3
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.equal(0, (await game.showRowMoves.call(1, 2))[0].cmp(new BN("1")), "wrong movesCreator[2]"); 
        });

        it("should fail if empty moveHash if gameRow < 2", async() => {
            await expectRevert(game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), "0x0", {
                from: CREATOR
            }), "Empty hash");
        });

        it("should update creatorMoveHashes if gameRow < 2", async () => {
            //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.deepEqual(await game.getCreatorMoveHashesForGame.call(1),
                [hash, 
                 web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)),
                 '0x0000000000000000000000000000000000000000000000000000000000000000'], "wrong creatorMoveHashes");

            //  2
            await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });
            await game.playMove(1, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.deepEqual(await game.getCreatorMoveHashesForGame.call(1),
                [hash, 
                 web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), 
                 web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED))], "wrong creatorMoveHashes 2");

        });

        it("should set game.nextMover = game.opponent if gameRow < 2", async () => {
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.equal((await game.games.call(1)).nextMover, OPPONENT, "wrong next mover");
        });

        it("should update prevMoveTimestamp to now if gameRow < 2", async () => {
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.equal(0, (await game.games.call(1)).prevMoveTimestamp.cmp(await time.latest()), "wrong prevMoveTimestamp after");
        });

        it("should emit GameMovePlayed with correct args if gameRow < 2", async () => {
            //  1

            let { logs } = await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            assert.equal(1, logs.length, "should be 1 event");
            await expectEvent.inLogs(
            logs, 'RPS_GameMovePlayed', {
                id: new BN("1")
            });

            //  2
             await game.opponentNextMove(1, 1, {
                from: OPPONENT
            });

            tx = await game.playMove(1, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.equal(1, tx.logs.length, "should be 1 log");
            let event = tx.logs[0];
            assert.equal(event.event, "RPS_GameMovePlayed", "should be RPS_GameMovePlayed");
            assert.equal(0, event.args.id.cmp(new BN("1")), "id should be 1");
        });
    });

    describe("playerWithMoreWins", ()=> {
        //  3 wins
        it("should return CREATOR, Rock - Scissors * 3", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 3, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Scissors - Paper * 3", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Paper - Rock * 3", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        //  1 win (Rock - scissors), draw, draw
        it("should return CREATOR, Rock - Scissors, Rock - Rock, Rock - Rock", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 3, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Rock - Scissors, Scissors - Scissors, Scissors - Scissors", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 3, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Rock - Scissors, Paper - Paper, Paper - Paper", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 3, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        //  1 win (Scissors - Paper), draw, draw
        it("should return CREATOR, Scissors - Paper, Rock - Rock, Rock - Rock", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Scissors - Paper, Scissors - Scissors, Scissors - Scissors", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Scissors - Paper, Paper - Paper, Paper - Paper", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        //  1 win (Paper - Rock), draw, draw
        it("should return CREATOR, Paper - Rock, Rock - Rock, Rock - Rock", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Paper - Rock, Scissors - Scissors, Scissors - Scissors", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return CREATOR, Paper - Rock, Paper - Paper, Paper - Paper", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should return 0x0 on Draw, Rock - Rock * 3", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal("0x0000000000000000000000000000000000000000", (await game.games.call(2)).winner, "wrong winner");
        });

        it("should return 0x0 on Draw, Paper - Paper * 3", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal("0x0000000000000000000000000000000000000000", (await game.games.call(2)).winner, "wrong winner");
        });

        it("should return 0x0 on Draw, Scissors - Scissors * 3", async() => {
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 3, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 3, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal("0x0000000000000000000000000000000000000000", (await game.games.call(2)).winner, "wrong winner");
        });
    });

    describe("makeMove - last move", () => {
        it("should set CREATOR as winner", async() => {
            //  Paper - Rock, Paper - Paper, Paper - Paper
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(CREATOR_2, (await game.games.call(2)).winner, "wrong winner, should be CREATOR_2");
        });

        it("should set 0x0 as winner if Draw", async() => {
            //  Rock - Rock * 3
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal("0x0000000000000000000000000000000000000000", (await game.games.call(2)).winner, "wrong winner, should be draw");
        });

        it("should set GameState.WinnerPresent", async() => {
            //  Paper - Rock, Paper - Paper, Paper - Paper
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });
            
            //  2
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 2, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "wrong gameState");
        });

        it("should call finishGame", async() => {
            //  Rock - Rock * 3
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.strictEqual(0, (await game.games.call(2)).state.cmp(new BN("3")), "wrong game.state");
        });

        it("should emit RPS_GameFinished", async() => {
            //  Rock - Rock * 3
            await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2,
                value: ether("0.1")
            });
            await game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT_2,
                value: ether("0.1")
            });

            //  1
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  2
            await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });
            await game.opponentNextMove(2, 1, {
                from: OPPONENT_2
            });

            //  3
            const {logs} = await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR_2
            });

            assert.strictEqual(1, logs.length, "should be single event");
            await expectEvent.inLogs(logs, 'RPS_GameFinished', {
                id: new BN("2"),
                creator: CREATOR_2,
                opponent: OPPONENT_2
            });
        });
    });
});