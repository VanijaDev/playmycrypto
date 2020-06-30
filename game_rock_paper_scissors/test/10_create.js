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
    // console.log("Hello World creator:              ", web3.utils.soliditySha3("Hello World creator"));
    // console.log("1 + hashed(Hello World creator):  ", web3.utils.soliditySha3(1, web3.utils.soliditySha3("Hello World creator")));
    // console.log("2 + hashed(Hello World creator):  ", web3.utils.soliditySha3(2, web3.utils.soliditySha3("Hello World creator")));
    // console.log("3 + hashed(Hello World creator):  ", web3.utils.soliditySha3(3, web3.utils.soliditySha3("Hello World creator")));

    // console.log("Hello World 2:               ", web3.utils.soliditySha3("Hello World 2"));
    // console.log("0 + hashed(Hello World 2):   ", web3.utils.soliditySha3(0, web3.utils.soliditySha3("Hello World 2")));
    // console.log("1 + hashed(Hello World 2):   ", web3.utils.soliditySha3(1, web3.utils.soliditySha3("Hello World 2")));
    // console.log("2 + hashed(Hello World 2):   ", web3.utils.soliditySha3(2, web3.utils.soliditySha3("Hello World 2")));

    // console.log("Hello World 3:               ", web3.utils.soliditySha3("Hello World 3"));
    // console.log("0 + hashed(Hello World 3):   ", web3.utils.soliditySha3(0, web3.utils.soliditySha3("Hello World 3")));
    // console.log("1 + hashed(Hello World 3):   ", web3.utils.soliditySha3(1, web3.utils.soliditySha3("Hello World 3")));
    // console.log("2 + hashed(Hello World 3):   ", web3.utils.soliditySha3(2, web3.utils.soliditySha3("Hello World 3")));

    await game.createGame(OTHER, ownerHash, {
      from: OWNER,
      value: ether("0.1", ether)
    });
  });

  describe("createGame", async () => {
    const CREATOR_COIN_SIDE = 1;
    const CREATOR_SEED = "Hello World creator";
    let hash = web3.utils.soliditySha3(CREATOR_COIN_SIDE, web3.utils.soliditySha3(CREATOR_SEED));
    // console.log("hash createGame: ", hash);

    it("should fail if paused", async () => {
      await game.pause();

      await expectRevert(game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      }), "paused");
    });

    it("should fail if already created one game", async () => {
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("2", ether)
      }), "No more participating");
    });

    it("should fail if joined another game", async () => {
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, 1, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      await expectRevert(game.createGame(CREATOR_REFERRAL, hash, {
        from: OPPONENT,
        value: ether("2", ether)
      }), "No more participating");
    });

    it("should fail if less, than min bet", async () => {
      await expectRevert(game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("0.00001", ether)
      }), "Wrong bet");
    });

    it("should fail if creator == referral", async () => {
      await expectRevert(game.createGame(CREATOR, hash, {
        from: CREATOR,
        value: ether("1", ether)
      }), "Wrong referral");
    });

    it("should fail if empty moveHash", async() => {
      await expectRevert(game.createGame(CREATOR_REFERRAL, "0x0", {
        from: CREATOR,
        value: ether("1", ether)
      }), "Empty hash");
    });

    it("should increase addressBetTotal for creator", async () => {
      //  1
      let prev = await game.addressBetTotal.call(CREATOR);

      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.addressBetTotal.call(CREATOR)).sub(prev).cmp(ether("1")), "wrong addressBetTotal 1");

      await game.quitGame(1, {
        from: CREATOR
      });

      //  2
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("0.1", ether)
      });

      assert.equal(0, (await game.addressBetTotal.call(CREATOR)).sub(prev).cmp(ether("1.1")), "wrong addressBetTotal 2");
    });

    it("should set correct game id", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, ((await game.games.call(1)).id).cmp(new BN("1")), "wrong id set");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal(0, ((await game.games.call(2)).id).cmp(new BN("2")), "wrong id set");
    });

    it("should set correct game creator", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(1)).creator, CREATOR, "wrong creator set");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(2)).creator, CREATOR_2, "wrong creator set");
    });

    it("should set correct game bet", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, ((await game.games.call(1)).bet).cmp(ether("1", ether)), "wrong bet set");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("0.5", ether)
      });
      assert.equal(0, ((await game.games.call(2)).bet).cmp(ether("0.5", ether)), "wrong bet set");
    });

    it("should set correct game state", async () => {
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, ((await game.games.call(1)).state).cmp(new BN("0")), "wrong set set");
    });

    it("should set correct creatorMoveHashes", async () => {
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });

      // console.log("hash: ", hash);
      assert.deepEqual(await game.getCreatorMoveHashesForGame.call(1), [
        '0xd5e9fc8f4f5488ef25c446f13c4ffa1c9cefa03d19d4ace8513dc6704153eba3',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      ], "wrong creatorMoveHashes");
    });

    it("should set correct game creatorReferral if != address(0)", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(1)).creatorReferral, CREATOR_REFERRAL, "wrong creatorReferral set");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(2)).creatorReferral, CREATOR_2_REFERRAL, "wrong creatorReferral 2 set");
    });

    it("should set game creatorReferral as address(0) if passed == address(0)", async () => {
      //  1
      await game.createGame("0x0000000000000000000000000000000000000000", hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(1)).creatorReferral, "0x0000000000000000000000000000000000000000", "wrong creatorReferral set");

      //  2
      await game.createGame("0x0000000000000000000000000000000000000000", hash, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(2)).creatorReferral, "0x0000000000000000000000000000000000000000", "wrong creatorReferral 2 set");
    });

    it("should update ongoingGameIdxForPlayer", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameIdxForPlayer.call(CREATOR)).cmp(new BN("1")), "wrong ongoingGameIdxForPlayer after create");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameIdxForPlayer.call(CREATOR_2)).cmp(new BN("2")), "wrong ongoingGameIdxForPlayer 2 after create");
    });

    it("should update playedGameIdxsForPlayer", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      let idxs = await game.getPlayedGameIdxsForPlayer.call(CREATOR);
      assert.equal(idxs.length, 1, "wrong idxs amount");
      assert.equal(0, idxs[0].cmp(new BN("1")), "wrong game index");

      //  2
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      let idxs_2 = await game.getPlayedGameIdxsForPlayer.call(CREATOR_2);
      assert.equal(idxs_2.length, 1, "wrong idxs amount");
      assert.equal(0, idxs_2[0].cmp(new BN("2")), "wrong game index");
    });

    it("should update totalUsedInGame", async () => {
      //  1
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("1.1", ether)), "wrong totalUsedInGame after 1"); //  0.1 - first game by OWNER

      //  2
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("0.1", ether)
      });
      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("1.2", ether)), "wrong totalUsedInGame after 2"); //  0.1 - first game by OWNER
    });

    it("should emit GameCreated with correct args", async () => {
      // event GameCreated(uint256 indexed id, address indexed creator, uint256 bet);

      let tx = await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "RPS_GameCreated", "should be RPS_GameCreated");
      assert.equal(0, event.args.id.cmp(new BN("1")), "should be 1");
      assert.equal(event.args.creator, CREATOR, "should be CREATOR");
      assert.equal(0, event.args.bet.cmp(ether("1", ether)), "should be 1 ETH");
    });

    it("should increase gamesCreatedAmount", async () => {
      //  1
      let created = await game.gamesCreatedAmount.call();
      await game.createGame(CREATOR_REFERRAL, hash, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.gamesCreatedAmount.call()).sub(created).cmp(new BN("1")), "should be increased by 1");

      //  2
      created = await game.gamesCreatedAmount.call();
      await game.createGame(CREATOR_2_REFERRAL, hash, {
        from: CREATOR_2,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.gamesCreatedAmount.call()).sub(created).cmp(new BN("1")), "should be increased by 1 again");
    });
  });
});