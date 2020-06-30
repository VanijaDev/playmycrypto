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


contract("Join game", (accounts) => {
  const OWNER = accounts[0];
  const CREATOR = accounts[1];
  const OPPONENT = accounts[2];
  const CREATOR_REFERRAL = accounts[3];
  const OPPONENT_REFERRAL = accounts[4];
  const PARTNER = accounts[5];
  const CREATOR_2 = accounts[6];
  const OTHER = accounts[9];

  let game;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    game = await Game.new(PARTNER);

    // FIRST GAME SHOULD BE CREATED BY OWNER
    await game.createGame(1, CREATOR_REFERRAL, {
      from: OWNER,
      value: ether("1", ether)
    });
  });

  describe("Join and play game", () => {
    it("should fail if creator joins", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await expectRevert(game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      }), "Is creator");
    });

    it("should fail if not yet alloed to play next game", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      await time.increase(time.duration.minutes(1));

      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await expectRevert(game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Suspended to play");

      await time.increase(time.duration.hours(1));
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

    });

    it("should fail if gameCreator == 0 (no such game)", async () => {
      await expectRevert(game.joinAndPlayGame(100, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "No game with such id");
    });

    it("should fail if game is played", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      //  2 - join again
      await expectRevert(game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OTHER,
        value: ether("1", ether)
      }), "Game has winner");
    });

    it("should fail if wrong bet provided", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      //  2 - join
      await expectRevert(game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("11", ether)
      }), "Wrong bet");
    });

    it("should fail if Wrong referral", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      //  2 - join
      await expectRevert(game.joinAndPlayGame(1, OPPONENT, {
        from: OPPONENT,
        value: ether("1", ether)
      }), "Wrong referral");
    });

    it("should increase addressBetTotal for opponent", async () => {
      //  1
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1")
      });

      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.addressBetTotal.call(OPPONENT)).cmp(ether("1")), "wrong addressBetTotal 1");

      //  2
      await time.increase(time.duration.hours(2));
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("0.5")
      });

      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.5", ether)
      });

      assert.equal(0, (await game.addressBetTotal.call(OPPONENT)).cmp(ether("1.5")), "wrong addressBetTotal 2");
    });

    it("should set correct opponent", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal((await game.games.call(1)).opponent, OPPONENT, "wrong opponent address");
    });

    it("should set correct opponentReferral", async () => {
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal((await game.games.call(1)).opponentReferral, OPPONENT_REFERRAL, "Wrong OPPONENT_REFERRAL");
    });

    it("should keep opponentReferral as address(0) if no referral param provided", async () => {
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(1, "0x0000000000000000000000000000000000000000", {
        from: OPPONENT,
        value: ether("1", ether)
      });

      let gameObj = await game.games.call(1);
      assert.equal(gameObj.opponentReferral, "0x0000000000000000000000000000000000000000", "wrong opponentReferral, should be 0x0");
    });

    it("should set correct winner", async () => {
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      let gameInfo = await game.games.call(1);
      assert.isTrue(gameInfo.winner == gameInfo.creator || gameInfo.winner == gameInfo.opponent , "wrong winner address");
    });

    it("should add game id to gamesWithPendingPrizeWithdrawalForAddress", async () => {
      let creator_0 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR);
      assert.isTrue(creator_0.length == 0, "creator_0 length should be 0 before");
      let opponent_0 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT);
      assert.isTrue(opponent_0.length == 0, "opponent_0 length should be 0 before");

      //  1
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      let winner_1_is_creator = (await game.games(1)).winner == CREATOR;
      // console.log("winner_1_is_creator: ", winner_1_is_creator);

      let creator_1 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR);
      let opponent_1 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT);

      if (winner_1_is_creator) {
        assert.isTrue(creator_1.length == 1, "creator_1 length should be 1 after 1");
        assert.isTrue(creator_1[0] == 1, "creator_1[0] must be 1 after 1");
        assert.isTrue(opponent_1.length == 0, "opponent_1 length should be 0 after 1");
      } else {
        assert.isTrue(creator_1.length == 0, "creator_1 length should be 0 after 1");
        assert.isTrue(opponent_1.length == 1, "opponent_1 length should be 1 after 1");
        assert.isTrue(opponent_1[0] == 1, "opponent_1[0] must be 1 after 1");
      }

      //  2
      await time.increase(time.duration.hours(2));
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.1", ether)
      });

      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.1", ether)
      });
      let winner_2_is_creator = (await game.games(2)).winner == CREATOR;
      // console.log("winner_2_is_creator: ", winner_2_is_creator);

      let creator_2 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR);
      let opponent_2 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT);

      if (winner_2_is_creator) {
        assert.isTrue(creator_2.length == creator_1.length + 1, "wrong creator_2 length in winner_1_is_creator after 2");
        assert.isTrue(creator_2[creator_2.length - 1] == 2, "wrong last game id for creator_2 in winner_1_is_creator after 2");
        assert.isTrue(opponent_2.length == opponent_1.length, "wrong opponent_2 length in winner_1_is_creator after 2");
      } else {
        assert.isTrue(creator_2.length == creator_1.length, "wrong creator_2 length after 2");
        assert.isTrue(opponent_2.length == opponent_1.length + 1, "wrong opponent_2 length after 2");
        assert.isTrue(opponent_2[opponent_2.length - 1] == 2, "wrong last game id for opponent_2 after 2");
      }

      //  3
      await time.increase(time.duration.hours(2));
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.1", ether)
      });

      await game.joinAndPlayGame(3, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.1", ether)
      });
      let winner_3_is_creator = (await game.games(3)).winner == CREATOR;
      // console.log("winner_3_is_creator: ", winner_3_is_creator);

      let creator_3 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR);
      let opponent_3 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT);

      if (winner_3_is_creator) {
        assert.isTrue(creator_3.length == creator_2.length + 1, "wrong creator_3 length in winner_2_is_creator after 3");
        assert.isTrue(creator_3[creator_3.length - 1] == 3, "wrong last game id for creator_3 in winner_2_is_creator after 3");
        assert.isTrue(opponent_3.length == opponent_2.length, "wrong opponent_3 length in winner_2_is_creator after 3");
      } else {
        assert.isTrue(creator_3.length == creator_2.length, "wrong creator_3 length after 3");
        assert.isTrue(opponent_3.length == opponent_2.length + 1, "wrong opponent_3 length after 3");
        assert.isTrue(opponent_3[opponent_3.length - 1] == 3, "wrong last game id for opponent_2 after 3");
      }

      //  4
      await time.increase(time.duration.hours(2));
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.1", ether)
      });

      await game.joinAndPlayGame(4, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("0.1", ether)
      });
      let winner_4_is_creator = (await game.games(4)).winner == CREATOR;
      // console.log("winner_4_is_creator: ", winner_4_is_creator);

      let creator_4 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(CREATOR);
      let opponent_4 = await game.getGamesWithPendingPrizeWithdrawalForAddress.call(OPPONENT);

      if (winner_4_is_creator) {
        assert.isTrue(creator_4.length == creator_3.length + 1, "wrong creator_4 length in winner_4_is_creator after 4");
        assert.isTrue(creator_4[creator_4.length - 1] == 4, "wrong last game id for creator_4 in winner_4_is_creator after 4");
        assert.isTrue(opponent_4.length == opponent_3.length, "wrong opponent_4 length in winner_4_is_creator after 4");
      } else {
        assert.isTrue(creator_4.length == creator_3.length, "wrong creator_4 length after 4");
        assert.isTrue(opponent_4.length == opponent_3.length + 1, "wrong opponent_4 length after 4");
        assert.isTrue(opponent_4[opponent_4.length - 1] == 4, "wrong last game id for opponent_4 after 4");
      }
    });

    it("should update raffleParticipants", async () => {
      // 1
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      let raffleParticipants = await game.getRaffleParticipants.call();
      assert.equal(raffleParticipants.length, 2, "should be 2 raffle participant");
      assert.equal(raffleParticipants[0], CREATOR), "should be CREATOR as reffle participant [0]";
      assert.equal(raffleParticipants[1], OPPONENT), "should be OPPONENT as reffle participant [1]";

      // 2
      await time.increase(time.duration.hours(2));
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      raffleParticipants = await game.getRaffleParticipants.call();
      assert.equal(raffleParticipants.length, 4, "should be 4 raffle participant");
      assert.equal(raffleParticipants[2], CREATOR), "should be CREATOR as reffle participant [2]";
      assert.equal(raffleParticipants[3], OPPONENT), "should be OPPONENT as reffle participant [3]";
    });

    it("should update lastPlayTimestamp", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.lastPlayTimestamp(OPPONENT)).cmp(await time.latest()), "wrong lastPlayTimestamp after game played");
    });

    it("should increase gamesCompletedAmount", async () => {
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      let gamesCompletedAmount = await game.gamesCompletedAmount.call();
      // console.log(gamesCompletedAmount);
      assert.equal(0, gamesCompletedAmount.cmp(new BN(1)), "wrong gamesCompletedAmount");

      //  2
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OTHER,
        value: ether("1", ether)
      });

      gamesCompletedAmount = await game.gamesCompletedAmount.call();
      // console.log(gamesCompletedAmount);
      assert.equal(0, gamesCompletedAmount.cmp(new BN(2)), "wrong gamesCompletedAmount 2");

      //  3
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("0.5", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(3, OPPONENT, {
        from: OPPONENT_REFERRAL,
        value: ether("0.5", ether)
      });

      gamesCompletedAmount = await game.gamesCompletedAmount.call();
      // console.log(gamesCompletedAmount);
      assert.equal(0, gamesCompletedAmount.cmp(new BN(3)), "wrong gamesCompletedAmount 3");

      //  4
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: OTHER,
        value: ether("0.5", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(4, OPPONENT, {
        from: CREATOR,
        value: ether("0.5", ether)
      });
      gamesCompletedAmount = await game.gamesCompletedAmount.call();
      // console.log(gamesCompletedAmount);
      assert.equal(0, gamesCompletedAmount.cmp(new BN(4)), "wrong gamesCompletedAmount 4");
    });

    it("should increase totalUsedInGame", async () => {
      // 1
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("3")), "totalUsedInGame should be 3 ether");

      // 2
      await time.increase(time.duration.hours(2));
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });
      await game.joinAndPlayGame(2, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.totalUsedInGame.call()).cmp(ether("5")), "totalUsedInGame should be 5 ether");
    });

    it("should update participatedGameIdxsForPlayer for opponent", async () => {
      //  1
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT)).length, 1, "wrong length");
      assert.equal(0, ((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT))[0]).cmp(new BN(1)), "should be 1");

      //  2
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR_2,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(2, OPPONENT, {
        from: OPPONENT_REFERRAL,
        value: ether("1", ether)
      });
      assert.equal((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT_REFERRAL)).length, 1, "wrong length after 2");
      assert.equal(0, ((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT_REFERRAL))[0]).cmp(new BN(2)), "should be 2 after 2");

      //  3
      await time.increase(time.duration.hours(2));
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      await game.joinAndPlayGame(3, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT)).length, 2, "wrong length after 3");
      assert.equal(0, ((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT))[0]).cmp(new BN(1)), "should be 1 after 3");
      assert.equal(0, ((await game.getParticipatedGameIdxsForPlayer.call(OPPONENT))[1]).cmp(new BN(3)), "should be 3 after 3");
    });

    it("should clear ongoingGameIdxForCreator for creator", async () => {
      //  1
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });


      assert.equal(0, (await game.ongoingGameIdxForCreator.call(CREATOR)).cmp(new BN(1)), "should be 1 before 1");
      //  2 - join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameIdxForCreator.call(CREATOR)).cmp(new BN(0)), "should be 0 after 1");

      //  2
      // 1 - create
      await game.createGame(1, CREATOR, {
        from: CREATOR_REFERRAL,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.ongoingGameIdxForCreator.call(CREATOR_REFERRAL)).cmp(new BN(2)), "should be 2 before 2");
      //  2 - join
      await game.joinAndPlayGame(2, OPPONENT, {
        from: OPPONENT_REFERRAL,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameIdxForCreator.call(CREATOR_REFERRAL)).cmp(new BN(0)), "should be 0 after 2");

      //  3
      await time.increase(time.duration.hours(2));
      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      assert.equal(0, (await game.ongoingGameIdxForCreator.call(CREATOR)).cmp(new BN(3)), "should be 3 before 3");
      //  2 - join
      await game.joinAndPlayGame(3, OPPONENT_REFERRAL, {
        from: OTHER,
        value: ether("1", ether)
      });
      assert.equal(0, (await game.ongoingGameIdxForCreator.call(CREATOR)).cmp(new BN(0)), "should be 0 after 3");
    });

    it("should remove game id from topGames", async () => {
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      await game.createGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      //  add to top
      await game.addTopGame(1, {
        from: CREATOR,
        value: ether("0.01")
      });
      assert.equal(0, new BN("1").cmp((await game.getTopGames.call())[0]), "1 should be in topGames");

      await game.addTopGame(2, {
        from: OPPONENT,
        value: ether("0.01")
      });
      assert.equal(0, new BN("2").cmp((await game.getTopGames.call())[0]), "2 should be in topGames");

      assert.equal(0, new BN("2").cmp((await game.getTopGames.call())[0]), "0 wrong topGames array before");
      assert.equal(0, new BN("1").cmp((await game.getTopGames.call())[1]), "1 wrong topGames array before");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[2]), "2 wrong topGames array before");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[3]), "3 wrong topGames array before");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[4]), "4 wrong topGames array before");

      //  join
      await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });
      assert.equal(0, new BN("2").cmp((await game.getTopGames.call())[0]), "0 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[1]), "1 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[2]), "2 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[3]), "3 wrong topGames array after");
      assert.equal(0, new BN("0").cmp((await game.getTopGames.call())[4]), "4 wrong topGames array after");
    });

    it("should emit CF_GamePlayed event", async () => {
      // event CF_GamePlayed(uint256 indexed id, address creator, address opponent, address indexed winner, uint256 bet);

      // 1 - create
      await game.createGame(1, CREATOR_REFERRAL, {
        from: CREATOR,
        value: ether("1", ether)
      });

      //  2 - join
      let tx = await game.joinAndPlayGame(1, OPPONENT_REFERRAL, {
        from: OPPONENT,
        value: ether("1", ether)
      });

      assert.equal(tx.logs.length, 1, "should be 1 event");
      let event = tx.logs[0];
      assert.equal(event.event, "CF_GamePlayed", "wrong event name");
      assert.equal(0, event.args.id.cmp(new BN(1)), "wrong id");
      assert.equal(event.args.creator, CREATOR, "wrong CREATOR");
      assert.equal(event.args.opponent, OPPONENT, "wrong OPPONENT");
      assert.equal(event.args.winner, (await game.games.call(1)).winner, "wrong winner");
      assert.equal(0, (await game.games.call(1)).bet.cmp(ether("1", ether)), "wrong bet");
    });
  });
});