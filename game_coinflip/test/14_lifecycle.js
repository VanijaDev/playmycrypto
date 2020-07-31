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



contract("Lifecycle", (accounts) => {
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

  const CREATOR_COIN_SIDE = 1;
  const CREATOR_SEED = "Hello World";

  let game;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);

    // // FIRST GAME SHOULD BE CREATED BY OWNER
    // await game.createGame(1, CREATOR_REFERRAL, {
    //   from: OWNER,
    //   value: ether("1", ether)
    // });

    // // 1 - create
    // await game.createGame(1, CREATOR_REFERRAL, {
    //   from: CREATOR,
    //   value: ether("1", ether)
    // });

    // //  2 - join
    // await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
    //   from: OPPONENT,
    //   value: ether("1", ether)
    // });

    await time.increase(1);
  });

  describe("Constructor", () => {
    it("should fail if partner == 0x0", async () => {
      await expectRevert(Game.new("0x0000000000000000000000000000000000000000"), "Wrong partner");
    });

    it("should set parner", async () => {
      assert.equal(await game.partner.call(), PARTNER, "Wrong partner");
    });
  });

  describe("kill", () => {
    it("should fail if not owner", async () => {
      await expectRevert(game.kill({
        from: OTHER
      }), "Ownable: caller is not the owner");
    });

    it("should remove Smart Contract", async () => {
      assert.isTrue((await web3.eth.getCode(game.address)).length > 0, "code should be present");

      await game.kill();
      await time.increase(1);

      assert.isTrue((await web3.eth.getCode(game.address)).length == 2, "code should be deleted");
    });

    it("should transfer funds to owner", async () => {
      let ownerBalance_before = new BN(await web3.eth.getBalance(OWNER));
      let gameBalance = new BN(await web3.eth.getBalance(game.address));

      let tx = await game.kill();
      let gasUsed = new BN(tx.receipt.gasUsed);
      let txInfo = await web3.eth.getTransaction(tx.tx);
      let gasPrice = new BN(txInfo.gasPrice);
      let gasSpent = gasUsed.mul(gasPrice);

      await time.increase(1);

      let ownerBalance_after = new BN(await web3.eth.getBalance(OWNER));
      assert.equal(0, ownerBalance_before.add(gameBalance).sub(gasSpent).cmp(ownerBalance_after), "wrong owner balance after kill");
    });
  });
});