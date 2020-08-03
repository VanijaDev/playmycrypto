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
  expect, assert
} = require('chai');


contract("AcquiredFeeBeneficiar", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const OTHER = accounts[9];
  const OPPONENT_2 = accounts[10];
  const CREATOR_2_REFERRAL = accounts[11];
  const OPPONENT_2_REFERRAL = accounts[12];

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

    await time.increase(1);
  });

  describe("makeFeeBeneficiar", () => {
    it("should fail if sent 0 on the very first time", async() => {
      await expectRevert(game.makeFeeBeneficiar({
        from: OTHER
      }), "Wrong amount");
    });

    it("should fail if amount sent is less, than latestPrice", async() => {
      await game.makeFeeBeneficiar({
        from: OTHER,
        value: ether("1")
      });

      await expectRevert(game.makeFeeBeneficiar({
        from: OTHER,
        value: ether("0.1")
      }), "Wrong amount");
    });
    
    it("should set latestBeneficiarPrice = msg.value", async() => {
      assert.equal(0, (await game.latestBeneficiarPrice.call()).cmp(ether("0")), "should be 0 before");
      await game.makeFeeBeneficiar({
        from: OTHER,
        value: ether("1")
      });
      assert.equal(0, (await game.latestBeneficiarPrice.call()).cmp(ether("1")), "should be 1 after");

      //  2
      await game.makeFeeBeneficiar({
        from: OPPONENT,
        value: ether("1.1")
      });
      assert.equal(0, (await game.latestBeneficiarPrice.call()).cmp(ether("1.1")), "should be 1.1 after");
    });
    
    it("should set feeBeneficiar = msg.sender", async() => {
      assert.equal(await game.feeBeneficiar.call(), OWNER, "should be OWNER before");
      await game.makeFeeBeneficiar({
        from: OTHER,
        value: ether("1")
      });
      assert.equal(await game.feeBeneficiar.call(), OTHER, "should be OTHER after");

      //  2
      await game.makeFeeBeneficiar({
        from: OPPONENT,
        value: ether("1.2")
      });
      assert.equal(await game.feeBeneficiar.call(), OPPONENT, "should be OPPONENT after");
    });
    
    it("should set feeBeneficiarPurchasedAt to now", async() => {
      assert.equal(0, (await game.latestBeneficiarPrice.call()).cmp(new BN("0")), "should be 0 before");
      await game.makeFeeBeneficiar({
        from: OTHER,
        value: ether("1")
      });
      assert.equal(0, (await game.feeBeneficiarPurchasedAt.call()).cmp(await time.latest()), "should be 1 after");

      //  2
      await time.increase(3);
      await game.makeFeeBeneficiar({
        from: OPPONENT,
        value: ether("1.1")
      });
      assert.equal(0, (await game.feeBeneficiarPurchasedAt.call()).cmp(await time.latest()), "should be 1.1 after");
    });
  });
});