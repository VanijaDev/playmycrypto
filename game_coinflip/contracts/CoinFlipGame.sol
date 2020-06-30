pragma solidity 0.5.8;

import "./Partnership.sol";
import "./GameRaffle.sol";
import "./_Pausable.sol";

/**
  * @notice IMPORTANT: owner should create first game.
  * @notice CoinFlipGame can be created by creator and run by joined player. Creator is not required to be online or perform any actions for game to be played.
  */

contract CoinFlipGame is Pausable, Partnership, GameRaffle {
  struct Game {
    uint8 creatorGuessCoinSide;
    uint256 id;
    uint256 bet;
    address payable creator;
    address payable opponent;
    address payable winner;
    address creatorReferral;
    address opponentReferral;
  }

  uint256 private constant FEE_PERCENT = 1;

  uint256 public minBet = 50 trx;
  uint256 public suspendedTimeDuration = 1 hours;

  uint256[5] public topGames;

  uint256 public gamesCreatedAmount;
  uint256 public gamesCompletedAmount; //  played, quitted, move expired

  mapping(uint256 => Game) public games;
  mapping(address => uint256) public ongoingGameIdxForCreator;
  mapping(address => uint256[]) private participatedGameIdxsForPlayer;
  mapping(address => uint256[]) public gamesWithPendingPrizeWithdrawalForAddress; //  for both won & draw

  mapping(address => uint256) public addressBetTotal;
  mapping(address => uint256) public addressPrizeTotal;

  mapping(address => uint256) public referralFeesPending;
  mapping(address => uint256) public referralFeesWithdrawn;

  mapping(address => uint256) public lastPlayTimestamp;

  uint256 public devFeePending;

  uint256 public totalUsedReferralFees;
  uint256 public totalUsedInGame;

  event CF_GameCreated(uint256 indexed id, address indexed creator, uint256 indexed bet);
  event CF_GamePlayed(uint256 indexed id, address indexed creator, address indexed opponent, address winner, uint256 bet);
  event CF_GamePrizesWithdrawn(address indexed player);
  event CF_GameAddedToTop(uint256 indexed id, address indexed creator);
  event CF_GameReferralWithdrawn(address indexed referral);
  event CF_GameUpdated(uint256 indexed id, address indexed creator);
 

  modifier onlyCorrectBet() {
    require(msg.value >= minBet, "Wrong bet");
    _;
  }

  modifier onlySingleGameCreated() {
    require(ongoingGameIdxForCreator[msg.sender] == 0, "No more creating");
    _;
  }

  modifier onlyAllowedToPlay() {
    require(allowedToPlay(), "Suspended to play");
    _;
  }

  modifier onlyCreator(uint256 _id) {
    require(games[_id].creator == msg.sender, "Not creator");
    _;
  }

  modifier onlyNotCreator(uint256 _id) {
    require(games[_id].creator != msg.sender, "Is creator");
    _;
  }


  /**
    * @dev Contract constructor.
    * @param _partner Address for partner.
    * TESTED
    */
  constructor(address payable _partner) Partnership (_partner, 1000 trx) public {
    updatePartner(_partner);
  }

  /**
    * @dev Destroyes the contract.
    * TESTED
    */
  function kill() external onlyOwner {
    address payable addr = msg.sender;
    selfdestruct(addr);
  }
  
  /**
   * Pausable.sol
   * TESTED
   */
  /**
   * @dev Triggers stopped state.
   * TESTED
   */
  function pause() external onlyOwner {
    Pausable._pause();
  }

  /**
    * GAMEPLAY
    */

  /**
    * @dev Creates new game.
    * @param _guessCoinSide Сoin side (0 or 1).
    * @param _referral Address for referral.
    * TESTED
    */
  function createGame(uint8 _guessCoinSide, address _referral) external payable whenNotPaused onlySingleGameCreated onlyCorrectBet {
    require(_guessCoinSide < 2, "Wrong guess coin side");
    require(_referral != msg.sender, "Wrong referral");

    addressBetTotal[msg.sender] = addressBetTotal[msg.sender].add(msg.value);

    games[gamesCreatedAmount].id = gamesCreatedAmount;
    games[gamesCreatedAmount].creator = msg.sender;
    games[gamesCreatedAmount].bet = msg.value;
    games[gamesCreatedAmount].creatorGuessCoinSide = _guessCoinSide;
    if (_referral != address(0)) {
      games[gamesCreatedAmount].creatorReferral = _referral;
    }

    ongoingGameIdxForCreator[msg.sender] = gamesCreatedAmount;
    participatedGameIdxsForPlayer[msg.sender].push(gamesCreatedAmount);

    totalUsedInGame = totalUsedInGame.add(msg.value);

    emit CF_GameCreated(gamesCreatedAmount, msg.sender, msg.value);

    gamesCreatedAmount = gamesCreatedAmount.add(1);
  }

  /**
    * @dev Joins and plays game.
    * @param _id Game id to join.
    * @param _referral Address for referral.
    * TESTED
    */
  function joinAndPlayGame(uint256 _id, address _referral) external payable onlyNotCreator(_id) onlyAllowedToPlay {
    Game storage game = games[_id];
    require(game.creator != address(0), "No game with such id");
    require(game.winner == address(0), "Game has winner");
    require(game.bet == msg.value, "Wrong bet");
    require(_referral != msg.sender, "Wrong referral");

    addressBetTotal[msg.sender] = addressBetTotal[msg.sender].add(msg.value);

    game.opponent = msg.sender;
    if (_referral != address(0)) {
      game.opponentReferral = _referral;
    }

    //  play
    uint8 coinSide = uint8(uint256(keccak256(abi.encodePacked(now, msg.sender, gamesCreatedAmount, totalUsedInGame,devFeePending))) %2);
    game.winner = (coinSide == game.creatorGuessCoinSide) ? game.creator : game.opponent;

    gamesWithPendingPrizeWithdrawalForAddress[game.winner].push(_id);

    raffleParticipants.push(game.creator);
    raffleParticipants.push(game.opponent);
    lastPlayTimestamp[msg.sender] = now;
    gamesCompletedAmount = gamesCompletedAmount.add(1);
    totalUsedInGame = totalUsedInGame.add(msg.value);
    participatedGameIdxsForPlayer[msg.sender].push(_id);
    delete ongoingGameIdxForCreator[game.creator];

    if (isTopGame(_id)) {
      removeTopGame(game.id);
    }

    emit CF_GamePlayed(_id, game.creator, game.opponent, game.winner, game.bet);
  }

  /**
    * WITHDRAW
    */

  /**
    * @dev Withdraws prize for won game.
    * @param _maxLoop max loop.
    * TESTED
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

      uint256 gamePrize = game.bet.mul(2);

      //  referral
      address winnerReferral = (msg.sender == game.creator) ? game.creatorReferral : game.opponentReferral;
      if (winnerReferral == address(0)) {
        winnerReferral = owner();
      }
      uint256 referralFee = gamePrize.mul(FEE_PERCENT).div(100);
      referralFeesPending[winnerReferral] = referralFeesPending[winnerReferral].add(referralFee);
      totalUsedReferralFees = totalUsedReferralFees.add(referralFee);
      
      prizeTotal += gamePrize;
      pendingGames.pop();
    }

    addressPrizeTotal[msg.sender] = addressPrizeTotal[msg.sender].add(prizeTotal);
    
    uint256 singleFee = prizeTotal.mul(FEE_PERCENT).div(100);
    partnerFeePending = partnerFeePending.add(singleFee);
    ongoinRafflePrize = ongoinRafflePrize.add(singleFee);
    devFeePending = devFeePending.add(singleFee.mul(2));

    prizeTotal = prizeTotal.sub(singleFee.mul(5));
    msg.sender.transfer(prizeTotal);

    //  partner transfer
    transferPartnerFee();

    emit CF_GamePrizesWithdrawn(msg.sender);
  }

  /**
    * @dev Withdraws referral fees.
    * TESTED
    */
  function withdrawReferralFees() external {
    uint256 feeTmp = referralFeesPending[msg.sender];
    require(feeTmp > 0, "No referral fee");

    delete referralFeesPending[msg.sender];
    referralFeesWithdrawn[msg.sender] = referralFeesWithdrawn[msg.sender].add(feeTmp);

    msg.sender.transfer(feeTmp);
    emit CF_GameReferralWithdrawn(msg.sender);
  }

  /**
    * @dev Withdraws developer fees.
    * TESTED
    */
  function withdrawDevFee() external onlyOwner {
    require(devFeePending > 0, "No dev fee");

    uint256 fee = devFeePending;
    delete devFeePending;

    msg.sender.transfer(fee);
  }

  /**
   * GameRaffle
   * TESTED
   */
  function withdrawRafflePrizes() external {
    require(rafflePrizePendingForAddress[msg.sender] > 0, "No raffle prize");

    uint256 prize = rafflePrizePendingForAddress[msg.sender];
    delete rafflePrizePendingForAddress[msg.sender];
    
    addressPrizeTotal[msg.sender] = addressPrizeTotal[msg.sender].add(prize);

    uint256 singleFee = prize.mul(FEE_PERCENT).div(100);
    partnerFeePending = partnerFeePending.add(singleFee);
    devFeePending = devFeePending.add(singleFee.mul(2));

    //  transfer prize
    prize = prize.sub(singleFee.mul(3));
    msg.sender.transfer(prize);

    //  partner transfer
    transferPartnerFee();

    emit CF_RafflePrizeWithdrawn(msg.sender, prize);
  }

  /**
    * OTHER
    */

  /**
    * @dev Checks if player is allowed to play since last game played time.
    * @return Returns weather player is allowed to play.
    * TESTED
    */
  function allowedToPlay() public view returns (bool) {
    return now.sub(lastPlayTimestamp[msg.sender]) > suspendedTimeDuration;
  }

  /**
    * @dev Adds game idx to the beginning of topGames.
    * @param _id Game idx to be added.
    * TESTED
    */
  function addTopGame(uint256 _id) external payable onlyCreator(_id) {
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

    emit CF_GameAddedToTop(_id, msg.sender);
  }

  /**
    * @dev Removes game idx from topGames.
    * @param _id Game idx to be removed.
    * TESTED
    */
  function removeTopGame(uint256 _id) private {
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
    * TESTED
    */
  function getTopGames() external view returns (uint256[5] memory) {
    return topGames;
  }

  /**
    * @dev Checks if game id is in top games.
    * @param _id Game id to check.
    * @return Whether game id is in top games.
    * TESTED
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
    * @dev Returns game ids with pending withdrawal for address.
    * @param _address Player address.
    * @return ids Game ids.
    * TESTED
    */
  function getGamesWithPendingPrizeWithdrawalForAddress(address _address) external view returns (uint256[] memory ids) {
    ids =  gamesWithPendingPrizeWithdrawalForAddress[_address];
  }

  /**
   * @dev Updates bet for game.
   * @param _id Game index.
   * TESTED
   */
  function increaseBetForGameBy(uint256 _id) whenNotPaused onlyCreator(_id) external payable {
    require(msg.value > 0, "increase must be > 0");

    addressBetTotal[msg.sender] = addressBetTotal[msg.sender].add(msg.value);
    
    games[_id].bet = games[_id].bet.add(msg.value);
    totalUsedInGame = totalUsedInGame.add(msg.value);
    emit CF_GameUpdated(_id, msg.sender);
  }

  /**
    * @dev Updates minimum bet value. Can be 0 if no restrictions.
    * @param _minBet Min bet value.
    * TESTED
    */
  function updateMinBet(uint256 _minBet) external onlyOwner {
    require(_minBet > 0, "Wrong bet");
    minBet = _minBet;
  }

  /**
    * @dev Updates spended time duration.
    * @param _duration time duration value.
    * TESTED
    */
  function updateSuspendedTimeDuration(uint256 _duration) external onlyOwner {
    require(_duration > 0, "Wrong duration");
    suspendedTimeDuration = _duration;
  }

  /**
    * @dev Gets game indexes where player participated. Created and joined
    * @param _address Player address.
    * @return List of indexes.
    * TESTED
    */
  function getParticipatedGameIdxsForPlayer(address _address) external view returns (uint256[] memory) {
    require(_address != address(0), "Cannt be 0x0");
    return participatedGameIdxsForPlayer[_address];
  }
}