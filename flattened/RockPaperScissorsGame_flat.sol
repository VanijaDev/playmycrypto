
// File: localhost/node_modules/openzeppelin-solidity/contracts/GSN/Context.sol

// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with GSN meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

// File: localhost/node_modules/openzeppelin-solidity/contracts/access/Ownable.sol

// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: localhost/node_modules/openzeppelin-solidity/contracts/utils/Pausable.sol

// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;


/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
contract Pausable is Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor () internal {
        _paused = false;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

// File: localhost/contracts/AcquiredFeeBeneficiar.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;



/**
 * @dev Contract that allowes user to purchase right to receive % of game prizes.
 * @notice Beneficiary address will be reset after single address is being set 15 days.
 */
contract AcquiredFeeBeneficiar is Ownable {
  using SafeMath for uint256;

  uint256 public constant ACQUIRED_FEE_BENEFICIARY_MAX_DURATION = 15 days;  //  max duration for single beneficiar

  uint256 public latestBeneficiarPrice;

  address payable public feeBeneficiar; //  ongoing address to get fees during withdrawals
  uint256 public feeBeneficiarPurchasedAt;  //  timestamp, when purchased

  mapping(address => uint256) public feeBeneficiarBalances;

  /**
   * @dev Purchase right to become fee beneficiar.
   * TESTED
   */
  function makeFeeBeneficiar() virtual public payable {
    require(msg.value > latestBeneficiarPrice, "Wrong amount");

    latestBeneficiarPrice = msg.value;
    feeBeneficiar = msg.sender;
    feeBeneficiarPurchasedAt = now;
  }

  /**
   * @dev Add fee amount to ongoing beneficiar balance.
   * @param _amount Amount of fee to be added.
   * TESTED
   */
  function addBeneficiarFee(uint256 _amount) internal {
    resetFeeBeneficiarIfExceeded();

    feeBeneficiarBalances[feeBeneficiar] = feeBeneficiarBalances[feeBeneficiar].add(_amount);
  }

  /**
   * @dev Withdraws beneficiary fee.
   * TESTED
   */
  function withdrawBeneficiaryFee() external {
    uint256 fee = feeBeneficiarBalances[msg.sender];
    require(fee > 0, "No fee");

    delete feeBeneficiarBalances[msg.sender];
    msg.sender.transfer(fee);

    resetFeeBeneficiarIfExceeded();
  }

  /**
   * @dev Resets fee beneficiar to owner if max duration exceeded.
   * TESTED
   */
  function resetFeeBeneficiarIfExceeded() private {
    if (feeBeneficiar == owner()) {
      return;
    }

    if (now.sub(feeBeneficiarPurchasedAt) > ACQUIRED_FEE_BENEFICIARY_MAX_DURATION) {
      address payable ownerAddr = address(uint160(owner()));
      feeBeneficiar = ownerAddr;
      delete feeBeneficiarPurchasedAt;
      delete latestBeneficiarPrice;
    }
  }
}
// File: localhost/contracts/GameRaffle.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;



abstract contract GameRaffle is Ownable {
  using SafeMath for uint256;

  struct RaffleResult {
    address winner;
    uint256 prize;
    uint256 time;
  }
  
  mapping(address => uint256) public rafflePrizePending;
  mapping(address => uint256) public rafflePrizeWithdrawn;
  
  uint256 public ongoinRafflePrize;
  uint256 public rafflePrizesWonTotal;

  uint256 public raffleActivationParticipantsAmount = 200;  //  1 game has 2 participants
  address[] public raffleParticipants;  //  the more you play, the more times added
  RaffleResult[] public raffleResults;


  event RPS_RafflePlayed(address indexed winner, uint256 indexed prize);
  event RPS_RafflePrizeWithdrawn(address indexed winner);


  /**
   * @dev Gets raffle participants.
   * @return Participants count.
   * 
   */
  function getRaffleParticipants() external view returns (address[] memory) {
    return raffleParticipants;
  }
  
  /**
   * @dev Updates raffle minimum participants Count to activate.
   * @param _amount Amount to be set.
   * 
   */
  function updateRaffleActivationParticipantsCount(uint256 _amount) external onlyOwner {
    require(_amount > 0, "Should be > 0");
    raffleActivationParticipantsAmount = _amount;
  }

  /**
   * @dev Gets past raffle results count.
   * @return Results count.
   * 
   */
  function getRaffleResultCount() external view returns (uint256) {
    return raffleResults.length;
  }

  /**
   * @dev Checks if raffle is activated.
   * @return Wether raffle is activated.
   * 
   */
  function raffleActivated() public view returns(bool) {
    return (raffleParticipants.length >= raffleActivationParticipantsAmount && ongoinRafflePrize > 0);
  }

  /**
   * @dev Runs the raffle.
   * 
   */
  function runRaffle() external {
    require(raffleActivated(), "Raffle != activated");

    uint256 winnerIdx = rand();
    rafflePrizePending[raffleParticipants[winnerIdx]] = rafflePrizePending[raffleParticipants[winnerIdx]].add(ongoinRafflePrize);
    rafflePrizesWonTotal = rafflePrizesWonTotal.add(ongoinRafflePrize);
    raffleResults.push(RaffleResult(raffleParticipants[winnerIdx], ongoinRafflePrize, now));

    emit RPS_RafflePlayed(raffleParticipants[winnerIdx], ongoinRafflePrize);

    delete ongoinRafflePrize;
    delete raffleParticipants;
  }

  /**
   * @dev Generates random number
   * 
   */
  function rand() public view returns(uint256) {
    require(raffleParticipants.length > 0, "No participants");
    return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, ongoinRafflePrize, raffleParticipants.length))) % raffleParticipants.length;
  }

  /**
   * @dev Withdraw prizes for all won raffles.
   */
  function withdrawRafflePrizes() external virtual;
}

