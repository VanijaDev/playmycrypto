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


contract("Game Row Winners", (accounts) => {
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
  });

  describe("gameRowWinners", () => {
    //  Draw
    it("should be DRAW on: 1,1  1,1  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("3")), "shate should be Draw == 3");
      assert.equal((await game.games.call(2)).winner, "0x0000000000000000000000000000000000000000", "winner should be 0x0");
    });

    it("should be DRAW on: 2,2  2,2  2,2", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 2, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 2, {
        from: OPPONENT_2
      });

      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 2, {
        from: OPPONENT_2
      });

      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("3")), "shate should be Draw == 3");
      assert.equal((await game.games.call(2)).winner, "0x0000000000000000000000000000000000000000", "winner should be 0x0");
    });

    it("should be DRAW on: 3,3  3,3  3,3", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 3, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("3")), "shate should be Draw == 3");
      assert.equal((await game.games.call(2)).winner, "0x0000000000000000000000000000000000000000", "winner should be 0x0");
    });

    //  Rock
    it("should set winner == CREATOR with Rock: 1,3  1,1  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 3, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Rock: 1,1  1,3  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Rock: 1,1  1,1  1,3", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Rock: 1,3  1,3  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 3, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Rock: 1,1  1,3  1,3", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    //  Paper
    it("should set winner == CREATOR with Paper: 2,1  1,1  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Paper: 1,1  2,1  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Paper: 1,1  1,1  2,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Paper: 2,1  2,1  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Paper: 1,1  2,1  2,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    //  Scissors
    it("should set winner == CREATOR with Scissors: 3,2  1,1  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 2, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Scissors: 2,2  3,2  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(2, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 2, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 2, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 2, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Scissors: 1,1  3,3  3,2", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 3, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 2, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Scissors: 3,2  3,2  1,1", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 2, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 2, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 1, {
        from: OPPONENT_2
      });

      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });

    it("should set winner == CREATOR with Scissors: 1,1  3,2  3,2", async () => {
      await game.createGame(CREATOR_REFERRAL, web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2,
        value: ether("1")
      });
      await game.joinGame(2, OPPONENT_REFERRAL, 1, {
        from: OPPONENT_2,
        value: ether("1")
      });

      //  1
      await game.playMove(2, 1, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  2
      await game.opponentNextMove(2, 2, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(3, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      //  3
      await game.opponentNextMove(2, 2, {
        from: OPPONENT_2
      });

      await game.playMove(2, 3, web3.utils.soliditySha3(CREATOR_SEED), web3.utils.soliditySha3(1, web3.utils.soliditySha3(CREATOR_SEED)), {
        from: CREATOR_2
      });

      assert.equal(0, (await game.games.call(2)).state.cmp(new BN("2")), "shate should be WinnerPresent == 2");
      assert.equal((await game.games.call(2)).winner, CREATOR_2, "winner should be CREATOR_2");
    });
  });
});