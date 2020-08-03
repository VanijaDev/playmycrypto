const Game = artifacts.require("./CoinFlipGame.sol");
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


contract("Quit game", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const OTHER = accounts[9];

  let game;
  let ownerHash;
  const CREATOR_COIN_SIDE = 1;
  const CREATOR_SEED = "Hello World";
  const CREATOR_SEED_HASHED = web3.utils.soliditySha3(CREATOR_SEED);

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);
    
    ownerHash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(ownerHash, CREATOR_REFERRAL, {
      from: OWNER,
      value: ether("1", ether)
    });

    //  1
    await game.createGame(ownerHash, CREATOR_REFERRAL, {
      from: CREATOR,
      value: ether("1", ether)
    });
    await game.joinGame(1, OPPONENT_REFERRAL, {
      from: OPPONENT,
      value: ether("1", ether)
    });
  });

  describe("quitGame", () => {
    it("should fail if Not a game player", async() => {
      await expectRevert(game.quitGame(0, {
        from: CREATOR
      }), "Not a game player");
    });

    it("should fail if Has winner", async() => {
      await game.playGame(1, CREATOR_COIN_SIDE, CREATOR_SEED_HASHED, {
        from: CREATOR
      });

      await expectRevert(game.quitGame(1, {
        from: CREATOR
      }), "Has winner");
      await expectRevert(game.quitGame(1, {
        from: OPPONENT
      }), "Has winner");
    });

    it("should fail if Expired", async() => {
      await time.increase(time.duration.hours("13"));
      await expectRevert(game.quitGame(1, {
        from: CREATOR
      }), "Expired");
    });

    it("should set game.winner = game.opponent if (game.creator == msg.sender && game.opponent != address(0))", async() => {
      await game.quitGame(1, {
        from: CREATOR
      });
      assert.equal(OPPONENT, (await game.games.call(1)).winner, "winner should be OPPONENT");
    });

    it("should raffleParticipants.push(OPPONENT) if (game.creator == msg.sender && game.opponent != address(0))", async() => {
      assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");

      await game.quitGame(1, {
        from: CREATOR
      });
      
      assert.deepEqual(await game.getRaffleParticipants.call(), [OPPONENT], "should be OPPONENT after");
    });

    it("should set game.winner = game.creator if (game.opponent == msg.sender)", async() => {
      await game.quitGame(1, {
        from: OPPONENT
      });
      assert.equal(CREATOR, (await game.games.call(1)).winner, "winner should be CREATOR");
    });

    it("should raffleParticipants.push(CREATOR) if (game.opponent == msg.sender)", async() => {
      assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");

      await game.quitGame(1, {
        from: OPPONENT
      });
      
      assert.deepEqual(await game.getRaffleParticipants.call(), [CREATOR], "should be CREATOR after");
    });

    it("should set game.winner = ownerAddr if no opponent", async() => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      await game.quitGame(2, {
        from: CREATOR_2
      });
      assert.equal(OWNER, (await game.games.call(2)).winner, "winner should be OWNER");
    });

    it("should not raffleParticipants.push(CREATOR) if no opponent", async() => {
      assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty before");
      
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      await game.quitGame(2, {
        from: CREATOR_2
      });
      
      assert.deepEqual(await game.getRaffleParticipants.call(), [], "should be empty after");
    });

    it("should push game to gamesWithPendingPrizeWithdrawal for winner", async() => {
      assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [], "should be empty before");

      await game.quitGame(1, {
        from: OPPONENT
      });
      
      assert.deepEqual(await game.getGamesWithPendingPrizeWithdrawal.call(CREATOR), [new BN("1")], "should be 1 after");
    });

    it("should increase gamesCompletedAmount", async() => {
      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("0")), "should be 0 before");

      await game.quitGame(1, {
        from: OPPONENT
      });

      assert.equal(0, (await game.gamesCompletedAmount.call()).cmp(new BN("1")), "should be 1 after");
    });

    it("should delete ongoingGameAsCreator[game.creator]", async() => {
      assert.equal(0, (await game.ongoingGameAsCreator.call(CREATOR)).cmp(new BN("1")), "should be 1 before");

      await game.quitGame(1, {
        from: OPPONENT
      });

      assert.equal(0, (await game.ongoingGameAsCreator.call(CREATOR)).cmp(new BN("0")), "should be 0 after");
    });

    it("should delete ongoingGameAsOpponent[game.opponent]", async() => {
      assert.equal(0, (await game.ongoingGameAsOpponent.call(OPPONENT)).cmp(new BN("1")), "should be 1 before");

      await game.quitGame(1, {
        from: OPPONENT
      });

      assert.equal(0, (await game.ongoingGameAsOpponent.call(OPPONENT)).cmp(new BN("0")), "should be 0 after");
    });

    it("should emit CF_GameQuittedFinished", async() => {
      // event CF_GameQuittedFinished(uint256 indexed id, address indexed creator, address indexed opponent, address winner);
      const { logs } = await game.quitGame(1, {
        from: OPPONENT
      });
      assert.equal(1, logs.length, "should be 1 event");
      await expectEvent.inLogs(
        logs, 'CF_GameQuittedFinished', {
        id: new BN("1"),
        creator: CREATOR,
        opponent: OPPONENT,
        winner: CREATOR
      });
    });
  });
});