// File: localhost/contracts/IGamePausable.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

abstract contract IGamePausable {

  event RPS_GamePaused(uint256 indexed id);
  event RPS_GameUnpaused(uint256 indexed id);

  /**
   * @dev Checks if game is paused.
   * @param _id Game index.
   * @return Is game paused.
   */
  function gameOnPause(uint256 _id) public view virtual returns(bool);

  /**
   * @dev Pauses game.
   * @param _id Game index.
   */
  function pauseGame(uint256 _id) external virtual;

  /**
   * @dev Unpauses game.
   * @param _id Game index.
   */
  function unpauseGame(uint256 _id) external payable virtual;
}

// File: localhost/contracts/IExpiryMoveDuration.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

abstract contract IExpiryMoveDuration {
  uint16 public gameMoveDuration = 12 hours;

  /**
   * @dev Updates game move duration.
   * @param _duration Game duration.
   */
  function updateGameMoveDuration(uint16 _duration) external virtual;

  /**
   * @dev Checks if game is expired.
   * @param _id Game id.
   * @return Is game expired.
   */
  function gameMoveExpired(uint256 _id) public view virtual returns(bool);

  /**
   * @dev Finishes expired game.
   * @param _id Game id.
   */
  function finishExpiredGame(uint256 _id) external virtual;
}
// File: localhost/node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol

// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

// File: localhost/contracts/Partnership.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;



/**
 * @dev Contract module which provides a basic fu=nctionality for donates to partner address.
 */
contract Partnership is Ownable {
  using SafeMath for uint256;
  
  address payable public partner;
  
  uint256 public partnerFeeTransferThreshold;
  uint256 public partnerFeePending;
  uint256 public partnerFeeTotalUsed;

  event RPS_PartnerFeeTransferred(address from, address indexed to, uint256 indexed amount);

  /**
   * @dev Initializes the contract.
   * @param _partnerAddress Partner address.
   * @param _transferThreshold Fee amount, that should trigger transfer.
   * TESTED
   */
  constructor(address payable _partnerAddress, uint256 _transferThreshold) public {
    updatePartner(_partnerAddress);
    updatePartnerTransferThreshold(_transferThreshold);
  }

  /**
   * @dev Updates partner address.
   * @param _partnerAddress Address for partner.
   * TESTED
   */
  function updatePartner(address payable _partnerAddress) public onlyOwner {
    require(_partnerAddress != address(0), "Cannt be 0x0");
    partner = _partnerAddress;
  }

  /**
   * @dev Updates partner fee transfer threshold limit, when fee should be transferred to address.
   * @notice In wei.
   * @param _transferThreshold Fee amount, that should trigger transfer.
   * TESTED
   */
  function updatePartnerTransferThreshold(uint256 _transferThreshold) public onlyOwner {
    require(_transferThreshold > 0, "threshold must be > 0");
    partnerFeeTransferThreshold = _transferThreshold;
  }

  /**
   * @dev Transfers partner fee to partner address if threshold was reached.
   * 
   */
  function transferPartnerFee() internal {
    if (partnerFeePending >= partnerFeeTransferThreshold) {
      uint256 partnerFeePendingTmp = partnerFeePending;
      delete partnerFeePending;

      partnerFeeTotalUsed = partnerFeeTotalUsed.add(partnerFeePendingTmp);
      partner.transfer(partnerFeePendingTmp);
      emit RPS_PartnerFeeTransferred(address(this), partner, partnerFeePendingTmp);
    }
  }
}

