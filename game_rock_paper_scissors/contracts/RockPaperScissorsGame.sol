// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Partnership.sol";
import "./IExpiryMoveDuration.sol";
import "./IGamePausable.sol";
import "./GameRaffle.sol";
import "./AcquiredFeeBeneficiar.sol";
import "../node_modules/openzeppelin-solidity/contracts/utils/Pausable.sol";


/**
 * @notice IMPORTANT: owner should create first game.
 *
 *  Prize distribution will be performed on game prize withdrawal only with percentages:
 *    95% - winner
 *     1% - winner referral
 *     1% - raffle
 *     1% - partner project
 *     1% - fee beneficiar
 *     1% - dev
 */


contract RockPaperScissorsGame is Pausable, Partnership, AcquiredFeeBeneficiar, IExpiryMoveDuration, IGamePausable, GameRaffle {
  
  enum GameState {WaitingForOpponent, Started, WinnerPresent, Draw, Quitted, Expired}

  struct Game {
    bool paused;
    bool prizeWithdrawn;
    bool[2] drawWithdrawn;  //  0 - creator; 1 - opponent

    GameState state;

    uint256 id;
    uint256 bet;
    uint256 prevMoveTimestamp;
    address nextMover;
    uint8[3] movesCreator;  //  [row mark: None, Rock, Paper, Scissors]
    uint8[3] movesOpponent; //  [row mark: None, Rock, Paper, Scissors]
    bytes32[3] creatorMoveHashes;

    address payable creator;
    address payable opponent;
    address payable winner;

    address creatorReferral;
    address opponentReferral;
  }

  uint256 private constant FEE_PERCENT = 1; //  from single bet, because prize is opponent's bet
  uint256 public minBet = 10 finney; //  also used as fee add to TopGames, unpause
  
  uint256[5] public topGames; //  show above other games

  uint256 public gamesCreatedAmount;
  uint256 public gamesCompletedAmount; //  played, quitted, move expired

  mapping(uint256 => Game) public games;
  mapping(address => uint256) public ongoingGameAsCreator;
  mapping(address => uint256) public ongoingGameAsOpponent;
  mapping(address => uint256[]) private playedGames;
  mapping(address => uint256[]) public gamesWithPendingPrizeWithdrawal; //  for both won & draw

  mapping(address => uint256) public addressBetTotal;
  mapping(address => uint256) public addressPrizeTotal;

  mapping(address => uint256) public referralFeesPending;
  mapping(address => uint256) public referralFeesWithdrawn;

  uint256 public devFeePending;

  uint256 public totalUsedReferralFees;
  uint256 public totalUsedInGame;


  event RPS_GameCreated(uint256 indexed id, address indexed creator, uint256 indexed bet);
  event RPS_GameJoined(uint256 indexed id, address indexed creator, address indexed opponent);
  event RPS_GameMovePlayed(uint256 indexed id,);
  event RPS_GameOpponentMoved(uint256 indexed id);
  event RPS_GameExpiredFinished(uint256 indexed id, address indexed creator, address indexed opponent);
  event RPS_GameQuittedFinished(uint256 indexed id, address indexed creator, address indexed opponent);
  event RPS_GameFinished(uint256 indexed id, address indexed creator, address indexed opponent);
  event RPS_GamePrizesWithdrawn(address indexed player);
  event RPS_GameUpdated(uint256 indexed id, address indexed creator);
  event RPS_GameAddedToTop(uint256 indexed id, address indexed creator);
  event RPS_GameReferralWithdrawn(address indexed referral);
  
    
  modifier onlyCorrectBet() {
    require(msg.value >= minBet, "Wrong bet");
    _;
  }

  modifier onlyAvailableToCreate() {
    require(ongoingGameAsCreator[msg.sender] == 0, "No more creating");
    _;
  }

  modifier onlyAvailableToJoin() {
    require(ongoingGameAsOpponent[msg.sender] == 0, "No more opponenting");
    _;
  }

  modifier onlyCorrectReferral(address _referral) {
    require(_referral != msg.sender, "Wrong referral");
    _;
  }

  modifier onlyGameCreator(uint256 _id) {
    require(games[_id].creator == msg.sender,  "Not creator");
    _;
  }

  modifier onlyWaitingForOpponent(uint256 _id) {
    require(games[_id].state == GameState.WaitingForOpponent,  "!= WaitingForOpponent");
    _;
  }

  modifier onlyNotExpiredGame(uint256 _id) {
    require(!gameMoveExpired(_id), "Move expired");
    _;
  }

  modifier onlyGameNotPaused(uint256 _id) {
    require(!gameOnPause(_id),  "Game is paused");
    _;
  }

  modifier onlyGamePaused(uint256 _id) {
    require(gameOnPause(_id),  "Game is not paused");
    _;
  }

  modifier onlyNextMover(uint256 _id) {
    require(games[_id].nextMover == msg.sender,  "Not next mover");
    _;
  }

  modifier onlyValidMoveMark(uint8 _moveMark) {
    require(_moveMark > 0 && _moveMark < 4, "Wrong move idx");
    _;
  }
  
  /**
   * @dev Contract constructor.
   * @param _partner Address for partner.
   * 
   */
  constructor(address payable _partner) Partnership (_partner, 1 ether) public {
    updatePartner(_partner);
  }

  /**
   * @dev Destroys the contract.
   * 
   */
  function kill() external onlyOwner {
    address payable addr = msg.sender;
    selfdestruct(addr);
  }

  /**
   * IExpiryMoveDuration
   * 
   */

  /**
   * @dev Updates game move duration.
   * @param _duration Game duration.
   * 
   */
  function updateGameMoveDuration(uint16 _duration) external override onlyOwner {
    require(_duration > 0, "Should be > 0");
    gameMoveDuration = _duration;    
  }

  /**
   * @dev Checks if game move expired.
   * @param _id Game id.
   * @return Whether game move is expired.
   * 
   */
  function gameMoveExpired(uint256 _id) public view override returns(bool) {
    if(games[_id].prevMoveTimestamp != 0) {
      return games[_id].prevMoveTimestamp.add(gameMoveDuration) < now; 
    }
  }

  /**
   * @dev Finishes prize for expired game.
   * @param _id Game id.
   * 
   */
  function finishExpiredGame(uint256 _id) external override {
    Game storage game = games[_id];

    require(game.creator != address(0), "No game with such id");
    require(game.state ==  GameState.Started, "Wrong state");
    require(msg.sender == ((game.nextMover == game.creator) ? game.opponent : game.creator), "Wrong claimer");
    require(gameMoveExpired(_id), "Not yet expired");

    game.winner = msg.sender;
    game.state = GameState.Expired;

    finishGame(game);
  }

  /**
   * Pausable.sol
   * 
   */
  /**
   * @dev Triggers stopped state.
   * 
   */
  function pause() external onlyOwner {
    Pausable._pause();
  }

  /**
   * IGamePausable
   * 
   */
  /**
   * @dev Checks if game is paused.
   * @param _id Game index.
   * @return Is game paused.
   * 
   */
  function gameOnPause(uint256 _id) public view override returns(bool) { 
    return games[_id].paused;
  }

  /**
   * @dev Pauses game.
   * @param _id Game index.
   * 
   */
  function pauseGame(uint256 _id) onlyGameCreator(_id) onlyGameNotPaused(_id) onlyWaitingForOpponent(_id) external override {
    games[_id].paused = true;

    if (isTopGame(_id)) {
      removeTopGame(_id);
    }

    emit RPS_GamePaused(_id);
  }
  /** 
   * @dev Unpauses game.
   * @param _id Game index.
   * 
   */
  function unpauseGame(uint256 _id) onlyGameCreator(_id) onlyGamePaused(_id) external payable override {
    require(msg.value == minBet, "Wrong fee");

    games[_id].paused = false;
    
    devFeePending = devFeePending.add(msg.value);
    totalUsedInGame = totalUsedInGame.add(msg.value);

    emit RPS_GameUnpaused(_id, games[_id].creator);
  }
  
  /**
   * AcquiredFeeBeneficiar
   * TESTED
   */
  function makeFeeBeneficiar() public payable override {
     totalUsedInGame = totalUsedInGame.add(msg.value);
     AcquiredFeeBeneficiar.makeFeeBeneficiar();
  }


  /**
   * GAMEPLAY
   */

   /**
   * @dev Creates new game.
   * @param _referral Address for referral. 
   * @param _moveHash Move hash (moveId, moveSeed).
   * 
   */
  function createGame(address _referral, bytes32 _moveHash) external payable whenNotPaused onlyAvailableToCreate onlyCorrectBet onlyCorrectReferral(_referral) {  
    require(_moveHash[0] != 0, "Empty hash");

    addressBetTotal[msg.sender] = addressBetTotal[msg.sender].add(msg.value);

    games[gamesCreatedAmount].id = gamesCreatedAmount;
    games[gamesCreatedAmount].creator = msg.sender;
    games[gamesCreatedAmount].bet = msg.value;
    games[gamesCreatedAmount].creatorMoveHashes[0] = _moveHash;
    if(_referral != address(0)) {
      games[gamesCreatedAmount].creatorReferral = _referral;
    }
    
    ongoingGameIdxForPlayer[msg.sender] = gamesCreatedAmount;
    playedGames[msg.sender].push(gamesCreatedAmount);

    totalUsedInGame = totalUsedInGame.add(msg.value);

    emit RPS_GameCreated(gamesCreatedAmount, msg.sender, msg.value);

    gamesCreatedAmount = gamesCreatedAmount.add(1);
  }

  /**
   * @dev Joins game.
   * @param _id Game id.
   * @param _referral Address for referral.
   * @param _moveMark Move mark id.
   * 
   */
  function joinGame(uint256 _id, address _referral, uint8 _moveMark) external payable whenNotPaused onlyAvailableToJoin onlyGameNotPaused(_id) onlyWaitingForOpponent(_id) onlyCorrectReferral(_referral) onlyValidMoveMark(_moveMark) {
    Game storage game = games[_id];
    
    require(game.bet == msg.value, "Wrong bet");
    if(_referral != address(0)) {
      game.opponentReferral = _referral;
    }

    if (isTopGame(_id)) {
      removeTopGame(_id);
    }

    addressBetTotal[msg.sender] = addressBetTotal[msg.sender].add(msg.value);
    
    game.opponent = msg.sender;
    game.nextMover = game.creator;
    game.prevMoveTimestamp = now;
    game.movesOpponent[0] = _moveMark;
    game.state = GameState.Started;

    ongoingGameIdxForPlayer[msg.sender] = _id;
    playedGames[msg.sender].push(_id);
    
    totalUsedInGame = totalUsedInGame.add(msg.value);

    emit RPS_GameJoined(_id, game.creator, game.opponent);
  }

  /**
   * @dev Plays move.
   * @param _id Game id.
   * @param _prevMoveMark Move mark used in previous move hash.
   * @param _prevSeedHashFromHash Seed string hash used in previous move hash.
   * @param _nextMoveHash Next move hash.
   * 
   */
  function playMove(uint256 _id, uint8 _prevMoveMark, bytes32 _prevSeedHashFromHash, bytes32 _nextMoveHash) external whenNotPaused onlyGameCreator(_id) onlyNextMover(_id) onlyNotExpiredGame(_id)  {
    Game storage game = games[_id];
    
    uint8 gameRow;
    for (uint8 i = 0; i < 3; i ++) {
      if (game.movesCreator[i] == 0) {
        gameRow = i;
        break;
      }
    }

    require(keccak256(abi.encodePacked(uint256(_prevMoveMark), _prevSeedHashFromHash)) == game.creatorMoveHashes[gameRow], "Wrong hash value");

    game.movesCreator[gameRow] = _prevMoveMark;

    if(gameRow < 2) {
      require(_nextMoveHash[0] != 0, "Empty hash");
      game.creatorMoveHashes[gameRow + 1] = _nextMoveHash;
      game.nextMover = game.opponent;
      game.prevMoveTimestamp = now;

      emit RPS_GameMovePlayed(_id);
      return;
    }

    game.winner = playerWithMoreWins(_id);
    game.state = (game.winner != address(0)) ? GameState.WinnerPresent : GameState.Draw;
    finishGame(game);
  }

  /**
   * @dev Opponent makes move.
   * @param _id Game id.
   * @param _moveMark Move mark.
   * 
   */
  function opponentNextMove(uint256 _id, uint8 _moveMark) external whenNotPaused onlyNextMover(_id) onlyNotExpiredGame(_id) onlyValidMoveMark(_moveMark) {
    Game storage game = games[_id];
    
    uint8 gameRow;
    for (uint8 i = 0; i < 3; i ++) {
      if (game.movesOpponent[i] == 0) {
        gameRow = i;
        break;
      }
    }

    game.movesOpponent[gameRow] = _moveMark;
    game.nextMover = game.creator;
    game.prevMoveTimestamp = now;
    
    emit RPS_GameOpponentMoved(_id);
  }


  /**
   * WITHDRAW
   */

  /**
   * @dev Withdraws prize for multiple games where user is winner.
   * @param _maxLoop Max loop.
   * 
   */
  function withdrawGamePrizes(uint256 _maxLoop) external {
    require(_maxLoop > 0, "_maxLoop == 0");
    
    uint256[] storage pendingGames = gamesWithPendingPrizeWithdrawalForAddress[msg.sender];
    require(pendingGames.length > 0, "no pending");
    require(_maxLoop <= pendingGames.length, "wrong _maxLoop");
    
    uint256 prizeTotal;
    for (uint256 i = 0; i < _maxLoop; i ++) {
      uint256 gameId = pendingGames[pendingGames.length.sub(1)];
      Game storage game = games[gameId];
      
      if (game.state == GameState.Draw) {
        if (game.creator == msg.sender) {
          require(!game.drawWithdrawn[0], "Fatal, cr with draw");
          game.drawWithdrawn[0] = true;
        } else if (game.opponent == msg.sender) {
          require(!game.drawWithdrawn[1], "Fatal, opp with draw");
          game.drawWithdrawn[1] = true;
        }
      } else {
        require((game.winner == msg.sender), "Fatal, not winner");
        require(!game.prizeWithdrawn, "Fatal,prize was with");
        game.prizeWithdrawn = true;
      }

      uint256 gamePrize = prizeForGame(gameId);
      require(gamePrize > 0, "Fatal, no prize");

      //  referral
      address referral = (msg.sender == game.creator) ? game.creatorReferral : game.opponentReferral;
      uint256 referralFee = gamePrize.mul(FEE_PERCENT).div(100);
      referralFeesPending[referral] = referralFeesPending[referral].add(referralFee);
      totalUsedReferralFees = totalUsedReferralFees.add(referralFee);
      
      prizeTotal += gamePrize;
      pendingGames.pop();
    }

    addressPrizeTotal[msg.sender] = addressPrizeTotal[msg.sender].add(prizeTotal);
    
    uint256 singleFee = prizeTotal.mul(FEE_PERCENT).div(100);
    partnerFeePending = partnerFeePending.add(singleFee);
    ongoinRafflePrize = ongoinRafflePrize.add(singleFee);
    devFeePending = devFeePending.add(singleFee.mul(2));
    addBeneficiarFee(singleFee);

    prizeTotal = prizeTotal.sub(singleFee.mul(5));
    msg.sender.transfer(prizeTotal);

    //  partner transfer
    transferPartnerFee();

    emit RPS_GamePrizesWithdrawn(msg.sender);
  }

  /**
   * @dev Withdraws referral fees.
   * 
   */
  function withdrawReferralFees() external {
    uint256 feeTmp = referralFeesPending[msg.sender];
    require(feeTmp > 0, "No referral fee");

    delete referralFeesPending[msg.sender];
    referralFeesWithdrawn[msg.sender] = referralFeesWithdrawn[msg.sender].add(feeTmp);

    msg.sender.transfer(feeTmp);
    emit RPS_GameReferralWithdrawn(msg.sender);
  }

  /**
   * @dev Withdraws developer fees.
   * 
   */
  function withdrawDevFee() external onlyOwner {
    require(devFeePending > 0, "No dev fee");

    uint256 feeTmp = devFeePending;
    delete devFeePending;

    msg.sender.transfer(feeTmp);
  }

  /**
   * GameRaffle
   * @dev Withdraw prizes for all won raffles.
   * 
   */
   
  function withdrawRafflePrizes() external override {
    require(rafflePrizePending[msg.sender] > 0, "No raffle prize");

    uint256 prize = rafflePrizePending[msg.sender];
    delete rafflePrizePending[msg.sender];
    
    addressPrizeTotal[msg.sender] = addressPrizeTotal[msg.sender].add(prize);

    uint256 singleFee = prize.mul(FEE_PERCENT).div(100);
    partnerFeePending = partnerFeePending.add(singleFee);
    devFeePending = devFeePending.add(singleFee.mul(2));

    //  transfer prize
    prize = prize.sub(singleFee.mul(3));
    msg.sender.transfer(prize);

    //  partner transfer
    transferPartnerFee();

    emit RPS_RafflePrizeWithdrawn(msg.sender, prize);
  }
  

  /**
   * OTHER
   */

  /**
   * @dev Quits the game.
   * @param _id Game id.
   * 
   */
  function quitGame(uint256 _id) external {
    Game storage game = games[_id];
    require((msg.sender == game.creator) || (msg.sender == game.opponent), "Not a game player");
    require((game.state == GameState.WaitingForOpponent) || (game.state == GameState.Started), "Wrong game state");
    
    if (game.state == GameState.WaitingForOpponent) {
      address payable ownerAddr = address(uint160(owner()));
      game.winner = ownerAddr;
    } else if (game.state == GameState.Started) {
      game.winner = (msg.sender == game.creator) ? game.opponent : game.creator;
    }

    if (gameMoveExpired(_id)) {
      if (game.winner == msg.sender) {
        revert("Claim, not quit");
      }
    }

    game.state = GameState.Quitted;

    if (isTopGame(_id)) {
      removeTopGame(_id);
    }
    
    finishGame(game);
  }

  /**
   * @dev Adds game idx to the beginning of topGames.
   * @param _id Game idx to be added.
   * 
   */  
  function addTopGame(uint256 _id) whenNotPaused onlyGameCreator(_id) onlyWaitingForOpponent(_id) onlyGameNotPaused(_id) external payable {
    require(msg.value == minBet, "Wrong fee");
    require(topGames[0] != _id, "Top in TopGames");
        
    uint256[5] memory topGamesTmp = [_id, 0, 0, 0, 0];
    bool isIdPresent;
    for (uint8 i = 0; i < 4; i ++) {
      if (topGames[i] == _id && !isIdPresent) {
        isIdPresent = true;
      }
      topGamesTmp[i+1] = (isIdPresent) ? topGames[i+1] : topGames[i];
    }
    topGames = topGamesTmp;
    devFeePending = devFeePending.add(msg.value);
    totalUsedInGame = totalUsedInGame.add(msg.value);

    emit RPS_GameAddedToTop(_id, games[_id].creator);
  }

  /**
   * @dev Removes game idx from topGames.
   * @param _id Game idx to be removed.
   * 
   */
  function removeTopGame(uint256 _id) public {
    uint256[5] memory tmpArr;
    bool found;
    
    for(uint256 i = 0; i < 5; i ++) {
      if(topGames[i] == _id) {
        found = true;
      } else {
        if (found) {
          tmpArr[i-1] = topGames[i];
        } else {
          tmpArr[i] = topGames[i];
        }
      }
    }

    require(found, "Not TopGame");
    topGames = tmpArr;
  }

  /**
   * @dev Gets top games.
   * @return Returns list of top games.
   * 
   */
  function getTopGames() external view returns (uint256[5] memory) {
    return topGames;
  }

  /**
   * @dev Checks if game id is in top games.
   * @param _id Game id to check.
   * @return Whether game id is in top games.
   * 
   */
  function isTopGame(uint256 _id) public view returns (bool) {
    for (uint8 i = 0; i < 5; i++) {
      if (topGames[i] == _id) {
          return true;
      }
    }
    return false;
  }

  /**
   * @dev Updates bet for game.
   * @param _id Game index.
   * 
   */
  function increaseBetForGameBy(uint256 _id) whenNotPaused onlyGameCreator(_id) onlyWaitingForOpponent(_id) external payable {
    require(msg.value > 0, "increase must be > 0");

    addressBetTotal[msg.sender] = addressBetTotal[msg.sender].add(msg.value);
    
    games[_id].bet = games[_id].bet.add(msg.value);
    totalUsedInGame = totalUsedInGame.add(msg.value);
    emit RPS_GameUpdated(_id, msg.sender);
  }

  /**
   * @dev Updates minimum bet value. Can be 0 if no restrictions.
   * @param _minBet Min bet value.
   * 
   */
  function updateMinBet(uint256 _minBet) external onlyOwner {
    require(_minBet > 0, "Wrong bet");
    minBet = _minBet;
  }

  /**
   * @dev Shows moves for row for game.
   * @param _id Game index.
   * @param _row Game moves row.
   * @return Game moves.
   * 
   */
  function showRowMoves(uint256 _id, uint8 _row) external view returns (uint8, uint8) {
    return (games[_id].movesCreator[_row], games[_id].movesOpponent[_row]);
  }

  /**
   * @dev Gets creator's hashes for game.
   * @param _id Game id.
   * @return Array of hash values.
   * 
   */
  function getCreatorMoveHashesForGame(uint256 _id) external view returns(bytes32[3] memory) {
    return games[_id].creatorMoveHashes;
  }

  /**
   * @dev Game withdrawal information.
   * @param _id Game index.
   * @return prizeWithdrawn, drawWithdrawnCreator, drawWithdrawnOpponent.
   * 
   */
  function gameWithdrawalInfo(uint256 _id) external view returns (bool, bool, bool) {
    return (games[_id].prizeWithdrawn, games[_id].drawWithdrawn[0], games[_id].drawWithdrawn[1]);
  }

  /**
   * @dev Gets game indexes where player played. Created and joined
   * @param _address Player address.
   * @return List of indexes.
   * 
   */
  function getPlayedGamesForPlayer(address _address) external view returns (uint256[] memory) {
    require(_address != address(0), "Cannt be 0x0");
    return playedGames[_address];
  }

  /**
   * @dev Calculates prize for game for msg.sender.
   * @param _id Game id.
   * @return _prize Prize amount. Fees are included.
   * 
   */
  function prizeForGame(uint256 _id) public view returns (uint256 _prize) {
    if (games[_id].winner == msg.sender) {
      //  WinnerPresent, Quitted, Expired
      _prize = games[_id].bet.mul(2);
    } else if (games[_id].state == GameState.Draw) {
      if ((games[_id].creator == msg.sender) || (games[_id].opponent == msg.sender)) {
        _prize = games[_id].bet;
      }
    }
  }

  /**
   * @dev Gets gamesWithPendingPrizeWithdrawalForAddress.
   * @param _address Player address.
   * @return ids Game id array.
   * 
   */
  function getGamesWithPendingPrizeWithdrawal(address _address) external view returns(uint256[] memory ids) {
    ids = gamesWithPendingPrizeWithdrawalForAddress[_address];
  }

  /**
   * PRIVATE
   */

   /**
   * @dev Finds player address with more wins.
   * @param _id Game id.
   * @return playerAddr Winner address with more wins.
   * 
   */
  function playerWithMoreWins(uint256 _id) private view returns (address payable playerAddr) {
    //  0 - None
    //  1 - Rock
    //  2 - Paper
    //  3 - Scissors

    Game memory game = games[_id];
    uint8 creatorAmount;
    uint8 opponentAmount;
   
    for (uint8 i  = 0; i < 3; i ++) {
      uint8 creatorMark = game.movesCreator[i];
      uint8 opponentMark = game.movesOpponent[i];

      if (creatorMark == 1) {
        if (opponentMark == 2) {
          opponentAmount++;
        } else if (opponentMark == 3) {
          creatorAmount++;
        }
      } else if (creatorMark == 2) {
        if (opponentMark == 1) {
            creatorAmount++;
        } else if (opponentMark == 3) {
            opponentAmount++;
        }
      } else if (creatorMark == 3) {
        if (opponentMark == 1) {
            opponentAmount++;
        } else if (opponentMark == 2) {
            creatorAmount++;
        }
      }
    }

    if (creatorAmount > opponentAmount) {
      return game.creator;
    } else if (creatorAmount < opponentAmount) {
      return game.opponent;
    }
  }

  /**
   * @dev Adds raffle participants & delete all ongoing statuses for players.
   * @param _game Game instance.
   * 
   */
  function finishGame(Game storage _game) private {
    if (_game.state == GameState.Expired || _game.state == GameState.Quitted) {
      raffleParticipants.push(_game.winner);
    } else if (_game.state == GameState.WinnerPresent || _game.state == GameState.Draw) {
      raffleParticipants.push(_game.creator);
      raffleParticipants.push(_game.opponent);
    } else {
      revert("Fatal, wrong GameState");
    }

    gamesCompletedAmount = gamesCompletedAmount.add(1);
    delete ongoingGameIdxForPlayer[_game.creator];
    delete ongoingGameIdxForPlayer[_game.opponent];
    delete _game.prevMoveTimestamp;
    delete _game.nextMover;

    if (_game.winner != address(0)) {
      gamesWithPendingPrizeWithdrawalForAddress[_game.winner].push(_game.id);
    } else {
      gamesWithPendingPrizeWithdrawalForAddress[_game.creator].push(_game.id);
      gamesWithPendingPrizeWithdrawalForAddress[_game.opponent].push(_game.id);
    }

    emit RPS_GameFinished(_game.id);
  }
}