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



contract("Create game", (accounts) => {
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

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);
    
    const CREATOR_COIN_SIDE = 1;
    const CREATOR_SEED = "Hello World";
    ownerHash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(ownerHash, CREATOR_REFERRAL, {
      from: OWNER,
      value: ether("1", ether)
    });

    // // FIRST GAME SHOULD BE CREATED BY OWNER
    // const OWNER_COIN_SIDE = 1;
    // const OWNER_SEED = "Hello World owner";
    // let ownerHash = web3.utils.soliditySha3(OWNER_COIN_SIDE, web3.utils.soliditySha3(OWNER_SEED));
    // console.log("Hello World creator:              ", web3.utils.soliditySha3("Hello World creator"));
    // console.log("0 + hashed(Hello World creator):  ", web3.utils.soliditySha3(0, web3.utils.soliditySha3("Hello World creator")));
    // console.log("1 + hashed(Hello World creator):  ", web3.utils.soliditySha3(1, web3.utils.soliditySha3("Hello World creator")));    
  });

  describe("Create game", () => {
    it("should fail if paused", async () => {
      await game.pause();

      await expectRevert(game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      }), "paused");
    });

    it("should fail if creator has already created game", async () => {
      //  1 - create
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2
      await expectRevert(game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      }), "No more creating");
    });

    it("should fail if less, than min bet", async () => {
      await expectRevert(game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: 0
      }), "Wrong bet");
    });

    it("should fail if creatorReferral == msg.sender", async () => {
      await expectRevert(game.createGame(ownerHash, CREATOR, {
        from: CREATOR,
        value: ether("1", ether)
      }), "Wrong referral");
    });
    
    it("should fail if empty moveHash", async() => {
      await expectRevert(game.createGame("0x0", CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      }), "Empty hash");
    });

    it("should create new game with correct params", async () => {
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      let gameObj = await game.games.call(1);
      assert.isFalse(gameObj.paused, "should not be paused");
      assert.equal(0, gameObj.creatorCoinSide.cmp(new BN(0)), "wrong creatorCoinSide");
      assert.equal(0, gameObj.randCoinSide.cmp(new BN(0)), "wrong randCoinSide");
      assert.equal(0, gameObj.id.cmp(new BN(1)), "wrong id");
      assert.equal(0, gameObj.bet.cmp(ether("1", ether)), "wrong bet");
      assert.equal(0, gameObj.opponentJoinedAt.cmp(new BN(0)), "wrong opponentJoinedAt");
      assert.equal(gameObj.creatorGuessHash, ownerHash, "wrong creatorGuessHash");
      assert.equal(gameObj.creator, CREATOR, "wrong creator");
      assert.equal(gameObj.opponent, 0x0, "wrong opponent");
      assert.equal(gameObj.winner, 0x0, "wrong winner");
      assert.equal(gameObj.creatorReferral, CREATOR_REFERRAL, "wrong creatorReferral");
      assert.equal(gameObj.opponentReferral, 0x0, "wrong opponentReferral");
    });

    it("should set creatorReferral as owner() if no referral param provided", async () => {
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR,
        value: ether("1", ether)
      });

      let gameObj = await game.games.call(1);
      assert.equal(gameObj.creatorReferral, await game.owner.call(), "wrong creatorReferral, should be 0x0");
    });

    it("should increase addressBetTotal for sender", async () => {
      //  1
      let prev = await game.addressBetTotal.call(CREATOR);

      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      assert.equal(0, (await game.addressBetTotal.call(CREATOR)).sub(prev).cmp(ether("1")), "wrong addressBetTotal 1");

      await game.quitGame(1, {
        from: CREATOR
      });

      //  2
      await game.createGame(ownerHash, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.1")
      });

      assert.equal(0, (await game.addressBetTotal.call(CREATOR)).sub(prev).cmp(ether("1.1")), "wrong addressBetTotal 2");
    });

    it("should increase totalUsedInGame", async () => {
      //  1 - CREATOR
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR,
        value: ether("1")
      });
      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("2")), "totalUsedInGame should be 2 ether");

      //  2 - CREATOR_2
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("3")), "totalUsedInGame should be 3 ether");

      //  3 - OTHER
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: OTHER,
        value: ether("0.1", ether)
      });
      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("3.1")), "totalUsedInGame should be 3.1 ether");
    });

    it("should update ongoingGameAsCreator for creator", async () => {
      //  1 - CREATOR_2
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameAsCreator.call(CREATOR_2)).cmp(new BN(1)), "should be 1");

      //  2 - CREATOR
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameAsCreator.call(CREATOR)).cmp(new BN(2)), "should be 2");
    });

    it("should update playedGamesForPlayer for creator", async () => {
      //  1 - CREATOR
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.getPlayedGamesForPlayer.call(CREATOR)).length, 1, "whong length after 1");
      assert.equal(0, ((await game.getPlayedGamesForPlayer.call(CREATOR))[0]).cmp(new BN(1)), "should be 1");

      //  2 - CREATOR_2
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal((await game.getPlayedGamesForPlayer.call(CREATOR_2)).length, 1, "whong length after 2");
      assert.equal(0, ((await game.getPlayedGamesForPlayer.call(CREATOR_2))[0]).cmp(new BN(2)), "should be 2");

      //  3 - CREATOR
      await game.quitGame(1, {
        from: CREATOR
      });
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.getPlayedGamesForPlayer.call(CREATOR)).length, 2, "whong length after 3");
      assert.equal(0, ((await game.getPlayedGamesForPlayer.call(CREATOR))[0]).cmp(new BN(1)), "should be 1 after 3");
      assert.equal(0, ((await game.getPlayedGamesForPlayer.call(CREATOR))[1]).cmp(new BN(3)), "should be 3 after 3");
    });

    it("should emit CF_GameCreated event", async () => {
      //  1
      let tx = await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "CF_GameCreated", "should be CF_GameCreated");
      assert.equal(0, event.args.id.cmp(new BN(1)), "should be 1");
      assert.equal(event.args.creator, CREATOR, "should be CREATOR");
      assert.equal(0, event.args.bet.cmp(ether("1", ether)), "should be 1 ETH");

      //  2
      let tx_2 = await game.createGame(ownerHash, OTHER, {
        from: CREATOR_2,
        value: ether("0.5", ether)
      });

      assert.equal(1, tx_2.logs.length, "should be 1 log");
      let event_2 = tx_2.logs[0];
      assert.equal(event_2.event, "CF_GameCreated", "should be CF_GameCreated");
      assert.equal(0, event_2.args.id.cmp(new BN(2)), "should be 2");
      assert.equal(event_2.args.creator, CREATOR_2, "should be CREATOR_2");
      assert.equal(0, event_2.args.bet.cmp(ether("0.5", ether)), "should be 0.5 ETH");
    });

    it("should increase gamesCreatedAmount", async () => {
      //  1 - CREATOR
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.gamesCreatedAmount.call()).cmp(new BN(2)), "should be 2");

      //  2 - CREATOR_2
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.gamesCreatedAmount.call()).cmp(new BN(3)), "should be 3");

      //  3 - OTHER
      await game.createGame(ownerHash, "0x0000000000000000000000000000000000000000", {
        from: OTHER,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.gamesCreatedAmount.call()).cmp(new BN(4)), "should be 4");
    });
  });
});