// File: localhost/contracts/RockPaperScissorsGame.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;








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
    bool isPrizeWithdrawn;
    bool[2] isDrawWithdrawn;  //  0 - creator; 1 - opponent

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
  uint256 public gamesCompletedAmount; //  completed in any way

  mapping(uint256 => Game) public games;
  mapping(address => uint256) public ongoingGameAsCreator;
  mapping(address => uint256) public ongoingGameAsOpponent;
  mapping(address => uint256[]) private playedGames;
  mapping(address => uint256[]) public gamesWithPendingPrizeWithdrawal; //  for both won & draw

  mapping(address => uint256) public betTotal;
  mapping(address => uint256) public prizeWithdrawn; //  game bet if won. TODO: rename 

  mapping(address => uint256) public referralFeesPending;
  mapping(address => uint256) public referralFeesWithdrawn;

  uint256 public devFeePending;

  uint256 public totalUsedReferralFees;
  uint256 public totalUsedInGame;


  event RPS_GameCreated(uint256 indexed id, address indexed creator, uint256 indexed bet);
  event RPS_GameJoined(uint256 indexed id, address indexed creator, address indexed opponent);
  event RPS_GameMovePlayed(uint256 indexed id);
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

  modifier onlyNotGameCreator(uint256 _id) {
    require(games[_id].creator != msg.sender,  "Game creator");
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
   * TESTED
   */
  constructor(address payable _partner) public Partnership(_partner, 1 ether) {
    feeBeneficiar = msg.sender;
  }

  /**
   * @dev Destroys the contract.
   * TESTED
   */
  function kill() external onlyOwner {
    address payable addr = msg.sender;
    selfdestruct(addr);
  }

  /**
   * Pausable.sol
   * 
   */
  /**
   * @dev Triggers stopped state.
   * TESTED
   */
  function pause() external onlyOwner {
    Pausable._pause();
  }

  /**
   * @dev Returns to normal state.
   * TESTED
   */
  function unpause() external onlyOwner {
    Pausable._unpause();
  }

  /**
   * IGamePausable
   * TESTED
   */

  /**
   * @dev Pauses game.
   * @param _id Game index.
   * TESTED
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
   * TESTED
   */
  function unpauseGame(uint256 _id) onlyGameCreator(_id) onlyGamePaused(_id) external payable override {
    require(msg.value == minBet, "Wrong fee");

    games[_id].paused = false;
    
    devFeePending = devFeePending.add(msg.value);
    totalUsedInGame = totalUsedInGame.add(msg.value);

    emit RPS_GameUnpaused(_id);
  }

  /**
   * @dev Checks if game is paused.
   * @param _id Game index.
   * @return Is game paused.
   * TESTED
   */
  function gameOnPause(uint256 _id) public view override returns(bool) { 
    return games[_id].paused;
  }

  /**
   * IExpiryMoveDuration
   * TESTED
   */

  /**
   * @dev Updates game move duration.
   * @param _duration Game duration.
   * TESTED
   */
  function updateGameMoveDuration(uint16 _duration) external override onlyOwner {
    require(_duration > 0, "Should be > 0");
    gameMoveDuration = _duration;  
  }

  /**
   * @dev Checks if game move expired.
   * @param _id Game id.
   * @return Whether game move is expired.
   * TESTED
   */
  function gameMoveExpired(uint256 _id) public view override returns(bool) {
    if(games[_id].prevMoveTimestamp != 0) {
      return games[_id].prevMoveTimestamp.add(gameMoveDuration) < now; 
    }
  }

  /**
   * @dev Finishes prize for expired game.
   * @param _id Game id.
   * TESTED
   */
  function finishExpiredGame(uint256 _id) external override {
    Game storage game = games[_id];

    require(game.state ==  GameState.Started, "Wrong state");
    require(gameMoveExpired(_id), "Not yet expired");
    address correctClaimer = (game.nextMover == game.creator) ? game.opponent : game.creator;
    require((msg.sender == correctClaimer), "Wrong claimer");

    game.winner = msg.sender;
    game.state = GameState.Expired;

    finishGame(game);

    emit RPS_GameExpiredFinished(game.id, game.creator, game.opponent);
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
   * TESTED
   */
  function createGame(address _referral, bytes32 _moveHash) external payable whenNotPaused onlyAvailableToCreate onlyCorrectBet onlyCorrectReferral(_referral) {  
    require(_moveHash[0] != 0, "Empty hash");

    betTotal[msg.sender] = betTotal[msg.sender].add(msg.value);

    games[gamesCreatedAmount].id = gamesCreatedAmount;
    games[gamesCreatedAmount].creator = msg.sender;
    games[gamesCreatedAmount].bet = msg.value;
    games[gamesCreatedAmount].creatorMoveHashes[0] = _moveHash;
    (_referral == address(0)) ? games[gamesCreatedAmount].creatorReferral = owner() : games[gamesCreatedAmount].creatorReferral = _referral;
    
    ongoingGameAsCreator[msg.sender] = gamesCreatedAmount;
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
   * TESTED
   */
  function joinGame(uint256 _id, address _referral, uint8 _moveMark) external payable whenNotPaused onlyAvailableToJoin onlyNotGameCreator(_id) onlyGameNotPaused(_id) onlyWaitingForOpponent(_id) onlyCorrectReferral(_referral) onlyValidMoveMark(_moveMark) {
    Game storage game = games[_id];
    
    require(game.bet == msg.value, "Wrong bet");
    (_referral == address(0)) ? games[_id].opponentReferral = owner() : games[_id].opponentReferral = _referral;

    if (isTopGame(_id)) {
      removeTopGame(_id);
    }

    betTotal[msg.sender] = betTotal[msg.sender].add(msg.value);
    
    game.opponent = msg.sender;
    game.nextMover = game.creator;
    game.prevMoveTimestamp = now;
    game.movesOpponent[0] = _moveMark;
    game.state = GameState.Started;

    ongoingGameAsOpponent[msg.sender] = _id;
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
   * TESTED
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
    emit RPS_GameFinished(game.id, game.creator, game.opponent);
  }

  /**
   * @dev Opponent makes move.
   * @param _id Game id.
   * @param _moveMark Move mark.
   * TESTED
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
   * @notice 95% to transfer. Fee will be deducted only from prize, but not draw.
   * TESTED
   */
  function withdrawGamePrizes(uint256 _maxLoop) external {
    require(_maxLoop > 0, "_maxLoop == 0");
    
    uint256[] storage pendingGames = gamesWithPendingPrizeWithdrawal[msg.sender];
    require(pendingGames.length > 0, "no pending");
    require(_maxLoop <= pendingGames.length, "_maxLoop too big");
    
    uint256 betsPrize;
    uint256 betsDraw;
    for (uint256 i = 0; i < _maxLoop; i++) {
      uint256 gameId = pendingGames[pendingGames.length.sub(1)];
      Game storage game = games[gameId];
      
      if (game.state == GameState.Draw) {
        betsDraw = betsDraw.add(game.bet);

        if (game.creator == msg.sender) {
          require(!game.isDrawWithdrawn[0], "Fatal, cr with draw");
          game.isDrawWithdrawn[0] = true;
        } else if (game.opponent == msg.sender) {
          require(!game.isDrawWithdrawn[1], "Fatal, opp with draw");
          game.isDrawWithdrawn[1] = true;
        }
      } else {
        require(!game.isPrizeWithdrawn, "Fatal,prize was with");
        game.isPrizeWithdrawn = true;
        betsPrize = betsPrize.add(game.bet);
        
        //  referral
        address winnerReferral = (msg.sender == game.creator) ? game.creatorReferral : game.opponentReferral;
        uint256 referralFee = game.bet.mul(FEE_PERCENT).div(100);
        referralFeesPending[winnerReferral] = referralFeesPending[winnerReferral].add(referralFee);
        totalUsedReferralFees = totalUsedReferralFees.add(referralFee);
      }
      pendingGames.pop();
    }

    prizeWithdrawn[msg.sender] = prizeWithdrawn[msg.sender].add(betsPrize);

    //  5% fees
    uint256 singleFee = betsPrize.mul(FEE_PERCENT).div(100);
    partnerFeePending = partnerFeePending.add(singleFee);
    ongoinRafflePrize = ongoinRafflePrize.add(singleFee);
    devFeePending = devFeePending.add(singleFee);
    addBeneficiarFee(singleFee);

    uint256 transferAmount = betsPrize.sub(singleFee.mul(5)).add(betsDraw).add(betsPrize);
    msg.sender.transfer(transferAmount);

    //  partner transfer
    transferPartnerFee();

    emit RPS_GamePrizesWithdrawn(msg.sender);
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
    emit RPS_GameReferralWithdrawn(msg.sender);
  }

  /**
   * @dev Withdraws developer fees.
   * TESTED
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
   * TESTED
   */
   
  function withdrawRafflePrizes() external override {
    uint256 prize = rafflePrizePending[msg.sender];
    require(prize > 0, "No raffle prize");

    delete rafflePrizePending[msg.sender];
    rafflePrizeWithdrawn[msg.sender] = rafflePrizeWithdrawn[msg.sender].add(prize);
    msg.sender.transfer(prize);

    emit RPS_RafflePrizeWithdrawn(msg.sender);
  }
  

  /**
   * OTHER
   */

  /**
   * @dev Quits the game.
   * @param _id Game id.
   * TESTED
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
      address correctClaimer = (game.nextMover == game.creator) ? game.opponent : game.creator;
      if (msg.sender == correctClaimer) {
        revert("Claim, not quit");
      }
    }

    game.state = GameState.Quitted;

    if (isTopGame(_id)) {
      removeTopGame(_id);
    }
    
    finishGame(game);

    emit RPS_GameQuittedFinished(game.id, game.creator, game.opponent);
  }

  /**
   * @dev Adds game idx to the beginning of topGames.
   * @param _id Game idx to be added.
   * TESTED
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
   * @dev Updates bet for game.
   * @param _id Game index.
   * TESTED
   */
  function increaseBetForGameBy(uint256 _id) whenNotPaused onlyGameCreator(_id) onlyWaitingForOpponent(_id) external payable {
    require(msg.value > 0, "increase must be > 0");

    betTotal[msg.sender] = betTotal[msg.sender].add(msg.value);
    
    games[_id].bet = games[_id].bet.add(msg.value);
    totalUsedInGame = totalUsedInGame.add(msg.value);
    emit RPS_GameUpdated(_id, msg.sender);
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
   * @dev Shows moves for row for game.
   * @param _id Game index.
   * @param _row Game moves row.
   * @return Game moves.
   * TESTED
   */
  function showRowMoves(uint256 _id, uint8 _row) external view returns (uint8, uint8) {
    return (games[_id].movesCreator[_row], games[_id].movesOpponent[_row]);
  }

  /**
   * @dev Gets creator's hashes for game.
   * @param _id Game id.
   * @return Array of hash values.
   * TESTED
   */
  function getCreatorMoveHashesForGame(uint256 _id) external view returns(bytes32[3] memory) {
    return games[_id].creatorMoveHashes;
  }

  /**
   * @dev Game withdrawal information.
   * @param _id Game index.
   * @return isPrizeWithdrawn, isDrawWithdrawnCreator, isDrawWithdrawnOpponent.
   * TESTED
   */
  function gameWithdrawalInfo(uint256 _id) external view returns (bool, bool, bool) {
    return (games[_id].isPrizeWithdrawn, games[_id].isDrawWithdrawn[0], games[_id].isDrawWithdrawn[1]);
  }

  /**
   * @dev Gets game indexes where player played. Created and joined
   * @param _address Player address.
   * @return List of indexes.
   * TESTED
   */
  function getPlayedGamesForPlayer(address _address) external view returns (uint256[] memory) {
    require(_address != address(0), "Cannt be 0x0");
    return playedGames[_address];
  }

  /**
   * @dev Gets gamesWithPendingPrizeWithdrawal.
   * @param _address Player address.
   * @return ids Game id array.
   * TESTED
   */
  function getGamesWithPendingPrizeWithdrawal(address _address) external view returns(uint256[] memory ids) {
    ids = gamesWithPendingPrizeWithdrawal[_address];
  }

  /**
   * PRIVATE
   */

   /**
   * @dev Finds player address with more wins.
   * @param _id Game id.
   * @return playerAddr Winner address with more wins.
   * TESTED
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
   * TESTING
   */
  function finishGame(Game storage _game) private {
    if (_game.state == GameState.Expired || _game.state == GameState.Quitted) {
        if (_game.winner != owner()) {
          raffleParticipants.push(_game.winner);
        }
    } else if (_game.state == GameState.WinnerPresent || _game.state == GameState.Draw) {
      raffleParticipants.push(_game.creator);
      raffleParticipants.push(_game.opponent);
    } else {
      revert("Fatal, wrong GameState");
    }

    gamesCompletedAmount = gamesCompletedAmount.add(1);
    delete ongoingGameAsCreator[_game.creator];
    delete ongoingGameAsOpponent[_game.opponent];
    delete _game.prevMoveTimestamp;
    delete _game.nextMover;

    if (_game.winner != address(0)) {
      gamesWithPendingPrizeWithdrawal[_game.winner].push(_game.id);
    } else {
      gamesWithPendingPrizeWithdrawal[_game.creator].push(_game.id);
      gamesWithPendingPrizeWithdrawal[_game.opponent].push(_game.id);
    }
  }
}