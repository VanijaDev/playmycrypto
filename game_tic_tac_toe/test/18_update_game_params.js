const Game = artifacts.require("./TicTacToeGame.sol");
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
  const OPPONENT_2 = accounts[10];
  const OPPONENT_2_REFERRAL = accounts[11];
  const OTHER = accounts[9];

  let game;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(OTHER, {
      from: OWNER,
      value: ether("1")
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

  describe("updateBetForGame", () => {
    beforeEach("create game", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });
    });

    it("should fail if not game creator", async () => {
      await expectRevert(game.updateBetForGame(1, ether("0.5"), {
        from: OTHER
      }), "Not creator");
    });

    it("should fail if game was joined", async () => {
      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await expectRevert(game.updateBetForGame(1, ether("0.5"), {
        from: CREATOR
      }), "Game is joined");
    });

    it("should fail if game bet is 0", async () => {
      await expectRevert(game.updateBetForGame(1, ether("0"), {
        from: CREATOR
      }), "Bet must be > 0");
    });

    it("should update bet for game", async () => {
      //  1
      await game.updateBetForGame(1, ether("0.5"), {
        from: CREATOR
      });
      assert.equal(0, (await game.games.call(1)).bet.cmp(ether("0.5")), "wrong bet after update 1");

      //  2
      await game.updateBetForGame(1, ether("0.777"), {
        from: CREATOR
      });
      assert.equal(0, (await game.games.call(1)).bet.cmp(ether("0.777")), "wrong bet after update 2");
    });

    it("should emit GameUpdated with correct args", async () => {
      let tx = await game.updateBetForGame(1, ether("0.5"), {
        from: CREATOR
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GameUpdated", "should be GameUpdated");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
    });
  });
});