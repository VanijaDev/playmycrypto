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


contract("top games", (accounts) => {
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

  const UPDATE_FEE = ether("0.001");

  let game;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(OTHER, {
      from: OWNER,
      value: ether("1", ether)
    });
  });

  describe("addTopGame", () => {
    it("should fail if not game creator", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.addTopGame(1, {
        from: OTHER,
        value: UPDATE_FEE
      }), "Not creator");
    });

    it("should fail if game is paused", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.pauseGame(1, {
        from: CREATOR
      });

      await expectRevert(game.addTopGame(1, {
        from: CREATOR,
        value: UPDATE_FEE
      }), "Game is paused");
    });

    it("should fail if game is expired", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1")
      });

      await time.increase(333);

      await expectRevert(game.addTopGame(1, {
        from: CREATOR,
        value: UPDATE_FEE
      }), "Move expired");
    });

    it("should fail if wrong UPDATE_FEE", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.addTopGame(1, {
        from: CREATOR,
        value: ether("1")
      }), "Wrong fee");
    });

    it("should update devFee by adding UPDATE_FEE", async () => {
      let devFee_before = await game.devFee.call();

      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.addTopGame(1, {
        from: CREATOR,
        value: UPDATE_FEE
      });

      let devFee_after = await game.devFee.call();
      assert.equal(0, devFee_after.sub(devFee_before).cmp(UPDATE_FEE), "wrong devFee after adding game to top");
    });

    it("should set new game on top", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.addTopGame(1, {
        from: CREATOR,
        value: UPDATE_FEE
      });

      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("1")), "wrong top games after 1");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      await game.addTopGame(2, {
        from: CREATOR_2,
        value: UPDATE_FEE
      });

      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("2")), "wrong top games after 2");

      //  3
      await game.createGame(CREATOR_2_REFERRAL, {
        from: OTHER,
        value: ether("1", ether)
      });
      await game.addTopGame(3, {
        from: OTHER,
        value: UPDATE_FEE
      });

      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("3")), "wrong top games after 3");
    });

    it("should emit GameAddedToTop event with correct prams", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      let tx = await game.addTopGame(1, {
        from: CREATOR,
        value: UPDATE_FEE
      });
      assert.equal(1, tx.logs.length, "should be 1 log");
      event = tx.logs[0];
      assert.equal(event.event, "GameAddedToTop", "should be GameAddedToTop");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
    });
  });

  describe("getTopGames", () => {
    it("should return correct topGames", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.addTopGame(1, {
        from: CREATOR,
        value: UPDATE_FEE
      });

      assert.equal(0, new BN((await game.getTopGames.call()).length).cmp(new BN("5")), "wrong lemgth, should be 5");
      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("1")), "wrong top games [0] after 1");
      assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("0")), "wrong top games [1] after 1");
      assert.equal(0, (await game.getTopGames.call())[2].cmp(new BN("0")), "wrong top games [2] after 1");
      assert.equal(0, (await game.getTopGames.call())[3].cmp(new BN("0")), "wrong top games [3] after 1");
      assert.equal(0, (await game.getTopGames.call())[4].cmp(new BN("0")), "wrong top games [4] after 2");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      await game.addTopGame(2, {
        from: CREATOR_2,
        value: UPDATE_FEE
      });

      assert.equal(0, new BN((await game.getTopGames.call()).length).cmp(new BN("5")), "wrong lemgth, should be 5");
      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("2")), "wrong top games [0] after 2");
      assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("1")), "wrong top games [1] after 2");
      assert.equal(0, (await game.getTopGames.call())[2].cmp(new BN("0")), "wrong top games [2] after 2");
      assert.equal(0, (await game.getTopGames.call())[3].cmp(new BN("0")), "wrong top games [3] after 2");
      assert.equal(0, (await game.getTopGames.call())[4].cmp(new BN("0")), "wrong top games [4] after 2");

      //  3
      await game.createGame(CREATOR_2_REFERRAL, {
        from: OTHER,
        value: ether("1", ether)
      });

      //  4
      await game.createGame(OPPONENT_2_REFERRAL, {
        from: OPPONENT_2,
        value: ether("1", ether)
      });
      await game.addTopGame(4, {
        from: OPPONENT_2,
        value: UPDATE_FEE
      });

      assert.equal(0, new BN((await game.getTopGames.call()).length).cmp(new BN("5")), "wrong lemgth, should be 5");
      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("4")), "wrong top games [0] after 4");
      assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("2")), "wrong top games [1] after 4");
      assert.equal(0, (await game.getTopGames.call())[2].cmp(new BN("1")), "wrong top games [2] after 4");
      assert.equal(0, (await game.getTopGames.call())[3].cmp(new BN("0")), "wrong top games [3] after 4");
      assert.equal(0, (await game.getTopGames.call())[4].cmp(new BN("0")), "wrong top games [4] after 4");

      //  5
      await game.addTopGame(3, {
        from: OTHER,
        value: UPDATE_FEE
      });

      assert.equal(0, new BN((await game.getTopGames.call()).length).cmp(new BN("5")), "wrong lemgth, should be 5");
      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("3")), "wrong top games [0] after 5");
      assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("4")), "wrong top games [1] after 5");
      assert.equal(0, (await game.getTopGames.call())[2].cmp(new BN("2")), "wrong top games [2] after 5");
      assert.equal(0, (await game.getTopGames.call())[3].cmp(new BN("1")), "wrong top games [3] after 5");
      assert.equal(0, (await game.getTopGames.call())[4].cmp(new BN("0")), "wrong top games [4] after 5");

      //  6
      await game.createGame(OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      await game.addTopGame(5, {
        from: OPPONENT,
        value: UPDATE_FEE
      });

      assert.equal(0, new BN((await game.getTopGames.call()).length).cmp(new BN("5")), "wrong lemgth, should be 5");
      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("5")), "wrong top games [0] after 6");
      assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("3")), "wrong top games [1] after 6");
      assert.equal(0, (await game.getTopGames.call())[2].cmp(new BN("4")), "wrong top games [2] after 6");
      assert.equal(0, (await game.getTopGames.call())[3].cmp(new BN("2")), "wrong top games [3] after 6");
      assert.equal(0, (await game.getTopGames.call())[4].cmp(new BN("1")), "wrong top games [4] after 6");

      //  7
      await game.createGame(OPPONENT_2_REFERRAL, {
        from: OPPONENT_REFERRAL,
        value: ether("1", ether)
      });
      await game.addTopGame(6, {
        from: OPPONENT_REFERRAL,
        value: UPDATE_FEE
      });

      assert.equal(0, new BN((await game.getTopGames.call()).length).cmp(new BN("5")), "wrong lemgth, should be 5");
      assert.equal(0, (await game.getTopGames.call())[0].cmp(new BN("6")), "wrong top games [0] after 6");
      assert.equal(0, (await game.getTopGames.call())[1].cmp(new BN("5")), "wrong top games [1] after 6");
      assert.equal(0, (await game.getTopGames.call())[2].cmp(new BN("3")), "wrong top games [2] after 6");
      assert.equal(0, (await game.getTopGames.call())[3].cmp(new BN("4")), "wrong top games [3] after 6");
      assert.equal(0, (await game.getTopGames.call())[4].cmp(new BN("2")), "wrong top games [4] after 6");
    });
  });
});