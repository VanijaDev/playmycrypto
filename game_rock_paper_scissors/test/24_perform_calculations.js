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


contract("performCalculations", (accounts) => {
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

    describe("prizeForGame", () => {
        it("should return 0 if no game", async() => {
            assert.equal(0, (await game.prizeForGame.call(111)).cmp(new BN("0")), "should return 0 if no game");
        });

        it("should return 0 if no winner && Game.state != Draw", async() => {
            assert.equal(0, (await game.prizeForGame.call(1)).cmp(new BN("0")), "should return 0 if Game.state != Draw");
        });

        it("should return 0 amount if not winner", async() => {
            //  1
          await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
              from: CREATOR
          });
          await game.opponentNextMove(1, 2, {
              from: OPPONENT
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

          assert.equal(0, (await game.prizeForGame.call(1, { from: CREATOR })).cmp(ether("0")), "should return 0 ETH if not winner, from CREATOR");
          assert.equal(0, (await game.prizeForGame.call(1, { from: CREATOR_2_REFERRAL })).cmp(ether("0")), "should return 0 ETH if not winner, from CREATOR_2_REFERRAL");
      });

        it("should return bet * 2 amount if winner present", async() => {
              //  1
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });
            await game.opponentNextMove(1, 2, {
                from: OPPONENT
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

            assert.equal(0, (await game.prizeForGame.call(1, { from: OPPONENT })).cmp(ether("2")), "should return 2 ETH if winner present");
        });

        it("should should return bet as amount if Game.state == Draw", async() => {
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
    
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.equal(0, (await game.prizeForGame.call(1, { from: OPPONENT })).cmp(ether("1")), "should return 1 ETH if Draw");
        });

        it("should should return 0 if Game.state == Draw, but not participant", async() => {
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
    
            await game.playMove(1, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
                from: CREATOR
            });

            assert.equal(0, (await game.prizeForGame.call(1, { from: OPPONENT_REFERRAL })).cmp(ether("0")), "should return 0 ETH if Draw, but not participant");
        });
    });
  });