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
    await game.createGame(OTHER, {
      from: OWNER,
      value: ether("1", ether)
    });
  });

  describe("Constructor", () => {
    it("should fail if partner == 0x0", async () => {
      await expectRevert(Game.new("0x0000000000000000000000000000000000000000"), "Cannt be 0x0");
    });

    it("should set parner", async () => {
      assert.equal(await game.partner.call(), PARTNER, "wrong partner");
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
  });

  describe("createGame", async () => {
    it("should fail if paused", async () => {
      await game.pause();

      await expectRevert(game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      }), "paused");
    });

    it("should fail if already created one game", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await expectRevert(game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("2", ether)
      }), "No more participating");
    });

    it("should fail if joined another game", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      await expectRevert(game.createGame(CREATOR_REFERRAL, {
        from: OPPONENT,
        value: ether("2", ether)
      }), "No more participating");
    });

    it("should fail if less, than min bet", async () => {
      await expectRevert(game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.00001", ether)
      }), "Wrong bet");
    });

    it("should fail if creator == referral", async () => {
      await expectRevert(game.createGame(CREATOR, {
        from: CREATOR,
        value: ether("1", ether)
      }), "Wrong referral");
    });

    it("should set correct game id", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, ((await game.games.call(1)).id).cmp(new BN("1")), "wrong id set");
    });

    it("should set correct game creator", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(1)).creator, CREATOR, "wrong creator set");
    });

    it("should set correct game bet", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, ((await game.games.call(1)).bet).cmp(ether("1", ether)), "wrong bet set");
    });

    it("should set correct game state", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, ((await game.games.call(1)).state).cmp(new BN("0")), "wrong set set");
    });

    it("should set correct game creatorReferral if != address(0)", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal((await game.games.call(1)).creatorReferral, CREATOR_REFERRAL, "wrong creatorReferral set");
    });

    it("should update ongoingGameIdxForParticipant", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameIdxForParticipant.call(CREATOR)).cmp(new BN("1")), "wrong ongoingGameIdxForParticipant after create");
    });

    it("should update participatedGameIdxsForPlayer", async () => {
      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      let idxs = await game.getParticipatedGameIdxsForPlayer.call(CREATOR);
      assert.equal(idxs.length, 1, "wrong idxs amount");
      assert.equal(0, idxs[0].cmp(new BN("1")), "wrong game index");
    });

    it("should emit GameCreated with correct args", async () => {
      // event GameCreated(uint256 indexed id, address indexed creator, uint256 bet);

      let tx = await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(1, tx.logs.length, "should be 1 log");
      let event = tx.logs[0];
      assert.equal(event.event, "GameCreated", "should be GameCreated");
      assert.equal(0, event.args.id.cmp(new BN(1)), "should be 1");
      assert.equal(event.args.creator, CREATOR, "should be CREATOR");
      assert.equal(0, event.args.bet.cmp(ether("1", ether)), "should be 1 ETH");
    });

    it("should increase gamesCreatedAmount", async () => {
      let created = await game.gamesCreatedAmount.call();

      await game.createGame(CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.gamesCreatedAmount.call()).sub(created).cmp(new BN("1")), "should be increased by 1");
    });
  });
});