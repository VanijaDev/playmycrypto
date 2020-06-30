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


contract("Join", (accounts) => {
    const OWNER = accounts[0];
    const CREATOR = accounts[1];
    const OPPONENT = accounts[2];
    const CREATOR_REFERRAL = accounts[3];
    const OPPONENT_REFERRAL = accounts[4];
    const PARTNER = accounts[5];
    const CREATOR_2 = accounts[6];
    const CREATOR_2_REFERRAL = accounts[7];
    const OTHER = accounts[9];

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
            value: ether("1", ether)
        });
    });

    describe("joinGame", () => {
        it("should fail if paused", async () => {
            //  1
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1", ether)
            });

            await game.pause();

            await expectRevert(game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            }), "paused");
        });

        it("should fail if already participating in other game", async () => {
            //  1
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1", ether)
            });

            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            });

            //  2
            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("1", ether)
            });

            await expectRevert(game.joinGame(2, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("1")
            }), "No more participating");
        });

        it("should fail if creator tries to to join his game", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await expectRevert(game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: CREATOR,
                value: ether("1")
            }), "No more participating");
        });

        it("should fail if game is paused", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await game.pauseGame(1, {
                from: CREATOR
            });

            await expectRevert(game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            }), "Game is paused");
        });

        it("should fail is state != WaitingForOpponent", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            await expectRevert(game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OTHER,
                value: ether("1")
            }), "!= WaitingForOpponent");
        });

        it("should fail if referral == opponent", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await expectRevert(game.joinGame(1, OPPONENT, 2, {
                from: OPPONENT,
                value: ether("1")
            }), "Wrong referral");
        });

        it("should fail if wrong move", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await expectRevert(game.joinGame(1, CREATOR_REFERRAL, 0, {
                from: OPPONENT,
                value: ether("1")
            }), "Wrong move idx");

            await expectRevert(game.joinGame(1, CREATOR_REFERRAL, 4, {
                from: OPPONENT,
                value: ether("1")
            }), "Wrong move idx");

            await expectRevert(game.joinGame(1, CREATOR_REFERRAL, 5, {
                from: OPPONENT,
                value: ether("1")
            }), "Wrong move idx");
        });

        it("should fail if wrong bet", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await expectRevert(game.joinGame(1, CREATOR_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("11")
            }), "Wrong bet");
        });

        it("should set correct game opponentReferral if != address(0)", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });
            assert.equal((await game.games.call(1)).opponentReferral, OPPONENT_REFERRAL, "wrong opponentReferral set");
        });

        it("should set game opponentReferral as address(0) if passed == address(0)", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await game.joinGame(1, "0x0000000000000000000000000000000000000000", 2, {
                from: OPPONENT,
                value: ether("1")
            });
            assert.equal((await game.games.call(1)).opponentReferral, "0x0000000000000000000000000000000000000000", "wrong opponentReferral set");
        });

        it("should remove game from TOP GAMES if present", async () => {
            //  create
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: OTHER,
                value: ether("1")
            });
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            //  add to top
            await game.addTopGame(2, {
                from: CREATOR,
                value: ether("0.01")
            });
            await game.addTopGame(1, {
                from: OTHER,
                value: ether("0.01")
            });
            assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("1")), "wrong top game[0] after adding to TOP GAMES");
            assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("2")), "wrong top game[1] after adding to TOP GAMES");

            //  join 2
            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });
            assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("1")), "top game[0] should be excluded");
            assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("0")), "top game[1] should be excluded");

            //  join 1
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: CREATOR_REFERRAL,
                value: ether("1")
            });
            assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("0")), "top game[0] should be excluded again");
            assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("0")), "top game[0] should be excluded again");
        });

        it("should increase addressBetTotal for opponent", async () => {
            //  1
            let prev = await game.addressBetTotal.call(OPPONENT);
      
            await game.createGame(CREATOR_REFERRAL, hash, {
              from: CREATOR,
              value: ether("1", ether)
            });

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });
      
            assert.equal(0, (await game.addressBetTotal.call(OPPONENT)).sub(prev).cmp(ether("1")), "wrong addressBetTotal 1");
      
            await game.quitGame(1, {
              from: CREATOR
            });
      
            //  2
            await game.createGame(CREATOR_REFERRAL, hash, {
              from: CREATOR_2,
              value: ether("0.2", ether)
            });

            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("0.2")
            });
      
            assert.equal(0, (await game.addressBetTotal.call(OPPONENT)).sub(prev).cmp(ether("1.2")), "wrong addressBetTotal 2");
          });

        it("should set opponent", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            assert.equal((await game.games.call(1)).opponent, "0x0000000000000000000000000000000000000000");

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            assert.equal((await game.games.call(1)).opponent, OPPONENT);
        });

        it("should set nextMover", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1", ether)
            });

            assert.equal((await game.games.call(1)).nextMover, "0x0000000000000000000000000000000000000000");

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            assert.equal((await game.games.call(1)).nextMover, CREATOR);
        });

        it("should update prevMoveTimestamp to now", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1", ether)
            });

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            assert.equal(0, ((await game.games.call(1)).prevMoveTimestamp).cmp(await time.latest()), "wrong prevMoveTimestamp");
        });

        it("should update movesOpponent[0]", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1", ether)
            });

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            assert.equal(0, ((await game.showRowMoves.call(1, 0))[1]).cmp(new BN("2")), "wrong movesOpponent[0]");
        });

        it("should update state to Started", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1", ether)
            });

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            assert.equal(0, (await game.games.call(1)).state.cmp(new BN("1")), "state should be Started");
        });

        it("should set correct ongoingGameIdxForPlayer", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("2", ether)
            });

            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("2")
            });

            assert.equal(0, (await game.ongoingGameIdxForPlayer.call(OPPONENT)).cmp(new BN("2")), "wrong ongoingGameIdxForPlayer after join");
        });

        it("should update playedGameIdxsForPlayer", async () => {
            //  1
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });

            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("2")
            });

            await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("2")
            });

            let idxs = await game.getPlayedGameIdxsForPlayer.call(OPPONENT);
            assert.equal(idxs.length, 1, "wrong idxs amount");
            assert.equal(0, idxs[0].cmp(new BN("2")), "wrong game index");

            await game.quitGame(2, {
                from: OPPONENT
            });

            //  2
            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });

            idxs = await game.getPlayedGameIdxsForPlayer.call(OPPONENT);
            assert.equal(idxs.length, 2, "wrong idxs amount");
            assert.equal(0, idxs[0].cmp(new BN("2")), "wrong game index, has to be 2");
            assert.equal(0, idxs[1].cmp(new BN("1")), "wrong game index, has to be 1");
        });

        it("should update totalUsedInGame", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1")
            });
            assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("2")), "wrong totalUsedInGame before");

            await game.joinGame(1, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("1")
            });
            assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("3")), "wrong totalUsedInGame");
        });

        it("should emit GameJoined with correct args", async () => {
            // event GameJoined(uint256 indexed id, address indexed creator, address indexed opponent, address nextMover);

            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("1", ether)
            });

            await game.createGame(CREATOR_2_REFERRAL, hash, {
                from: CREATOR_2,
                value: ether("2", ether)
            });

            let tx = await game.joinGame(2, OPPONENT_REFERRAL, 2, {
                from: OPPONENT,
                value: ether("2")
            });

            assert.equal(1, tx.logs.length, "should be 1 log");
            let event = tx.logs[0];
            assert.equal(event.event, "RPS_GameJoined", "should be RPS_GameJoined");
            assert.equal(0, event.args.id.cmp(new BN("2")), "should be 2");
            assert.equal(event.args.creator, CREATOR_2, "should be CREATOR_2");
            assert.equal(event.args.opponent, OPPONENT, "should be OPPONENT");
            assert.equal(event.args.nextMover, CREATOR_2, "should be Creator");
        });
    });
});