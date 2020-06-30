pragma solidity ^0.5.10;

import "./IExpiryMoveDuration.sol";
import "./IGamePausable.sol";
import "./GameRaffle.sol";
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

//  IMPORTANT: owner should create first game. Reason - onlySingleGameCreated

contract TicTacToeGame is Pausable, IExpiryMoveDuration, IGamePausable, GameRaffle {
  enum GameState {WaitingForOpponent, Started, WinnerPresent, Draw, Quitted, Expired}
  enum MoveMark {Vacant, Creator, Opponent}

  struct Game {
    uint256 id;
    bool paused;
    bool prizeWithdrawn;
    bool[2] drawWithdrawn;  //  0 - creator; 1 - opponent

    GameState state;

    address payable creator;
    address payable opponent;
    address payable winner;

    address creatorReferral;
    address opponentReferral;

    uint256 bet;
    uint256 prevMoveTimestamp;
    uint8 movesTotal;
    address nextMover;
    MoveMark[3][3] field;
  }

  uint256 public constant PRIZE_PERCENT = 90;
  uint256 public constant FEE_PERCENT = 2;

  uint8 public constant MOVES_MAX = 9;

  uint256 public constant UPDATE_FEE = 1 finney;
  uint256 public minBet = 1 finney;

  uint256[5] public topGames; //  show above other games

  uint256 public gamesCreatedAmount;
  uint256 public gamesCompletedAmount; //  played, quitted, move expired
  mapping(uint256 => Game) public games;
  mapping(address => uint256) public ongoingGameIdxForParticipant;
  mapping(address => uint256[]) private participatedGameIdxsForPlayer;

  mapping(address => uint256) public referralFees;
  uint256 public devFee;

  address payable public partner;
  uint256 public partnerFee;

  event GameCreated(uint256 indexed id, address indexed creator, uint256 bet);
  event GameJoined(uint256 indexed id, address indexed creator, address indexed opponent, address firstMove); //  firstMove: 0 - creator; 1 - opponent
  event GameMoveMade(uint256 indexed id, address indexed mover, uint8 x, uint8 y);
  event GameFinished(uint256 indexed id, address indexed winner, uint256 bet);
  event GamePrizeWithdrawn(uint256 indexed id);
  event GameQuitted(uint256 indexed id, address quitter);
  event GameUpdated(uint256 indexed id);
  event GameAddedToTop(uint256 indexed id);
  event GameReferralWithdrawn(address indexed referral);


  modifier onlyCorrectBet() {
    require(msg.value >= minBet, "Wrong bet");
    _;
  }

  modifier onlyCorrectReferral(address _referral) {
    require(_referral != msg.sender, "Wrong referral");
    _;
  }

  modifier onlySingleGameParticipating() {
    require(ongoingGameIdxForParticipant[msg.sender] == 0,  "No more participating");
    _;
  }

  modifier onlyCreator(uint256 _id) {
    require(games[_id].creator == msg.sender,  "Not creator");
    _;
  }

  modifier onlyNotCreator(uint256 _id) {
    require(games[_id].creator != msg.sender,  "Is creator");
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

  modifier onlyValidCell(uint256 _id, uint8 _x, uint8 _y) {
    require((_x < 3) && (_y < 3), "Wrong cell idx");
    require(games[_id].field[_x][_y] == MoveMark.Vacant, "Cell is set");
    _;
  }

  modifier onlyWaitingForOpponent(uint256 _id) {
    require(games[_id].state == GameState.WaitingForOpponent,  "!= WaitingForOpponent");
    _;
  }

  modifier onlyStarted(uint256 _id) {
    require(games[_id].state == GameState.Started,  "!= Started");
    _;
  }


   /**
    * @dev Contract constructor.
    * @param _partner Address for partner.
    * TESTED
    */
   constructor(address payable _partner) public {
     setPartner(_partner);
   }

  /**
   * @dev Gets contract balance.
   * @return Contract balance.
   * TESTED
   */
  function balance() public view returns(uint256) {
    return address(this).balance;
  }

  /**
  * @dev Destroyes the contract.
  * TESTED
  */
  function kill() public onlyOwner {
    address payable addr = msg.sender;
    selfdestruct(addr);
  }

  /**
   * IExpiryMoveDuration
   * TESTED
   */

   /**
   * @dev Checks if game is expired.
   * @param _duration Game duration.
   * @return Is game expired.
   * @notice Add onlyOwner modifier.
   * TESTED
   */
  function updateGameMoveDuration(uint16 _duration) public onlyOwner {
    require(_duration > 0, "Should be > 0");
    gameMoveDuration = _duration;    
  }

  /**
  * @dev Checks if game move expired.
  * @param _id Game id.
  * @return Whether game move is expired.
  * TESTED
  */
  function gameMoveExpired(uint256 _id) public view returns(bool) {
    if(games[_id].prevMoveTimestamp != 0) {
      return games[_id].prevMoveTimestamp.add(gameMoveDuration) < now; 
    }
  }

  /**
  * @dev Claims prize for game with expired move.
  * @param _id Game id.
  * TESTED
  */
  function claimExpiredGamePrize(uint256 _id) public {
    require(games[_id].creator != address(0), "No game with such id");
    require(games[_id].prizeWithdrawn == false, "Prize withdrawn");
    require(games[_id].winner == address(0), "Game was played");
    require(((games[_id].nextMover == games[_id].creator) ? games[_id].opponent : games[_id].creator) == msg.sender, "Wrong claimer");
    require(gameMoveExpired(_id), "Not yet expired");

    games[_id].winner = msg.sender;
    games[_id].state = GameState.Expired;

    finishGame(_id);
    performPrizeCalculationsAndTransferForGameWithWinner(_id);
  }


  /**
   * IGamePausable
   * TESTED
   */

   /**
   * @dev Checks if game is paused.
   * @param _id Game index.
   * @return Is game paused.
   * TESTED
   */
  function gameOnPause(uint256 _id) public view returns(bool) { 
    return games[_id].paused;
  }

  /**
   * @dev Pauses game.
   * @param _id Game index.
   * TESTED
   */
  function pauseGame(uint256 _id) onlyCreator(_id) onlyGameNotPaused(_id) onlyWaitingForOpponent(_id) public {
    games[_id].paused = true;

    emit GamePaused(_id);
  }

  /**
   * @dev Unpauses game.
   * @param _id Game index.
   * TESTED
   */
  function unpauseGame(uint256 _id) onlyCreator(_id) onlyGamePaused(_id) public {
    games[_id].paused = false;

    emit GameUnpaused(_id);
  }


  /**
   * GAMEPLAY
   * TESTED
   */
  /**
   * @dev Creates new game.
   * @param _referral Address for referral. 
   * TESTED
   */
  function createGame(address _referral) whenNotPaused onlySingleGameParticipating onlyCorrectBet onlyCorrectReferral(_referral) public payable {
    games[gamesCreatedAmount].id = gamesCreatedAmount;
    games[gamesCreatedAmount].creator = msg.sender;
    games[gamesCreatedAmount].bet = msg.value;
    games[gamesCreatedAmount].state = GameState.WaitingForOpponent;
    if(_referral != address(0)) {
      games[gamesCreatedAmount].creatorReferral = _referral;
    }

    ongoingGameIdxForParticipant[msg.sender] = gamesCreatedAmount;
    participatedGameIdxsForPlayer[msg.sender].push(gamesCreatedAmount);

    emit GameCreated(gamesCreatedAmount, msg.sender, msg.value);

    gamesCreatedAmount = gamesCreatedAmount.add(1);
  }

  /**
  * @dev Joins game.
  * @param _id Game id.
  * @param _referral Address for referral.
  * TESTED
  */
  function joinGame(uint256 _id, address _referral) public payable onlySingleGameParticipating onlyNotCreator(_id) onlyGameNotPaused(_id) onlyWaitingForOpponent(_id) onlyCorrectReferral(_referral) {
    Game storage game = games[_id];
    
    require(game.bet == msg.value, "Wrong bet");
    game.opponent = msg.sender;
    if(_referral != address(0)) {
      game.opponentReferral = _referral;
    }
    
    ongoingGameIdxForParticipant[msg.sender] = _id;
    participatedGameIdxsForPlayer[msg.sender].push(_id);
    uint8 firstMove = uint8(uint256(keccak256(abi.encodePacked(now, gamesCreatedAmount)))%2);
    game.nextMover = (firstMove == 0) ? game.creator : game.opponent;
    game.state = GameState.Started;
    game.prevMoveTimestamp = now;

    emit GameJoined(_id, game.creator, game.opponent, game.nextMover);
  }

  /**
  * @dev Plays game.
  * @param _id Game id.
  * @param _x Cell x coord.
  * @param _y Cell y coord.
  * TESTED
  */
  function makeMove(uint256 _id, uint8 _x, uint8 _y) public onlyStarted(_id) onlyNotExpiredGame(_id) onlyNextMover(_id) onlyValidCell(_id, _x, _y) {
    Game storage game = games[_id];

    game.movesTotal += 1;
    game.prevMoveTimestamp = now;
    game.nextMover = (game.nextMover == game.creator) ? game.opponent : game.creator;
    game.field[_x][_y] = (msg.sender == game.creator) ? MoveMark.Creator : MoveMark.Opponent;

    emit GameMoveMade(_id, msg.sender, _x, _y);

    checkForWinner(_id);
    if((game.winner != address(0))) {
      game.state = GameState.WinnerPresent;
      finishGame(_id);
    } else if (game.movesTotal == MOVES_MAX) {
      game.state = GameState.Draw;
      finishGame(_id);
    }
  }


  /**
   * WITHDRAW
   * TESTED
   */

  /**
   * @dev Withdraws prize for won game.
   * @param _id Game id.
   * TESTED
   */
  function withdrawGamePrize(uint256 _id) public {
    Game memory game = games[_id];
    if((game.state == GameState.WinnerPresent) || (game.state == GameState.Quitted)) {
      performPrizeCalculationsAndTransferForGameWithWinner(_id);
    } else if(game.state == GameState.Draw) {
      performPrizeCalculationsAndTransferForGameWithDraw(_id);
    } else {
      revert("Wrong state");
    }

    emit GamePrizeWithdrawn(_id);
  }

  /**
   * @dev Withdraws referral fees.
   * TESTED
   */
  function withdrawReferralFees() public {
    require(referralFees[msg.sender] > 0, "No referral fee");

    uint256 fee = referralFees[msg.sender];
    delete referralFees[msg.sender];

    msg.sender.transfer(fee);
    emit GameReferralWithdrawn(msg.sender);
  }

  /**
   * @dev Withdraws developer fees.
   * TESTED
   */
  function withdrawDevFee() public onlyOwner {
    require(devFee > 0, "No dev fee");

    uint256 fee = devFee;
    delete devFee;

    msg.sender.transfer(fee);
  }
  

  /**
   * OTHER
   * TESTED
   */
  
  /**
   * @dev Quits the game.
   * @param _id Game id.
   * TESTED
   */
  function quitGame(uint256 _id) public {
    Game storage game = games[_id];
    require((msg.sender == game.creator) || (msg.sender == game.opponent), "Not a game player");
    require((game.state == GameState.WaitingForOpponent) || (game.state == GameState.Started), "Wrong state");

    game.state = GameState.Quitted;
    game.winner = (game.creator == msg.sender) ? game.opponent : game.creator;
    if(game.winner == address(0)) {
      address payable ownerAddr = address(uint160(owner()));
      game.winner = ownerAddr;
    }

    finishGame(_id);
    emit GameQuitted(_id, msg.sender);
  }

  /**
   * @dev Adds game idx to the beginning of topGames.
   * @param _id Game idx to be added.
   * TESTED
   */
  function addTopGame(uint256 _id) onlyCreator(_id) onlyGameNotPaused(_id) onlyNotExpiredGame(_id) public payable {
    require(msg.value == UPDATE_FEE, "Wrong fee");
    devFee = devFee.add(msg.value);

    uint256[5] memory topGamesTmp = [_id, 0, 0, 0, 0];
    for (uint8 i = 1; i < 5; i ++) {
      topGamesTmp[i] = topGames[i-1];
    }
    topGames = topGamesTmp;

  emit GameAddedToTop(_id);
  }

  /**
   * @dev Gets top games.
   * @return Returns list of top games.
   * TESTED
   */
  function getTopGames() public view returns (uint256[5] memory) {
    return topGames;
  }

  /**
   * @dev Updates minimum bet value. Can be 0 if no restrictions.
   * TESTED
   */
  function updateMinBet(uint256 _minBet) public onlyOwner {
    require(_minBet > 0, "Wrong bet");
    minBet = _minBet;
  }

  /**
   * @dev Updates partner's address.
   * @param _partner Address for partner.
   * TESTED
   */
  function updatePartner(address payable _partner) public onlyOwner {
    setPartner(_partner);
  }

  /**
   * @dev Updates bet for game.
   * @param _id Game index.
   * @param _bet Bet to be set.
   * TESTED
   */
  function updateBetForGame(uint256 _id, uint256 _bet) onlyCreator(_id) public {
    require(games[_id].opponent == address(0), "Game is joined");
    require(_bet > 0, "Bet must be > 0");

    games[_id].bet = _bet;
    emit GameUpdated(_id);
  }

  /**
   * @dev Shows field columns for game.
   * 0 | 0 | 0
   * 0 | 0 | 0
   * 0 | 0 | 0
   * ^   ^   ^
   * column
   * @param _id Game index.
   * @return Game field columns with marks.
   * TESTED
   */
  function showFieldColumns(uint256 _id) public view returns (MoveMark[3] memory, MoveMark[3] memory, MoveMark[3] memory) {
    return (games[_id].field[0], games[_id].field[1], games[_id].field[2]);
  }
  
  /**
   * @dev Gave withdrawal information.
   * @param _id Game index.
   * @return PrizeWithdrawn, drawWithdrawnCreator, drawWithdrawnOpponent.
   * TESTED
   */
   function gameWithdrawalInfo(uint256 _id) public view returns (bool, bool, bool) {
       return (games[_id].prizeWithdrawn, games[_id].drawWithdrawn[0], games[_id].drawWithdrawn[1]);
   }

  /**
   * @dev Gets game indexes where player participated.
   * @param _address Player address.
   * @return List of indexes.
   * TESTED
   */
  function getParticipatedGameIdxsForPlayer(address _address) public view returns (uint256[] memory) {
    require(_address != address(0), "Cannt be 0x0");
    return participatedGameIdxsForPlayer[_address];
  }


  /**
   * PRIVATE
   */

  /**
   * @dev Sets partner's address
   * @param _partner Address for partner.
   * TESTED
   */
  function setPartner(address payable _partner) private {
    require(_partner != address(0), "Cannt be 0x0");
    partner = _partner;
  }

  /**
   * @dev Checks if winner is present.
   * @param _id Game id.
   * TESTED
   */
  function checkForWinner(uint256 _id) private {
    Game storage game = games[_id];
    
    //  horizontal
    if(game.field[0][0] != MoveMark.Vacant) {
      if((game.field[0][0] == game.field[1][0]) && (game.field[0][0] == game.field[2][0])) {
        game.winner = (game.field[0][0] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    } 

    if(game.field[0][1] != MoveMark.Vacant) {
      if ((game.field[0][1] == game.field[1][1]) && (game.field[0][1] == game.field[2][1])) {
        game.winner = (game.field[0][1] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    }
    if(game.field[0][2] != MoveMark.Vacant) {
      if ((game.field[0][2] == game.field[1][2]) && (game.field[0][2] == game.field[2][2])) {
        game.winner = (game.field[0][2] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    }

    //  vertical
    if(game.field[0][0] != MoveMark.Vacant) {
      if((game.field[0][0] == game.field[0][1]) && (game.field[0][0] == game.field[0][2])) {
        game.winner = (game.field[0][0] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    }

    if(game.field[1][0] != MoveMark.Vacant) {
      if ((game.field[1][0] == game.field[1][1]) && (game.field[1][0] == game.field[1][2])) {
        game.winner = (game.field[1][0] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    }
    if(game.field[2][0] != MoveMark.Vacant) {
      if ((game.field[2][0] == game.field[2][1]) && (game.field[2][0] == game.field[2][2])) {
        game.winner = (game.field[2][0] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    }

    //  cross
    if(game.field[0][0] != MoveMark.Vacant) {
      if((game.field[0][0] == game.field[1][1]) && (game.field[0][0] == game.field[2][2])) {
        game.winner = (game.field[0][0] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    }
    if(game.field[0][2] != MoveMark.Vacant) {
      if ((game.field[0][2] == game.field[1][1]) && (game.field[0][2] == game.field[2][0])) {
        game.winner = (game.field[0][2] == MoveMark.Creator) ? game.creator : game.opponent;
        return;
      }
    }
  }

  /**
   * @dev Makes calculations and transfers when game is finished.
   * @param _id Game id.
   * TESTING
   */
  function finishGame(uint256 _id) private {
    Game memory game = games[_id];

    if(game.state == GameState.Expired || game.state == GameState.Quitted) {
      raffleParticipants.push(game.winner);
    } else {
      raffleParticipants.push(game.creator);
      raffleParticipants.push(game.opponent);
    }
    gamesCompletedAmount = gamesCompletedAmount.add(1);
    delete ongoingGameIdxForParticipant[game.creator];
    delete ongoingGameIdxForParticipant[game.opponent];

    emit GameFinished(_id, game.winner, game.bet);
  }

  /**
   * @dev Performs prize calculations and transfers for game with winner.
   * @param _id Game id.
   */
  function performPrizeCalculationsAndTransferForGameWithWinner(uint256 _id) private {
    Game storage game = games[_id];
    require(game.winner == msg.sender, "Not a winner");
    require(game.prizeWithdrawn == false, "Prize is withdrawn");
    
    game.prizeWithdrawn = true;

    //  prize
    uint256 prize = game.bet.mul(2).mul(PRIZE_PERCENT).div(100);
    game.winner.transfer(prize);

    //  fees
    uint256 fee = game.bet.mul(2).mul(FEE_PERCENT).div(100);

    //  referral
    address winnerReferral = (game.winner == game.creator) ? game.creatorReferral : game.opponentReferral;
    if(winnerReferral == address(0)) {
      winnerReferral = owner();
    }
    referralFees[winnerReferral] = referralFees[winnerReferral].add(fee);

    //  raffle
    ongoinRafflePrize = ongoinRafflePrize.add(fee);

    //  partner
    partnerFee = partnerFee.add(fee);
    if(partnerFee > 1 ether) {
      uint256 feeTmp = partnerFee;
      delete partnerFee;
      partner.transfer(feeTmp);
    }

    //  dev
    uint256 otherFees = fee.mul(3);
    devFee = devFee.add(game.bet.mul(2).sub(prize).sub(otherFees));
  }

  /**
   * @dev Performs prize calculations and transfers for draw game. Players receives 90% of their bet, all other fees performs normally.
   * @param _id Game id.
   */
  function performPrizeCalculationsAndTransferForGameWithDraw(uint256 _id) private {
    Game storage game = games[_id];
    require((msg.sender == game.creator) || (msg.sender == game.opponent), "Not a game player");
    require(game.state == GameState.Draw, "Not Draw");
    
    if(msg.sender == game.creator) {
      require(game.drawWithdrawn[0] == false, "Creator withdrawn");
      game.drawWithdrawn[0] = true;
    } else {
      require(game.drawWithdrawn[1] == false, "Opponent withdrawn");
      game.drawWithdrawn[1] = true;
    }

    //  prize
    uint256 prize = game.bet.mul(PRIZE_PERCENT).div(100);
    msg.sender.transfer(prize);

    //  fees
    uint256 fee = game.bet.mul(FEE_PERCENT).div(100);

    //  referral
    address winnerReferral = (game.creator == msg.sender) ? game.creatorReferral : game.opponentReferral;
    if(winnerReferral == address(0)) {
      winnerReferral = owner();
    }
    referralFees[winnerReferral] = referralFees[winnerReferral].add(fee);

    //  raffle
    ongoinRafflePrize = ongoinRafflePrize.add(fee);

    //  partner
    partnerFee = partnerFee.add(fee);
    if(partnerFee > 1 ether) {
      partner.transfer(partnerFee);
      delete partnerFee;
    }

    //  dev
    uint256 otherFees = fee.mul(3);
    devFee = devFee.add(game.bet.sub(prize).sub(otherFees));
  }
}
