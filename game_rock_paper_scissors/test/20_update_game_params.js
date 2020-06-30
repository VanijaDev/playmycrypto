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


contract("Update Game Params", (accounts) => {
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
    });

    describe("increaseBetForGameBy", () => {
        beforeEach("create game", async () => {
            await game.createGame(CREATOR_REFERRAL, hash, {
                from: CREATOR,
                value: ether("0.1")
            });
        });

        it("should fail if paused", async () => {
            await game.pause();

            await expectRevert(game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.1")
            }), "paused");
        });

        it("should fail if not game creator", async () => {
            await expectRevert(game.increaseBetForGameBy(1, {
                from: OTHER,
                value: ether("0.1")
            }), "Not creator");
        });

        it("should fail if != WaitingForOpponent", async () => {
            await game.joinGame(1, OPPONENT_REFERRAL, 1, {
                from: OPPONENT,
                value: ether("0.1")
            });

            await expectRevert(game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.1")
            }), "!= WaitingForOpponent");
        });

        it("should fail if game bet is 0", async () => {
            await expectRevert(game.increaseBetForGameBy(1, {
                from: CREATOR,
            }), "increase must be > 0");
        });

        it("should increase addressBetTotal[msg.sender]", async() => {
            let prev = await game.addressBetTotal.call(CREATOR);
        
            await game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.1")
            });
        
            assert.equal(0, (await game.addressBetTotal.call(CREATOR)).sub(prev).cmp(ether("0.1")), "wrong addressBetTotal");
        });

        it("should increase bet for game", async () => {
            //  1
            await game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.1")
            });
            assert.equal(0, (await game.games.call(1)).bet.cmp(ether("0.2")), "wrong bet after update 1");

            //  2
            await game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.2")
            });
            assert.equal(0, (await game.games.call(1)).bet.cmp(ether("0.4")), "wrong bet after update 2");

            //  3
            await game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.002")
            });
            assert.equal(0, (await game.games.call(1)).bet.cmp(ether("0.402")), "wrong bet after update 3");
        });

        it("should update totalUsedInGame", async() => {
            let totalUsedInGameBefore = await game.totalUsedInGame.call();
      
            await game.increaseBetForGameBy(1, {
              from: CREATOR,
              value: ether("0.15")
            });
      
            let totalUsedInGameAfter = await game.totalUsedInGame.call();
      
            assert.equal(0, totalUsedInGameAfter.sub(totalUsedInGameBefore).cmp(ether("0.15")), "wrong difference");
          });

        it("should emit GameUpdated with correct args", async () => {
            let tx = await game.increaseBetForGameBy(1, {
                from: CREATOR,
                value: ether("0.2")
            });
            assert.equal(1, tx.logs.length, "should be 1 log");
            let event = tx.logs[0];
            assert.equal(event.event, "RPS_GameUpdated", "should be GameUpdated");
            assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
            assert.equal(event.args.creator, CREATOR, "should be CREATOR");
        });
    });

    describe("updateMinBet", () => {
        it("should fail if not OWNER", async () => {
            await expectRevert(game.updateMinBet(ether("0.5"), {
                from: OTHER
            }), "Ownable: caller is not the owner");
        });

        it("should fail if bet is 0", async () => {
            await expectRevert(game.updateMinBet(ether("0")), "Wrong bet");
        });

        it("should update minBet variable", async () => {
            await game.updateMinBet(ether("5"));
            assert.equal(0, (await game.minBet.call()).cmp(ether("5")), "wrong bet after update");
        });
    });

    describe("updatePartner", () => {
        it("should fail if not OWNER", async () => {
            await expectRevert(game.updatePartner(CREATOR, {
                from: OTHER
            }), "Ownable: caller is not the owner");
        });

        it("should update partner", async () => {
            await game.updatePartner(OTHER);
            assert.equal(await game.partner.call(), OTHER, "wrong partner after update");
        });
    });
});