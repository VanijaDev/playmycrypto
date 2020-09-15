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


contract("Create", (accounts) => {
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
  
  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);

    // FIRST GAME SHOULD BE CREATED BY OWNER
    const OWNER_COIN_SIDE = 1;
    const OWNER_SEED = "Hello World owner";
    let ownerHash = web3.utils.soliditySha3(OWNER_COIN_SIDE, web3.utils.soliditySha3(OWNER_SEED));

    await game.createGame(OTHER, ownerHash, {
      from: OWNER,
      value: ether("0.1", ether)
    });
  });
  
  describe("Constructor", () => {
    it("should fail if partner == 0x0", async () => {
      await expectRevert(Game.new("0x0000000000000000000000000000000000000000"), "Cannt be 0x0");
    });

    it("should set parner", async () => {
      assert.equal(await game.partner.call(), PARTNER, "wrong partner");
    });

    it("should set partner transfer threshold == 1 ether", async () => {
      assert.equal(await game.partnerFeeTransferThreshold.call(),  web3.utils.toWei("1", 'ether'), "wrong partnerFeeTransferThreshold");
    });

    it("should set feeBeneficiar as OWNER", async () => {
      assert.equal(await game.feeBeneficiar.call(), OWNER, "wrong feeBeneficiar");
    });
  });

  describe("kill", () => {
    it("should fail if not owner", async () => {
      await expectRevert(game.kill({
        from: OTHER
      }), "Ownable: caller is not the owner.");
    });

    it("should delete contract from Blockchain", async () => {
      assert.isTrue((await web3.eth.getCode(game.address)).length > 2, "wrong code length before");
      await game.kill();
      assert.isTrue((await web3.eth.getCode(game.address)).length == 2, "wrong code length after");
    });

    it("should transfer contract balance to OWNER", async() => {
      let contractBalance = new BN(await web3.eth.getBalance(game.address));
      let ownerBalanceBefore = new BN(await web3.eth.getBalance(OWNER));

      let tx = await game.kill();
      let gasUsed = new BN(tx.receipt.gasUsed);
      let txInfo = await web3.eth.getTransaction(tx.tx);
      let gasPrice = new BN(txInfo.gasPrice);
      let gasSpent = gasUsed.mul(gasPrice);
      
      let ownerBalanceAfter = new BN(await web3.eth.getBalance(OWNER));
      assert.equal(0, ownerBalanceBefore.add(contractBalance).sub(gasSpent).cmp(ownerBalanceAfter), "wrong balance after kill");
    });
  });
});